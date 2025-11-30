import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';
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
      transition={{ delay: 0.2, duration: 0.6 }}
      className="w-full max-w-xl mx-auto"
    >
      <div 
        {...getRootProps()} 
        className={cn(
          "relative cursor-pointer transition-all duration-500 ease-out",
          "bg-white border border-border rounded-lg p-16 md:p-20",
          "flex flex-col items-center justify-center text-center",
          "studio-shadow hover:studio-shadow-lg",
          isDragActive ? "border-foreground/30 bg-secondary/50" : "hover:border-foreground/20",
          isProcessing ? "opacity-50 cursor-not-allowed pointer-events-none" : ""
        )}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center space-y-8">
          <div className={cn(
            "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300",
            isDragActive ? "bg-foreground text-background" : "bg-secondary text-foreground"
          )}>
            <Upload className="w-7 h-7" strokeWidth={1.5} />
          </div>

          <div className="space-y-3">
            <h3 className="text-2xl font-display font-medium text-foreground tracking-tight">
              {isDragActive ? "Release to upload" : "Upload your photo"}
            </h3>
            <p className="text-muted-foreground font-light">
              Drag and drop or click to browse
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground/60 uppercase tracking-widest">
            <ImageIcon className="w-3 h-3" strokeWidth={1.5} />
            <span>JPG, PNG, WEBP</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
