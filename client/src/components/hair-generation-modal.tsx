import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, Sparkles, Brain, Palette } from 'lucide-react';
import React from 'react';
import { hairGenerationAPI } from '../services/hair-generation-api';

interface HairGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerationComplete: (resultUrl: string) => void;
  originalImageUrl: string;
  maskImageUrl: string;
  selectedTemplate: any;
}

export function HairGenerationModal({
  isOpen,
  onClose,
  onGenerationComplete,
  originalImageUrl,
  maskImageUrl,
  selectedTemplate
}: HairGenerationModalProps) {
  const [maskedImage, setMaskedImage] = useState<string | null>(null);
  const [maskingLoading, setMaskingLoading] = useState(false);
  
  // Inpainting debug state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStepNumber, setGenerationStepNumber] = useState(1);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [templatePrompt, setTemplatePrompt] = useState<string>('');
  const [loraPath, setLoraPath] = useState<string>('');
  const [generationStep, setGenerationStep] = useState<string>('');

  const steps = [
    { name: 'Uploading Image', icon: Sparkles, color: 'blue' },
    { name: 'Analyzing Hair Mask', icon: Brain, color: 'purple' },
    { name: 'Generating New Hairstyle', icon: Sparkles, color: 'pink' },
    { name: 'Applying Template Style', icon: Palette, color: 'green' },
    { name: 'Finalizing Results', icon: Sparkles, color: 'emerald' }
  ];

  useEffect(() => {
    if (isOpen && !isGenerating) {
      // If we have originalImageUrl and maskImageUrl, use them directly
      if (originalImageUrl && maskImageUrl) {
        startRealGeneration();
      } else {
        // Show upload interface
        setGenerationStepNumber(0);
      }
    }
  }, [isOpen, originalImageUrl, maskImageUrl]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMaskingLoading(true);
    setError('');

    try {
      // Convert file to base64
      const imageBase64 = await fileToBase64(file);
      
      // Call hair segmentation API
      const maskResponse = await fetch('https://www.ailabapi.com/api/portrait/effects/hair-segmentation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ailabapi-api-key': '5Ijx0puFEwRWm28jizz6kLSg3Xr9cbn3uQamsk10xflf2UYH7WMUZcA6G8IAhCrq'
        },
        body: JSON.stringify({
          image: imageBase64
        })
      });

      if (!maskResponse.ok) {
        throw new Error('Failed to analyze image');
      }

      const maskData = await maskResponse.json();
      
      if (maskData.error_code !== 0) {
        throw new Error(maskData.error_msg || 'Image analysis failed');
      }

      // Set the uploaded image and generated mask
      setUploadedImage(file);
      setUploadedImagePreview(imageBase64);
      setMaskedImage(maskData.data.mask_url);
      
      // Start generation after masking
      setTimeout(() => {
        startRealGeneration();
      }, 1000);
      
    } catch (err) {
      setError(`Image analysis failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setMaskingLoading(false);
    }
  };

  const startRealGeneration = async () => {
    console.log('=== Starting Real Generation ===');
    console.log('Original Image URL:', originalImageUrl);
    console.log('Mask Image URL:', maskImageUrl);
    console.log('Uploaded Image:', uploadedImage);
    console.log('Masked Image:', maskedImage);
    console.log('Selected Template:', selectedTemplate);

    // Use either the passed props or the uploaded image
    const imageToUse = uploadedImage ? await fileToBase64(uploadedImage) : originalImageUrl;
    const maskToUse = maskedImage || maskImageUrl;

    if (!imageToUse || !maskToUse || !selectedTemplate) {
      const missingData = [];
      if (!imageToUse) missingData.push('image');
      if (!maskToUse) missingData.push('mask');
      if (!selectedTemplate) missingData.push('template');
      
      const errorMsg = `Missing required data for generation: ${missingData.join(', ')}`;
      console.error(errorMsg);
      setError(errorMsg);
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGenerationStepNumber(0);
    setProgress(0);

    try {
      // Step 1: Uploading Image
      setGenerationStepNumber(0);
      setProgress(10);
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Step 2: Analyzing Hair Mask
      setGenerationStepNumber(1);
      setProgress(25);
      await new Promise(resolve => setTimeout(resolve, 800));

      // Step 3: Start Real API Call
      setGenerationStepNumber(2);
      setProgress(40);

      // Initialize hair generation API
      const apiKey = import.meta.env.VITE_FAL_KEY;
      hairGenerationAPI.initialize(apiKey);

      console.log('Starting real hair generation with:');
      console.log('Image to use:', imageToUse);
      console.log('Mask to use:', maskToUse);
      console.log('Template:', selectedTemplate.name);
      console.log('Template prompt:', selectedTemplate.prompt);
      console.log('Template LoRA path:', selectedTemplate.loraPath);

      // Set debug information
      setTemplatePrompt(selectedTemplate.prompt);
      setLoraPath(selectedTemplate.loraPath);
      setGenerationStep('Calling inpainting API...');

      // Call the real hair generation API
      const result = await hairGenerationAPI.generateHairStyle(
        imageToUse,
        maskToUse,
        selectedTemplate
      );

      // Step 4: Processing Results
      setGenerationStepNumber(3);
      setProgress(75);
      await new Promise(resolve => setTimeout(resolve, 500));

      // Step 5: Finalize
      setGenerationStepNumber(4);
      setProgress(100);
      await new Promise(resolve => setTimeout(resolve, 500));

      console.log('Real hair generation completed:', result);

      // Check if we got a valid result
      if (result.images && result.images.length > 0) {
        const generatedImageUrl = result.images[0].url;
        console.log('Generated image URL:', generatedImageUrl);
        
        setGeneratedImageUrl(generatedImageUrl);
        setGenerationStep('Generation completed!');
        
        // Pass the real result back
        onGenerationComplete(generatedImageUrl);
      } else {
        throw new Error('No images generated from API');
      }

    } catch (error) {
      console.error('Real hair generation failed:', error);
      setError(error instanceof Error ? error.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
      // Don't close modal immediately on error, let user see the error
      if (!error) {
        setTimeout(() => {
          onClose();
        }, 1000);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      
      <div className="bg-white rounded-3xl p-8 max-w-2xl mx-4 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="text-center">
          {/* Header */}
          <div className="relative mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 via-blue-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="h-12 w-12 text-purple-500 animate-pulse" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-white rounded-full animate-ping"></div>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Hair Transformation</h2>
          <p className="text-gray-600 mb-6">Creating your new {selectedTemplate?.name} hairstyle...</p>

          {/* Image Upload Section (if no images provided) */}
          {!originalImageUrl && !uploadedImage && (
            <div className="mb-8">
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-purple-400 transition-colors">
                <div className="text-center">
                  <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">Upload Your Image</h3>
                  <p className="text-gray-500 mb-4">Upload a clear photo of your face to generate a new hairstyle</p>
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    id="hair-image-upload"
                    className="hidden"
                  />
                  <label 
                    htmlFor="hair-image-upload" 
                    className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl cursor-pointer hover:from-purple-600 hover:to-blue-600 transition-all duration-300"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Choose Image
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Image Preview */}
          {uploadedImagePreview && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">Uploaded Image</h3>
              <div className="relative inline-block">
                <img 
                  src={uploadedImagePreview} 
                  alt="Uploaded" 
                  className="w-48 h-48 object-cover rounded-xl border-2 border-purple-200"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                  ✓ Uploaded
                </div>
              </div>
            </div>
          )}

          {/* Masking Loading */}
          {maskingLoading && (
            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                <div>
                  <h3 className="font-semibold text-blue-700">Analyzing Your Image</h3>
                  <p className="text-blue-600 text-sm">Generating hair mask...</p>
                </div>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">!</span>
                </div>
                <span className="text-red-700 font-medium">Generation Error</span>
              </div>
              <p className="text-red-600 text-sm mt-2">{error}</p>
              <button 
                onClick={() => {
                  setError(null);
                  startRealGeneration();
                }}
                className="mt-3 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-sm text-gray-500">{Math.round(progress)}% Complete</div>
          </div>

          {/* Current Step */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br from-${steps[generationStepNumber]?.color}-100 to-${steps[generationStepNumber]?.color}-200 rounded-full flex items-center justify-center`}>
                {steps[generationStepNumber]?.icon && React.createElement(steps[generationStepNumber].icon, { className: `h-6 w-6 text-${steps[generationStepNumber]?.color}-500` })}
              </div>
              <div className="text-left">
                <h3 className="font-semibold text-gray-800">{steps[generationStepNumber]?.name}</h3>
                <p className="text-sm text-gray-500">Step {generationStepNumber + 1} of {steps.length}</p>
              </div>
            </div>
          </div>

          {/* Template Info */}
          {selectedTemplate && (
            <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className="text-2xl">{selectedTemplate.icon}</div>
                <div>
                  <h4 className="font-semibold text-gray-800">{selectedTemplate.name}</h4>
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-4 h-4 rounded-full border border-gray-300" 
                      style={{ backgroundColor: selectedTemplate.color }}
                    />
                    <span className="text-sm text-gray-600">Hair Color</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Animated Elements */}
          <div className="flex justify-center space-x-2 mb-6">
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
            <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" style={{animationDelay: '0.6s'}}></div>
          </div>

          {/* Status Message */}
          <div className="text-sm text-gray-500">
            {error ? 'Generation failed. Please try again.' : 
             isGenerating ? 'Please wait while AI transforms your hairstyle...' : 
             'Generation complete!'}
          </div>

          {/* Debug Info (only in development) */}
          {import.meta.env.DEV && (
            <div className="mt-4 p-3 bg-gray-100 rounded-lg text-xs text-gray-600">
              <div>Original URL: {originalImageUrl ? '✓ Set' : '✗ Missing'}</div>
              <div>Mask URL: {maskImageUrl ? '✓ Set' : '✗ Missing'}</div>
              <div>Uploaded Image: {uploadedImage ? '✓ Set' : '✗ Missing'}</div>
              <div>Masked Image: {maskedImage ? '✓ Set' : '✗ Missing'}</div>
              <div>Template: {selectedTemplate ? '✓ Set' : '✗ Missing'}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 