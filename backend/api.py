import torch
import torch.nn as nn
import torch.nn.functional as F
from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Depends, BackgroundTasks # Modified import
from fastapi.responses import HTMLResponse
import uvicorn
from PIL import Image
import io
import uuid
import base64  
import time # Add this import
from datetime import datetime
from torchvision import transforms, models, datasets # Added datasets
from supabase import create_client, Client
import os
from dotenv import load_dotenv
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import torch.optim as optim
from sklearn.metrics import precision_recall_fscore_support, accuracy_score


# Load environment variables
load_dotenv()


SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY")


if not SUPABASE_URL or not SUPABASE_KEY:
   raise ValueError("Missing Supabase credentials in .env file")


# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)


# Setup FastAPI app
app = FastAPI(title="Lung Cancer Type Prediction API")

# Add this to enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Or specify your frontend URL here
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Class names used in the model
CLASS_NAMES = ['adenocarcinoma', 'large_cell_carcinoma', 'normal', 'squamous_cell_carcinoma']


# Path to the pretrained model
MODEL_PATH = "lung_cancer_densenet_se_20241209_071826.pth"

# Configuration for fine-tuning and evaluation
# IMPORTANT: You MUST create this directory and populate it with test data
# structured like: API_TEST_DATA_DIR/class_name/image.jpg
API_TEST_DATA_DIR = "path_to_your_api_test_data"  # <--- !!! SET THIS PATH !!!
FINE_TUNE_LEARNING_RATE = 0.00005  # Smaller LR for fine-tuning on single samples
EVAL_BATCH_SIZE = 16 # Batch size for evaluation

# Device configuration
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')


# Initialize model at startup to avoid loading it on each request
model = None
# Define criterion globally for reuse
criterion = nn.CrossEntropyLoss()

# Image preprocessing transforms (same as test set)
transform = transforms.Compose([
   transforms.Resize((224, 224)),  # Resize to match training input size
   transforms.ToTensor(),
   transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])


