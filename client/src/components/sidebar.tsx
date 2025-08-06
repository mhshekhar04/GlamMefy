import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Flame, Crown, Lightbulb, CheckCircle, X } from 'lucide-react';
import { useLocalStorage } from '@/hooks/use-local-storage';
import type { RecentStyle } from '@/lib/types';

const recentStyles: RecentStyle[] = [
  {
    id: '1',
    styleName: 'Classic Bob',
    image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60',
    timestamp: '2 hours ago'
  },
  {
    id: '2',
    styleName: 'Beach Waves',
    image: 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60',
    timestamp: 'Yesterday'
  },
  {
    id: '3',
    styleName: 'Elegant Updo',
    image: 'https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?ixlib=rb-4.0.3&auto=format&fit=crop&w=60&h=60',
    timestamp: '3 days ago'
  }
];

const trendingStyles = [
  { name: 'Beach Waves', tries: '2.3k' },
  { name: 'Curtain Bangs', tries: '1.8k' },
  { name: 'Wolf Cut', tries: '1.5k' },
  { name: 'Modern Lob', tries: '1.2k' }
];

const proTips = [
  'Consider your face shape when choosing a style',
  'Think about your lifestyle and maintenance time',
  'Always consult with a professional stylist'
];

export function Sidebar() {
  const [premiumModalOpen, setPremiumModalOpen] = useState(false);
  const [recentHistory] = useLocalStorage<RecentStyle[]>('recent-styles', recentStyles);

  return (
    <div className="w-full lg:w-80 space-y-6">
      {/* Recently Tried */}
      <Card className="p-6">
        <CardContent className="p-0">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Recently Tried</h3>
          <div className="space-y-3">
            {recentHistory.map(style => (
              <div 
                key={style.id}
                className="flex items-center space-x-3 p-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
              >
                <img 
                  src={style.image}
                  alt={style.styleName}
                  className="w-12 h-12 rounded-lg object-cover border border-slate-200"
                />
                <div className="flex-1">
                  <p className="font-medium text-slate-800">{style.styleName}</p>
                  <p className="text-sm text-slate-500">{style.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trending Styles */}
      <Card className="p-6">
        <CardContent className="p-0">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Flame className="h-5 w-5 text-warning mr-2" />
            Trending Now
          </h3>
          <div className="space-y-4">
            {trendingStyles.map((style, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="font-medium text-slate-800">{style.name}</span>
                <span className="text-sm text-slate-500">{style.tries} tries</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pro Tips */}
      <Card className="p-6">
        <CardContent className="p-0">
          <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
            <Lightbulb className="h-5 w-5 text-primary mr-2" />
            Pro Tips
          </h3>
          <div className="space-y-4">
            {proTips.map((tip, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                <p className="text-slate-600 text-sm">{tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Premium Banner */}
      <Card className="p-6 bg-gradient-to-r from-accent to-pink-600 text-white">
        <CardContent className="p-0 text-center">
          <Crown className="h-8 w-8 text-yellow-300 mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">Go Premium!</h3>
          <p className="text-sm mb-4 opacity-90">
            Unlock unlimited styles, HD downloads, and exclusive colors
          </p>
          <Button 
            onClick={() => setPremiumModalOpen(true)}
            className="w-full bg-white text-accent hover:bg-gray-100 transition-colors"
          >
            Upgrade Now
          </Button>
        </CardContent>
      </Card>

      {/* Premium Modal */}
      <Dialog open={premiumModalOpen} onOpenChange={setPremiumModalOpen}>
        <DialogContent className="sm:max-w-md p-8 rounded-3xl">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => setPremiumModalOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="text-center">
            <Crown className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Unlock Premium Features</h2>
            <p className="text-slate-600 mb-6">Get access to exclusive styles and advanced features</p>
            
            <div className="space-y-4 mb-6 text-left">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-slate-700">Unlimited hairstyle tries</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-slate-700">HD image downloads</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-slate-700">Exclusive color palettes</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-5 w-5 text-success" />
                <span className="text-slate-700">Advanced face analysis</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <Button className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg transition-all">
                Start Free Trial
              </Button>
              <Button 
                variant="outline"
                className="w-full"
                onClick={() => setPremiumModalOpen(false)}
              >
                Maybe Later
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
