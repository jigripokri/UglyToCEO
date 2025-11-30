import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function UploadZone({ onFileSelect, isProcessing }: UploadZoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
    disabled: isProcessing
  });

  return (
    <div 
      {...getRootProps()} 
      className={cn(
        "relative group cursor-pointer transition-all duration-300 ease-in-out",
        "border-4 border-dashed rounded-3xl p-10 md:p-16",
        "flex flex-col items-center justify-center text-center",
        "bg-card hover:bg-accent/5",
        isDragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-muted-foreground/20",
        isProcessing ? "opacity-50 cursor-not-allowed pointer-events-none" : "hover:border-primary/50 hover:shadow-pop-hover"
      )}
    >
      <input {...getInputProps()} />
      
      <div className="relative z-10 flex flex-col items-center space-y-6">
        <div className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center transition-colors duration-300",
          isDragActive ? "bg-primary text-white" : "bg-secondary/20 text-secondary"
        )}>
          {isDragActive ? (
            <Sparkles className="w-12 h-12 animate-pulse" />
          ) : (
            <Upload className="w-10 h-10 group-hover:scale-110 transition-transform duration-300" />
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-2xl font-bold text-foreground">
            {isDragActive ? "Drop it like it's hot! 🔥" : "Drag & Drop your selfie"}
          </h3>
          <p className="text-muted-foreground font-medium">
            or click to browse your gallery
          </p>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground/70 font-mono bg-muted px-3 py-1 rounded-full">
          <ImageIcon className="w-3 h-3" />
          <span>JPG, PNG, WEBP up to 10MB</span>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-4 left-4 w-3 h-3 rounded-full bg-primary/30 animate-bounce" style={{ animationDelay: "0s" }} />
      <div className="absolute bottom-8 right-12 w-4 h-4 rounded-full bg-secondary/30 animate-bounce" style={{ animationDelay: "0.2s" }} />
      <div className="absolute top-1/2 right-6 w-2 h-2 rounded-full bg-accent/30 animate-bounce" style={{ animationDelay: "0.5s" }} />
    </div>
  );
}
