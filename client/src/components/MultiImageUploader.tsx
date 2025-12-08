import { useCallback, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Plus, ImageIcon } from "lucide-react";

interface MultiImageUploaderProps {
  images: File[];
  onImagesChange: (images: File[]) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function MultiImageUploader({
  images,
  onImagesChange,
  maxImages = 4,
  disabled = false,
}: MultiImageUploaderProps) {
  const remainingSlots = maxImages - images.length;
  const urlsRef = useRef<Map<File, string>>(new Map());

  const getPreviewUrl = useCallback((file: File): string => {
    if (!urlsRef.current.has(file)) {
      urlsRef.current.set(file, URL.createObjectURL(file));
    }
    return urlsRef.current.get(file)!;
  }, []);

  useEffect(() => {
    const currentUrls = urlsRef.current;
    return () => {
      currentUrls.forEach((url) => URL.revokeObjectURL(url));
      currentUrls.clear();
    };
  }, []);

  useEffect(() => {
    const currentFiles = new Set(images);
    const toRemove: File[] = [];
    
    urlsRef.current.forEach((url, file) => {
      if (!currentFiles.has(file)) {
        URL.revokeObjectURL(url);
        toRemove.push(file);
      }
    });
    
    toRemove.forEach(file => urlsRef.current.delete(file));
  }, [images]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const newImages = [...images, ...acceptedFiles].slice(0, maxImages);
      onImagesChange(newImages);
    },
    [images, maxImages, onImagesChange]
  );

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxFiles: remainingSlots,
    disabled: disabled || remainingSlots <= 0,
  });

  const hasImages = images.length > 0;

  if (!hasImages) {
    return (
      <div
        {...getRootProps()}
        className={`min-h-[280px] md:min-h-[500px] flex flex-col items-center justify-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? "bg-gradient-to-br from-gray-100 to-gray-50 scale-[0.99]"
            : "bg-gradient-to-br from-gray-50 to-white hover:from-gray-100 hover:to-gray-50"
        } ${disabled ? "pointer-events-none opacity-50" : ""}`}
        data-testid="dropzone-empty"
      >
        <input {...getInputProps()} data-testid="file-input" />
        <div className="text-center space-y-4 md:space-y-6 p-6 md:p-12">
          <motion.div
            className="w-16 h-16 md:w-24 md:h-24 mx-auto rounded-full bg-gray-200/80 flex items-center justify-center shadow-inner"
            animate={{ scale: isDragActive ? 1.1 : 1 }}
            transition={{ duration: 0.2 }}
          >
            <Upload
              className="w-7 h-7 md:w-10 md:h-10 text-gray-500"
              strokeWidth={1.5}
            />
          </motion.div>
          <div className="space-y-1 md:space-y-2">
            <p className="text-lg md:text-2xl font-medium text-foreground">
              {isDragActive ? "Drop your photos here" : "Drop your photos here"}
            </p>
            <p className="text-sm md:text-base text-muted-foreground">
              or click to browse
            </p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] md:text-xs text-muted-foreground/60 uppercase tracking-widest">
              Upload 1-4 photos for better likeness
            </p>
            <p className="text-[10px] md:text-xs text-muted-foreground/60 uppercase tracking-widest">
              JPG, PNG, WebP up to 10MB each
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[280px] md:min-h-[500px] p-4 md:p-6 bg-gradient-to-br from-gray-50 to-white">
      <div className="grid grid-cols-2 gap-3 md:gap-4 h-full">
        <AnimatePresence mode="popLayout">
          {images.map((file, index) => (
            <motion.div
              key={`${file.name}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              layout
              className={`relative rounded-xl overflow-hidden bg-gray-100 ${
                images.length === 1 ? "col-span-2 row-span-2" : ""
              } ${images.length === 3 && index === 0 ? "row-span-2" : ""}`}
              style={{
                aspectRatio: images.length === 1 ? "auto" : "1",
                minHeight: images.length === 1 ? "100%" : "auto",
              }}
            >
              <img
                src={getPreviewUrl(file)}
                alt={`Reference ${index + 1}`}
                className="w-full h-full object-cover"
                data-testid={`preview-image-${index}`}
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                disabled={disabled}
                className={`absolute top-2 right-2 w-7 h-7 md:w-8 md:h-8 rounded-full bg-black/60 hover:bg-black/80 flex items-center justify-center transition-colors ${
                  disabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                data-testid={`remove-image-${index}`}
              >
                <X className="w-4 h-4 text-white" strokeWidth={2} />
              </button>
              <div className="absolute bottom-2 left-2">
                <span className="text-[10px] md:text-xs uppercase tracking-widest text-white/90 bg-black/50 px-2 py-1 md:px-3 md:py-1.5 rounded-full font-medium backdrop-blur-sm">
                  {index + 1} of {images.length}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {remainingSlots > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`${images.length === 1 ? "col-span-2" : ""} ${
              images.length === 3 ? "row-span-1" : ""
            }`}
            style={{
              aspectRatio: images.length >= 2 ? "1" : "auto",
              minHeight: images.length === 1 ? "120px" : "auto",
            }}
          >
            <div
              {...getRootProps()}
              className={`h-full relative rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragActive
                  ? "border-gray-400 bg-gray-100"
                  : "border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100"
              } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              data-testid="dropzone-add-more"
            >
              <input {...getInputProps()} data-testid="file-input-add" />
              <div className="flex flex-col items-center gap-1 md:gap-2 p-3">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-200 flex items-center justify-center">
                  <Plus className="w-5 h-5 md:w-6 md:h-6 text-gray-500" />
                </div>
                <span className="text-[10px] md:text-xs text-muted-foreground font-medium">
                  Add more
                </span>
                <span className="text-[9px] md:text-[10px] text-muted-foreground/60">
                  {remainingSlots} remaining
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="text-[10px] md:text-xs text-muted-foreground">
          <ImageIcon className="w-3 h-3 inline-block mr-1" />
          {images.length} photo{images.length !== 1 ? "s" : ""} selected — more photos = better likeness
        </p>
      </div>
    </div>
  );
}
