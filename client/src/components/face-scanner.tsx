import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Camera, X, Upload, CheckCircle, Star, Cloud } from 'lucide-react';
import type { ScanProgress } from '@/lib/types';

interface FaceScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

type ScanMode = 'select' | 'camera' | 'upload' | 'scanning' | 'complete';

export function FaceScanner({ isOpen, onClose, onComplete }: FaceScannerProps) {
  const [mode, setMode] = useState<ScanMode>('select');
  const [cameraActive, setCameraActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [scanProgress, setScanProgress] = useState<ScanProgress>({
    progress: 0,
    status: 'Position your face in the frame',
    completed: false
  });
  const [isScanning, setIsScanning] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [rating, setRating] = useState(0);
  const [scanStage, setScanStage] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [detectionPoints, setDetectionPoints] = useState<Array<{x: number, y: number}>>([]);

  const resetState = () => {
    setMode('select');
    setCameraActive(false);
    setFaceDetected(false);
    setIsScanning(false);
    setCountdown(0);
    setRating(0);
    setScanStage('');
    setUploadedImage(null);
    setDetectionPoints([]);
    setScanProgress({
      progress: 0,
      status: 'Position your face in the frame',
      completed: false
    });
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const initializeCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480, facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraActive(true);
      setMode('camera');
      
      // Simulate face detection after 2 seconds
      setTimeout(() => {
        setFaceDetected(true);
        // Generate random detection points
        const points = Array.from({ length: 15 }, () => ({
          x: Math.random() * 280 + 20,
          y: Math.random() * 350 + 25
        }));
        setDetectionPoints(points);
      }, 2000);
    } catch (error) {
      console.error('Camera access denied:', error);
      setMode('upload');
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
      setMode('upload');
      
      // Simulate face detection after 1 second
      setTimeout(() => {
        setFaceDetected(true);
        const points = Array.from({ length: 15 }, () => ({
          x: Math.random() * 280 + 20,
          y: Math.random() * 350 + 25
        }));
        setDetectionPoints(points);
      }, 1000);
    };
    reader.readAsDataURL(file);
  };

  const startScan = () => {
    if (!faceDetected) return;
    
    setIsScanning(true);
    setMode('scanning');
    setCountdown(3);
    
    // Countdown animation
    const countdownInterval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownInterval);
          startActualScan();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startActualScan = () => {
    const stages = [
      'Detecting face...',
      'Analyzing facial features...',
      'Measuring proportions...',
      'Calculating face shape...',
      'Processing complete!'
    ];
    
    let currentStage = 0;
    setScanStage(stages[0]);
    
    const stageInterval = setInterval(() => {
      setScanProgress(prev => {
        const newProgress = Math.min(prev.progress + Math.random() * 20 + 10, 100);
        
        if (newProgress >= 100 || currentStage >= stages.length - 1) {
          clearInterval(stageInterval);
          setMode('complete');
          setRating(5);
          setScanStage('Perfect!');
          setTimeout(() => {
            onComplete();
            setTimeout(() => {
              onClose();
              resetState();
            }, 2000);
          }, 1500);
          return { ...prev, progress: 100, completed: true };
        }
        
        // Update stage every 20% progress
        const stageIndex = Math.floor(newProgress / 20);
        if (stageIndex !== currentStage && stageIndex < stages.length) {
          currentStage = stageIndex;
          setScanStage(stages[stageIndex]);
        }
        
        return { ...prev, progress: newProgress, status: stages[currentStage] };
      });
      
      // Update rating progressively
      setRating(prev => Math.min(prev + 1, 5));
    }, 600);
  };

  useEffect(() => {
    if (!isOpen) {
      resetState();
    }
  }, [isOpen]);

  const renderModeContent = () => {
    switch (mode) {
      case 'select':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Scan Your Face</h2>
            <p className="text-slate-300 mb-8">Choose how you'd like to analyze your face</p>
            
            <div className="oval-frame mx-auto mb-8">
              <div className="oval-content">
                <div className="flex flex-col items-center gap-6">
                  <Button
                    onClick={initializeCamera}
                    className="w-32 h-32 rounded-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
                    size="icon"
                  >
                    <div className="flex flex-col items-center">
                      <Camera className="h-10 w-10 mb-2" />
                      <span className="text-sm font-medium">Use Camera</span>
                    </div>
                  </Button>
                  
                  <div className="text-slate-400 font-medium">OR</div>
                  
                  <div 
                    className="w-32 h-32 border-3 border-dashed border-primary/50 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-all duration-300"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Cloud className="h-8 w-8 text-primary mb-2" />
                    <span className="text-sm font-medium text-primary">Upload Photo</span>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-sm text-slate-400">Position your face within the oval for best results</p>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
          </div>
        );

      case 'camera':
      case 'upload':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Face Detection</h2>
            <p className="text-slate-300 mb-8">
              {faceDetected ? 'Perfect! Face detected successfully' : 'Positioning your face...'}
            </p>
            
            <div className="oval-frame mx-auto mb-8">
              <div className="oval-content relative overflow-hidden">
                {mode === 'camera' && cameraActive ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : uploadedImage ? (
                  <img 
                    src={uploadedImage}
                    alt="Uploaded"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-slate-100 flex items-center justify-center">
                    <Upload className="h-16 w-16 text-slate-400" />
                  </div>
                )}
                
                {faceDetected && (
                  <>
                    {/* Detection points - Removed animate-pulse */}
                    {detectionPoints.map((point, index) => (
                      <div
                        key={index}
                        className="absolute w-2 h-2 bg-primary rounded-full"
                        style={{
                          left: point.x,
                          top: point.y
                        }}
                      />
                    ))}
                    
                    {/* Face outline - Removed animate-pulse */}
                    <div className="absolute inset-8 border-2 border-primary rounded-full opacity-70" />
                  </>
                )}
              </div>
            </div>
            
            {faceDetected && (
              <Button
                onClick={startScan}
                className="px-8 py-4 bg-gradient-to-r from-success to-green-400 hover:shadow-xl transition-all text-lg font-semibold"
                size="lg"
              >
                <CheckCircle className="h-6 w-6 mr-2" />
                Start Analysis
              </Button>
            )}
          </div>
        );

      case 'scanning':
        return (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Analyzing Your Face</h2>
            
            {countdown > 0 ? (
              <div className="mb-8">
                <div className="text-8xl font-bold text-primary mb-4 countdown-number">
                  {countdown}
                </div>
                <p className="text-slate-300">Get ready...</p>
              </div>
            ) : (
              <>
                <div className="oval-frame mx-auto mb-8">
                  <div className="oval-content relative overflow-hidden">
                    {cameraActive && stream ? (
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className="w-full h-full object-cover"
                      />
                    ) : uploadedImage ? (
                      <img 
                        src={uploadedImage}
                        alt="Uploaded"
                        className="w-full h-full object-cover"
                      />
                    ) : null}
                    
                    {/* Scanning line - Removed animation */}
                    <div className="scanning-line" />
                    
                    {/* Detection points - Removed animate-ping */}
                    {detectionPoints.map((point, index) => (
                      <div
                        key={index}
                        className="absolute w-3 h-3 bg-success rounded-full"
                        style={{
                          left: point.x,
                          top: point.y
                        }}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Progress value={scanProgress.progress} className="h-3" />
                  
                  <p className="text-lg font-medium text-primary">
                    {scanStage}
                  </p>
                  
                  {/* Rating stars */}
                  <div className="flex justify-center space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-6 w-6 ${
                          star <= rating 
                            ? 'text-yellow-400 fill-yellow-400' 
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        );

      case 'complete':
        return (
          <div className="text-center">
            <div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-12 w-12 text-white" />
            </div>
            
            <h2 className="text-3xl font-bold text-success mb-4">Perfect!</h2>
            <p className="text-slate-600 mb-6">Face analysis complete. Redirecting to styles...</p>
            
            {/* Rating stars */}
            <div className="flex justify-center space-x-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className="h-8 w-8 text-yellow-400 fill-yellow-400 animate-bounce"
                  style={{ animationDelay: `${star * 100}ms` }}
                />
              ))}
            </div>
            
            <p className="text-sm text-slate-500">Excellent facial structure detected!</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg p-0 bg-transparent border-none" aria-describedby="scanner-description">
        <div className="hidden" id="scanner-description">AI-powered face scanning for hairstyle recommendations</div>
        <div className="scanner-modal">
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4 z-10 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
          
          <div className="scanner-content">
            {renderModeContent()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}