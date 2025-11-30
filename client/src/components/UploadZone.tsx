import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Image as ImageIcon, Sparkles, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div 
        {...getRootProps()} 
        className={cn(
          "relative group cursor-pointer transition-all duration-500 ease-out",
          "glass-panel rounded-[2.5rem] p-12 md:p-20 overflow-hidden",
          "flex flex-col items-center justify-center text-center",
          isDragActive ? "ring-4 ring-primary/20 scale-[1.02]" : "hover:shadow-soft-xl hover:-translate-y-1",
          isProcessing ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
        )}
      >
        <input {...getInputProps()} />
        
        {/* Dynamic background glow */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 transition-opacity duration-500",
          isDragActive ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        )} />

        <div className="relative z-10 flex flex-col items-center space-y-8">
          <div className="relative">
            <div className={cn(
              "w-28 h-28 rounded-3xl flex items-center justify-center transition-all duration-500 shadow-xl",
              isDragActive ? "bg-primary rotate-6 scale-110" : "bg-white group-hover:scale-105 group-hover:rotate-3"
            )}>
              {isDragActive ? (
                <Sparkles className="w-12 h-12 text-white animate-pulse" />
              ) : (
                <UploadCloud className="w-12 h-12 text-primary" />
              )}
            </div>
            {/* Decorative dots */}
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-secondary rounded-full animate-bounce delay-100" />
            <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-accent rounded-full animate-bounce delay-300" />
          </div>

          <div className="space-y-3 max-w-sm">
            <h3 className="text-3xl font-bold text-slate-800 tracking-tight">
              {isDragActive ? "Drop to Transform! ⚡️" : "Upload your Selfie"}
            </h3>
            <p className="text-slate-500 text-lg leading-relaxed">
              Drag & drop or click to browse. 
              <br/>We'll handle the rest.
            </p>
          </div>
          
          <div className="flex items-center gap-3 text-xs font-bold tracking-wide uppercase text-slate-400 bg-slate-100/50 px-4 py-2 rounded-full backdrop-blur-sm border border-white/50">
            <ImageIcon className="w-3 h-3" />
            <span>High Resolution Supported</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