# Squeeze and Excitation Block
class SEBlock(nn.Module):
   def __init__(self, channel, reduction=16):
       super(SEBlock, self).__init__()
       self.avg_pool = nn.AdaptiveAvgPool2d(1)
       self.fc = nn.Sequential(
           nn.Linear(channel, channel // reduction, bias=False),
           nn.ReLU(inplace=True),
           nn.Linear(channel // reduction, channel, bias=False),
           nn.Sigmoid()
       )


   def forward(self, x):
       b, c, _, _ = x.size()
       y = self.avg_pool(x).view(b, c)
       y = self.fc(y).view(b, c, 1, 1)
       return x * y.expand_as(x)


# Modified DenseNet with SE blocks
class DenseNetSE(nn.Module):
   def __init__(self, num_classes=4):
       super(DenseNetSE, self).__init__()
       # Load pretrained DenseNet
       densenet = models.densenet121(pretrained=False)
      
       # Get the features (all layers except the classifier)
       self.features = densenet.features
      
       # Add SE blocks after each dense block
       self.se1 = SEBlock(256)    # After first dense block
       self.se2 = SEBlock(512)    # After second dense block
       self.se3 = SEBlock(1024)   # After third dense block
       self.se4 = SEBlock(1024)   # After fourth dense block
      
       # Classifier
       self.classifier = nn.Sequential(
           nn.Linear(1024, 512),
           nn.ReLU(),
           nn.Dropout(0.2),
           nn.Linear(512, num_classes)
       )
      
   def forward(self, x):
       # First dense block
       x = self.features.conv0(x)
       x = self.features.norm0(x)
       x = self.features.relu0(x)
       x = self.features.pool0(x)
       x = self.features.denseblock1(x)
       x = self.se1(x)
       x = self.features.transition1(x)
      
       # Second dense block
       x = self.features.denseblock2(x)
       x = self.se2(x)
       x = self.features.transition2(x)
      
       # Third dense block
       x = self.features.denseblock3(x)
       x = self.se3(x)
       x = self.features.transition3(x)
      
       # Fourth dense block
       x = self.features.denseblock4(x)
       x = self.se4(x)
       x = self.features.norm5(x)
      
       x = F.adaptive_avg_pool2d(x, (1, 1))
       x = torch.flatten(x, 1)
       x = self.classifier(x)
      
       return x


def load_model(model_path):
   """Load the saved model from a .pth file"""
   checkpoint = torch.load(model_path, map_location=device)
  
   model = DenseNetSE(num_classes=4)
  
   # Handle different saved model formats
   if 'model_state_dict' in checkpoint:
       model.load_state_dict(checkpoint['model_state_dict'])
   else:
       model.load_state_dict(checkpoint)
  
   return model


@app.on_event("startup")
async def startup_event():
   """Load model on startup."""
   global model
   try:
       model = load_model(MODEL_PATH)
       model = model.to(device)
       model.eval()
       print("Model loaded successfully")
   except Exception as e:
       print(f"Error loading model: {e}")
       raise RuntimeError(f"Failed to load model: {e}")


async def store_image_and_prediction(image_data, filename, prediction, confidence, all_confidences, speed, user_id=None):
    """Store image and prediction in Supabase"""
    try:
        # Generate a unique ID for this prediction
        prediction_id = str(uuid.uuid4())
        
        # Generate a unique filename with timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        file_extension = os.path.splitext(filename)[1]
        unique_filename = f"{timestamp}_{prediction_id}{file_extension}"
        
        # Upload image to Supabase Storage
        storage_path = f"{unique_filename}"
        
        # Upload the image to Supabase storage
        res = supabase.storage.from_("lung-scan-images").upload(
            path=storage_path,
            file=image_data,
            file_options={"content-type": "image/jpeg"}  # Adjust if needed for different image types
        )
        
        # Get the public URL for the uploaded image
        image_url = supabase.storage.from_("lung-scan-images").get_public_url(storage_path)
        
        # Store prediction data in Supabase database
        data = {
            "id": prediction_id,
            "image_url": image_url,
            "prediction": prediction,
            "confidence": confidence,
            "speed": speed,  # Add speed here
            "user_id": user_id  # Now we can include the user_id
        }
        
        # Insert data into the predictions table
        result = supabase.table("predictions").insert(data).execute()
        
        return prediction_id
        
    except Exception as e:
        print(f"Error storing data in Supabase: {e}")
        # Print more detailed error info for debugging
        import traceback
        traceback.print_exc()
        raise e


async def evaluate_api_model(current_model, test_data_dir, device_to_use, transform_to_use):
    """
    Evaluates the current model on the API's test dataset.
    Adapted from your training script's evaluate_model.
    """
    if not os.path.exists(test_data_dir) or not os.listdir(test_data_dir):
        print(f"Warning: Test data directory '{test_data_dir}' is empty or does not exist. Skipping evaluation.")
        return {"error": "Test data not found or empty."}

    try:
        test_dataset = datasets.ImageFolder(test_data_dir, transform_to_use)
        if not test_dataset.classes:
             print(f"Warning: No classes found in '{test_data_dir}'. Check dataset structure. Skipping evaluation.")
             return {"error": "No classes found in test dataset."}

        test_dataloader = torch.utils.data.DataLoader(test_dataset, batch_size=EVAL_BATCH_SIZE, shuffle=False, num_workers=2) # Using 2 workers for API
        
        current_model.eval()
        all_preds = []
        all_labels = []

        with torch.no_grad():
            for inputs, labels in test_dataloader:
                inputs = inputs.to(device_to_use)
                outputs = current_model(inputs)
                _, preds = torch.max(outputs, 1)
                all_preds.extend(preds.cpu().numpy())
                all_labels.extend(labels.cpu().numpy())
        
        if not all_labels: # Should not happen if dataset is not empty and has classes
            print("Warning: No labels collected during evaluation. Skipping metrics calculation.")
            return {"warning": "No data processed during evaluation."}

        # Ensure CLASS_NAMES match the ones from ImageFolder
        # For simplicity, we assume CLASS_NAMES defined globally is consistent with test_dataset.classes
        # In a robust setup, you might want to use test_dataset.classes directly for metrics.
        
                
        # Calculate metrics only if there are predictions
        if all_preds:
            precision, recall, f1, _ = precision_recall_fscore_support(all_labels, all_preds, average='weighted', zero_division=0)
            accuracy = accuracy_score(all_labels, all_preds)
            
            per_class_precision, per_class_recall, per_class_f1, _ = precision_recall_fscore_support(all_labels, all_preds, average=None, labels=list(range(len(CLASS_NAMES))), zero_division=0)

            metrics = {
                "overall_accuracy": float(accuracy),
                "overall_precision_weighted": float(precision),
                "overall_recall_weighted": float(recall),
                "overall_f1_weighted": float(f1),
                "per_class_metrics": {}
            }
            for i, class_name in enumerate(CLASS_NAMES):
                 if i < len(per_class_precision): # Check bounds
                    metrics["per_class_metrics"][class_name] = {
                        "precision": float(per_class_precision[i]),
                        "recall": float(per_class_recall[i]),
                        "f1_score": float(per_class_f1[i])
                    }
                 else: # Should not happen if CLASS_NAMES and dataset classes align
                    metrics["per_class_metrics"][class_name] = {"precision": 0, "recall": 0, "f1_score": 0, "note": "Index out of bounds for metrics array"}

            print(f"Evaluation complete. Accuracy: {accuracy:.4f}")
            return metrics
        else:
            print("Warning: No predictions made during evaluation. Metrics cannot be calculated.")
            return {"warning": "No predictions to evaluate."}

    except Exception as e:
        print(f"Error during evaluation: {e}")
        import traceback
        traceback.print_exc()
        return {"error": f"Evaluation failed: {str(e)}"}


async def retrain_and_evaluate_task(image_bytes: bytes, correct_label_str: str, prediction_id: str):
    """
    Background task to fine-tune the model with a new sample and evaluate it.
    """
    global model # We are modifying the global model

    try:
        print(f"Background task started for prediction ID: {prediction_id}, Label: {correct_label_str}")
        
        # 1. Preprocess the new image
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        img_tensor = transform(image).unsqueeze(0).to(device)

        # 2. Convert correct_label to target tensor
        if correct_label_str not in CLASS_NAMES:
            print(f"Error: Invalid label '{correct_label_str}' provided for retraining.")
            return
        
        label_idx = CLASS_NAMES.index(correct_label_str)
        target = torch.tensor([label_idx], dtype=torch.long).to(device)

        # 3. Fine-tune the model (one step)
        # Use the same optimizer type as in your training script
        optimizer = optim.Adam(model.parameters(), lr=FINE_TUNE_LEARNING_RATE)
        
        model.train()  # Set model to training mode
        optimizer.zero_grad()
        outputs = model(img_tensor)
        loss = criterion(outputs, target) # Use global criterion
        loss.backward()
        optimizer.step()
        model.eval()  # Set model back to evaluation mode

        print(f"Model fine-tuned for {prediction_id}. Loss: {loss.item():.4f}")

        # 4. Save the updated model state (overwrites the existing model)
        # Consider model versioning for production
        torch.save(model.state_dict(), MODEL_PATH)
        print(f"Updated model saved to {MODEL_PATH}")

        # 5. Evaluate the updated model (Commented out as per request)
        # print(f"Starting evaluation of the fine-tuned model...")
        # eval_metrics = await evaluate_api_model(model, API_TEST_DATA_DIR, device, transform)
        # print(f"Evaluation metrics for fine-tuned model: {eval_metrics}")

    except Exception as e:
        print(f"Error in background retraining/evaluation task for {prediction_id}: {e}")
        import traceback
        traceback.print_exc()


@app.get("/", response_class=HTMLResponse)
async def read_root():
   """Serve a simple HTML page with an upload form."""
   return """
   <!DOCTYPE html>
   <html>
   <head>
       <title>Lung Cancer Type Prediction</title>
       <style>
           body {
               font-family: Arial, sans-serif;
               max-width: 800px;
               margin: 0 auto;
               padding: 20px;
           }
           h1 {
               color: #333;
           }
           form {
               margin: 20px 0;
               padding: 20px;
               border: 1px solid #ddd;
               border-radius: 5px;
           }
           button {
               background-color: #4CAF50;
               color: white;
               padding: 10px 15px;
               border: none;
               border-radius: 5px;
               cursor: pointer;
           }
           #result {
               margin-top: 20px;
               padding: 15px;
               border: 1px solid #ddd;
               border-radius: 5px;
               display: none;
           }
           .prediction {
               font-weight: bold;
               font-size: 18px;
               margin-bottom: 10px;
           }
           .confidence {
               margin-bottom: 5px;
           }
           #loading {
               display: none;
               margin-top: 10px;
           }
       </style>
   </head>
   <body>
       <h1>Lung Cancer Type Prediction</h1>
       <p>Upload a lung CT scan image for classification:</p>
       <form id="upload-form" enctype="multipart/form-data">
           <input type="file" id="file" name="file" accept="image/*" required>
           <button type="submit">Predict</button>
           <div id="loading">Processing...</div>
       </form>
       <div id="result">
           <div class="prediction" id="prediction-text"></div>
           <div id="confidence-scores"></div>
           <div id="storage-status"></div>
       </div>


       <script>
           document.getElementById('upload-form').addEventListener('submit', async (e) => {
               e.preventDefault();
              
               const formData = new FormData();
               const fileInput = document.getElementById('file');
               if (fileInput.files.length === 0) {
                   alert('Please select a file');
                   return;
               }
              
               formData.append('file', fileInput.files[0]);
               
               // Show loading indicator
               document.getElementById('loading').style.display = 'block';
               document.getElementById('result').style.display = 'none';
              
               try {
                   const response = await fetch('/predict/', {
                       method: 'POST',
                       body: formData
                   });
                  
                   const result = await response.json();
                  
                   document.getElementById('prediction-text').textContent =
                       `Prediction: ${result.prediction} (${(result.confidence * 100).toFixed(2)}% confidence)`;
                      
                   // Display all confidence scores
                   const confidenceScoresDiv = document.getElementById('confidence-scores');
                   confidenceScoresDiv.innerHTML = '';
                   Object.entries(result.all_confidences).forEach(([className, confidence]) => {
                       const confidenceItem = document.createElement('div');
                       confidenceItem.className = 'confidence';
                       confidenceItem.textContent = `${className}: ${(confidence * 100).toFixed(2)}%`;
                       confidenceScoresDiv.appendChild(confidenceItem);
                   });
                   
                   // Display storage status
                   if (result.stored_id) {
                       document.getElementById('storage-status').textContent = 
                           `Results and image saved to database (ID: ${result.stored_id})`;
                   }
                  
                   // Hide loading and show results
                   document.getElementById('loading').style.display = 'none';
                   document.getElementById('result').style.display = 'block';
               } catch (error) {
                   console.error('Error:', error);
                   alert('Error predicting image');
                   document.getElementById('loading').style.display = 'none';
               }
           });
       </script>
   </body>
   </html>
   """


@app.post("/predict/")
async def predict(
    file: UploadFile = File(...),
    user_id: Optional[str] = Form(None)  # Added user_id as an optional form parameter
):
   """
   Make a prediction on the uploaded image and store in Supabase.
   Returns the predicted class and confidence score.
   """
   if not file.content_type.startswith("image/"):
       raise HTTPException(status_code=400, detail="Uploaded file is not an image")
  
   try:
       start_time = time.time() # Record start time
       # Read image
       contents = await file.read()
       image = Image.open(io.BytesIO(contents)).convert("RGB")
       
       # Create a copy of the contents for storage
       image_for_storage = contents
      
       # Preprocess image for model
       img_tensor = transform(image).unsqueeze(0).to(device)
      
       # Make prediction
       with torch.no_grad():
           outputs = model(img_tensor)
           probs = F.softmax(outputs, dim=1)[0]
          
           # Get prediction and confidence
           prediction_idx = torch.argmax(probs).item()
           prediction = CLASS_NAMES[prediction_idx]
           confidence = probs[prediction_idx].item()
          
           # Get all confidences
           all_confidences = {CLASS_NAMES[i]: probs[i].item() for i in range(len(CLASS_NAMES))}
       
       end_time = time.time() # Record end time
       processing_speed = end_time - start_time # Calculate processing speed

       # Store image and prediction in Supabase with user_id
       stored_id = await store_image_and_prediction(
           image_for_storage, 
           file.filename, 
           prediction, 
           confidence, 
           all_confidences,
           processing_speed, # Pass the processing speed
           user_id  # Pass the user_id to the store function
       )
          
       return {
           "prediction": prediction,
           "confidence": confidence,
           "all_confidences": all_confidences,
           "stored_id": stored_id,
           "speed": processing_speed  # Return processing speed
       }
  
   except Exception as e:
       raise HTTPException(status_code=500, detail=f"Error predicting image: {str(e)}")


@app.post("/feedback/")
async def feedback_and_retrain(
    background_tasks: BackgroundTasks, # Inject BackgroundTasks
    file: UploadFile = File(...),
    prediction_id: str = Form(...),
    correct_label: str = Form(...)
):
    """
    Accepts feedback (correct label) for a prediction,
    updates the Supabase record, and queues a background task
    for model fine-tuning and evaluation.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file is not an image.")

    if correct_label not in CLASS_NAMES:
        raise HTTPException(status_code=400, detail=f"Invalid label. Must be one of: {CLASS_NAMES}")

    try:
        image_bytes = await file.read() # Read file content once

        # 1. Update Supabase record (synchronously)
        db_response = supabase.table("predictions").select("prediction").eq("id", prediction_id).execute()
        
        db_update_message = f"Supabase record with ID {prediction_id} not found."
        updated_db_status = False

        if db_response.data:
            current_prediction_in_db = db_response.data[0]['prediction']
            if current_prediction_in_db != correct_label:
                update_response = supabase.table("predictions").update({"prediction": correct_label}).eq("id", prediction_id).execute()
                # Basic check, Supabase client might raise error on failure
                if update_response.data or (hasattr(update_response, 'status_code') and 200 <= update_response.status_code < 300):
                    db_update_message = f"Supabase record {prediction_id} updated: old_label='{current_prediction_in_db}', new_label='{correct_label}'."
                    updated_db_status = True
                else:
                    db_update_message = f"Supabase record {prediction_id} update may have failed. Old: '{current_prediction_in_db}', New: '{correct_label}'."
            else:
                db_update_message = f"Supabase record {prediction_id} already has the correct label '{correct_label}'. No update needed."
                updated_db_status = True # Considered successful as no change needed
        else:
            # Optionally, raise HTTPException if record must exist for feedback
            print(f"Warning: Prediction ID {prediction_id} not found in database for feedback.")


        # 2. Add fine-tuning and evaluation to background tasks
        background_tasks.add_task(retrain_and_evaluate_task, image_bytes, correct_label, prediction_id)
        
        return {
            "message": "Feedback received. Model fine-tuning and evaluation initiated in the background.",
            "prediction_id": prediction_id,
            "correct_label": correct_label,
            "database_update_status": db_update_message,
            "database_record_updated_or_confirmed": updated_db_status
        }

    except HTTPException as e:
        raise e # Re-raise FastAPI/HTTP exceptions
    except Exception as e:
        print(f"Error processing feedback for {prediction_id}: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error processing feedback: {str(e)}")


if __name__ == "__main__":
   # Run the server
   uvicorn.run("api:app", host="0.0.0.0", port=5500, reload=True)