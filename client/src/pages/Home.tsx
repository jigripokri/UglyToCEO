import { useState } from "react";
import { Header } from "@/components/Header";
import { UploadZone } from "@/components/UploadZone";
import { transformImage, type ModelType } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, RotateCcw, Zap, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<ModelType>("flash");
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setOriginalImage(objectUrl);
    setPendingFile(file);
    setProcessedImage(null);
    setIsProcessing(true);
    
    try {
      const result = await transformImage(file, selectedModel);
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
    setOriginalImage(null);
    setProcessedImage(null);
    setPendingFile(null);
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

  return (
    <div className="min-h-screen w-full bg-background font-sans text-foreground">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        <Header />

        {/* Model Toggle */}
        <div className="flex justify-center mb-8 relative z-50">
          <div className="inline-flex items-center bg-gray-100 border border-gray-300 rounded-full p-1 shadow-md">
            <button
              type="button"
              data-testid="toggle-flash"
              onClick={() => {
                console.log("Flash clicked");
                setSelectedModel("flash");
              }}
              disabled={isProcessing}
              style={{
                backgroundColor: selectedModel === "flash" ? "#1a1a1a" : "transparent",
                color: selectedModel === "flash" ? "#ffffff" : "#666666",
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isProcessing ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Zap className="w-4 h-4" />
              Flash
            </button>
            <button
              type="button"
              data-testid="toggle-pro"
              onClick={() => {
                console.log("Pro clicked");
                setSelectedModel("pro");
              }}
              disabled={isProcessing}
              style={{
                backgroundColor: selectedModel === "pro" ? "#1a1a1a" : "transparent",
                color: selectedModel === "pro" ? "#ffffff" : "#666666",
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isProcessing ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Pro
            </button>
          </div>
        </div>

        <main className="mt-4 pb-24">
          <AnimatePresence mode="wait">
            {!originalImage ? (
              <UploadZone key="upload" onFileSelect={handleFileSelect} isProcessing={isProcessing} />
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-12"
              >
                <div className="flex flex-col items-center justify-center">
                  {isProcessing ? (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="bg-white border border-border rounded-lg p-16 text-center space-y-8 max-w-md w-full studio-shadow"
                    >
                      <div className="relative w-20 h-20 mx-auto">
                        <div className="absolute inset-0 bg-secondary rounded-full" />
                        <div className="relative w-full h-full flex items-center justify-center">
                           <Loader2 className="w-8 h-8 text-foreground animate-spin" strokeWidth={1.5} />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-display font-medium text-foreground">Processing</h3>
                        <p className="text-muted-foreground font-light">
                          Using {selectedModel === "pro" ? "Gemini 3 Pro" : "Gemini 2.5 Flash"}...
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="w-full flex flex-col items-center gap-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
                        {/* Before Image */}
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5 }}
                          className="space-y-4"
                        >
                          <p className="text-sm uppercase tracking-widest text-muted-foreground text-center">Before</p>
                          <div className="bg-white rounded-lg overflow-hidden studio-shadow-lg">
                            <div className="aspect-[4/5] bg-secondary">
                              <img 
                                src={originalImage} 
                                alt="Before" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </motion.div>

                        {/* After Image */}
                        <motion.div
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.5, delay: 0.15 }}
                          className="space-y-4"
                        >
                          <p className="text-sm uppercase tracking-widest text-muted-foreground text-center">After</p>
                          <div className="bg-white rounded-lg overflow-hidden studio-shadow-lg">
                            <div className="aspect-[4/5] bg-secondary">
                              <img 
                                src={processedImage!} 
                                alt="After" 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          </div>
                        </motion.div>
                      </div>
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="flex flex-col sm:flex-row items-center gap-4"
                      >
                        <Button 
                          onClick={handleDownload}
                          size="lg"
                          className="h-12 px-8 rounded-md text-sm font-medium bg-foreground hover:bg-foreground/90 text-background tracking-wide uppercase"
                        >
                          <Download className="mr-2 h-4 w-4" strokeWidth={1.5} />
                          Download
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          onClick={handleReset}
                          size="lg"
                          className="h-12 px-8 rounded-md text-sm font-medium border-border hover:bg-secondary tracking-wide uppercase"
                        >
                          <RotateCcw className="mr-2 h-4 w-4" strokeWidth={1.5} />
                          New Photo
                        </Button>
                      </motion.div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        <footer className="text-center py-8 border-t border-border">
          <p className="text-xs uppercase tracking-widest text-muted-foreground/50">
            Powered by AI
          </p>
        </footer>
      </div>
    </div>
  );
}
