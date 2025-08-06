import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Crown, 
  Sparkles, 
  Zap, 
  Star, 
  CheckCircle, 
  Lock, 
  Unlock, 
  Diamond, 
  Palette, 
  Camera, 
  Brain, 
  Activity,
  ArrowRight,
  Gift
} from 'lucide-react';

interface PremiumFeaturesProps {
  onUpgrade?: () => void;
  isPremium?: boolean;
}

export function PremiumFeatures({ onUpgrade, isPremium = false }: PremiumFeaturesProps) {
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');

  const features = [
    {
      icon: <Crown className="h-5 w-5" />,
      title: "Unlimited Hairstyles",
      description: "Generate unlimited AI hairstyles without restrictions",
      premium: true
    },
    {
      icon: <Sparkles className="h-5 w-5" />,
      title: "Advanced AI Models",
      description: "Access to premium FLUX.1 and advanced inpainting models",
      premium: true
    },
    {
      icon: <Palette className="h-5 w-5" />,
      title: "Style Customization",
      description: "Fine-tune and customize every aspect of your hairstyle",
      premium: true
    },
    {
      icon: <Camera className="h-5 w-5" />,
      title: "HD Quality Scans",
      description: "High-definition 3D face scanning with enhanced accuracy",
      premium: true
    },
    {
      icon: <Brain className="h-5 w-5" />,
      title: "AI Style Recommendations",
      description: "Get personalized hairstyle suggestions based on your face shape",
      premium: true
    },
    {
      icon: <Activity className="h-5 w-5" />,
      title: "Real-time Processing",
      description: "Faster generation times with priority processing",
      premium: true
    },
    {
      icon: <Gift className="h-5 w-5" />,
      title: "Exclusive Templates",
      description: "Access to premium hairstyle templates and styles",
      premium: true
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Priority Support",
      description: "24/7 premium customer support with dedicated assistance",
      premium: true
    }
  ];

  const plans = {
    monthly: {
      price: 19.99,
      originalPrice: 29.99,
      savings: "33% off"
    },
    yearly: {
      price: 199.99,
      originalPrice: 359.88,
      savings: "44% off"
    }
  };

  const currentPlan = plans[selectedPlan];

  if (isPremium) {
    return (
      <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 rounded-3xl p-8 border border-purple-200">
        <div className="text-center space-y-6">
          {/* Premium Badge */}
          <div className="flex items-center justify-center space-x-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
              Premium Member
            </Badge>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
              Welcome to GlamMefy Premium!
            </h3>
            <p className="text-gray-600 mt-2">You have access to all premium features</p>
          </div>

          {/* Premium Features Grid */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3 p-4 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800 text-sm">{feature.title}</h4>
                  <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                </div>
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
              </div>
            ))}
          </div>

          {/* Premium Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-purple-600">∞</div>
              <p className="text-xs text-gray-600">Hairstyles</p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-blue-600">HD</div>
              <p className="text-xs text-gray-600">Quality</p>
            </div>
            <div className="text-center p-4 bg-white rounded-xl shadow-sm">
              <div className="text-2xl font-bold text-green-600">24/7</div>
              <p className="text-xs text-gray-600">Support</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 rounded-3xl p-8 border border-purple-200">
      <div className="text-center space-y-8">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-center space-x-2">
            <Crown className="h-8 w-8 text-yellow-500" />
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
              GlamMefy Premium
            </h2>
          </div>
          <p className="text-gray-600 text-lg">Unlock the full potential of AI-powered hairstyle generation</p>
        </div>

        {/* Pricing Toggle */}
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedPlan === 'monthly'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setSelectedPlan('yearly')}
            className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
              selectedPlan === 'yearly'
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                : 'bg-white text-gray-600 border border-gray-200'
            }`}
          >
            Yearly
            <Badge variant="secondary" className="ml-2 bg-green-500 text-white">
              Best Value
            </Badge>
          </button>
        </div>

        {/* Pricing Card */}
        <div className="relative">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-purple-200">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <Badge variant="secondary" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                <Star className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            </div>

            <div className="text-center space-y-6">
              {/* Price */}
              <div className="space-y-2">
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-4xl font-bold text-gray-800">${currentPlan.price}</span>
                  <span className="text-gray-500">/{selectedPlan === 'monthly' ? 'mo' : 'year'}</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <span className="text-lg text-gray-400 line-through">${currentPlan.originalPrice}</span>
                  <Badge variant="secondary" className="bg-green-500 text-white">
                    {currentPlan.savings}
                  </Badge>
                </div>
              </div>

              {/* Features List */}
              <div className="space-y-4">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="font-medium text-gray-800">{feature.title}</span>
                      <p className="text-sm text-gray-600">{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* CTA Button */}
              <Button
                onClick={onUpgrade}
                className="w-full py-4 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 hover:from-purple-600 hover:via-blue-600 hover:to-pink-600 hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-xl font-semibold text-lg"
                size="lg"
              >
                <Crown className="h-5 w-5 mr-2" />
                Upgrade to Premium
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>

              {/* Additional Info */}
              <div className="text-center space-y-2">
                <p className="text-sm text-gray-500">Cancel anytime • No commitment</p>
                <div className="flex items-center justify-center space-x-2 text-xs text-gray-400">
                  <Lock className="h-3 w-3" />
                  <span>Secure payment • 256-bit encryption</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comparison */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-4">Free Plan</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">3 hairstyles per month</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">Basic AI models</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-gray-600">Standard quality</span>
              </div>
              <div className="flex items-center space-x-3">
                <Lock className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-400">Community support</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl p-6 shadow-lg text-white">
            <h4 className="font-semibold mb-4 flex items-center">
              <Crown className="h-5 w-5 mr-2" />
              Premium Plan
            </h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Unlimited hairstyles</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Advanced AI models</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">HD quality</span>
              </div>
              <div className="flex items-center space-x-3">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm">Priority support</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 