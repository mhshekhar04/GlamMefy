import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Save, RotateCcw, Share, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { Hairstyle, ColorSwatch } from '@/lib/types';

interface PreviewSectionProps {
  selectedStyle?: Hairstyle;
  selectedColor?: ColorSwatch;
}

export function PreviewSection({ selectedStyle, selectedColor }: PreviewSectionProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const beforeImage = "https://images.unsplash.com/photo-1494790108755-2616b612b882?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400";
  const afterImage = selectedStyle?.image || "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400";

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderRef.current) return;
    
    const rect = sliderRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const handleSave = () => {
    toast({
      title: "Look Saved!",
      description: "Your new style has been saved to your gallery."
    });
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My New Hairstyle',
        text: `Check out my new ${selectedStyle?.name || 'hairstyle'} from StyleMe!`,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied!",
        description: "Share link has been copied to your clipboard."
      });
    }
  };

  const handleDownload = () => {
    toast({
      title: "Download Started!",
      description: "Your styled image will be downloaded shortly."
    });
  };

  const handleTryAnother = () => {
    document.getElementById('styles')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <Card className="p-6">
      <CardContent className="p-0">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Preview Your Look</h2>
        
        <div 
          ref={sliderRef}
          className="comparison-slider relative rounded-2xl overflow-hidden mb-6 h-96 cursor-ew-resize shadow-2xl border-4 border-white"
        >
          <img 
            src={beforeImage}
            alt="Before styling"
            className="absolute inset-0 w-full h-full object-cover"
          />
          
          <div 
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img 
              src={afterImage}
              alt="After styling"
              className="w-full h-full object-cover"
              style={{
                filter: selectedColor?.category === 'vibrant' ? 'hue-rotate(45deg) saturate(1.2) brightness(1.1)' : 'brightness(1.05)'
              }}
            />
          </div>

          <div 
            className="comparison-handle shadow-xl"
            style={{ left: `${sliderPosition}%` }}
            onMouseDown={handleMouseDown}
          />

          <div className="absolute top-6 left-6 bg-gradient-to-r from-black/70 to-black/50 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
            Before
          </div>
          <div className="absolute top-6 right-6 bg-gradient-to-r from-primary/80 to-secondary/80 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
            After
          </div>

          {/* Enhancement indicator */}
          {selectedStyle && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
              <span className="text-sm font-medium text-slate-800">AI Enhanced</span>
            </div>
          )}
        </div>

        {selectedStyle && (
          <div className="mb-4 p-3 bg-slate-50 rounded-lg">
            <p className="text-sm text-slate-600">
              <span className="font-medium">Selected Style:</span> {selectedStyle.name}
              {selectedColor && (
                <>
                  <span className="mx-2">•</span>
                  <span className="font-medium">Color:</span> {selectedColor.name}
                </>
              )}
            </p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button 
            onClick={handleSave}
            className="bg-gradient-to-r from-success to-green-400 hover:shadow-lg transition-all"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Look
          </Button>
          
          <Button 
            variant="outline"
            onClick={handleTryAnother}
            className="border-primary text-primary hover:bg-primary hover:text-white"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Try Another
          </Button>
          
          <Button 
            onClick={handleShare}
            className="bg-gradient-to-r from-blue-500 to-blue-700 hover:shadow-lg transition-all"
          >
            <Share className="h-4 w-4 mr-2" />
            Share
          </Button>
          
          <Button 
            onClick={handleDownload}
            className="bg-gradient-to-r from-warning to-accent hover:shadow-lg transition-all"
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
