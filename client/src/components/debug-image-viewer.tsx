import React from 'react';
import { Camera, Image, Shield, Sparkles, Download, Eye } from 'lucide-react';

interface DebugImageViewerProps {
  originalImages: string[];
  maskedImages: string[];
  originalCollageUrl: string | null;
  maskedCollageUrl: string | null;
  generatedImageUrl: string | null;
  isProcessing: boolean;
  currentStep: string;
}

export function DebugImageViewer({
  originalImages,
  maskedImages,
  originalCollageUrl,
  maskedCollageUrl,
  generatedImageUrl,
  isProcessing,
  currentStep
}: DebugImageViewerProps) {
  return (
    <div className="fixed right-4 top-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto z-50">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <Eye className="h-5 w-5 mr-2 text-blue-500" />
          Debug Image Viewer
        </h3>
        <p className="text-sm text-gray-600 mt-1">Track all images in the process</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Current Step */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isProcessing ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-sm font-medium text-blue-700">{currentStep}</span>
          </div>
        </div>

        {/* Original Images */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Camera className="h-4 w-4 mr-2 text-green-500" />
            Original Scanned Images ({originalImages.length})
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {originalImages.map((image, index) => (
              <div key={index} className="relative">
                <img 
                  src={image} 
                  alt={`Original ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg border border-gray-200"
                />
                <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Masked Images */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Shield className="h-4 w-4 mr-2 text-purple-500" />
            Masked Images ({maskedImages.length})
          </h4>
          <div className="grid grid-cols-3 gap-2">
            {maskedImages.map((image, index) => (
              <div key={index} className="relative">
                <img 
                  src={image} 
                  alt={`Masked ${index + 1}`}
                  className="w-full h-20 object-cover rounded-lg border border-purple-200"
                />
                <div className="absolute top-1 left-1 bg-purple-500 text-white text-xs px-1 rounded">
                  M{index + 1}
                </div>
              </div>
            ))}
            {maskedImages.length === 0 && (
              <div className="col-span-3 text-center py-4 text-gray-400 text-sm">
                No masked images yet
              </div>
            )}
          </div>
        </div>

        {/* Original Collage */}
        {originalCollageUrl && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Image className="h-4 w-4 mr-2 text-blue-500" />
              Original Collage (3 Images)
            </h4>
            <div className="relative">
              <img 
                src={originalCollageUrl} 
                alt="Original Collage"
                className="w-full h-24 object-cover rounded-lg border border-blue-200"
              />
              <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                Original
              </div>
            </div>
          </div>
        )}

        {/* Masked Collage */}
        {maskedCollageUrl && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Shield className="h-4 w-4 mr-2 text-purple-500" />
              Masked Collage (3 Masked Images)
            </h4>
            <div className="relative">
              <img 
                src={maskedCollageUrl} 
                alt="Masked Collage"
                className="w-full h-24 object-cover rounded-lg border border-purple-200"
              />
              <div className="absolute top-1 left-1 bg-purple-500 text-white text-xs px-1 rounded">
                Masked
              </div>
            </div>
          </div>
        )}

        {/* Generated Image */}
        {generatedImageUrl && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
              <Sparkles className="h-4 w-4 mr-2 text-green-500" />
              Generated Result
            </h4>
            <div className="relative">
              <img 
                src={generatedImageUrl} 
                alt="Generated Image"
                className="w-full h-24 object-cover rounded-lg border border-green-200"
              />
              <div className="absolute top-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                Generated
              </div>
            </div>
          </div>
        )}

        {/* API Call Status */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">API Calls Status</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Masking API Calls:</span>
              <span className="font-medium">{maskedImages.length}/3</span>
            </div>
            <div className="flex justify-between">
              <span>Inpainting API:</span>
              <span className="font-medium">{generatedImageUrl ? 'Completed' : 'Pending'}</span>
            </div>
          </div>
        </div>

        {/* Download Links */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Download Images</h4>
          <div className="space-y-1">
            {originalCollageUrl && (
              <a 
                href={originalCollageUrl} 
                download="original-collage.png"
                className="flex items-center space-x-2 text-xs text-blue-600 hover:text-blue-800"
              >
                <Download className="h-3 w-3" />
                <span>Original Collage</span>
              </a>
            )}
            {maskedCollageUrl && (
              <a 
                href={maskedCollageUrl} 
                download="masked-collage.png"
                className="flex items-center space-x-2 text-xs text-purple-600 hover:text-purple-800"
              >
                <Download className="h-3 w-3" />
                <span>Masked Collage</span>
              </a>
            )}
            {generatedImageUrl && (
              <a 
                href={generatedImageUrl} 
                download="generated-hairstyle.png"
                className="flex items-center space-x-2 text-xs text-green-600 hover:text-green-800"
              >
                <Download className="h-3 w-3" />
                <span>Generated Result</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 