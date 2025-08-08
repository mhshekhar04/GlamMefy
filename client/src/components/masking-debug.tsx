import React from 'react';
import { Camera, Shield, Image, Sparkles } from 'lucide-react';

interface MaskingDebugProps {
  originalImages: string[];
  maskedImages: string[];
  originalCollageUrl: string | null;
  maskedCollageUrl: string | null;
  isMasking: boolean;
  maskingStep: string;
}

export function MaskingDebug({
  originalImages,
  maskedImages,
  originalCollageUrl,
  maskedCollageUrl,
  isMasking,
  maskingStep
}: MaskingDebugProps) {
  return (
    <div className="fixed left-4 top-4 w-72 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[80vh] overflow-y-auto z-50">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800">Masking Debug</h3>
        <p className="text-sm text-gray-600">Track masking process</p>
      </div>

      <div className="p-4 space-y-4">
        {/* Status */}
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isMasking ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-sm font-medium text-blue-700">{maskingStep}</span>
          </div>
        </div>

        {/* Original Images */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Camera className="h-4 w-4 mr-2 text-green-500" />
            Original ({originalImages.length})
          </h4>
          <div className="grid grid-cols-3 gap-1">
            {originalImages.map((image, index) => (
              <div key={index} className="relative">
                <img 
                  src={image} 
                  alt={`Original ${index + 1}`}
                  className="w-full h-16 object-cover rounded border border-gray-200"
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
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <Shield className="h-4 w-4 mr-2 text-purple-500" />
            Masked ({maskedImages.length}/3)
          </h4>
          <div className="grid grid-cols-3 gap-1">
            {maskedImages.map((image, index) => (
              <div key={index} className="relative">
                <img 
                  src={image} 
                  alt={`Masked ${index + 1}`}
                  className="w-full h-16 object-cover rounded border border-purple-200"
                />
                <div className="absolute top-1 left-1 bg-purple-500 text-white text-xs px-1 rounded">
                  M{index + 1}
                </div>
              </div>
            ))}
            {maskedImages.length < 3 && (
              <div className="col-span-3 text-center py-4 text-gray-400 text-xs">
                Processing... {maskedImages.length}/3
              </div>
            )}
          </div>
        </div>

        {/* Collages */}
        {originalCollageUrl && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Image className="h-4 w-4 mr-2 text-blue-500" />
              Original Collage
            </h4>
            <img 
              src={originalCollageUrl} 
              alt="Original Collage"
              className="w-full h-20 object-cover rounded border border-blue-200"
            />
          </div>
        )}

        {maskedCollageUrl && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
              <Shield className="h-4 w-4 mr-2 text-purple-500" />
              Masked Collage
            </h4>
            <img 
              src={maskedCollageUrl} 
              alt="Masked Collage"
              className="w-full h-20 object-cover rounded border border-purple-200"
            />
          </div>
        )}

        {/* API Status */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">API Status</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Masking API:</span>
              <span className="font-medium">{maskedImages.length}/3 calls</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-medium">{isMasking ? 'Processing' : 'Complete'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 