import { useState, useEffect, useRef } from "react";
import { Header } from "@/components/Header";
import { 
  transformImage, 
  type ModelType, 
  type Gender,
  type ClothingSelection,
  BACKGROUND_COLORS, 
  type BackgroundColor,
  MEN_CLOTHING,
  WOMEN_CLOTHING,
  DEFAULT_CLOTHING,
} from "@/lib/api";
import { ClothingIconMap } from "@/components/ClothingIcons";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, RotateCcw, Zap, Sparkles, Upload, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from "react-dropzone";
import confetti from "canvas-confetti";

const PHOTOGRAPHER_MESSAGES = [
  "Chin up, confidence on...",
  "Give me your best 'I just closed the deal' look",
  "Pretend the camera owes you money",
  "Channel your inner CEO",
  "Think 'approachable but powerful'",
  "Shoulders back, success forward",
  "Show me that corner office energy",
  "Perfect! Now even more professional",
  "That's the million-dollar smile",
  "You're absolutely nailing this",
];

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>("pro");
  const [selectedColor, setSelectedColor] = useState<BackgroundColor>("#562226");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  
  // Clothing state
  const [gender, setGender] = useState<Gender>(DEFAULT_CLOTHING.gender);
  const [clothingId, setClothingId] = useState(DEFAULT_CLOTHING.clothingId);
  const [clothingColor, setClothingColor] = useState(DEFAULT_CLOTHING.clothingColor);
  
  // Photographer message cycling
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Cycle through photographer messages every 5 seconds while processing
  useEffect(() => {
    // Clear any existing interval first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    
    if (isProcessing) {
      // Start with a random message
      setCurrentMessageIndex(Math.floor(Math.random() * PHOTOGRAPHER_MESSAGES.length));
      
      intervalRef.current = setInterval(() => {
        setCurrentMessageIndex(prev => {
          let next = Math.floor(Math.random() * PHOTOGRAPHER_MESSAGES.length);
          // Ensure we don't repeat the same message
          while (next === prev && PHOTOGRAPHER_MESSAGES.length > 1) {
            next = Math.floor(Math.random() * PHOTOGRAPHER_MESSAGES.length);
          }
          return next;
        });
      }, 5000);
    }
    
    // Cleanup function - always returns to ensure proper cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isProcessing]);
  
  const { toast } = useToast();
  
  // Get current clothing options based on gender
  const clothingOptions = gender === "men" ? MEN_CLOTHING : WOMEN_CLOTHING;
  const selectedClothing = clothingOptions.find(c => c.id === clothingId) || clothingOptions[0];

  const handleGenderChange = (newGender: Gender) => {
    setGender(newGender);
    // Reset to first clothing option for new gender
    const newOptions = newGender === "men" ? MEN_CLOTHING : WOMEN_CLOTHING;
    setClothingId(newOptions[0].id);
    setClothingColor(newOptions[0].colors[0].hex);
  };

  const handleClothingSelect = (id: string) => {
    setClothingId(id);
    const clothing = clothingOptions.find(c => c.id === id);
    if (clothing) {
      setClothingColor(clothing.colors[0].hex);
    }
  };

  const handleFileSelect = (file: File) => {
    // Revoke previous object URL if exists
    if (originalImage) {
      URL.revokeObjectURL(originalImage);
    }
    
    const objectUrl = URL.createObjectURL(file);
    setOriginalImage(objectUrl);
    setPendingFile(file);
    setProcessedImage(null);
  };

  const handleSubmit = async () => {
    if (!pendingFile) return;
    
    setIsProcessing(true);
    
    const clothing: ClothingSelection = {
      gender,
      clothingId,
      clothingColor,
    };
    
    try {
      const result = await transformImage(pendingFile, selectedModel, selectedColor, clothing);
      setProcessedImage(result);
      triggerConfetti();
    } catch (error) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 100,
      origin: { y: 0.6 },
      colors: ['#1a1a1a', '#666666', '#999999', '#cccccc']
    });
  };

  const handleReset = () => {
    if (originalImage) {
      URL.revokeObjectURL(originalImage);
    }
    setOriginalImage(null);
    setPendingFile(null);
    setProcessedImage(null);
    setIsProcessing(false);
  };

  const handleDownload = () => {
    if (processedImage) {
      const link = document.createElement('a');
      link.href = processedImage;
      link.download = 'headshot-hero-result.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Image saved",
        className: "bg-foreground text-background border-none",
      });
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFileSelect(acceptedFiles[0]);
      }
    },
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp']
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  return (
    <div className="min-h-screen w-full bg-background font-sans text-foreground">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <Header selectedModel={selectedModel} setSelectedModel={setSelectedModel} isProcessing={isProcessing} gender={gender} />

        {/* Main two-column layout - 70/30 split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
          
          {/* Left Column - Preview Area (70%) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Preview Area */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg">
              <AnimatePresence mode="wait">
                {!originalImage ? (
                  /* Upload Zone */
                  <motion.div
                    key="upload"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <div
                      {...getRootProps()}
                      className={`min-h-[280px] md:min-h-[500px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                        isDragActive 
                          ? "bg-gradient-to-br from-gray-100 to-gray-50 scale-[0.99]" 
                          : "bg-gradient-to-br from-gray-50 to-white hover:from-gray-100 hover:to-gray-50"
                      } ${isProcessing ? "pointer-events-none opacity-50" : ""}`}
                    >
                      <input {...getInputProps()} data-testid="file-input" />
                      <div className="text-center space-y-4 md:space-y-6 p-6 md:p-12">
                        <motion.div 
                          className="w-16 h-16 md:w-24 md:h-24 mx-auto rounded-full bg-gray-200/80 flex items-center justify-center shadow-inner"
                          animate={{ scale: isDragActive ? 1.1 : 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Upload className="w-7 h-7 md:w-10 md:h-10 text-gray-500" strokeWidth={1.5} />
                        </motion.div>
                        <div className="space-y-1 md:space-y-2">
                          <p className="text-lg md:text-2xl font-medium text-foreground">
                            {isDragActive ? "Drop your photo here" : "Drop your photo here"}
                          </p>
                          <p className="text-sm md:text-base text-muted-foreground">or click to browse</p>
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground/60 uppercase tracking-widest">
                          JPG, PNG, WebP up to 10MB
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  /* Before/After Split View */
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-2"
                  >
                    {/* Before Pane */}
                    <div className="relative border-r border-gray-200">
                      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
                        <span className="text-[10px] md:text-xs uppercase tracking-widest text-white/90 bg-black/50 px-2 py-1 md:px-3 md:py-1.5 rounded-full font-medium backdrop-blur-sm">
                          Before
                        </span>
                      </div>
                      <div className="h-[280px] md:h-[500px] overflow-hidden">
                        <motion.img
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.4 }}
                          src={originalImage} 
                          alt="Before" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    {/* After Pane */}
                    <div className="relative">
                      <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10">
                        <span className="text-[10px] md:text-xs uppercase tracking-widest text-white/90 bg-black/50 px-2 py-1 md:px-3 md:py-1.5 rounded-full font-medium backdrop-blur-sm">
                          After
                        </span>
                      </div>
                      <div className="h-[280px] md:h-[500px] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
                        {isProcessing ? (
                          /* Camera with Orbiting Dots & Flash Effect */
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full h-full flex flex-col items-center justify-center space-y-4 md:space-y-6 px-4"
                          >
                            {/* Camera with Orbiting Dots */}
                            <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center">
                              
                              {/* Fade Flash Backdrop */}
                              <motion.div
                                className="absolute inset-0 rounded-full bg-gradient-radial from-amber-200/60 via-amber-100/30 to-transparent"
                                style={{
                                  background: "radial-gradient(circle, rgba(251,191,36,0.4) 0%, rgba(251,191,36,0.1) 40%, transparent 70%)"
                                }}
                                animate={{ 
                                  opacity: [0, 0.8, 0],
                                  scale: [0.8, 1.1, 0.8]
                                }}
                                transition={{ 
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              />
                              
                              {/* Orbiting Dots Container */}
                              <motion.div
                                className="absolute inset-0"
                                animate={{ rotate: 360 }}
                                transition={{
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: "linear"
                                }}
                              >
                                {/* Dot 1 - Top */}
                                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-400" />
                                {/* Dot 2 - Bottom Left */}
                                <div className="absolute bottom-1 left-2 md:bottom-1.5 md:left-2.5 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-500" />
                                {/* Dot 3 - Bottom Right */}
                                <div className="absolute bottom-1 right-2 md:bottom-1.5 md:right-2.5 w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-amber-400" />
                              </motion.div>
                              
                              {/* Camera Icon - Centered */}
                              <Camera className="w-10 h-10 md:w-12 md:h-12 text-foreground relative z-10" strokeWidth={1.5} />
                            </div>
                            
                            {/* Cycling Photographer Message */}
                            <div className="text-center">
                              <AnimatePresence mode="wait">
                                <motion.p
                                  key={currentMessageIndex}
                                  initial={{ opacity: 0, y: 10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  transition={{ duration: 0.3 }}
                                  className="text-sm md:text-lg font-medium text-foreground italic"
                                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                                >
                                  "{PHOTOGRAPHER_MESSAGES[currentMessageIndex]}"
                                </motion.p>
                              </AnimatePresence>
                            </div>
                          </motion.div>
                        ) : processedImage ? (
                          <motion.img
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            src={processedImage}
                            alt="After"
                            className="w-full h-full object-cover"
                          />
                        ) : null}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Action Buttons */}
            {processedImage && !isProcessing && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2 md:gap-3 px-2 md:px-0"
              >
                <Button 
                  onClick={handleDownload}
                  size="sm"
                  className="h-11 md:h-10 px-4 md:px-6 rounded-md text-[10px] md:text-xs font-medium bg-foreground hover:bg-foreground/90 text-background tracking-wide uppercase"
                  data-testid="button-download"
                >
                  <Download className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={1.5} />
                  Download
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  size="sm"
                  className="h-11 md:h-10 px-4 md:px-6 rounded-md text-[10px] md:text-xs font-medium border-border hover:bg-secondary tracking-wide uppercase"
                  data-testid="button-new-photo"
                >
                  <RotateCcw className="mr-1.5 md:mr-2 h-3.5 w-3.5 md:h-4 md:w-4" strokeWidth={1.5} />
                  New Photo
                </Button>
              </motion.div>
            )}
          </div>

          {/* Right Column - Settings Panel (30%) */}
          <div className="lg:col-span-4">
            <div className="space-y-4 lg:sticky lg:top-4">
              
              {/* Background Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 md:p-4 space-y-3 md:space-y-4">
                <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground text-center font-medium">
                  Background
                </h3>

                {/* Background Color Picker - Horizontal scroll on mobile */}
                <div className="flex justify-center">
                  <div className="flex gap-0 overflow-x-auto pb-1 px-1 max-w-full scrollbar-hide">
                    {BACKGROUND_COLORS.map((color) => (
                      <button
                        key={color.hex}
                        type="button"
                        data-testid={`color-${color.hex.replace('#', '')}`}
                        onClick={() => setSelectedColor(color.hex)}
                        disabled={isProcessing}
                        title={color.name}
                        className={`min-w-[44px] min-h-[44px] flex items-center justify-center flex-shrink-0 ${
                          isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                        }`}
                      >
                        <span
                          className={`w-6 h-6 md:w-7 md:h-7 rounded-full transition-all duration-200 ${
                            !isProcessing ? "hover:scale-110" : ""
                          }`}
                          style={{
                            backgroundColor: color.hex,
                            boxShadow: selectedColor === color.hex 
                              ? `0 0 0 2px white, 0 0 0 3px ${color.hex}` 
                              : "0 1px 2px rgba(0,0,0,0.3)",
                          }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Outfit Customization Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 md:p-4 space-y-3 md:space-y-4">
                <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground text-center font-medium">
                  Customize Outfit
                </h3>

                {/* Gender Toggle */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center bg-white border border-gray-300 rounded-full p-1 shadow-sm">
                    <button
                      type="button"
                      data-testid="gender-men"
                      onClick={() => handleGenderChange("men")}
                      disabled={isProcessing}
                      style={{
                        backgroundColor: gender === "men" ? "#1a1a1a" : "transparent",
                        color: gender === "men" ? "#ffffff" : "#666666",
                      }}
                      className={`flex items-center gap-1.5 px-4 py-2.5 md:py-1.5 rounded-full text-xs font-semibold transition-all duration-200 min-h-[44px] ${
                        isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      Men
                    </button>
                    <button
                      type="button"
                      data-testid="gender-women"
                      onClick={() => handleGenderChange("women")}
                      disabled={isProcessing}
                      style={{
                        backgroundColor: gender === "women" ? "#1a1a1a" : "transparent",
                        color: gender === "women" ? "#ffffff" : "#666666",
                      }}
                      className={`flex items-center gap-1.5 px-4 py-2.5 md:py-1.5 rounded-full text-xs font-semibold transition-all duration-200 min-h-[44px] ${
                        isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      Women
                    </button>
                  </div>
                </div>

                {/* Clothing Cards Grid */}
                <div className="grid grid-cols-2 gap-1.5 md:gap-2">
                  {clothingOptions.map((clothing) => {
                    const IconComponent = ClothingIconMap[clothing.id];
                    const isSelected = clothingId === clothing.id;
                    return (
                      <div
                        key={clothing.id}
                        data-testid={`clothing-${clothing.id}`}
                        onClick={() => !isProcessing && handleClothingSelect(clothing.id)}
                        className={`group relative bg-white border-2 rounded-lg p-2 md:p-3 transition-all duration-200 ${
                          isSelected 
                            ? "border-foreground shadow-md" 
                            : "border-gray-200 hover:border-gray-400"
                        } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className="flex flex-col items-center space-y-1">
                          {IconComponent ? (
                            <IconComponent className="w-6 h-6 md:w-8 md:h-8 text-gray-700" />
                          ) : (
                            <span className="text-xl md:text-2xl">{clothing.icon}</span>
                          )}
                          <span className="text-[9px] md:text-[10px] font-medium text-foreground text-center leading-tight">{clothing.name}</span>
                        </div>
                        
                        {/* Color swatches for selected clothing */}
                        {isSelected && (
                          <div className="flex justify-center gap-0 mt-1 md:mt-2 pt-1 md:pt-2 border-t border-gray-100 -mx-1">
                            {clothing.colors.map((color) => (
                              <button
                                key={color.hex}
                                type="button"
                                data-testid={`clothing-color-${color.hex.replace('#', '')}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isProcessing) setClothingColor(color.hex);
                                }}
                                title={color.name}
                                disabled={isProcessing}
                                className={`min-w-[44px] min-h-[44px] flex items-center justify-center ${
                                  isProcessing ? "cursor-not-allowed opacity-50" : "cursor-pointer"
                                }`}
                              >
                                <span
                                  className={`w-4 h-4 md:w-5 md:h-5 rounded-full transition-all duration-200 ${
                                    !isProcessing ? "hover:scale-110" : ""
                                  }`}
                                  style={{
                                    backgroundColor: color.hex,
                                    boxShadow: clothingColor === color.hex 
                                      ? `0 0 0 1.5px white, 0 0 0 2.5px ${color.hex}` 
                                      : "0 1px 2px rgba(0,0,0,0.2)",
                                  }}
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Current Selection Summary */}
                <div className="text-center text-[9px] md:text-[10px] text-muted-foreground pt-2 border-t border-gray-200">
                  {selectedClothing.name} • {selectedClothing.colors.find(c => c.hex === clothingColor)?.name || "Default"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button - Sticky on mobile */}
        {pendingFile && !processedImage && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed bottom-4 left-4 right-4 z-50 md:static md:z-auto md:flex md:justify-center md:mt-6"
          >
            <Button
              onClick={handleSubmit}
              disabled={isProcessing}
              data-testid="button-submit"
              className="w-full md:w-auto px-8 py-5 md:py-6 text-sm md:text-base font-medium text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
              style={{ backgroundColor: selectedColor }}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 mr-2" />
                  Generate Headshot
                </>
              )}
            </Button>
          </motion.div>
        )}

        <footer className="py-4 border-t border-border mt-8 pb-20 md:pb-4">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-2 md:gap-0 text-[10px] md:text-xs text-muted-foreground/70">
            <div className="flex items-center gap-1.5">
              <span>Made with love at</span>
              <a 
                href="https://stickywicketlabs.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-foreground underline hover:text-foreground/80 transition-colors"
              >
                Sticky Wicket Labs
              </a>
            </div>
            <div className="flex items-center gap-1">
              <span>Powered by</span>
              <span>🍌</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
