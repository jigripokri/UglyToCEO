import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import type { ReactNode } from "react";

interface HeaderProps {
  rightContent?: ReactNode;
}

export function Header({ rightContent }: HeaderProps) {
  return (
    <header className="relative z-10 mb-6">
      {/* Top bar with logo and toggle */}
      <div className="flex items-center justify-between mb-6">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
            <Camera className="w-5 h-5 text-background" strokeWidth={1.5} />
          </div>
          <span className="text-xl font-medium tracking-tight text-foreground">HeadShot Hero</span>
        </motion.div>
        
        {rightContent && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            {rightContent}
          </motion.div>
        )}
      </div>

      {/* Tagline */}
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-muted-foreground text-sm font-light tracking-wide text-center"
      >
        Professional AI-powered headshots. Studio quality, without the studio.
      </motion.p>
    </header>
  );
}
