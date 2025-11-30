import { motion } from "framer-motion";
import { Camera } from "lucide-react";

export function Header() {
  return (
    <header className="relative z-10 mb-4">
      {/* Logo and tagline */}
      <div className="flex flex-col items-center space-y-2">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
            <Camera className="w-4 h-4 text-background" strokeWidth={1.5} />
          </div>
          <span className="text-lg font-medium tracking-tight text-foreground">HeadShot Hero</span>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-muted-foreground text-xs font-light tracking-wide"
        >
          Professional AI-powered headshots. Studio quality, without the studio.
        </motion.p>
      </div>
    </header>
  );
}
