"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function LungCancerInputForm() {
  // const [inputType, setInputType] = useState<"text" | "image">("text");
  // const [textInput, setTextInput] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult("Analysis complete. Please consult with a medical professional for accurate diagnosis.");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);

    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Lung Cancer Detection</CardTitle>
        <CardDescription>Upload an image for analysis</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="image">Recommended: CT scan</Label>
              <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
            </div>
            {imagePreview && (
              <div className="mt-4">
                <p className="text-sm text-gray-500">Image Preview:</p>
                <img
                  src={imagePreview}
                  alt="Uploaded Preview"
                  className="mt-2 w-full max-h-60 object-contain rounded-lg border"
                />
              </div>
            )}
            <Button type="submit" className="bg-green-500 text-white">
              Analyze
            </Button>
          </div>
        </form>
      </CardContent>
      {result && (
        <CardFooter>
          <p className="text-sm text-muted-foreground">{result}</p>
        </CardFooter>
      )}
    </Card>
  );
}
