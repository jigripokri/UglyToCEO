import { useState } from "react";
import { Header } from "@/components/Header";
import { UploadZone } from "@/components/UploadZone";
import { transformImage } from "@/lib/mock-service";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, RefreshCw, Sparkles, Wand2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    // Create preview for original
    const objectUrl = URL.createObjectURL(file);
    setOriginalImage(objectUrl);
    setProcessedImage(null);
    
    // Start processing
    setIsProcessing(true);
    
    try {
      const result = await transformImage(file);
      setProcessedImage(result);
      triggerConfetti();
      toast({
        title: "Transformation Complete! 🎉",
        description: "Your professional headshot is ready.",
        className: "bg-secondary text-white border-none",
      });
    } catch (error) {
      toast({
        title: "Oops!",
        description: "Something went wrong. Try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFEAA7']
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
        title: "Saved! 💾",
        description: "Image downloaded to your device.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden selection:bg-primary/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Header />

        <main className="mt-8 md:mt-12 pb-20">
          <AnimatePresence mode="wait">
            {!originalImage ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <UploadZone onFileSelect={handleFileSelect} isProcessing={isProcessing} />
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  {/* Original Image Card */}
                  <div className="relative group">
                     <div className="absolute -inset-1 bg-gradient-to-r from-primary to-secondary rounded-[2rem] blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                     <Card className="relative overflow-hidden rounded-[1.8rem] border-4 border-white shadow-pop aspect-square bg-white">
                        <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-bold backdrop-blur-sm">
                          Before
                        </div>
                        <img 
                          src={originalImage} 
                          alt="Original" 
                          className="w-full h-full object-cover"
                        />
                     </Card>
                  </div>

                  {/* Processed Image Card or Loading State */}
                  <div className="relative">
                    {isProcessing ? (
                      <Card className="aspect-square rounded-[1.8rem] border-4 border-dashed border-secondary/30 flex flex-col items-center justify-center bg-secondary/5 p-8 text-center space-y-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-secondary/20 blur-xl rounded-full animate-pulse"></div>
                          <Loader2 className="w-16 h-16 text-secondary animate-spin relative z-10" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">AI Magic in Progress...</h3>
                          <p className="text-muted-foreground mt-2">Applying studio lighting & suit...</p>
                        </div>
                      </Card>
                    ) : (
                      <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-secondary to-accent rounded-[2rem] blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200 animate-pulse"></div>
                        <Card className="relative overflow-hidden rounded-[1.8rem] border-4 border-white shadow-pop aspect-square bg-white">
                          <div className="absolute top-4 left-4 z-10 bg-secondary text-white px-3 py-1 rounded-full text-sm font-bold shadow-md">
                            After ✨
                          </div>
                          <img 
                            src={processedImage!} 
                            alt="Processed" 
                            className="w-full h-full object-cover"
                          />
                        </Card>
                      </div>
                    )}
                  </div>
                </div>

                {/* Controls */}
                {!isProcessing && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-8"
                  >
                    <Button 
                      onClick={handleDownload}
                      className="h-14 px-8 rounded-2xl text-lg font-bold bg-secondary hover:bg-secondary/90 text-white shadow-pop hover:shadow-pop-hover active:shadow-pop-active transition-all w-full sm:w-auto"
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Save Photo
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      onClick={handleReset}
                      className="h-14 px-8 rounded-2xl text-lg font-bold border-2 hover:bg-muted shadow-pop hover:shadow-pop-hover active:shadow-pop-active transition-all w-full sm:w-auto"
                    >
                      <RefreshCw className="mr-2 h-5 w-5" />
                      Start Over
                    </Button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Footer */}
        <footer className="text-center text-muted-foreground text-sm font-medium py-8">
          <p className="flex items-center justify-center gap-2">
            Made with <span className="text-primary text-lg">♥</span> by Replit
          </p>
        </footer>
      </div>
    </div>
  );
}
