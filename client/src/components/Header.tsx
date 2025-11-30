import { motion, AnimatePresence } from "framer-motion";
import { Zap, Sparkles } from "lucide-react";
import type { ModelType } from "@/lib/api";
import { TransformArrow } from "./TransformArrow";

import beforeFemale from "@assets/before(1)_1764471091566.jpg";
import afterFemale from "@assets/after (1)_1764471091567.png";
import beforeMale from "@assets/before(2)_1764471091566.jpg";
import afterMale from "@assets/after (2)_1764471091567.png";

interface HeaderProps {
  selectedModel: ModelType;
  setSelectedModel: (model: ModelType) => void;
  isProcessing: boolean;
  gender: "men" | "women";
}

export function Header({ selectedModel, setSelectedModel, isProcessing, gender }: HeaderProps) {
  const beforeImage = gender === "men" ? beforeMale : beforeFemale;
  const afterImage = gender === "men" ? afterMale : afterFemale;

  return (
    <header className="relative">
      {/* Model Toggle - Top Right */}
      <div className="absolute top-0 right-0 z-20">
        <div className="inline-flex items-center bg-white border border-gray-300 rounded-full p-1 shadow-sm">
          <button
            type="button"
            data-testid="toggle-flash"
            onClick={() => setSelectedModel("flash")}
            disabled={isProcessing}
            aria-label="Flash mode"
            title="Flash mode"
            style={{
              backgroundColor: selectedModel === "flash" ? "#1a1a1a" : "transparent",
              color: selectedModel === "flash" ? "#ffffff" : "#666666",
            }}
            className={`flex items-center justify-center gap-1.5 w-11 h-11 md:w-auto md:h-auto md:px-3 md:py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <Zap className="w-4 h-4 md:w-3 md:h-3" />
            <span className="hidden md:inline">Flash</span>
          </button>
          <button
            type="button"
            data-testid="toggle-pro"
            onClick={() => setSelectedModel("pro")}
            disabled={isProcessing}
            aria-label="Pro mode"
            title="Pro mode"
            style={{
              backgroundColor: selectedModel === "pro" ? "#1a1a1a" : "transparent",
              color: selectedModel === "pro" ? "#ffffff" : "#666666",
            }}
            className={`flex items-center justify-center gap-1.5 w-11 h-11 md:w-auto md:h-auto md:px-3 md:py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
              isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <Sparkles className="w-4 h-4 md:w-3 md:h-3" />
            <span className="hidden md:inline">Pro</span>
          </button>
        </div>
      </div>

      {/* Main Header Content */}
      <div className="flex flex-col items-center justify-center py-6 md:py-10 space-y-4 relative z-10">
        
        {/* V-Formation Cards */}
        <div className="relative flex flex-row items-center justify-center gap-0">
          {/* Before Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`before-${gender}`}
              initial={{ opacity: 0, x: -50, rotate: 0 }}
              animate={{ opacity: 1, x: 0, rotate: -8 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20,
                delay: 0.1
              }}
              className="relative w-[90px] h-[120px] md:w-[120px] md:h-[160px] rounded-xl overflow-hidden shadow-lg -mr-2 md:-mr-3 z-10"
              style={{
                boxShadow: "0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              <motion.img
                key={`before-img-${gender}`}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                src={beforeImage}
                alt="Before transformation"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute bottom-2 left-2">
                <span className="text-[8px] md:text-[9px] uppercase tracking-wider text-white/90 bg-black/50 px-1.5 py-0.5 rounded-full backdrop-blur-sm font-medium">
                  Before
                </span>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* After Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`after-${gender}`}
              initial={{ opacity: 0, x: 50, rotate: 0 }}
              animate={{ opacity: 1, x: 0, rotate: 8 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 20,
                delay: 0.2
              }}
              className="relative w-[90px] h-[120px] md:w-[120px] md:h-[160px] rounded-xl overflow-hidden shadow-lg -ml-2 md:-ml-3 z-10"
              style={{
                boxShadow: "0 8px 32px rgba(0,0,0,0.15), 0 2px 8px rgba(0,0,0,0.1)"
              }}
            >
              <motion.img
                key={`after-img-${gender}`}
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                src={afterImage}
                alt="After transformation"
                className="w-full h-full object-cover object-top"
              />
              <div className="absolute bottom-2 left-2">
                <span className="text-[8px] md:text-[9px] uppercase tracking-wider text-white/90 bg-black/50 px-1.5 py-0.5 rounded-full backdrop-blur-sm font-medium">
                  After
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Title and Tagline */}
        <div className="text-center space-y-2 md:space-y-3 max-w-2xl mx-auto pt-1 md:pt-2 px-4">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-3xl md:text-5xl lg:text-6xl font-medium tracking-tight leading-tight text-foreground"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            HeadShot Hero
          </motion.h1>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="w-10 md:w-12 h-px bg-foreground/20 mx-auto"
          />
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="text-muted-foreground text-sm md:text-lg font-light leading-relaxed tracking-wide"
          >
            Professional AI-powered headshots.
            <span className="hidden md:inline"><br /></span>
            <span className="md:hidden"> </span>
            Studio quality, without the studio.
          </motion.p>
        </div>
      </div>
    </header>
  );
}
