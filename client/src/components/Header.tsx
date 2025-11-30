import { motion } from "framer-motion";
import { Camera } from "lucide-react";

export function Header() {
  return (
    <header className="flex flex-col items-center justify-center py-16 md:py-24 space-y-6 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex items-center gap-3"
      >
        <div className="w-12 h-12 rounded-full bg-foreground flex items-center justify-center">
          <Camera className="w-6 h-6 text-background" strokeWidth={1.5} />
        </div>
      </motion.div>

      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.8 }}
          className="text-5xl md:text-7xl font-medium tracking-tight leading-tight text-foreground"
        >
          HeadShot Hero
        </motion.h1>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="w-16 h-px bg-foreground/20 mx-auto"
        />
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="text-muted-foreground text-lg md:text-xl font-light leading-relaxed tracking-wide"
        >
          Professional AI-powered headshots.<br className="hidden md:block" />
          Studio quality, without the studio.
        </motion.p>
      </div>
    </header>
  );
}
