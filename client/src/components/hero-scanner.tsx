import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Camera, Sparkles, Brain, CheckCircle, RotateCcw, Zap, Eye, Scan, Cpu, Activity } from 'lucide-react';

interface HeroScannerProps {
  onScanComplete: (scannedData?: any) => void;
}

type ScanState = 'waiting' | 'scanning' | 'processing' | 'complete';
type ScanPhase = 'front' | 'left' | 'right';

export function HeroScanner({ onScanComplete }: HeroScannerProps) {
  const [scanState, setScanState] = useState<ScanState>('waiting');
  const [scanPhase, setScanPhase] = useState<ScanPhase>('front');
  const [progress, setProgress] = useState(0);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [showCollage, setShowCollage] = useState(false);
  const [scanIntensity, setScanIntensity] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Scanning animation
  useEffect(() => {
    if (scanState === 'scanning') {
      const scanInterval = setInterval(() => {
        setScanIntensity(prev => (prev + 1) % 100);
      }, 50);

      return () => clearInterval(scanInterval);
    }
  }, [scanState]);

  // Camera setup
  useEffect(() => {
    if (scanState !== 'scanning' || streamRef.current) return;

    (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' } 
        });
        streamRef.current = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setTimeout(() => captureImage('front'), 5000);
        }
      } catch (error) {
        console.error('Camera access denied:', error);
      }
    })();
  }, [scanState]);

  const startCamera = () => {
    setScanPhase('front');
    setScanState('scanning');
  };

  const captureImage = (phase: ScanPhase) => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    setCapturedImages((prev) => [...prev, imageData]);

    if (phase === 'front') {
      setScanPhase('left');
      setTimeout(() => captureImage('left'), 5000);
    } else if (phase === 'left') {
      setScanPhase('right');
      setTimeout(() => captureImage('right'), 5000);
    } else {
      setTimeout(() => {
        setScanState('processing');
        processImages();
      }, 500);
    }
  };

  const processImages = () => {
    let current = 0;
    const iv = setInterval(() => {
      current += Math.random() * 15;
      if (current >= 100) {
        clearInterval(iv);
        setProgress(100);
        setTimeout(() => {
          setScanState('complete');
          setShowCollage(true);
        }, 500);
      } else {
        setProgress(current);
      }
    }, 200);
  };

  const resetScanner = () => {
    setScanState('waiting');
    setScanPhase('front');
    setProgress(0);
    setCapturedImages([]);
    setShowCollage(false);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const renderScannerContent = () => {
    switch (scanState) {
      case 'waiting':
        return (
          <div className="text-center space-y-8">
            {/* Modern Scanner Container */}
            <div className="relative mx-auto w-96 h-96">
              {/* Outer Glow Ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 animate-pulse"></div>
              
              {/* Main Scanner Frame */}
              <div className="relative w-full h-full">
                {/* Scanner Border with Gradient */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 bg-clip-border animate-spin-slow"></div>
                
                {/* Inner Scanner Area */}
                <div className="absolute inset-4 rounded-full bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl">
                  {/* Scanner Icon */}
                  <div className="relative flex items-center justify-center h-full">
                    <div className="relative">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                        <Camera className="h-12 w-12 text-white" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-ping shadow-lg">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-6 left-6">
                    <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-purple-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <Brain className="h-4 w-4 text-purple-600" />
                      <span className="text-sm font-semibold text-gray-700">AI Ready</span>
                    </div>
                  </div>

                  {/* Feature Indicators */}
                  <div className="absolute bottom-6 left-6 right-6">
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
                        <Eye className="h-4 w-4 text-blue-600" />
                        <span className="text-xs font-medium text-gray-700">Detection</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
                        <Scan className="h-4 w-4 text-purple-600" />
                        <span className="text-xs font-medium text-gray-700">3D Map</span>
                      </div>
                      <div className="flex items-center space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1 shadow-md">
                        <Activity className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-medium text-gray-700">Analysis</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-6">
              <div className="space-y-3">
                <h3 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                  GlamMefy Scanner
                </h3>
                <p className="text-gray-600 text-lg">Advanced 3D Face Recognition & Analysis</p>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
                <div className="text-center p-4 bg-white rounded-xl shadow-md border border-gray-100">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Eye className="h-6 w-6 text-purple-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">Face Detection</p>
                  <p className="text-xs text-gray-500">99.9% Accuracy</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-md border border-gray-100">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Scan className="h-6 w-6 text-blue-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">3D Mapping</p>
                  <p className="text-xs text-gray-500">High Precision</p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-md border border-gray-100">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <Activity className="h-6 w-6 text-green-600" />
                  </div>
                  <p className="text-sm font-semibold text-gray-700">AI Analysis</p>
                  <p className="text-xs text-gray-500">Real-time</p>
                </div>
              </div>

              {/* Start Button */}
              <Button
                onClick={startCamera}
                className="relative w-full py-5 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 hover:from-purple-600 hover:via-blue-600 hover:to-pink-600 hover:shadow-2xl hover:scale-105 transition-all duration-500 rounded-2xl font-bold text-lg overflow-hidden group"
                size="lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex items-center justify-center space-x-3">
                  <Sparkles className="h-6 w-6 animate-pulse" />
                  <span>Initialize GlamMefy Scanner</span>
                  <Zap className="h-6 w-6 animate-pulse" />
                </div>
              </Button>
            </div>
          </div>
        );

      case 'scanning':
        return (
          <div className="text-center space-y-8">
            {/* Modern Scanning Container */}
            <div className="relative mx-auto w-96 h-96">
              <div className="hero-scanner-frame relative overflow-hidden rounded-full shadow-2xl">
                {/* Video Feed */}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover rounded-full"
                  style={{ transform: 'scale(1.05)' }}
                />
                
                {/* Scanning Overlay */}
                <div className="absolute inset-0 rounded-full">
                  {/* Animated Border */}
                  <div 
                    className="absolute inset-0 rounded-full border-4 border-green-500 animate-pulse"
                    style={{
                      boxShadow: `0 0 30px rgba(34, 197, 94, ${0.6 + Math.sin(scanIntensity * 0.1) * 0.4})`
                    }}
                  ></div>
                  
                  {/* Scanning Ring */}
                  <div 
                    className="absolute inset-2 rounded-full border-2 border-green-400/50"
                    style={{
                      background: `conic-gradient(from ${scanIntensity * 3.6}deg, transparent 0deg, rgba(34, 197, 94, 0.8) 15deg, transparent 30deg)`
                    }}
                  ></div>
                  
                  {/* Face Detection Frame */}
                  <div className="absolute inset-8 border-2 border-green-400 rounded-full animate-pulse">
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                      ✓ Face Detected
                    </div>
                  </div>
                  
                  {/* Progress Indicators */}
                  <div className="absolute top-6 left-1/2 transform -translate-x-1/2 flex space-x-4">
                    {[1, 2, 3].map((dot) => (
                      <div
                        key={dot}
                        className={`w-4 h-4 rounded-full transition-all duration-500 shadow-lg ${
                          (scanPhase === 'front' && dot === 1) ||
                          (scanPhase === 'left' && dot === 2) ||
                          (scanPhase === 'right' && dot === 3)
                            ? 'bg-green-500 shadow-green-500/50 scale-125'
                            : 'bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>

                  {/* AI Status Badge */}
                  <div className="absolute bottom-6 left-6">
                    <div className="flex items-center space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-green-200">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <Brain className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-semibold text-gray-700">Analyzing</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="space-y-6">
              {/* Current Phase */}
              <div className="flex items-center justify-center space-x-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    Capturing {scanPhase.charAt(0).toUpperCase() + scanPhase.slice(1)} View
                  </h3>
                  <p className="text-gray-600">GlamMefy AI is analyzing facial features...</p>
                </div>
              </div>
              
              {/* Phase Progress */}
              <div className="flex justify-center space-x-3">
                {(['front', 'left', 'right'] as ScanPhase[]).map((phase) => (
                  <div
                    key={phase}
                    className={`px-6 py-3 rounded-full text-sm font-medium transition-all duration-500 shadow-lg ${
                      scanPhase === phase 
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-green-500/50' 
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    {phase.charAt(0).toUpperCase() + phase.slice(1)}
                    {scanPhase === phase && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Scan Progress</span>
                  <span>{scanPhase === 'front' ? '33%' : scanPhase === 'left' ? '66%' : '100%'}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ 
                      width: scanPhase === 'front' ? '33%' : scanPhase === 'left' ? '66%' : '100%' 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'processing':
        return (
          <div className="text-center space-y-8">
            {/* Processing Animation */}
            <div className="relative mx-auto w-80 h-80">
              {/* Processing Ring */}
              <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 bg-clip-border animate-spin-slow"></div>
              
              {/* Inner Circle */}
              <div className="absolute inset-8 rounded-full bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-pink-500/20 animate-pulse"></div>
              
              {/* Central Icon */}
              <div className="absolute inset-16 flex items-center justify-center">
                <div className="relative">
                  <Brain className="h-16 w-16 text-purple-500 animate-pulse" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center animate-ping">
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Processing Status */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold text-gray-800">Processing Images</h3>
              <p className="text-gray-600">GlamMefy AI is analyzing facial features and generating 3D model...</p>
              
              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto">
                <Progress 
                  value={progress} 
                  className="h-3 rounded-full bg-gray-200" 
                />
                <div className="flex justify-between text-sm text-gray-500 mt-2">
                  <span>Processing</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
              
              {/* Processing Steps */}
              <div className="flex justify-center space-x-4 text-xs text-gray-500">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Face Detection</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${progress > 30 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>Feature Mapping</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className={`w-2 h-2 rounded-full ${progress > 70 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                  <span>3D Generation</span>
                </div>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className="text-center space-y-8">
            {showCollage ? (
              <>
                {/* Success Header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-center space-x-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-bounce">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-800">GlamMefy Scan Complete!</h3>
                      <p className="text-gray-600">AI analysis finished successfully</p>
                    </div>
                  </div>
                </div>

                {/* AI Analysis Results */}
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200">
                  <div className="flex items-center justify-center space-x-2 mb-4">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <h4 className="text-lg font-semibold text-gray-800">GlamMefy AI Analysis Results</h4>
                  </div>
                  
                  {/* Analysis Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Eye className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">Face Detected</p>
                      <p className="text-xs text-gray-500">100% Accuracy</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Scan className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">3D Mapping</p>
                      <p className="text-xs text-gray-500">Complete</p>
                    </div>
                    <div className="text-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Activity className="h-6 w-6 text-purple-600" />
                      </div>
                      <p className="text-sm font-medium text-gray-700">AI Analysis</p>
                      <p className="text-xs text-gray-500">Ready</p>
                    </div>
                  </div>

                  {/* Captured Images */}
                  <div className="space-y-4">
                    <h5 className="text-md font-semibold text-gray-700">Captured Face Views</h5>
                    <div className="grid grid-cols-3 gap-3">
                      {capturedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <div className="relative overflow-hidden rounded-lg border-2 border-gray-200 group-hover:border-purple-300 transition-all duration-300">
                            <img 
                              src={image} 
                              alt={`Face view ${index + 1}`}
                              className="w-full h-24 object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          </div>
                          <div className="absolute top-2 left-2 bg-purple-500 text-white px-2 py-1 rounded text-xs font-medium">
                            {index === 0 ? 'Front' : index === 1 ? 'Left' : 'Right'}
                          </div>
                          <div className="absolute bottom-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Button 
                    onClick={() => onScanComplete({
                      images: capturedImages,
                      originalCollageUrl: capturedImages[0],
                      maskedImageUrl: capturedImages[0]
                    })} 
                    className="w-full py-4 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-xl font-semibold"
                  >
                    <Sparkles className="h-5 w-5 mr-2" />
                    Continue to Hair Styles
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={resetScanner} 
                    className="w-full py-3 border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 rounded-xl"
                  >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Scan Again
                  </Button>
                </div>

                {/* Additional Info */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Your face data is ready for GlamMefy hairstyle generation</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <div className="animate-spin h-6 w-6 border-b-2 border-purple-500 rounded-full"></div>
                <span className="text-gray-600">Finalizing GlamMefy results...</span>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return <div className="w-full">{renderScannerContent()}</div>;
}