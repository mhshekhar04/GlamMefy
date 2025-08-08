import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Camera, Sparkles, Brain, CheckCircle, RotateCcw, Zap, Eye, Scan, Cpu, Activity } from 'lucide-react';
import { maskingAPI } from '../services/masking-api';

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
  const [countdown, setCountdown] = useState(5);
  const [isCountingDown, setIsCountingDown] = useState(false);
  
  // Masking process state
  const [isMasking, setIsMasking] = useState(false);
  const [maskedImages, setMaskedImages] = useState<string[]>([]);
  const [originalCollageUrl, setOriginalCollageUrl] = useState<string | null>(null);
  const [maskedCollageUrl, setMaskedCollageUrl] = useState<string | null>(null);
  const [maskingStep, setMaskingStep] = useState('Waiting for images...');

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // GIF guidance for head positioning
  const headPositionGifs = {
    front: '/gifs/look_front_small.gif',
    left: '/gifs/turn_left_small.gif',
    right: '/gifs/turn_right_small.gif'
  };

  // Voice synthesis setup
  const speak = (text: string) => {
    try {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        // Try to get a female voice for better quality
        const voices = speechSynthesis.getVoices();
        const femaleVoice = voices.find(voice => 
          voice.name.includes('female') || 
          voice.name.includes('Female') ||
          voice.name.includes('Samantha') ||
          voice.name.includes('Google UK English Female')
        );
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
        
        utterance.onstart = () => {
          console.log('Voice started:', text);
        };
        
        utterance.onend = () => {
          console.log('Voice ended:', text);
        };
        
        utterance.onerror = (event) => {
          console.error('Voice error:', event.error);
          // Fallback to custom audio if available
          playCustomAudio(text);
        };
        
        speechSynthesis.speak(utterance);
      } else {
        console.log('Speech synthesis not supported, would say:', text);
        // Fallback to custom audio
        playCustomAudio(text);
      }
    } catch (error) {
      console.error('Voice synthesis error:', error);
      // Fallback to custom audio
      playCustomAudio(text);
    }
  };

  // Fallback audio system for custom MP3 files
  const playCustomAudio = (text: string) => {
    // Map text to audio file names - using your exact file names
    const audioMap: { [key: string]: string } = {
      'Starting scan. Look straight ahead.': '/audio/starting.mp3',
      'Front view captured. Now turn your head to the left.': '/audio/turnleft.mp3',
      'Left view captured. Now turn your head to the right.': '/audio/turnright.mp3',
      'Right view captured. Scanning complete!': '/audio/complete.mp3'
    };

    const audioFile = audioMap[text];
    if (audioFile) {
      try {
        const audio = new Audio(audioFile);
        audio.volume = 0.8;
        audio.play().catch(error => {
          console.error('Custom audio play error:', error);
        });
      } catch (error) {
        console.error('Custom audio error:', error);
      }
    } else {
      console.log('No custom audio for:', text);
    }
  };

  // Initialize voices when component mounts
  useEffect(() => {
    if ('speechSynthesis' in window) {
      // Load voices
      speechSynthesis.getVoices();
      
      // Some browsers need a delay to load voices
      setTimeout(() => {
        const voices = speechSynthesis.getVoices();
        console.log('Available voices:', voices.length);
      }, 1000);
    }
  }, []);

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

  // Auto-start masking when scan is complete
  useEffect(() => {
    if (scanState === 'complete' && capturedImages.length === 3 && maskedImages.length === 0) {
      console.log('Scan complete detected, starting masking automatically...');
      setTimeout(async () => {
        await startMaskingProcess();
      }, 500);
    }
  }, [scanState, capturedImages.length, maskedImages.length]);

  const startCamera = () => {
    setIsCountingDown(true);
    setCountdown(5);
    // Remove voice countdown - just use visual countdown
    
    const countdownInterval = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 1) {
          // No voice for countdown numbers
          return prev - 1;
        } else {
          clearInterval(countdownInterval);
          setIsCountingDown(false);
          setScanPhase('front');
          setScanState('scanning');
          speak("Starting scan. Look straight ahead.");
          return 0;
        }
      });
    }, 1000);
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
      speak("Front view captured. Now turn your head to the left.");
      setTimeout(() => captureImage('left'), 5000);
    } else if (phase === 'left') {
      setScanPhase('right');
      speak("Left view captured. Now turn your head to the right.");
      setTimeout(() => captureImage('right'), 5000);
    } else {
      speak("Right view captured. Scanning complete!");
      setScanState('complete');
      setTimeout(() => processImages(), 1000);
    }
  };

  const processImages = async () => {
    console.log('=== Starting Image Processing ===');
    console.log('Captured images count:', capturedImages.length);
    
    let current = 0;
    const iv = setInterval(() => {
      current += Math.random() * 15;
      if (current >= 100) {
        clearInterval(iv);
        setProgress(100);
        console.log('Processing complete, starting masking...');
        
        // Immediately start masking process
        setScanState('complete');
        setShowCollage(true);
        
        // Start masking process after a short delay to ensure state is updated
        setTimeout(async () => {
          console.log('Starting automatic masking process...');
          console.log('Captured images at masking start:', capturedImages.length);
          await startMaskingProcess();
        }, 1000);
        
      } else {
        setProgress(current);
      }
    }, 200);
  };

  const startMaskingProcess = async () => {
    console.log('=== Starting Individual Masking Process ===');
    console.log('Captured images:', capturedImages);
    console.log('Captured images length:', capturedImages.length);
    
    if (capturedImages.length !== 3) {
      console.error('Expected 3 images, but got:', capturedImages.length);
      setMaskingStep('Error: Expected 3 images for masking');
      setIsMasking(false);
      return;
    }

    setIsMasking(true);
    setMaskingStep('Starting individual masking...');
    setMaskedImages([]);
    
    try {
      // Initialize masking API
      const apiKey = import.meta.env.VITE_FAL_KEY;
      if (!apiKey) {
        throw new Error('FAL API key not found');
      }
      console.log('API Key found:', apiKey.substring(0, 10) + '...');
      maskingAPI.initialize(apiKey);
      console.log('Masking API initialized with key');

      // Test the first image to verify API is working
      console.log('Testing masking API with first image...');
      setMaskingStep('Testing masking API...');
      
      const testResponse = await fetch(capturedImages[0]);
      if (!testResponse.ok) {
        throw new Error(`Failed to fetch test image: ${testResponse.status}`);
      }
      const testBlob = await testResponse.blob();
      const testFile = new File([testBlob], 'test-face.png', { type: 'image/png' });
      
      console.log('Test file created:', testFile.size, 'bytes');
      
      // Test the masking API
      const testResult = await maskingAPI.processFaceCollage(testFile, {
        prompt: "Mask only the scalp hair in the full-face crop, excluding all facial hair (beard, eyebrows). Focus on the hair on top of the head, sideburns, and back of the head. Do not include any facial hair, eyebrows, or beard."
      });
      
      console.log('Test masking successful:', testResult);
      setMaskingStep('API test successful, processing all images...');

      // Process each image individually
      console.log('Processing 3 images individually...');
      setMaskingStep('Processing 3 images individually...');
      
      const maskedImagesArray: string[] = [];
      
      for (let i = 0; i < capturedImages.length; i++) {
        console.log(`Processing image ${i + 1}/${capturedImages.length}...`);
        setMaskingStep(`Masking image ${i + 1}/3...`);
        
        try {
          // Convert image URL to blob
          console.log(`Fetching image ${i + 1}:`, capturedImages[i]);
          const response = await fetch(capturedImages[i]);
          
          if (!response.ok) {
            throw new Error(`Failed to fetch image ${i + 1}: ${response.status}`);
          }
          
          const blob = await response.blob();
          console.log(`Image ${i + 1} blob size:`, blob.size);
          
          // Create file from blob
          const file = new File([blob], `face-${i + 1}.png`, { type: 'image/png' });
          
          console.log(`Image ${i + 1} file:`, file);
          console.log(`Image ${i + 1} size:`, file.size, 'bytes');
          
          // Call masking API for individual image
          console.log(`Calling masking API for image ${i + 1}...`);
          const maskedResult = await maskingAPI.processFaceCollage(file, {
            prompt: "Mask only the scalp hair in the full-face crop, excluding all facial hair (beard, eyebrows). Focus on the hair on top of the head, sideburns, and back of the head. Do not include any facial hair, eyebrows, or beard."
          });
          
          console.log(`Masking API result for image ${i + 1}:`, maskedResult);
          console.log(`Masked image ${i + 1} URL:`, maskedResult.image.url);
          
          maskedImagesArray.push(maskedResult.image.url);
          setMaskedImages([...maskedImagesArray]);
          
          console.log(`Successfully masked image ${i + 1}`);
          
        } catch (imageError) {
          console.error(`Error processing image ${i + 1}:`, imageError);
          setMaskingStep(`Error masking image ${i + 1}: ${imageError instanceof Error ? imageError.message : 'Unknown error'}`);
          setIsMasking(false);
          return;
        }
      }
      
      console.log('All 3 images masked successfully:', maskedImagesArray);
      
      if (maskedImagesArray.length !== 3) {
        throw new Error(`Expected 3 masked images, but got ${maskedImagesArray.length}`);
      }
      
      setMaskingStep('Creating collage from masked images...');
      
      // Create collage from the 3 masked images
      const collageCanvas = document.createElement('canvas');
      const ctx = collageCanvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      collageCanvas.width = 900;
      collageCanvas.height = 300;

      // Load all 3 masked images
      const maskedImagePromises = maskedImagesArray.map((src) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      });

      const loadedMaskedImages = await Promise.all(maskedImagePromises);
      console.log('Loaded masked images successfully:', loadedMaskedImages.length);

      // Draw masked images side by side in the collage
      const imageWidth = 300;
      const imageHeight = 300;
      
      loadedMaskedImages.forEach((img, index) => {
        ctx.drawImage(img, index * imageWidth, 0, imageWidth, imageHeight);
      });

      // Convert canvas to blob for final collage
      const collageBlob = await new Promise<Blob>((resolve) => {
        collageCanvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });

      const maskedCollagePreviewUrl = URL.createObjectURL(collageBlob);
      setMaskedCollageUrl(maskedCollagePreviewUrl);

      // Create original collage for comparison
      const originalCollageCanvas = document.createElement('canvas');
      const originalCtx = originalCollageCanvas.getContext('2d');
      
      if (!originalCtx) {
        throw new Error('Could not get canvas context for original collage');
      }

      originalCollageCanvas.width = 900;
      originalCollageCanvas.height = 300;

      // Load original images for comparison
      const originalImagePromises = capturedImages.map((src) => {
        return new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = src;
        });
      });

      const loadedOriginalImages = await Promise.all(originalImagePromises);
      
      // Draw original images side by side
      loadedOriginalImages.forEach((img, index) => {
        originalCtx.drawImage(img, index * imageWidth, 0, imageWidth, imageHeight);
      });

      const originalCollageBlob = await new Promise<Blob>((resolve) => {
        originalCollageCanvas.toBlob((blob) => {
          if (blob) resolve(blob);
        }, 'image/png');
      });

      const originalCollagePreviewUrl = URL.createObjectURL(originalCollageBlob);
      setOriginalCollageUrl(originalCollagePreviewUrl);
      
      console.log('=== URL Setting Debug ===');
      console.log('Set masked collage URL to:', maskedCollagePreviewUrl);
      console.log('Set original collage URL to:', originalCollagePreviewUrl);
      console.log('URLs are valid:', !!maskedCollagePreviewUrl, !!originalCollagePreviewUrl);
      console.log('Blob sizes - masked:', collageBlob.size, 'original:', originalCollageBlob.size);
      
      // Validate URLs by testing them
      try {
        const maskedTest = await fetch(maskedCollagePreviewUrl);
        const originalTest = await fetch(originalCollagePreviewUrl);
        console.log('URL validation - masked:', maskedTest.ok, 'original:', originalTest.ok);
      } catch (error) {
        console.error('URL validation failed:', error);
      }
      
      setMaskingStep('Masking completed successfully!');
      setIsMasking(false);
      
      // Add a small delay to ensure state updates are complete
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Automatically call onScanComplete with the processed data
      console.log('=== Automatically calling onScanComplete ===');
      console.log('originalCollageUrl:', originalCollagePreviewUrl);
      console.log('maskedCollageUrl:', maskedCollagePreviewUrl);
      console.log('capturedImages length:', capturedImages.length);
      console.log('maskedImages length:', maskedImagesArray.length);
      
      onScanComplete({
        images: capturedImages,
        originalCollageUrl: originalCollagePreviewUrl,
        maskedImageUrl: maskedCollagePreviewUrl
      });
      
      console.log('Masking process completed successfully');
      console.log('Original collage URL:', originalCollagePreviewUrl);
      console.log('Masked collage URL:', maskedCollagePreviewUrl);

    } catch (error) {
      console.error('Individual masking process failed:', error);
      setMaskingStep('Masking failed: ' + (error instanceof Error ? error.message : 'Unknown error'));
      setIsMasking(false);
    }
  };

  const resetScanner = () => {
    setScanState('waiting');
    setScanPhase('front');
    setProgress(0);
    setCapturedImages([]);
    setShowCollage(false);
    setIsMasking(false);
    setMaskedImages([]);
    setOriginalCollageUrl(null);
    setMaskedCollageUrl(null);
    setMaskingStep('Waiting for images...');
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
            {/* Countdown Overlay */}
            {isCountingDown && (
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
                <div className="bg-white rounded-3xl p-8 max-w-md mx-4 shadow-2xl text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-4xl font-bold text-white">{countdown}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800 mb-2">Get Ready!</h3>
                  <p className="text-gray-600 mb-4">Position yourself in front of the camera</p>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                    <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                    <span>Voice instructions will guide you</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Modern Scanner Container */}
            <div className="relative mx-auto w-80 h-80 sm:w-96 sm:h-96">
              {/* Outer Glow Ring */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-pink-500/10 animate-pulse"></div>
              
              {/* Main Scanner Frame */}
              <div className="relative w-full h-full">
                {/* Scanner Border with Gradient */}
                <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 bg-clip-border animate-spin-slow"></div>
                
                {/* Inner Scanner Area */}
                <div 
                  className="absolute inset-4 rounded-full bg-gradient-to-br from-white via-gray-50 to-gray-100 shadow-2xl cursor-pointer hover:shadow-3xl hover:scale-105 transition-all duration-300 group"
                  onClick={startCamera}
                >
                  {/* Scanner Icon */}
                  <div className="relative flex items-center justify-center h-full">
                    <div className="relative group-hover:scale-110 transition-transform duration-300">
                      <div className="w-16 h-16 sm:w-24 sm:h-24 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl">
                        <Camera className="h-8 w-8 sm:h-12 sm:w-12 text-white group-hover:animate-pulse" />
                      </div>
                      <div className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center animate-ping shadow-lg">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-white rounded-full"></div>
                      </div>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="absolute top-3 left-3 sm:top-6 sm:left-6">
                    <div className="flex items-center space-x-1 sm:space-x-2 bg-white/90 backdrop-blur-sm rounded-full px-2 py-1 sm:px-4 sm:py-2 shadow-lg border border-purple-200">
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                      <span className="text-xs sm:text-sm font-semibold text-gray-700">AI Ready</span>
                    </div>
                  </div>

                  {/* Feature Indicators */}
                  <div className="absolute bottom-3 left-3 right-3 sm:bottom-6 sm:left-6 sm:right-6">
                    <div className="flex justify-between">
                      <div className="flex items-center space-x-1 sm:space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1 shadow-md">
                        <Eye className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />
                        <span className="text-xs font-medium text-gray-700 hidden sm:inline">Detection</span>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1 shadow-md">
                        <Scan className="h-3 w-3 sm:h-4 sm:w-4 text-purple-600" />
                        <span className="text-xs font-medium text-gray-700 hidden sm:inline">3D Map</span>
                      </div>
                      <div className="flex items-center space-x-1 sm:space-x-2 bg-white/80 backdrop-blur-sm rounded-full px-2 py-1 sm:px-3 sm:py-1 shadow-md">
                        <Activity className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />
                        <span className="text-xs font-medium text-gray-700 hidden sm:inline">Analysis</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="space-y-4 sm:space-y-6">
              <div className="space-y-2 sm:space-y-3">
                <h3 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
                  GlamMefy Scanner
                </h3>
                <p className="text-gray-600 text-sm sm:text-lg">Advanced 3D Face Recognition & Analysis</p>
                <p className="text-xs sm:text-sm text-gray-500 italic">Click the scanner to begin</p>
              </div>

              {/* Feature Grid */}
              <div className="grid grid-cols-3 gap-2 sm:gap-4 max-w-md mx-auto">
                <div className="text-center p-2 sm:p-4 bg-white rounded-xl shadow-md border border-gray-100">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                    <Eye className="h-4 w-4 sm:h-6 sm:w-6 text-purple-600" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">Face Detection</p>
                  <p className="text-xs text-gray-500">99.9% Accuracy</p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-white rounded-xl shadow-md border border-gray-100">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                    <Scan className="h-4 w-4 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">3D Mapping</p>
                  <p className="text-xs text-gray-500">High Precision</p>
                </div>
                <div className="text-center p-2 sm:p-4 bg-white rounded-xl shadow-md border border-gray-100">
                  <div className="w-8 h-8 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-1 sm:mb-2">
                    <Activity className="h-4 w-4 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-gray-700">AI Analysis</p>
                  <p className="text-xs text-gray-500">Real-time</p>
                </div>
              </div>

              {/* Start Button */}
              <Button
                onClick={startCamera}
                className="relative w-full py-3 sm:py-5 bg-gradient-to-r from-purple-500 via-blue-500 to-pink-500 hover:from-purple-600 hover:via-blue-600 hover:to-pink-600 hover:shadow-2xl hover:scale-105 transition-all duration-500 rounded-2xl font-bold text-sm sm:text-lg overflow-hidden group"
                size="lg"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10 flex items-center justify-center space-x-2 sm:space-x-3">
                  <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 animate-pulse" />
                  <span>Initialize GlamMefy Scanner</span>
                  <Zap className="h-4 w-4 sm:h-6 sm:w-6 animate-pulse" />
                </div>
              </Button>
            </div>
          </div>
        );

      case 'scanning':
        return (
          <div className="text-center space-y-8">
            {/* Small GIF Guidance - Just Above Scanner */}
            <div className="max-w-xs mx-auto">
              <div className="bg-white rounded-xl p-3 shadow-lg border border-gray-200">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h4 className="text-xs font-semibold text-gray-700">Position Guide</h4>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                </div>
                
                {/* Bigger GIF Guidance - No Rectangle Background */}
                <div className="relative overflow-hidden rounded-lg">
                  <img 
                    src={headPositionGifs[scanPhase]}
                    alt={`${scanPhase} head position`}
                    className="w-full h-32 object-contain"
                    onError={(e) => {
                      // Fallback if GIF doesn't load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.parentElement?.querySelector('.fallback-text');
                      if (fallback) {
                        fallback.classList.remove('hidden');
                      }
                    }}
                  />
                  <div className="fallback-text hidden absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                    <div className="text-center">
                      <div className="text-2xl mb-1">
                        {scanPhase === 'front' ? '👤' : scanPhase === 'left' ? '👈' : '👉'}
                      </div>
                      <p className="text-xs font-medium text-gray-700">
                        {scanPhase === 'front' ? 'Straight' : 
                         scanPhase === 'left' ? 'Left' : 'Right'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modern Scanning Container */}
            <div className="relative mx-auto w-80 h-80 sm:w-96 sm:h-96">
              <div className="hero-scanner-frame relative overflow-hidden rounded-full shadow-2xl">
                {/* Video Feed */}
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                  className="absolute inset-0 w-full h-full object-cover rounded-full"
                  style={{ transform: 'scale(1.05) scaleX(-1)' }}
                />
                
                {/* Professional Scanning Overlay */}
                <div className="absolute inset-0 rounded-full">
                  {/* Professional Border */}
                  <div className="absolute inset-0 rounded-full border-2 border-white/30 shadow-inner"></div>
                  
                  {/* Face Targeting Frame */}
                  <div className="absolute inset-12 border border-white/50 rounded-full">
                    {/* Corner Indicators */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 border-l-2 border-t-2 border-white/70 rounded-tl-lg"></div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 border-r-2 border-t-2 border-white/70 rounded-tr-lg"></div>
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 border-l-2 border-b-2 border-white/70 rounded-bl-lg"></div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 border-r-2 border-b-2 border-white/70 rounded-br-lg"></div>
                    
                    {/* Center Crosshair */}
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                      <div className="w-1 h-8 bg-white/60 rounded-full"></div>
                      <div className="w-8 h-1 bg-white/60 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    </div>
                    
                    {/* Face Detection Status */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg border border-white/20">
                      ✓ Face Detected
                    </div>
                  </div>
                  
                  {/* Progress Indicators */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                    {[1, 2, 3].map((dot) => (
                      <div
                        key={dot}
                        className={`w-2 h-2 rounded-full transition-all duration-500 ${
                          (scanPhase === 'front' && dot === 1) ||
                          (scanPhase === 'left' && dot === 2) ||
                          (scanPhase === 'right' && dot === 3)
                            ? 'bg-white shadow-lg scale-125'
                            : 'bg-white/30'
                        }`}
                      />
                    ))}
                  </div>

                  {/* AI Status Badge */}
                  <div className="absolute bottom-4 left-4">
                    <div className="flex items-center space-x-2 bg-black/20 backdrop-blur-sm rounded-full px-3 py-2 shadow-lg border border-white/20">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <Brain className="h-4 w-4 text-white" />
                      <span className="text-xs font-medium text-white">Analyzing</span>
                    </div>
                  </div>
                  
                  {/* Scanning Progress Ring */}
                  <div className="absolute inset-4 rounded-full">
                    <div 
                      className="absolute inset-0 rounded-full border border-white/20"
                      style={{
                        background: `conic-gradient(from ${scanIntensity * 3.6}deg, transparent 0deg, rgba(255, 255, 255, 0.3) 15deg, transparent 30deg)`
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Section */}
            <div className="space-y-4 sm:space-y-6">
              {/* Current Phase */}
              <div className="flex items-center justify-center space-x-2 sm:space-x-3">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                  <Brain className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                    Capturing {scanPhase.charAt(0).toUpperCase() + scanPhase.slice(1)} View
                  </h3>
                  <p className="text-gray-600 text-sm sm:text-base">GlamMefy AI is analyzing facial features...</p>
                </div>
              </div>
              
              {/* Phase Progress */}
              <div className="flex justify-center space-x-2 sm:space-x-3">
                {(['front', 'left', 'right'] as ScanPhase[]).map((phase) => (
                  <div
                    key={phase}
                    className={`px-3 py-2 sm:px-6 sm:py-3 rounded-full text-xs sm:text-sm font-medium transition-all duration-500 shadow-lg ${
                      scanPhase === phase 
                        ? 'bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-green-500/50' 
                        : 'bg-white text-gray-600 border border-gray-200'
                    }`}
                  >
                    {phase === 'front' ? 'Front' : phase === 'left' ? 'Left' : 'Right'}
                    {scanPhase === phase && (
                      <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-ping"></div>
                    )}
                  </div>
                ))}
              </div>

              {/* Voice Status */}
              <div className="flex items-center justify-center space-x-2 mt-4">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs sm:text-sm text-gray-600">
                  {scanPhase === 'front' ? 'Looking straight ahead' : 
                   scanPhase === 'left' ? 'Turn head to the left' : 
                   'Turn head to the right'}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full max-w-md mx-auto">
                <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
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
            {/* Show processing modal until masking is complete */}
            {isMasking || maskedImages.length < 3 ? (
              <>
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
                  <h3 className="text-2xl font-bold text-gray-800">GlamMefy AI Analysis</h3>
                  <p className="text-gray-600">Processing facial features and generating hair masks...</p>
                  
                  {/* Masking Progress */}
                  <div className="w-full max-w-md mx-auto">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>Masking Progress</span>
                      <span>{maskedImages.length}/3</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${(maskedImages.length / 3) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Current Step */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium text-blue-700">{maskingStep}</span>
                    </div>
                  </div>
                  
                  {/* Processing Steps */}
                  <div className="flex justify-center space-x-4 text-xs text-gray-500">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Face Detection</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${maskedImages.length > 0 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span>Hair Masking</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-2 h-2 rounded-full ${maskedImages.length === 3 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span>Collage Creation</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Show final results only after masking is complete
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
                    onClick={() => {
                      // The onScanComplete is now called automatically when masking completes
                      // No need to call it manually here
                      console.log('Continue button clicked - scanning already completed');
                    }} 
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
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full">
      
      {renderScannerContent()}
    </div>
  );
}