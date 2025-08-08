import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Brain, Palette, CheckCircle, X, Download, RotateCcw } from 'lucide-react';
import { hairGenerationAPI } from '../services/hair-generation-api';

interface HairGenerationModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalImageUrl: string;
  maskedImageUrl: string;
  template: any;
}

export function HairGenerationModal({ 
  isOpen, 
  onClose, 
  originalImageUrl, 
  maskedImageUrl, 
  template 
}: HairGenerationModalProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [generationStep, setGenerationStep] = useState('Initializing...');
  const [showOutput, setShowOutput] = useState(false);
  
  // Removed debugging states
  const [templatePrompt, setTemplatePrompt] = useState<string>('');
  const [loraPath, setLoraPath] = useState<string>('');
  const [generationStepNumber, setGenerationStepNumber] = useState(0);

  useEffect(() => {
    if (isOpen && !generatedImageUrl) {
      startRealGeneration();
    }
  }, [isOpen]);

  const startRealGeneration = async () => {
    if (!originalImageUrl || !maskedImageUrl || !template) {
      setError('Missing required data for generation');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(0);
    setGenerationStep('Initializing AI models...');
    setShowOutput(false);

    try {
      // Set debug information
      setTemplatePrompt(template.prompt);
      setLoraPath(template.loraPath);
      setGeneratedImageUrl(null);
      setGenerationStep('Processing your image...');

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 1000);

      // Call the actual API
      const result = await hairGenerationAPI.generateHairStyle(
        originalImageUrl,
        maskedImageUrl,
        template
      );

      clearInterval(progressInterval);
      setProgress(100);
      setGenerationStep('Finalizing your new look...');
      
      // Small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setGeneratedImageUrl(result.images[0].url);
      setShowOutput(true);
      setIsGenerating(false);
      setGenerationStep('Generation complete!');

    } catch (err) {
      console.error('Generation error:', err);
      setError(err instanceof Error ? err.message : 'Generation failed');
      setIsGenerating(false);
    }
  };

  const handleDownload = () => {
    if (generatedImageUrl) {
      const link = document.createElement('a');
      link.href = generatedImageUrl;
      link.download = 'glammefy-hairstyle.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleTryAgain = () => {
    setGeneratedImageUrl(null);
    setShowOutput(false);
    setError(null);
    startRealGeneration();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">GlamMefy AI Generation</h2>
              <p className="text-sm text-gray-600">Creating your new hairstyle</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!showOutput ? (
            // Loading State
            <div className="text-center space-y-6">
              {/* AI Processing Animation */}
              <div className="relative mx-auto w-32 h-32">
                <div className="absolute inset-0 rounded-full border-4 border-purple-200 animate-pulse"></div>
                <div className="absolute inset-4 rounded-full border-4 border-purple-300 animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="absolute inset-8 rounded-full border-4 border-purple-400 animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                <div className="absolute inset-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <Brain className="h-8 w-8 text-white animate-pulse" />
                </div>
              </div>

              {/* Progress Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-800">{generationStep}</h3>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                
                <p className="text-sm text-gray-600">{progress}% Complete</p>
              </div>

              {/* Processing Steps */}
              <div className="grid grid-cols-3 gap-4 text-xs">
                <div className="text-center">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <p className="text-gray-600">Image Analysis</p>
                </div>
                <div className="text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    progress > 30 ? 'bg-blue-100' : 'bg-gray-100'
                  }`}>
                    <Brain className={`h-4 w-4 ${
                      progress > 30 ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <p className="text-gray-600">AI Processing</p>
                </div>
                <div className="text-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    progress > 70 ? 'bg-purple-100' : 'bg-gray-100'
                  }`}>
                    <Sparkles className={`h-4 w-4 ${
                      progress > 70 ? 'text-purple-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <p className="text-gray-600">Style Generation</p>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600 text-sm">{error}</p>
                  <button
                    onClick={handleTryAgain}
                    className="mt-2 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              )}
            </div>
          ) : (
            // Results State
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Your New Look is Ready!</h3>
                <p className="text-gray-600">Generated with {template.name}</p>
              </div>

              {/* Generated Image */}
              <div className="relative rounded-xl overflow-hidden border-2 border-gray-200">
                <img 
                  src={generatedImageUrl!} 
                  alt="Generated hairstyle"
                  className="w-full h-auto"
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-1">
                  <div className="flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700">AI Generated</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download Result
                </Button>
                <Button
                  onClick={handleTryAgain}
                  variant="outline"
                  className="flex-1"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Try Another Style
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 