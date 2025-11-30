import { motion } from "framer-motion";
import { Camera, Zap, Sparkles } from "lucide-react";
import type { ModelType } from "@/lib/api";

interface HeaderProps {
  selectedModel: ModelType;
  setSelectedModel: (model: ModelType) => void;
  isProcessing: boolean;
}

export function Header({ selectedModel, setSelectedModel, isProcessing }: HeaderProps) {
  return (
    <header className="relative">
      {/* Model Toggle - Top Right */}
      <div className="absolute top-0 right-0 lg:relative lg:flex lg:justify-end lg:mb-4">
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

      {/* Main Header Content */}
      <div className="flex flex-col items-center justify-center py-8 md:py-12 space-y-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center">
            <Camera className="w-6 h-6 text-background" strokeWidth={1.5} />
          </div>
        </motion.div>

        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-tight text-foreground"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            HeadShot Hero
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="w-12 h-px bg-foreground/20 mx-auto"
          />
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-muted-foreground text-base md:text-lg font-light leading-relaxed tracking-wide"
          >
            Professional AI-powered headshots.<br className="hidden md:block" />
            Studio quality, without the studio.
          </motion.p>
        </div>
      </div>
    </header>
  );
}
