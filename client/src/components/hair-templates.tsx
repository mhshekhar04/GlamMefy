import { useState } from 'react';
import { Sparkles, Wand2, Palette, Plus, Loader2, Camera } from 'lucide-react';

// Template data with trigger words and LoRA paths - EXACTLY as you specified
const HAIR_TEMPLATES = [
  {
    id: 'curly',
    name: 'Natural Curly Waves',
    triggerWord: 'BlackCurly',
    loraPath: 'https://v3.fal.media/files/penguin/oE9LhKKMITakN2OPOPu8A_pytorch_lora_weights.safetensors',
    color: '#8B4513',
    icon: '🔄',
    image: '/images/blackCurl.png',
    prompt: 'make the hairstyle of uploaded image exactly like BlackCurly with black color hair'
  },
  {
    id: 'long-marron',
    name: 'Elegant Long Brunette',
    triggerWord: 'brownHair',
    loraPath: 'https://v3.fal.media/files/kangaroo/sQ_L7ymUU6OeIgyQFXqCV_pytorch_lora_weights.safetensors',
    color: '#A0522D',
    icon: '💇‍♀️',
    image: '/images/LongMaroon.png',
    prompt: 'make the hairstyle of uploaded image exactly like brownHair with maroon brown color hair'
  },
  {
    id: 'streak',
    name: 'Cream Blonde Highlights',
    triggerWord: 'CreamStreakBlack',
    loraPath: 'https://v3.fal.media/files/panda/2Mq3BEPVV43vBwUGrtLv-_pytorch_lora_weights.safetensors',
    color: '#F5DEB3',
    icon: '✨',
    image: '/images/CreamStreak.png',
    prompt: 'make the hairstyle of uploaded image exactly like creamStreakHair with black color hair and cream blonde streaks'
  }
];

interface HairTemplatesProps {
  onTemplateSelect: (template: typeof HAIR_TEMPLATES[0]) => void;
  onGenerate?: () => void;
  isGenerating?: boolean;
  hasScannedData?: boolean;
}

export function HairTemplates({ onTemplateSelect, onGenerate, isGenerating = false, hasScannedData = false }: HairTemplatesProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  const handleTemplateClick = (template: typeof HAIR_TEMPLATES[0]) => {
    setSelectedTemplate(template.id);
    onTemplateSelect(template);
  };

  const handleImageLoad = (templateId: string) => {
    setLoadedImages(prev => new Set(prev).add(templateId));
  };

  const handleImageError = (templateId: string) => {
    // Keep track of failed images
    console.log(`Failed to load image for template: ${templateId}`);
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {HAIR_TEMPLATES.map((template) => (
          <div
            key={template.id}
            className={`relative group cursor-pointer transition-all duration-300 ${
              selectedTemplate === template.id 
                ? 'ring-4 ring-purple-500 scale-105' 
                : 'hover:scale-105 hover:shadow-xl'
            } ${isGenerating ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => handleTemplateClick(template)}
          >
            {/* Template Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-purple-300 transition-all duration-300">
              {/* Template Image */}
              <div className="aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative overflow-hidden">
                {/* Loading State */}
                {!loadedImages.has(template.id) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <div className="text-center">
                      <Loader2 className="h-8 w-8 text-gray-400 animate-spin mx-auto mb-2" />
                      <div className="text-xs text-gray-500">Loading...</div>
                    </div>
                  </div>
                )}
                
                {/* Template Image */}
                <img 
                  src={template.image} 
                  alt={template.name}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    loadedImages.has(template.id) ? 'opacity-100' : 'opacity-0'
                  }`}
                  onLoad={() => handleImageLoad(template.id)}
                  onError={() => handleImageError(template.id)}
                />
                
                {/* Fallback Icon - Only show if image fails to load */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 opacity-0 pointer-events-none">
                  <div className="text-center">
                    <div className="text-4xl mb-2">{template.icon}</div>
                    <div className="text-xs text-gray-500">Template Preview</div>
                  </div>
                </div>
              </div>
              
              {/* Template Info */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-lg text-gray-800">{template.name}</h3>
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-gray-300" 
                    style={{ backgroundColor: template.color }}
                  />
                </div>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <div className="flex items-center space-x-1">
                    <Sparkles className="h-3 w-3 text-purple-500" />
                    <span>AI Enhanced</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Palette className="h-3 w-3 text-blue-500" />
                    <span>Custom Styling</span>
                  </div>
                </div>
              </div>

              {/* Selection Indicator */}
              {selectedTemplate === template.id && (
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-purple-500/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
          </div>
        ))}
        
        {/* Coming Soon Card */}
        <div className="relative group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-xl">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 hover:border-purple-300 transition-all duration-300">
            {/* Coming Soon Placeholder */}
            <div className="aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <div className="text-sm font-semibold text-gray-700 mb-1">More Styles</div>
                <div className="text-xs text-gray-500">Coming Soon</div>
              </div>
            </div>
            
            {/* Info */}
            <div className="p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-2">New Templates</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex items-center space-x-1">
                  <Sparkles className="h-3 w-3 text-purple-500" />
                  <span>More styles</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Palette className="h-3 w-3 text-blue-500" />
                  <span>Regular updates</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Note */}
      <div className="text-center mt-8">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full border border-purple-200">
          <Sparkles className="h-4 w-4 text-purple-600" />
          <span className="text-sm font-medium text-purple-700">More templates will be added soon!</span>
        </div>
      </div>

      {/* Generate Button */}
      {selectedTemplate && (
        <div className="mt-8 text-center">
          <button
            onClick={onGenerate}
            className={`px-10 py-5 rounded-2xl font-bold text-lg transition-all duration-300 ${
              isGenerating || !hasScannedData
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 transform hover:scale-105 shadow-2xl'
            } text-white shadow-xl`}
            disabled={isGenerating || !hasScannedData}
          >
            {isGenerating ? (
              <div className="flex items-center space-x-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Your New Look...</span>
              </div>
            ) : !hasScannedData ? (
              <div className="flex items-center space-x-3">
                <Camera className="h-5 w-5" />
                <span>Scan Your Face First</span>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Wand2 className="h-5 w-5" />
                <span>Generate New Look</span>
              </div>
            )}
          </button>
          
          {!hasScannedData && (
            <p className="text-sm text-gray-500 mt-2">
              Please scan your face first to generate hairstyles
            </p>
          )}
        </div>
      )}
    </div>
  );
} 