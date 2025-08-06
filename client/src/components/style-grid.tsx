import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Heart, Search, Flame } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { Hairstyle } from '@/lib/types';

const hairstyles: Hairstyle[] = [
  {
    id: '1',
    name: 'Classic Bob',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
    category: ['short'],
    difficulty: 'easy'
  },
  {
    id: '2',
    name: 'Beach Waves',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
    category: ['medium'],
    difficulty: 'medium',
    trending: true
  },
  {
    id: '3',
    name: 'Long Layers',
    image: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
    category: ['long'],
    difficulty: 'hard'
  },
  {
    id: '4',
    name: 'Curly Pixie',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
    category: ['short', 'curly'],
    difficulty: 'medium'
  },
  {
    id: '5',
    name: 'Sleek Straight',
    image: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
    category: ['long', 'straight'],
    difficulty: 'easy'
  },
  {
    id: '6',
    name: 'Elegant Updo',
    image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
    category: ['medium'],
    difficulty: 'hard'
  },
  {
    id: '7',
    name: 'Braided Style',
    image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
    category: ['long'],
    difficulty: 'medium'
  },
  {
    id: '8',
    name: 'Modern Lob',
    image: 'https://images.unsplash.com/photo-1505033575518-a36ea2ef75ae?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
    category: ['medium'],
    difficulty: 'easy',
    trending: true
  },
  {
    id: '9',
    name: 'Textured Shag',
    image: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
    category: ['medium'],
    difficulty: 'medium',
    trending: true
  },
  {
    id: '10',
    name: 'Curtain Bangs',
    image: 'https://images.unsplash.com/photo-1594736797933-d0a3ba6ba4fc?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
    category: ['medium', 'long'],
    difficulty: 'easy',
    trending: true
  },
  {
    id: '11',
    name: 'Wolf Cut',
    image: 'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
    category: ['medium'],
    difficulty: 'hard',
    trending: true
  },
  {
    id: '12',
    name: 'Butterfly Layers',
    image: 'https://images.unsplash.com/photo-1595475884109-8df31ab00b30?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&h=300',
    category: ['long'],
    difficulty: 'medium',
    trending: true
  }
];

const categories = [
  { id: 'all', label: 'All Styles' },
  { id: 'short', label: 'Short' },
  { id: 'medium', label: 'Medium' },
  { id: 'long', label: 'Long' },
  { id: 'curly', label: 'Curly' },
  { id: 'straight', label: 'Straight' }
];

interface StyleGridProps {
  onStyleSelect: (style: Hairstyle) => void;
}

export function StyleGrid({ onStyleSelect }: StyleGridProps) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [favorites, setFavorites] = useLocalStorage<string[]>('favorites', []);

  const filteredStyles = hairstyles.filter(style => {
    const matchesCategory = activeCategory === 'all' || style.category.includes(activeCategory);
    const matchesSearch = style.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (styleId: string) => {
    setFavorites(prev => 
      prev.includes(styleId) 
        ? prev.filter(id => id !== styleId)
        : [...prev, styleId]
    );
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-success text-success-foreground';
      case 'medium': return 'bg-warning text-warning-foreground';
      case 'hard': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <Card className="p-6">
      <CardContent className="p-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-4 sm:mb-0">Choose Your Style</h2>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search hairstyles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-slate-50 border-slate-200 focus:ring-2 focus:ring-primary focus:border-primary"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map(category => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              onClick={() => setActiveCategory(category.id)}
              className={`category-tab ${
                activeCategory === category.id 
                  ? 'active bg-white border-b-3 border-primary text-primary' 
                  : 'bg-slate-100 text-slate-600 hover:bg-purple-50'
              }`}
            >
              {category.label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredStyles.map((style, index) => (
            <Card 
              key={style.id} 
              className={`overflow-hidden cursor-pointer style-card-hover animate-fade-in-up border-0 ${
                style.trending ? 'premium-glow' : ''
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => onStyleSelect(style)}
            >
              <div className="relative overflow-hidden">
                <img 
                  src={style.image} 
                  alt={style.name}
                  className="w-full h-48 object-cover style-card-image"
                />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white shadow-lg transition-all duration-300 hover:scale-110"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(style.id);
                  }}
                >
                  <Heart 
                    className={`h-5 w-5 transition-colors ${
                      favorites.includes(style.id) 
                        ? 'fill-destructive text-destructive' 
                        : 'text-slate-500'
                    }`} 
                  />
                </Button>

                {style.trending && (
                  <Badge className="absolute top-3 left-3 bg-gradient-to-r from-warning to-accent text-white shadow-lg border-0 font-medium">
                    <Flame className="h-3 w-3 mr-1" />
                    Trending
                  </Badge>
                )}

                <Badge className={`absolute bottom-3 left-3 ${getDifficultyColor(style.difficulty)} shadow-lg border-0 font-medium`}>
                  {style.difficulty.charAt(0).toUpperCase() + style.difficulty.slice(1)}
                </Badge>

                {/* Quick try button overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                  <Button 
                    className="bg-gradient-to-r from-primary to-secondary hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-white font-semibold px-6 py-2"
                    onClick={(e) => {
                      e.stopPropagation();
                      onStyleSelect(style);
                    }}
                  >
                    Try Now
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-4 bg-white">
                <h3 className="font-bold text-slate-800 mb-3 text-lg">{style.name}</h3>
                <div className="flex items-center justify-between text-sm text-slate-500 mb-3">
                  <span className="capitalize">{style.category.join(', ')}</span>
                  {favorites.includes(style.id) && (
                    <span className="text-destructive font-medium">♥ Favorited</span>
                  )}
                </div>
                <Button 
                  className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:scale-105 transition-all duration-300 font-semibold"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStyleSelect(style);
                  }}
                >
                  Select Style
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
