import { useState, useEffect } from 'react';
import { Users, Palette, Zap, HeadphonesIcon, Star, TrendingUp } from 'lucide-react';

interface StatItem {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  countUp?: boolean;
  finalValue?: number;
}

export function EnhancedStats() {
  const [counts, setCounts] = useState<Record<string, number>>({
    users: 0,
    styles: 0,
    accuracy: 0
  });

  const stats: StatItem[] = [
    {
      value: "1M+",
      label: "Happy Users",
      icon: <Users className="h-6 w-6" />,
      color: "text-purple-600",
      countUp: true,
      finalValue: 1000000
    },
    {
      value: "50K+",
      label: "Hairstyles Available",
      icon: <Palette className="h-6 w-6" />,
      color: "text-blue-600",
      countUp: true,
      finalValue: 50000
    },
    {
      value: "99%",
      label: "Accuracy Rate",
      icon: <Star className="h-6 w-6" />,
      color: "text-yellow-500",
      countUp: true,
      finalValue: 99
    },
    {
      value: "<1s",
      label: "Processing Time",
      icon: <Zap className="h-6 w-6" />,
      color: "text-green-600"
    },
    {
      value: "24/7",
      label: "AI Support",
      icon: <HeadphonesIcon className="h-6 w-6" />,
      color: "text-indigo-600"
    }
  ];

  useEffect(() => {
    const animateCounters = () => {
      stats.forEach((stat, index) => {
        if (stat.countUp && stat.finalValue) {
          let current = 0;
          const increment = stat.finalValue / 100;
          const timer = setInterval(() => {
            current += increment;
            if (current >= stat.finalValue!) {
              current = stat.finalValue!;
              clearInterval(timer);
            }
            
            setCounts(prev => ({
              ...prev,
              [stat.label.toLowerCase().replace(/\s+/g, '')]: Math.floor(current)
            }));
          }, 30);
        }
      });
    };

    const timer = setTimeout(animateCounters, 500);
    return () => clearTimeout(timer);
  }, []);

  const formatCount = (value: number, originalValue: string): string => {
    if (originalValue.includes('M')) {
      return `${(value / 1000000).toFixed(1)}M+`;
    }
    if (originalValue.includes('K')) {
      return `${(value / 1000).toFixed(0)}K+`;
    }
    if (originalValue.includes('%')) {
      return `${value}%`;
    }
    return value.toString();
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
      {stats.map((stat, index) => (
        <div 
          key={index}
          className="text-center"
        >
          <div className="relative mb-3">
            {/* Icon Container - Removed hover scale and animations */}
            <div className={`inline-flex p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg ${stat.color}`}>
              {stat.icon}
            </div>
            
            {/* Floating indicator for trending stats - Removed animate-pulse */}
            {index < 3 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-orange-400 to-red-500 rounded-full">
                <TrendingUp className="h-2 w-2 text-white" />
              </div>
            )}
          </div>
          
          <div className="stat-counter">
            <div className="text-2xl md:text-3xl font-bold text-slate-800 mb-1">
              {stat.countUp && stat.finalValue ? 
                formatCount(counts[stat.label.toLowerCase().replace(/\s+/g, '')] || 0, stat.value) : 
                stat.value
              }
            </div>
            <div className="text-sm text-slate-600 font-medium">
              {stat.label}
            </div>
          </div>
          
          {/* Progress indicator for accuracy - Removed animations */}
          {stat.label === "Accuracy Rate" && (
            <div className="mt-2 flex justify-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-3 w-3 text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
          )}
          
          {/* Avatar stack for users - Removed animations */}
          {stat.label === "Happy Users" && (
            <div className="mt-2 flex justify-center -space-x-2">
              {[1, 2, 3].map((avatar) => (
                <div
                  key={avatar}
                  className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 border-2 border-white shadow-sm"
                />
              ))}
              <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white shadow-sm flex items-center justify-center">
                <span className="text-xs font-bold text-slate-600">+</span>
              </div>
            </div>
          )}
          
          {/* Style preview thumbnails - Removed floating animation */}
          {stat.label === "Hairstyles Available" && (
            <div className="mt-2 flex justify-center space-x-1">
              {[1, 2, 3].map((thumb) => (
                <div
                  key={thumb}
                  className="w-4 h-4 rounded bg-gradient-to-br from-blue-400 to-purple-400 opacity-60"
                />
              ))}
            </div>
          )}
          
          {/* Speed indicator - Removed animate-pulse */}
          {stat.label === "Processing Time" && (
            <div className="mt-2 flex justify-center">
              <div className="w-8 h-1 bg-gradient-to-r from-green-400 to-blue-500 rounded-full">
                <div className="w-2 h-1 bg-white rounded-full" />
              </div>
            </div>
          )}
          
          {/* Chat bubble for support - Removed animate-pulse */}
          {stat.label === "AI Support" && (
            <div className="mt-2 flex justify-center">
              <div className="relative">
                <div className="w-6 h-4 bg-indigo-500 rounded-lg"></div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-indigo-500 rotate-45 -mt-1"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1 h-1 bg-white rounded-full"></div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}