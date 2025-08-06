import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { ColorSwatch } from '@/lib/types';

const naturalColors: ColorSwatch[] = [
  {
    id: 'black',
    name: 'Black',
    value: '#000000',
    category: 'natural',
    image: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'
  },
  {
    id: 'brown',
    name: 'Brown',
    value: '#8B4513',
    category: 'natural',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'
  },
  {
    id: 'blonde',
    name: 'Blonde',
    value: '#FAD5A5',
    category: 'natural',
    image: 'https://images.unsplash.com/photo-1519699047748-de8e457a634e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'
  },
  {
    id: 'auburn',
    name: 'Auburn',
    value: '#A52A2A',
    category: 'natural',
    image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'
  },
  {
    id: 'red',
    name: 'Red',
    value: '#DC143C',
    category: 'natural',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'
  },
  {
    id: 'silver',
    name: 'Silver',
    value: '#C0C0C0',
    category: 'natural',
    image: 'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100'
  }
];

const vibrantColors: ColorSwatch[] = [
  {
    id: 'coral',
    name: 'Coral',
    value: 'linear-gradient(135deg, #ff6b6b, #ee5a52)',
    category: 'vibrant'
  },
  {
    id: 'teal',
    name: 'Teal',
    value: 'linear-gradient(135deg, #4ecdc4, #44a08d)',
    category: 'vibrant'
  },
  {
    id: 'mint',
    name: 'Mint',
    value: 'linear-gradient(135deg, #a8e6cf, #7fcdcd)',
    category: 'vibrant'
  },
  {
    id: 'sunset',
    name: 'Sunset',
    value: 'linear-gradient(135deg, #ffd93d, #ff6b6b)',
    category: 'vibrant'
  },
  {
    id: 'pastel',
    name: 'Pastel',
    value: 'linear-gradient(135deg, #a8edea, #fed6e3)',
    category: 'vibrant'
  },
  {
    id: 'purple',
    name: 'Purple',
    value: 'linear-gradient(135deg, #f093fb, #f5576c)',
    category: 'vibrant'
  }
];

interface ColorPaletteProps {
  onColorSelect: (color: ColorSwatch) => void;
  selectedColor?: ColorSwatch;
}

export function ColorPalette({ onColorSelect, selectedColor }: ColorPaletteProps) {
  const [customColor, setCustomColor] = useState('#6366f1');

  const handleCustomColorSelect = () => {
    const customSwatch: ColorSwatch = {
      id: 'custom',
      name: 'Custom',
      value: customColor,
      category: 'custom'
    };
    onColorSelect(customSwatch);
  };

  const ColorSwatchButton = ({ color }: { color: ColorSwatch }) => (
    <button
      onClick={() => onColorSelect(color)}
      className={`w-16 h-16 rounded-full border-4 border-white shadow-lg hover:scale-125 hover:shadow-xl transition-all duration-300 cursor-pointer color-swatch ${
        selectedColor?.id === color.id ? 'active ring-4 ring-primary scale-110' : ''
      }`}
      style={{
        background: color.image ? `url(${color.image})` : color.value,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
      title={color.name}
    >
      {selectedColor?.id === color.id && (
        <div className="w-full h-full rounded-full bg-white/20 flex items-center justify-center">
          <div className="w-4 h-4 bg-white rounded-full shadow-md" />
        </div>
      )}
    </button>
  );

  return (
    <Card className="p-6">
      <CardContent className="p-0">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">Choose Your Color</h2>
        
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-3">Natural</h3>
            <div className="flex flex-wrap gap-3">
              {naturalColors.map(color => (
                <ColorSwatchButton key={color.id} color={color} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-3">Vibrant</h3>
            <div className="flex flex-wrap gap-3">
              {vibrantColors.map(color => (
                <ColorSwatchButton key={color.id} color={color} />
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-700 mb-3">Custom</h3>
            <div className="flex items-center gap-4">
              <div className="relative">
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-16 h-16 rounded-full border-4 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                />
                <div className="absolute inset-0 rounded-full border-2 border-primary/30 pointer-events-none" />
              </div>
              <div className="flex-1">
                <input
                  type="text"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                  placeholder="#ffffff"
                />
              </div>
              <Button
                onClick={handleCustomColorSelect}
                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:shadow-xl transition-all font-semibold"
              >
                Apply Color
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
