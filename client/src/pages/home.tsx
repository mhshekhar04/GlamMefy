import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FaceScanner } from '@/components/face-scanner';
import { HeroScanner } from '@/components/hero-scanner';
import { EnhancedStats } from '@/components/enhanced-stats';
import { HairTemplates } from '@/components/hair-templates';
import { PreviewSection } from '@/components/preview-section';
import { Sidebar } from '@/components/sidebar';
import { AuthModal } from '@/components/auth-modal';
import { HairGenerationModal } from '@/components/hair-generation-modal';
import { PremiumFeatures } from '@/components/premium-features';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAuth } from '@/contexts/auth-context';
import { hairGenerationAPI } from '@/services/hair-generation-api';
import { 
  Camera, 
  Images, 
  Scissors, 
  Menu, 
  X, 
  Bolt, 
  Clock, 
  Palette,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Play,
  Shield,
  Award,
  Sparkles,
  ArrowRight,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import type { Hairstyle } from '@/lib/types';

export default function Home() {
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenerationModal, setShowGenerationModal] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [showOutput, setShowOutput] = useState(false);
  const [activeImage, setActiveImage] = useState(1);
  
  // Store scanned images and masked image from scanning flow
  const [scannedImages, setScannedImages] = useState<string[]>([]);
  const [originalCollageUrl, setOriginalCollageUrl] = useState<string | null>(null);
  const [maskedImageUrl, setMaskedImageUrl] = useState<string | null>(null);
  
  const isMobile = useIsMobile();
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleScanComplete = (scannedData?: any) => {
    // Store the scanned data for use in hair generation
    console.log('=== handleScanComplete called ===');
    console.log('Received scanned data:', scannedData);
    console.log('Original collage URL from data:', scannedData?.originalCollageUrl);
    console.log('Masked image URL from data:', scannedData?.maskedImageUrl);
    console.log('Images array from data:', scannedData?.images);
    
    if (scannedData) {
      setScannedImages(scannedData.images || []);
      setOriginalCollageUrl(scannedData.originalCollageUrl || null);
      setMaskedImageUrl(scannedData.maskedImageUrl || null);
      
      console.log('=== State Updated ===');
      console.log('Set scannedImages:', scannedData.images?.length || 0);
      console.log('Set originalCollageUrl:', scannedData.originalCollageUrl);
      console.log('Set maskedImageUrl:', scannedData.maskedImageUrl);
    }
    
    document.getElementById('styles')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleAuthSuccess = (token: string, userData: any) => {
    login(token, userData);
  };

  const handleAuthRequired = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return false;
    }
    return true;
  };

  const handleStartScan = () => {
    if (handleAuthRequired()) {
      setScanModalOpen(true);
    }
  };

  const handleStartCamera = () => {
    if (handleAuthRequired()) {
      // Handle camera start
    }
  };

  const handleUploadImage = () => {
    if (handleAuthRequired()) {
      // Handle image upload
    }
  };

  const handleTemplateSelect = (template: any) => {
    setSelectedTemplate(template);
  };

  const handleGenerateHairStyle = async () => {
    if (!selectedTemplate) return;

    // Check if we have scanned images and masked image
    console.log('=== handleGenerateHairStyle called ===');
    console.log('Selected template:', selectedTemplate);
    console.log('Original collage URL:', originalCollageUrl);
    console.log('Masked image URL:', maskedImageUrl);
    console.log('Scanned images length:', scannedImages.length);
    
    if (!originalCollageUrl || !maskedImageUrl) {
      console.log('No scanned images available. Please scan your face first.');
      console.log('Original collage URL:', originalCollageUrl);
      console.log('Masked image URL:', maskedImageUrl);
      // You could show a modal here asking user to scan first
      return;
    }

    // Just show the generation modal - it will handle the real API call
    setShowGenerationModal(true);
  };

  const splitCollageIntoThree = async (collageUrl: string): Promise<string[]> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          resolve([collageUrl, collageUrl, collageUrl]); // Fallback
          return;
        }

        // Set canvas size for individual image (300x300)
        canvas.width = 300;
        canvas.height = 300;

        const images: string[] = [];
        
        // Split the 900x300 collage into 3 parts (300x300 each)
        for (let i = 0; i < 3; i++) {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw the specific part of the collage
          ctx.drawImage(
            img,
            i * 300, 0, 300, 300, // Source: x, y, width, height
            0, 0, 300, 300         // Destination: x, y, width, height
          );
          
          // Convert to data URL
          const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
          images.push(dataUrl);
        }
        
        resolve(images);
      };
      
      img.onerror = () => {
        // Fallback if image fails to load
        resolve([collageUrl, collageUrl, collageUrl]);
      };
      
      img.src = collageUrl;
    });
  };

  const handleGenerationComplete = (resultUrl: string) => {
    console.log('Received generated image URL:', resultUrl);
    
    // Split the generated collage into 3 individual images
    splitCollageIntoThree(resultUrl).then((splitImages) => {
      console.log('Split images:', splitImages);
      setGeneratedImages(splitImages);
      setShowOutput(true);
      setShowGenerationModal(false);
    }).catch((error) => {
      console.error('Error splitting collage:', error);
      // Fallback: use the same image for all 3 views
      setGeneratedImages([resultUrl, resultUrl, resultUrl]);
      setShowOutput(true);
      setShowGenerationModal(false);
    });
  };

  const rotate = (dir: number) => {
    setActiveImage((prev) => (prev + dir + generatedImages.length) % generatedImages.length);
  };

  return (
    <div className="min-h-screen enhanced-hero-bg">
      {/* Enhanced Header */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo Section */}
            <div className="flex items-center space-x-4">
              <div className="relative group">
                <div className="relative p-3 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl border border-primary/20 group-hover:border-primary/40 transition-all duration-300">
                  <Scissors className="h-8 w-8 text-primary group-hover:scale-110 transition-transform duration-300" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-warning to-accent rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col">
                <span className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                GlamMefy
              </span>
                <div className="flex items-center space-x-2">
                  <div className="px-2 py-1 bg-gradient-to-r from-warning/20 to-accent/20 rounded-full border border-warning/30">
                    <span className="text-xs font-bold text-warning">AI</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">Premium</span>
                </div>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            {!isMobile && (
              <nav className="flex items-center space-x-1">
                <button 
                  onClick={() => scrollToSection('home')}
                  className="relative px-4 py-2 text-primary font-semibold rounded-xl transition-all duration-300 hover:bg-primary/10 group"
                >
                  <span className="relative z-10">Home</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                
                <button 
                  onClick={() => scrollToSection('styles')}
                  className="relative px-4 py-2 text-slate-600 font-medium rounded-xl transition-all duration-300 hover:text-primary hover:bg-primary/5 group"
                >
                  <span className="relative z-10">Styles</span>
                  <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                
                <button 
                  onClick={() => scrollToSection('gallery')}
                  className="relative px-4 py-2 text-slate-600 font-medium rounded-xl transition-all duration-300 hover:text-primary hover:bg-primary/5 group"
                >
                  <span className="relative z-10">Gallery</span>
                  <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                
                <button className="relative px-4 py-2 text-slate-600 font-medium rounded-xl transition-all duration-300 hover:text-primary hover:bg-primary/5 group">
                  <span className="relative z-10">About</span>
                  <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
                
                <button 
                  onClick={() => scrollToSection('premium')}
                  className="relative px-4 py-2 text-slate-600 font-medium rounded-xl transition-all duration-300 hover:text-primary hover:bg-primary/5 group"
                >
                  <span className="relative z-10">Premium</span>
                  <div className="absolute inset-0 bg-primary/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </button>
              </nav>
            )}
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-3">
              {!isMobile && (
                isAuthenticated ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <User className="h-4 w-4 text-white" />
                        </div>
                      )}
                      <span className="text-sm font-medium text-slate-700">{user?.name}</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={logout}
                      className="border-red-300 text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    className="relative px-6 py-2.5 border-2 border-primary/30 text-primary font-semibold rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-300 group overflow-hidden"
                    onClick={() => setAuthModalOpen(true)}
                  >
                    <span className="relative z-10">Login</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </Button>
                )
              )}
              
              {!isAuthenticated && (
                <Button 
                  className="relative px-6 py-2.5 bg-gradient-to-r from-primary via-secondary to-accent text-white font-bold rounded-xl hover:shadow-2xl hover:shadow-primary/25 hover:scale-105 transition-all duration-300 group overflow-hidden"
                  onClick={() => setAuthModalOpen(true)}
                >
                  <span className="relative z-10">Sign Up Free</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              )}
              
              {isMobile && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => setMobileMenuOpen(true)}
                  className="relative p-3 rounded-xl hover:bg-primary/10 transition-all duration-300 group"
                >
                  <Menu className="h-6 w-6 text-slate-600 group-hover:text-primary transition-colors duration-300" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Enhanced Mobile Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-xl shadow-2xl border-l border-slate-200/50">
            <div className="p-8">
              {/* Mobile Menu Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl border border-primary/20">
                    <Scissors className="h-6 w-6 text-primary" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                    GlamMefy
                  </span>
                </div>
              <Button 
                variant="ghost" 
                size="icon"
                onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-slate-100 transition-all duration-300"
              >
                  <X className="h-5 w-5 text-slate-600" />
              </Button>
              </div>
              
              {/* Mobile Navigation */}
              <nav className="space-y-2">
                <button 
                  onClick={() => scrollToSection('home')}
                  className="w-full text-left px-4 py-3 text-primary font-semibold rounded-xl bg-primary/10 border border-primary/20 transition-all duration-300 hover:bg-primary/15"
                >
                  Home
                </button>
                <button 
                  onClick={() => scrollToSection('styles')}
                  className="w-full text-left px-4 py-3 text-slate-600 font-medium rounded-xl hover:bg-slate-100 hover:text-primary transition-all duration-300"
                >
                  Styles
                </button>
                <button 
                  onClick={() => scrollToSection('gallery')}
                  className="w-full text-left px-4 py-3 text-slate-600 font-medium rounded-xl hover:bg-slate-100 hover:text-primary transition-all duration-300"
                >
                  Gallery
                </button>
                <button className="w-full text-left px-4 py-3 text-slate-600 font-medium rounded-xl hover:bg-slate-100 hover:text-primary transition-all duration-300">
                  About
                </button>
              </nav>
              
              {/* Mobile Action Buttons */}
              <div className="mt-8 space-y-3">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-xl">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-white" />
                        </div>
                      )}
                      <div>
                        <p className="font-medium text-slate-900">{user?.name}</p>
                        <p className="text-sm text-slate-500">{user?.email}</p>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      className="w-full py-3 border-red-300 text-red-600 hover:bg-red-50"
                      onClick={logout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                ) : (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full py-3 border-2 border-primary/30 text-primary font-semibold rounded-xl hover:border-primary hover:bg-primary/5 transition-all duration-300"
                      onClick={() => setAuthModalOpen(true)}
                    >
                      Login
                    </Button>
                    <Button 
                      className="w-full py-3 bg-gradient-to-r from-primary to-secondary text-white font-bold rounded-xl hover:shadow-xl hover:scale-105 transition-all duration-300"
                      onClick={() => setAuthModalOpen(true)}
                    >
                      Sign Up Free
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Background Elements */}
      <div className="floating-elements">
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="floating-shape"></div>
        <div className="color-bubble"></div>
        <div className="color-bubble"></div>
        <div className="color-bubble"></div>
        <div className="sparkle-container">
          <div className="sparkle"></div>
          <div className="sparkle"></div>
          <div className="sparkle"></div>
          <div className="sparkle"></div>
        </div>
      </div>

      {/* Enhanced Hero Section */}
      <section id="home" className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          {/* Hero Content - Better Structured */}
          <div className="text-center mb-20">
            {/* Main Hero Title */}
            <div className="mb-12">
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-8 leading-tight">
                Transform Your Look with{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  AI
                  </span>
                  <Sparkles className="absolute -top-4 -right-8 h-8 w-8 text-warning animate-pulse" />
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
                Discover your perfect hairstyle and color with our advanced{' '}
                <span className="font-semibold text-primary">AI technology</span>
              </p>
              </div>
              
            {/* Enhanced Statistics Section */}
            <div className="mb-16">
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
                <h3 className="text-lg font-semibold text-slate-700 mb-6">Trusted by Millions</h3>
                <EnhancedStats />
              </div>
            </div>
          </div>
          
          {/* Scanner Section - Centered and Structured */}
          <div className="flex justify-center">
            <div className="relative max-w-md w-full">
              {/* Background Glow */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 rounded-3xl blur-3xl"></div>
              
              {/* Main Scanner Container */}
              <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/50">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">AI Face Scanner</h3>
                  <p className="text-slate-600 text-sm">Advanced facial analysis with 3D collage generation</p>
                </div>
            
                <HeroScanner onScanComplete={handleScanComplete} />
                </div>
                </div>
          </div>
        </div>
      </section>

      {/* Styles Section */}
      <section id="styles" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Choose Your Style</h2>
            <p className="text-xl text-slate-600">Select a template to transform your hair with AI</p>
          </div>
          
          <HairTemplates 
            onTemplateSelect={handleTemplateSelect}
            onGenerate={handleGenerateHairStyle}
            isGenerating={isGenerating}
            hasScannedData={!!originalCollageUrl && !!maskedImageUrl}
          />
        </div>
            </section>
            
      {/* Output Display Section */}
      {showOutput && generatedImages.length > 0 && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-slate-800 mb-4">Your New Look!</h2>
              <p className="text-xl text-slate-600">Generated with {selectedTemplate?.name}</p>
            </div>
            
            {/* Generated 3D Carousel Container */}
            <div className="max-w-4xl mx-auto">
              <div className="carousel-3d-fixed">
                <div className="carousel-3d-stage-fixed" style={{ '--active': activeImage } as React.CSSProperties}>
                  {generatedImages.map((image, idx) => (
                    <div
                      key={idx}
                      className={`carousel-3d-slide-fixed${activeImage === idx ? ' active' : ''}`}
                      style={{ '--i': idx } as React.CSSProperties}
                    >
                      <div className="carousel-3d-img-wrap-fixed">
                        <div className="carousel-3d-img-container-fixed">
                          <img 
                            src={image} 
                            alt={`Generated hairstyle ${idx + 1}`} 
                            className="carousel-3d-img-fixed"
                          />
                          <div className="carousel-3d-overlay-fixed">
                            <div className="carousel-3d-badge-fixed">
                              <Sparkles className="h-4 w-4" />
                              <span>AI Generated</span>
                            </div>
                          </div>
                        </div>
                        <div className="carousel-3d-label-fixed">
                          <div className="carousel-3d-label-icon-fixed">👤</div>
                          <span>Generated View {idx + 1}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Navigation Arrows */}
                {generatedImages.length > 1 && (
                  <>
                    <button 
                      className="carousel-3d-arrow-fixed left" 
                      onClick={() => rotate(-1)}
                      aria-label="Previous view"
                    >
                      <ChevronLeft className="h-6 w-6" />
                    </button>
                    <button 
                      className="carousel-3d-arrow-fixed right" 
                      onClick={() => rotate(1)}
                      aria-label="Next view"
                    >
                      <ChevronRight className="h-6 w-6" />
                    </button>
                  </>
                )}
              </div>
              
              {/* Controls */}
              <div className="flex justify-center mt-8 space-x-6">
                <div className="flex items-center space-x-3 px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl shadow-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                  <span className="text-white font-semibold">AI Generated</span>
          </div>
          
                <div className="flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
                  <span className="text-white font-semibold">
                    {activeImage + 1} of {generatedImages.length}
                  </span>
        </div>
      </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center space-x-4 mt-8">
                <Button 
                  variant="outline"
                  className="px-6 py-3 border-2 border-purple-300 text-purple-600 hover:bg-purple-50"
                  onClick={() => setShowOutput(false)}
                >
                  Try Another Style
                </Button>
                <Button 
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  Download Result
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Premium Features Section */}
      <section id="premium" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-slate-800 mb-4">Unlock Premium Features</h2>
            <p className="text-xl text-slate-600">Get unlimited access to advanced AI hairstyle generation</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <PremiumFeatures 
              onUpgrade={() => {
                // Handle premium upgrade
                console.log('Premium upgrade clicked');
              }}
              isPremium={false} // Set to true if user has premium
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl border border-primary/30">
                  <Scissors className="h-6 w-6 text-primary" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  GlamMefy
                </span>
              </div>
              <p className="text-slate-300 mb-6 max-w-md">
                Transform your look with AI-powered hairstyle recommendations. 
                Discover your perfect style with our advanced technology.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Home</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Styles</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Gallery</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">About</a></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Contact Us</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-300 hover:text-white transition-colors">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Bar */}
          <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-400 text-sm">
              © 2024 GlamMefy. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-slate-400" />
                <span className="text-slate-400 text-sm">Secure & Private</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-slate-400" />
                <span className="text-slate-400 text-sm">AI Powered</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* Face Scanner Modal */}
      <FaceScanner 
        isOpen={scanModalOpen}
        onClose={() => setScanModalOpen(false)}
        onComplete={handleScanComplete}
      />

      {/* Hair Generation Modal */}
      <HairGenerationModal
        isOpen={showGenerationModal}
        onClose={() => setShowGenerationModal(false)}
        onGenerationComplete={handleGenerationComplete}
        originalImageUrl={originalCollageUrl || ''}
        maskImageUrl={maskedImageUrl || ''}
        selectedTemplate={selectedTemplate}
      />
    </div>
  );
}
