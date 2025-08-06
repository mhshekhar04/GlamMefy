// ThreeDCollage.tsx
import { useState, useEffect } from 'react';
import { Sparkles, RotateCw, ChevronLeft, ChevronRight, Star, Camera, CheckCircle, Brain } from 'lucide-react';
import { maskingAPI } from '../services/masking-api';
import { hairGenerationAPI } from '../services/hair-generation-api';
import { HairTemplates } from './hair-templates';
import { HairGenerationModal } from './hair-generation-modal';

interface ThreeDCollageProps {
  images: string[];
  onScanComplete?: (scannedData: {
    images: string[];
    originalCollageUrl: string;
    maskedImageUrl: string;
  }) => void;
}

const angleMap = [
  { label: 'Left Profile', key: 'left', icon: '👈' },
  { label: 'Front View', key: 'front', icon: '👤' },
  { label: 'Right Profile', key: 'right', icon: '👉' },
];

export function ThreeDCollage({ images, onScanComplete }: ThreeDCollageProps) {
  const [active, setActive] = useState(1); // Start with front view (index 1)
  const [isAnimating, setIsAnimating] = useState(false);
  const [isMasking, setIsMasking] = useState(false);
  const [maskedImageUrl, setMaskedImageUrl] = useState<string | null>(null);
  const [originalCollageUrl, setOriginalCollageUrl] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [showOutput, setShowOutput] = useState(false);

  useEffect(() => {
    console.log('ThreeDCollage received images:', images.length);
    if (images.length === 3) {
      // Start masking process when we have 3 images
      handleMaskingProcess();
    }
  }, [images]);

  const handleMaskingProcess = async () => {
    console.log('=== Starting Masking Process ===');
    console.log('Images array length:', images.length);
    console.log('Images:', images);
    
    setIsMasking(true);
    setIsAnimating(true);
    
    try {
      // Create a 3-image collage
      const collageCanvas = document.createElement('canvas');
      const ctx = collageCanvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Set canvas size for the collage
      collageCanvas.width = 900;
      collageCanvas.height = 300;

      // Load all 3 images
      const imagePromises = images.map((src) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      });

      const loadedImages = await Promise.all(imagePromises);
      console.log('Loaded images successfully:', loadedImages.length);

      // Draw images side by side in the collage
      const imageWidth = 300;
      const imageHeight = 300;
      
      loadedImages.forEach((img, index) => {
        ctx.drawImage(img, index * imageWidth, 0, imageWidth, imageHeight);
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        collageCanvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });

      // Create file from blob
      const file = new File([blob], 'face-collage.png', { type: 'image/png' });

      // Log the input collage image
      console.log('Input collage image file:', file);
      console.log('Input collage image size:', file.size, 'bytes');
      console.log('Input collage image type:', file.type);
      
      // Create a preview URL for the collage
      const collagePreviewUrl = URL.createObjectURL(blob);
      console.log('Input collage preview URL:', collagePreviewUrl);

      // Initialize masking API with environment variable
      const apiKey = import.meta.env.VITE_FAL_KEY;
      maskingAPI.initialize(apiKey);

      // Call masking API
      console.log('Calling masking API...');
      const maskedResult = await maskingAPI.processFaceCollage(file);
      
      console.log('Masking API result:', maskedResult);
      console.log('Masked image URL:', maskedResult.image.url);
      
      setMaskedImageUrl(maskedResult.image.url);
      setOriginalCollageUrl(collagePreviewUrl); // Store the original collage URL
      
      console.log('Set masked image URL to:', maskedResult.image.url);
      console.log('Set original collage URL to:', collagePreviewUrl);
      
      // Pass scanned data back to parent component
      if (onScanComplete) {
        const scannedData = {
          images: images,
          originalCollageUrl: collagePreviewUrl,
          maskedImageUrl: maskedResult.image.url
        };
        console.log('Calling onScanComplete with:', scannedData);
        onScanComplete(scannedData);
      }
      
      // Show templates after masking is complete
      setTimeout(() => {
        setIsMasking(false);
        setIsAnimating(false);
        // Don't show templates here - they're on the main page
      }, 1000);

    } catch (error) {
      console.error('Masking process failed:', error);
      setIsMasking(false);
      setIsAnimating(false);
    }
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
  };

  const handleGenerateHairStyle = async () => {
    if (!selectedTemplate || !maskedImageUrl || !originalCollageUrl) {
      console.log('Missing required data for hair generation');
      console.log('Selected template:', selectedTemplate);
      console.log('Masked image URL:', maskedImageUrl);
      console.log('Original collage URL:', originalCollageUrl);
      return;
    }

    // Just show the generation modal - it will handle the real API call
    setShowGenerationModal(true);
  };

  const handleGenerationComplete = (resultUrl: string) => {
    console.log('Received generated image URL:', resultUrl);
    
    // For now, use the same generated image for all 3 views
    // In the future, you can implement actual splitting of the collage
    setGeneratedImages([resultUrl, resultUrl, resultUrl]);
    setShowOutput(true);
    setShowTemplates(false);
    setShowGenerationModal(false);
  };

  const rotate = (dir: number) => {
    setActive((prev) => (prev + dir + images.length) % images.length);
  };

  // Show output carousel with generated images
  if (showOutput && generatedImages.length > 0) {
    return (
      <div className="relative">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Your New Look!</h2>
          <p className="text-gray-600">Generated with {selectedTemplate?.name}</p>
        </div>
        
        {/* Generated 3D Carousel Container */}
        <div className="carousel-3d-fixed">
          <div className="carousel-3d-stage-fixed" style={{ '--active': active } as React.CSSProperties}>
            {generatedImages.map((image, idx) => (
              <div
                key={idx}
                className={`carousel-3d-slide-fixed${active === idx ? ' active' : ''}`}
                style={{ '--i': idx } as React.CSSProperties}
              >
                <div className="carousel-3d-img-wrap-fixed">
                  <div className="carousel-3d-img-container-fixed">
                    <img 
                      src={image} 
                      alt={`Generated hairstyle ${idx + 1}`} 
                      className="carousel-3d-img-fixed"
                    />
                    <div className="carousel-3d-overlay-fixed">
                      <div className="carousel-3d-badge-fixed">
                        <Sparkles className="h-4 w-4" />
                        <span>AI Generated</span>
                      </div>
                    </div>
                  </div>
                  <div className="carousel-3d-label-fixed">
                    <div className="carousel-3d-label-icon-fixed">{angleMap[idx]?.icon}</div>
                    <span>{angleMap[idx]?.label || `Generated ${idx + 1}`}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Navigation Arrows */}
          {generatedImages.length > 1 && (
            <>
              <button 
                className="carousel-3d-arrow-fixed left" 
                onClick={() => rotate(-1)}
                aria-label="Previous view"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button 
                className="carousel-3d-arrow-fixed right" 
                onClick={() => rotate(1)}
                aria-label="Next view"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex justify-center mt-8 space-x-6">
          <div className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
            <span className="text-white font-semibold">AI Generated</span>
          </div>
          
          <div className="flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
            <span className="text-white font-semibold">
              {active + 1} of {generatedImages.length}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Show masking modal when processing
  if (isMasking) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl">
          <div className="text-center">
            <div className="relative mb-6">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Brain className="h-10 w-10 text-purple-500 animate-pulse" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full animate-ping"></div>
              </div>
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Analyzing Your Face</h3>
            <p className="text-gray-600 mb-4">Creating AI-enhanced face collage...</p>
            
            {/* Progress indicators */}
            <div className="flex justify-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
            
            <div className="text-sm text-gray-500">
              Processing {images.length} face images...
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="flex items-center justify-center h-80 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 rounded-3xl border-2 border-dashed border-slate-200">
        <div className="text-center p-8">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Camera className="h-10 w-10 text-slate-500" />
            </div>
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            </div>
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">No Images Captured</h3>
          <p className="text-slate-500 text-sm">Start the camera to capture your 3D face collage</p>
          <p className="text-xs text-slate-400 mt-2">Images array length: {images.length}</p>
        </div>
      </div>
    );
  }
          
  return (
    <div className="relative">
      {/* Fixed 3D Carousel Container */}
      <div className="carousel-3d-fixed">
        <div className="carousel-3d-stage-fixed" style={{ '--active': active } as React.CSSProperties}>
          {images.map((image, idx) => (
            <div
              key={idx}
              className={`carousel-3d-slide-fixed${active === idx ? ' active' : ''}`}
              style={{ '--i': idx } as React.CSSProperties}
            >
              <div className="carousel-3d-img-wrap-fixed">
                <div className="carousel-3d-img-container-fixed">
                  <img 
                    src={image} 
                    alt={`Face scan ${idx + 1}`} 
                    className="carousel-3d-img-fixed"
                  />
                  <div className="carousel-3d-overlay-fixed">
                    <div className="carousel-3d-badge-fixed">
                      <Sparkles className="h-4 w-4" />
                      <span>AI Enhanced</span>
                    </div>
                  </div>
                </div>
                <div className="carousel-3d-label-fixed">
                  <div className="carousel-3d-label-icon-fixed">{angleMap[idx]?.icon}</div>
                  <span>{angleMap[idx]?.label || `View ${idx + 1}`}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Fixed Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button 
              className="carousel-3d-arrow-fixed left" 
              onClick={() => rotate(-1)}
              aria-label="Previous view"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button 
              className="carousel-3d-arrow-fixed right" 
              onClick={() => rotate(1)}
              aria-label="Next view"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>
      
      {/* Fixed Controls */}
      <div className="flex justify-center mt-8 space-x-6">
        <div className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl shadow-lg">
          <Sparkles className="h-5 w-5 text-white" />
          <span className="text-white font-semibold">3D Face Collage</span>
        </div>
        
        <div className="flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
          <span className="text-white font-semibold">
            {active + 1} of {images.length}
          </span>
        </div>
      </div>
      
      {/* Fixed Animation Overlay */}
      {isAnimating && !isMasking && (
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/30 via-blue-500/30 to-pink-500/30 rounded-3xl animate-pulse flex items-center justify-center backdrop-blur-sm">
          <div className="text-center bg-white/95 rounded-2xl p-8 shadow-2xl border border-white/20">
            <div className="relative mb-4">
              <Sparkles className="h-12 w-12 text-purple-500 animate-bounce mx-auto" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-ping"></div>
            </div>
            <p className="text-purple-600 font-bold text-lg">Creating 3D Carousel...</p>
            <p className="text-gray-500 text-sm mt-1">Processing your face data</p>
          </div>
        </div>
      )}

      {/* Hair Generation Modal */}
      <HairGenerationModal
        isOpen={showGenerationModal}
        onClose={() => setShowGenerationModal(false)}
        onGenerationComplete={handleGenerationComplete}
        originalImageUrl={maskedImageUrl || ''}
        maskImageUrl={maskedImageUrl || ''}
        selectedTemplate={selectedTemplate}
      />
    </div>
  );
}
