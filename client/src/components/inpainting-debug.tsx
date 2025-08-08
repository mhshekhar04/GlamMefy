import React from 'react';
import { Image, Shield, Sparkles, Settings, Download, Eye } from 'lucide-react';

interface InpaintingDebugProps {
  originalCollageUrl: string | null;
  maskedCollageUrl: string | null;
  templatePrompt: string | null;
  loraPath: string | null;
  isGenerating: boolean;
  generationStep: string;
  generatedImageUrl: string | null;
}

export function InpaintingDebug({
  originalCollageUrl,
  maskedCollageUrl,
  templatePrompt,
  loraPath,
  isGenerating,
  generationStep,
  generatedImageUrl
}: InpaintingDebugProps) {
  return (
    <div className="fixed right-4 top-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 max-h-[90vh] overflow-y-auto z-50">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-bold text-gray-800 flex items-center">
          <Sparkles className="h-5 w-5 mr-2 text-purple-500" />
          Inpainting Debug
        </h3>
        <p className="text-sm text-gray-600">Track inpainting API parameters</p>
      </div>

      <div className="p-4 space-y-6">
        {/* Status */}
        <div className="bg-purple-50 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isGenerating ? 'bg-purple-500 animate-pulse' : 'bg-green-500'}`}></div>
            <span className="text-sm font-medium text-purple-700">{generationStep}</span>
          </div>
        </div>

        {/* Input Images */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Image className="h-4 w-4 mr-2 text-blue-500" />
            Input Images
          </h4>
          
          {/* Original Collage */}
          {originalCollageUrl && (
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-xs font-medium text-gray-700">Original Collage (3 scanned images)</span>
              </div>
              <div className="relative">
                <img 
                  src={originalCollageUrl} 
                  alt="Original Collage"
                  className="w-full h-20 object-cover rounded border border-blue-200"
                />
                <div className="absolute top-1 left-1 bg-blue-500 text-white px-1 rounded text-xs">
                  Original
                </div>
              </div>
            </div>
          )}

          {/* Masked Collage */}
          {maskedCollageUrl && (
            <div className="mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-xs font-medium text-gray-700">Masked Collage (3 masked images)</span>
              </div>
              <div className="relative">
                <img 
                  src={maskedCollageUrl} 
                  alt="Masked Collage"
                  className="w-full h-20 object-cover rounded border border-purple-200"
                />
                <div className="absolute top-1 left-1 bg-purple-500 text-white px-1 rounded text-xs">
                  Masked
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Template Parameters */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Settings className="h-4 w-4 mr-2 text-green-500" />
            Template Parameters
          </h4>
          
          <div className="space-y-3">
            {/* Prompt */}
            {templatePrompt && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700">Prompt</span>
                </div>
                <p className="text-xs text-gray-600 bg-white p-2 rounded border">
                  {templatePrompt}
                </p>
              </div>
            )}

            {/* LoRA Path */}
            {loraPath && (
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-xs font-medium text-gray-700">LoRA Path</span>
                </div>
                <p className="text-xs text-gray-600 bg-white p-2 rounded border font-mono">
                  {loraPath}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* API Parameters */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
            <Settings className="h-4 w-4 mr-2 text-orange-500" />
            API Parameters
          </h4>
          
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600">num_inference_steps:</span>
                <span className="font-mono font-medium">28</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">guidance_scale:</span>
                <span className="font-mono font-medium">3.5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">num_images:</span>
                <span className="font-mono font-medium">1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">enable_safety_checker:</span>
                <span className="font-mono font-medium">true</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">output_format:</span>
                <span className="font-mono font-medium">png</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">scheduler:</span>
                <span className="font-mono font-medium">euler</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">lora_scale:</span>
                <span className="font-mono font-medium">1.0</span>
              </div>
            </div>
          </div>
        </div>

        {/* Generated Result */}
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
                className="w-full h-20 object-cover rounded border border-green-200"
              />
              <div className="absolute top-1 left-1 bg-green-500 text-white px-1 rounded text-xs">
                Generated
              </div>
            </div>
          </div>
        )}

        {/* API Status */}
        <div className="bg-gray-50 rounded-lg p-3">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">API Status</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Inpainting API:</span>
              <span className="font-medium">{generatedImageUrl ? 'Completed' : isGenerating ? 'Processing' : 'Pending'}</span>
            </div>
            <div className="flex justify-between">
              <span>Input Images:</span>
              <span className="font-medium">{originalCollageUrl && maskedCollageUrl ? 'Ready' : 'Missing'}</span>
            </div>
            <div className="flex justify-between">
              <span>Template:</span>
              <span className="font-medium">{templatePrompt ? 'Selected' : 'Not Selected'}</span>
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