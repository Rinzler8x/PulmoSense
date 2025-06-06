"use client";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import { Stethoscope, X, Zap, MessageCircleQuestion, MessageSquareWarningIcon } from "lucide-react";
import { Footer } from "@/components/footer";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"; 
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Define TypeScript type for prediction result
type PredictionResult = {
  prediction: string;
  confidence: number;
  all_confidences: { [key: string]: number };
  speed: number;
  stored_id?: string;
};

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [isNoClicked, setIsNoClicked] = useState(false); // State to manage "No" button click
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleOptionChange = (option: string) => {
    setSelectedOption(option);
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getSession();
      setIsLoggedIn(!!data.session);

      // Store the user ID if logged in
      if (data.session) {
        setUserId(data.session.user.id);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setIsLoggedIn(!!session);
        // Update user ID when auth state changes
        setUserId(session?.user.id || null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      
      // Create image preview URL
      const previewUrl = URL.createObjectURL(selectedFile);
      setImagePreview(previewUrl);
    }
  };

  const handleRemoveImage = () => {
    setFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleAnalyzeClick = async () => {
    if (!file) {
      alert("Please upload an image!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);

    // Add user ID to form data if available
    if (userId) {
      formData.append("user_id", userId);
    }

    try {
      const response = await fetch("http://localhost:5500/predict/", {
        method: "POST",
        body: formData,
      });

      const data: PredictionResult = await response.json();
      console.log(data)
      setResult(data);
    } catch (error) {
      console.error("Error analyzing image:", error);
      alert("Error analyzing image");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50">
      <div className="max-w-3xl w-full text-center">
        <h1 className="text-5xl font-bold mb-4">PulmoSense</h1>
        <p className="text-xl text-gray-600 mb-8">
          Early detection saves lives. Use our AI-powered tool to analyze your
          symptoms or chest images.
        </p>

        {/* {userId && (
          <div className="mb-4 text-sm text-gray-600">
            Logged in as user: {userId.substring(0, 8)}...
          </div>
        )} */}

        <Card className="p-6 bg-white shadow-md">
          <h2 className="text-2xl font-semibold mb-2">Lung Cancer Detection</h2>
          <p className="text-gray-600 mb-4">Upload an image for analysis</p>
          <p className="text-sm text-gray-500 mb-4">
            Recommended: CT scan
          </p>

          <div className="flex flex-col gap-4">
            {imagePreview ? (
              <div className="relative">
                <div className="rounded-lg overflow-hidden border border-gray-300">
                  <img 
                    src={imagePreview} 
                    alt="Preview" 
                    className="w-full h-64 object-contain"
                  />
                </div>
                <button 
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                >
                  <X size={16} />
                </button>
                <p className="mt-2 text-sm text-gray-600">{file?.name}</p>
              </div>
            ) : (
              <div 
                className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                onClick={() => document.getElementById('fileInput')?.click()}
              >
                <input
                  id="fileInput"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <div className="flex flex-col items-center">
                  <svg className="w-10 h-10 text-gray-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                  </svg>
                  <p className="text-sm text-gray-500">
                    Click to upload an image or drag and drop
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Supports: JPG, PNG, JPEG
                  </p>
                </div>
              </div>
            )}

            {isLoggedIn ? (
              <Button
                className="bg-green-500 hover:bg-green-600 text-white"
                onClick={handleAnalyzeClick}
                disabled={loading || !file}
              >
                {loading ? "Analyzing..." : "Analyze"}
              </Button>
            ) : (
              <div className="text-center">
                <p className="mb-2 text-gray-600">
                  Please login to analyze images
                </p>
                <Link href="/authentication">
                  <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                    Login / Signup
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {result && (
            <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-left">Analysis Results</h3>
              <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                <PopoverTrigger asChild>
                  <button 
                    className="flex items-center justify-center p-2 bg-inherit text-black rounded-full hover:bg-gray-200 transition duration-300 focus:outline-none"
                    onClick={() => setIsPopoverOpen(true)}
                    >
                    <MessageSquareWarningIcon className="w-6 h-6" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="p-4 shadow-md">
                  <h4 className="text-lg font-medium mb-2">
                    Is the prediction correct?
                  </h4>
                  <div className="flex gap-4">
                    <Button
                      className="bg-inherit text-green-600 border-green-600 border hover:bg-green-200 transition duration-300"
                      onClick={async () => {
                        const formData = new FormData();
                        formData.append("file", file); // `file` must be a File object
                        formData.append("prediction_id", result.stored_id);
                        formData.append("correct_label", result.prediction);
                      
                        try {
                          await fetch("http://localhost:5500/feedback", {
                            method: "POST",
                            body: formData,
                          });
                          
                        } catch (error) {
                          console.error("Error sending feedback:", error);
                        }

                        setIsPopoverOpen(false)
                      }}
                    >
                      Yes
                    </Button>
                    <Popover>
                      <PopoverTrigger>
                        <Button
                          className="bg-inherit text-red-600 border-red-600 border hover:bg-gray-200 transition duration-300"
                          onClick={() => {
                            setIsNoClicked(true);
                          }}
                        >
                          No
                        </Button>
                      </PopoverTrigger>
                    </Popover>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Diagnosis */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Diagnosis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center mb-2">
                      <div className={`h-4 w-4 rounded-full mr-2 ${
                        result.prediction.includes("carcinoma") ? "bg-red-500" : "bg-green-500"
                      }`}></div>
                      <p className="text-lg font-semibold">
                        {result.prediction.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600">
                      {result.prediction.includes("carcinoma") 
                        ? "Abnormal cells detected. Please consult with your healthcare provider."
                        : "No abnormal cells detected."
                      }
                    </p>
                  </CardContent>
                </Card>

                {/* Confidence */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Confidence</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                      <div 
                        className={`h-4 rounded-full ${
                          result.prediction.includes("carcinoma") ? "bg-red-500" : "bg-green-500"
                        }`}
                        style={{ width: `${result.confidence * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-right text-sm font-medium">
                      {(result.confidence * 100).toFixed(2)}%
                    </p>
                  </CardContent>
                </Card>

                {/* Detailed Analysis */}
                <Card className="sm:col-span-1">
                  <CardHeader>
                    <CardTitle className="text-lg font-medium">Detailed Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-2">
                      {Object.entries(result.all_confidences).map(([className, confidence]) => (
                        <div key={className} className="flex items-center justify-between border-b pb-1">
                          <span className="text-sm">
                            {className.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                          </span>
                          <span className="font-semibold">
                            {(confidence * 100).toFixed(2)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Processing Speed */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">Processing Speed</CardTitle>
                    <Zap className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent className="h-24 flex items-center justify-center pt-[72]">
                    <div className="text-[50px] font-bold">{result.speed.toFixed(4)}s</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {isNoClicked && (
            <Dialog open={isNoClicked} onOpenChange={setIsNoClicked}>
              <DialogContent>
                <DialogTitle>Feedback</DialogTitle>
                <DialogDescription>
                  Please select the correct Class
                </DialogDescription>

                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="adenocarcinoma"
                      checked={selectedOption === "adenocarcinoma"}
                      onChange={() => handleOptionChange("adenocarcinoma")}
                      className="h-4 w-4"
                    />
                    Adenocarcinoma
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="large_cell_carcinoma"
                      checked={selectedOption === "large_cell_carcinoma"}
                      onChange={() =>
                        handleOptionChange("large_cell_carcinoma")
                      }
                      className="h-4 w-4"
                    />
                    Large Cell Carcinoma
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="normal"
                      checked={selectedOption === "normal"}
                      onChange={() => handleOptionChange("normal")}
                      className="h-4 w-4"
                    />
                    Normal
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="squamous_cell_carcinoma"
                      checked={selectedOption === "squamous_cell_carcinoma"}
                      onChange={() =>
                        handleOptionChange("squamous_cell_carcinoma")
                      }
                      className="h-4 w-4"
                    />
                    Squamous Cell Carcinoma
                  </label>

                  <label className="flex items-center gap-2">
                    <input
                      type="radio"
                      value="not sure"
                      checked={selectedOption === "not sure"}
                      onChange={() => handleOptionChange("not sure")}
                      className="h-4 w-4"
                    />
                    Not sure
                  </label>
                </div>

                <DialogFooter>
                  <Button
                    onClick={async () => {
                      const formData = new FormData();
                      formData.append("file", file); // File object
                      formData.append("prediction_id", result.stored_id);
                      formData.append("correct_label", selectedOption); // Send selectedOption instead
                  
                      try {
                        await fetch("http://localhost:5500/feedback", {
                          method: "POST",
                          body: formData,
                        });
                  
                        setIsNoClicked(false); // Close the dialog after submission
                        console.log("Submitted feedback with selected option:", selectedOption);
                      } catch (error) {
                        console.error("Error sending feedback:", error);
                      }
                    }}
                  >
                    Submit
                  </Button>
                  <DialogClose>
                    <Button className="outline">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </Card>
      </div>
    </main>
  );
}
