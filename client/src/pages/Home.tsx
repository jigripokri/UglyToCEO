import { useState } from "react";
import { Header } from "@/components/Header";
import { UploadZone } from "@/components/UploadZone";
import { ComparisonView } from "@/components/ComparisonView";
import { transformImage } from "@/lib/mock-service";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Download, RotateCcw, Sparkles, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import bgMesh from "@assets/generated_images/bg_mesh.png";

export default function Home() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleFileSelect = async (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setOriginalImage(objectUrl);
    setProcessedImage(null);
    setIsProcessing(true);
    
    try {
      const result = await transformImage(file);
      setProcessedImage(result);
      triggerConfetti();
    } catch (error) {
      toast({
        title: "Processing failed",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const triggerConfetti = () => {
    const end = Date.now() + 1000;
    const colors = ['#FA4D56', '#2BCFB0', '#ffffff'];

    (function frame() {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors
      });
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    }());
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
        className: "bg-slate-900 text-white border-none",
      });
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-x-hidden font-sans text-slate-900">
      {/* Background Mesh */}
      <div className="fixed inset-0 z-0">
        <img 
          src={bgMesh} 
          alt="Background" 
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-white/30 backdrop-blur-[2px]" />
      </div>

      <div className="container relative z-10 mx-auto px-4 py-8 max-w-5xl">
        <Header />

        <main className="mt-8 md:mt-16 pb-20">
          <AnimatePresence mode="wait">
            {!originalImage ? (
              <UploadZone key="upload" onFileSelect={handleFileSelect} isProcessing={isProcessing} />
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-10"
              >
                <div className="flex flex-col items-center justify-center min-h-[500px]">
                  {isProcessing ? (
                    <motion.div 
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="glass-panel p-12 rounded-[2.5rem] text-center space-y-8 max-w-md w-full"
                    >
                      <div className="relative w-32 h-32 mx-auto">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary rounded-full blur-xl animate-pulse opacity-50" />
                        <div className="relative bg-white rounded-full w-full h-full flex items-center justify-center shadow-lg">
                           <Loader2 className="w-12 h-12 text-primary animate-spin" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-slate-800">Polishing Pixels...</h3>
                        <p className="text-slate-500 mt-2">Applying professional lighting & retouching</p>
                      </div>
                      
                      <div className="flex justify-center gap-2">
                         {[1,2,3].map(i => (
                           <div key={i} className="w-2 h-2 bg-slate-200 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.1}s`}} />
                         ))}
                      </div>
                    </motion.div>
                  ) : (
                    <div className="w-full flex flex-col items-center gap-8">
                      <ComparisonView original={originalImage} processed={processedImage!} />
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="flex flex-col sm:flex-row items-center gap-4 w-full max-w-md"
                      >
                        <Button 
                          onClick={handleDownload}
                          size="lg"
                          className="w-full h-14 rounded-2xl text-lg font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-xl hover:shadow-2xl transition-all hover:-translate-y-0.5"
                        >
                          <Download className="mr-2 h-5 w-5" />
                          Download HD
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          onClick={handleReset}
                          size="lg"
                          className="w-full h-14 rounded-2xl text-lg font-bold border-slate-200 hover:bg-white hover:text-primary transition-all"
                        >
                          <RotateCcw className="mr-2 h-5 w-5" />
                          New Photo
                        </Button>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="flex items-center gap-2 text-sm text-emerald-600 font-medium bg-emerald-50 px-4 py-2 rounded-full"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Watermark removed automatically
                      </motion.div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
