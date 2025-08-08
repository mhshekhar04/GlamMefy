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
    icon: '',
    image: '/images/blackCurl.png',
    prompt: 'make the hairstyle of uploaded image exactly like BlackCurly with black color hair'
  },
  {
    id: 'long-marron',
    name: 'Elegant Long Brunette',
    triggerWord: 'brownHair',
    loraPath: 'https://v3.fal.media/files/kangaroo/sQ_L7ymUU6OeIgyQFXqCV_pytorch_lora_weights.safetensors',
    color: '#A0522D',
    icon: '💇',
    image: '/images/LongMaroon.png',
    prompt: 'make the hairstyle of uploaded image exactly like brownHair with maroon brown color hair'
  },
  {
    id: 'streak',
    name: 'Cream Blonde Highlights',
    triggerWord: 'CreamStreakBlack',
    loraPath: 'https://v3.fal.media/files/panda/2Mq3BEPVV43vBwUGrtLv-_pytorch_lora_weights.safetensors',
    color: '#F5DEB3',
    icon: '',
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
      <div className="flex overflow-x-auto gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 max-w-4xl mx-auto pb-4 sm:pb-0">
        {HAIR_TEMPLATES.map((template) => (
          <div
            key={template.id}
            className={`relative group cursor-pointer transition-all duration-300 flex-shrink-0 w-48 sm:w-auto ${
              selectedTemplate === template.id 
                ? 'ring-4 ring-purple-500 scale-105' 
                : 'hover:scale-105 hover:shadow-xl'
            } ${isGenerating ? 'opacity-50 pointer-events-none' : ''}`}
            onClick={() => handleTemplateClick(template)}
          >
            {/* Template Card */}
            <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 hover:border-purple-300 transition-all duration-300 w-full">
              {/* Template Image */}
              <div className="aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center relative overflow-hidden">
                {/* Loading State */}
                {!loadedImages.has(template.id) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300">
                    <div className="text-center">
                      <Loader2 className="h-4 w-4 sm:h-6 sm:w-6 text-gray-400 animate-spin mx-auto mb-1 sm:mb-2" />
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
                
                {/* Template Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-2 left-2 right-2 sm:bottom-4 sm:left-4 sm:right-4">
                    <div className="flex items-center justify-center space-x-1 sm:space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-2">
                      <div className="text-lg sm:text-2xl">{template.icon}</div>
                      <div>
                        <div className="text-xs sm:text-sm font-semibold text-gray-800">{template.name}</div>
                        <div className="text-xs text-gray-600">Click to select</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Template Info */}
              <div className="p-2 sm:p-3 lg:p-4">
                <div className="flex items-center justify-between mb-1 sm:mb-2">
                  <h3 className="text-xs sm:text-sm lg:text-base font-semibold text-gray-800">{template.name}</h3>
                  <div className="text-lg sm:text-2xl">{template.icon}</div>
                </div>
                <div className="flex items-center space-x-1 sm:space-x-2">
                  <div 
                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 border-gray-300"
                    style={{ backgroundColor: template.color }}
                  ></div>
                  <span className="text-xs text-gray-600">Natural {template.name.toLowerCase()}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Generate Button */}
      {selectedTemplate && (
        <div className="mt-6 sm:mt-8 text-center">
          <button
            onClick={onGenerate}
            className={`px-6 sm:px-10 py-3 sm:py-5 rounded-2xl font-bold text-sm sm:text-lg transition-all duration-300 ${
              isGenerating || !hasScannedData
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 transform hover:scale-105 shadow-2xl'
            } text-white shadow-xl`}
            disabled={isGenerating || !hasScannedData}
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Generating Your New Look...</span>
              </div>
            ) : !hasScannedData ? (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Scan Your Face First</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 sm:space-x-3">
                <Wand2 className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Generate New Look</span>
              </div>
            )}
          </button>
          
          {!hasScannedData && (
            <p className="text-xs sm:text-sm text-gray-500 mt-2">
              Please scan your face first to generate hairstyles
            </p>
          )}
        </div>
      )}
    </div>
  );
} 