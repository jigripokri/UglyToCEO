import { useState } from "react";
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
import { Loader2, Download, RotateCcw, Zap, Sparkles, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useDropzone } from "react-dropzone";
import confetti from "canvas-confetti";

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>("flash");
  const [selectedColor, setSelectedColor] = useState<BackgroundColor>("#562226");
  
  // Clothing state
  const [gender, setGender] = useState<Gender>(DEFAULT_CLOTHING.gender);
  const [clothingId, setClothingId] = useState(DEFAULT_CLOTHING.clothingId);
  const [clothingColor, setClothingColor] = useState(DEFAULT_CLOTHING.clothingColor);
  
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

  const handleFileSelect = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setOriginalImage(objectUrl);
    setProcessedImage(null);
    setIsProcessing(true);
    
    const clothing: ClothingSelection = {
      gender,
      clothingId,
      clothingColor,
    };
    
    try {
      const result = await transformImage(file, selectedModel, selectedColor, clothing);
      setProcessedImage(result);
      triggerConfetti();
    } catch (error) {
      toast({
        title: "Processing failed",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      // Reset on error
      setOriginalImage(null);
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
    setOriginalImage(null);
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
        <Header />

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
                      className={`min-h-[500px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
                        isDragActive 
                          ? "bg-gradient-to-br from-gray-100 to-gray-50 scale-[0.99]" 
                          : "bg-gradient-to-br from-gray-50 to-white hover:from-gray-100 hover:to-gray-50"
                      } ${isProcessing ? "pointer-events-none opacity-50" : ""}`}
                    >
                      <input {...getInputProps()} data-testid="file-input" />
                      <div className="text-center space-y-6 p-12">
                        <motion.div 
                          className="w-24 h-24 mx-auto rounded-full bg-gray-200/80 flex items-center justify-center shadow-inner"
                          animate={{ scale: isDragActive ? 1.1 : 1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Upload className="w-10 h-10 text-gray-500" strokeWidth={1.5} />
                        </motion.div>
                        <div className="space-y-2">
                          <p className="text-2xl font-medium text-foreground">
                            {isDragActive ? "Drop your photo here" : "Drop your photo here"}
                          </p>
                          <p className="text-muted-foreground">or click to browse</p>
                        </div>
                        <p className="text-xs text-muted-foreground/60 uppercase tracking-widest">
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
                      <div className="absolute top-4 left-4 z-10">
                        <span className="text-xs uppercase tracking-widest text-white/90 bg-black/50 px-3 py-1.5 rounded-full font-medium backdrop-blur-sm">
                          Before
                        </span>
                      </div>
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.4 }}
                        className="min-h-[500px]"
                      >
                        <img 
                          src={originalImage} 
                          alt="Before" 
                          className="w-full h-full object-cover min-h-[500px]"
                        />
                      </motion.div>
                    </div>

                    {/* After Pane */}
                    <div className="relative">
                      <div className="absolute top-4 left-4 z-10">
                        <span className="text-xs uppercase tracking-widest text-white/90 bg-black/50 px-3 py-1.5 rounded-full font-medium backdrop-blur-sm">
                          After
                        </span>
                      </div>
                      <div className="min-h-[500px] bg-gradient-to-br from-gray-100 to-gray-50">
                        {isProcessing ? (
                          /* Spinner Overlay */
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="w-full h-full min-h-[500px] flex flex-col items-center justify-center space-y-6"
                          >
                            <div className="relative w-20 h-20">
                              <div className="absolute inset-0 bg-gray-200/80 rounded-full shadow-inner" />
                              <div className="relative w-full h-full flex items-center justify-center">
                                <Loader2 className="w-10 h-10 text-gray-600 animate-spin" strokeWidth={1.5} />
                              </div>
                            </div>
                            <div className="text-center space-y-1">
                              <p className="text-lg font-medium text-foreground">
                                {selectedModel === "pro" ? "Creating with Gemini Pro" : "Processing"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                This may take a moment...
                              </p>
                            </div>
                          </motion.div>
                        ) : processedImage ? (
                          <motion.img
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.4 }}
                            src={processedImage}
                            alt="After"
                            className="w-full h-full object-cover min-h-[500px]"
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
                className="flex items-center justify-center gap-3"
              >
                <Button 
                  onClick={handleDownload}
                  size="sm"
                  className="h-10 px-6 rounded-md text-xs font-medium bg-foreground hover:bg-foreground/90 text-background tracking-wide uppercase"
                  data-testid="button-download"
                >
                  <Download className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  Download
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={handleReset}
                  size="sm"
                  className="h-10 px-6 rounded-md text-xs font-medium border-border hover:bg-secondary tracking-wide uppercase"
                  data-testid="button-new-photo"
                >
                  <RotateCcw className="mr-2 h-4 w-4" strokeWidth={1.5} />
                  New Photo
                </Button>
              </motion.div>
            )}
          </div>

          {/* Right Column - Settings Panel (30%) */}
          <div className="lg:col-span-4">
            <div className="space-y-4 lg:sticky lg:top-4">
              
              {/* Session Settings Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
                <h3 className="text-[10px] uppercase tracking-widest text-muted-foreground text-center font-medium">
                  Session Settings
                </h3>

                {/* Model Toggle */}
                <div className="flex justify-center">
                  <div className="inline-flex items-center bg-white border border-gray-300 rounded-full p-1 shadow-sm">
                    <button
                      type="button"
                      data-testid="toggle-flash"
                      onClick={() => setSelectedModel("flash")}
                      disabled={isProcessing}
                      style={{
                        backgroundColor: selectedModel === "flash" ? "#1a1a1a" : "transparent",
                        color: selectedModel === "flash" ? "#ffffff" : "#666666",
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                        isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      <Zap className="w-3 h-3" />
                      Flash
                    </button>
                    <button
                      type="button"
                      data-testid="toggle-pro"
                      onClick={() => setSelectedModel("pro")}
                      disabled={isProcessing}
                      style={{
                        backgroundColor: selectedModel === "pro" ? "#1a1a1a" : "transparent",
                        color: selectedModel === "pro" ? "#ffffff" : "#666666",
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                        isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      <Sparkles className="w-3 h-3" />
                      Pro
                    </button>
                  </div>
                </div>

                {/* Background Color Picker - 3x2 Grid */}
                <div className="space-y-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center">Background</p>
                  <div className="flex justify-center">
                    <div className="grid grid-cols-3 gap-2">
                      {BACKGROUND_COLORS.map((color) => (
                        <button
                          key={color.hex}
                          type="button"
                          data-testid={`color-${color.hex.replace('#', '')}`}
                          onClick={() => setSelectedColor(color.hex)}
                          disabled={isProcessing}
                          title={color.name}
                          className={`w-7 h-7 rounded-full transition-all duration-200 ${
                            isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:scale-110"
                          }`}
                          style={{
                            backgroundColor: color.hex,
                            boxShadow: selectedColor === color.hex 
                              ? `0 0 0 2px white, 0 0 0 3px ${color.hex}` 
                              : "0 1px 2px rgba(0,0,0,0.3)",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Outfit Customization Card */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-4">
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
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
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
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                        isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      }`}
                    >
                      Women
                    </button>
                  </div>
                </div>

                {/* Clothing Cards Grid */}
                <div className="grid grid-cols-2 gap-2">
                  {clothingOptions.map((clothing) => {
                    const IconComponent = ClothingIconMap[clothing.id];
                    const isSelected = clothingId === clothing.id;
                    return (
                      <div
                        key={clothing.id}
                        data-testid={`clothing-${clothing.id}`}
                        onClick={() => !isProcessing && handleClothingSelect(clothing.id)}
                        className={`group relative bg-white border-2 rounded-lg p-3 transition-all duration-200 ${
                          isSelected 
                            ? "border-foreground shadow-md" 
                            : "border-gray-200 hover:border-gray-400"
                        } ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className="flex flex-col items-center space-y-1.5">
                          {IconComponent ? (
                            <IconComponent className="w-8 h-8 text-gray-700" />
                          ) : (
                            <span className="text-2xl">{clothing.icon}</span>
                          )}
                          <span className="text-[10px] font-medium text-foreground text-center leading-tight">{clothing.name}</span>
                        </div>
                        
                        {/* Color swatches for selected clothing */}
                        {isSelected && (
                          <div className="flex justify-center gap-1.5 mt-2 pt-2 border-t border-gray-100">
                            {clothing.colors.map((color) => (
                              <div
                                key={color.hex}
                                data-testid={`clothing-color-${color.hex.replace('#', '')}`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!isProcessing) setClothingColor(color.hex);
                                }}
                                title={color.name}
                                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                                  isProcessing ? "cursor-not-allowed" : "cursor-pointer hover:scale-110"
                                }`}
                                style={{
                                  backgroundColor: color.hex,
                                  boxShadow: clothingColor === color.hex 
                                    ? `0 0 0 1.5px white, 0 0 0 2.5px ${color.hex}` 
                                    : "0 1px 2px rgba(0,0,0,0.2)",
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                
                {/* Current Selection Summary */}
                <div className="text-center text-[10px] text-muted-foreground pt-2 border-t border-gray-200">
                  {selectedClothing.name} • {selectedClothing.colors.find(c => c.hex === clothingColor)?.name || "Default"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Examples Section - Subdued */}
        <section className="mt-16 py-8 -mx-4 px-4 bg-gray-50/40">
          <div className="max-w-4xl mx-auto">
            {/* Section Header - Muted */}
            <div className="text-center mb-6">
              <p className="text-xs uppercase tracking-widest text-muted-foreground/60 mb-1">
                See The Difference
              </p>
              <h3 className="text-base font-medium text-foreground/70">
                Real Transformations
              </h3>
            </div>

            {/* Examples - Two columns on desktop, stacked on mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Example 1 - Female */}
              <div className="flex items-center justify-center gap-3" data-testid="example-female">
                {/* Before */}
                <div className="flex-1 max-w-[140px]">
                  <div className="relative rounded-xl overflow-hidden shadow-sm border border-gray-200/60">
                    <img 
                      src="/attached_assets/before(1)_1764471091566.jpg" 
                      alt="Before - casual photo" 
                      className="w-full h-[180px] object-cover object-top"
                    />
                    <div className="absolute bottom-2 left-2">
                      <span className="text-[9px] uppercase tracking-wider text-white/80 bg-black/40 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                        Before
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Arrow */}
                <div className="flex-shrink-0 text-muted-foreground/40">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
                
                {/* After */}
                <div className="flex-1 max-w-[140px]">
                  <div className="relative rounded-xl overflow-hidden shadow-sm border border-gray-200/60">
                    <img 
                      src="/attached_assets/after (1)_1764471091567.png" 
                      alt="After - professional headshot" 
                      className="w-full h-[180px] object-cover object-top"
                    />
                    <div className="absolute bottom-2 left-2">
                      <span className="text-[9px] uppercase tracking-wider text-white/80 bg-black/40 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                        After
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Example 2 - Male */}
              <div className="flex items-center justify-center gap-3" data-testid="example-male">
                {/* Before */}
                <div className="flex-1 max-w-[140px]">
                  <div className="relative rounded-xl overflow-hidden shadow-sm border border-gray-200/60">
                    <img 
                      src="/attached_assets/before(2)_1764471091566.jpg" 
                      alt="Before - casual photo" 
                      className="w-full h-[180px] object-cover object-top"
                    />
                    <div className="absolute bottom-2 left-2">
                      <span className="text-[9px] uppercase tracking-wider text-white/80 bg-black/40 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                        Before
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Arrow */}
                <div className="flex-shrink-0 text-muted-foreground/40">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
                
                {/* After */}
                <div className="flex-1 max-w-[140px]">
                  <div className="relative rounded-xl overflow-hidden shadow-sm border border-gray-200/60">
                    <img 
                      src="/attached_assets/after (2)_1764471091567.png" 
                      alt="After - professional headshot" 
                      className="w-full h-[180px] object-cover object-top"
                    />
                    <div className="absolute bottom-2 left-2">
                      <span className="text-[9px] uppercase tracking-wider text-white/80 bg-black/40 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
                        After
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="text-center py-4 border-t border-border">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/50">
            Powered by AI
          </p>
        </footer>
      </div>
    </div>
  );
}
