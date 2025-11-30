import { motion } from "framer-motion";

export function Header() {
  return (
    <header className="flex flex-col items-center justify-center py-16 md:py-24 space-y-8 relative z-10">
      <div className="text-center space-y-6 max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-6xl md:text-8xl font-extrabold tracking-tight leading-tight mb-2">
            <span className="text-slate-800">HeadShot</span>
            <span className="text-gradient ml-3">Hero</span>
          </h1>
        </motion.div>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-slate-500 text-xl md:text-2xl font-medium leading-relaxed max-w-2xl mx-auto"
        >
          Your personal AI photography studio.
          <br className="hidden md:block" />
          Turn casual selfies into professional portraits in seconds.
        </motion.p>

        <motion.div
           initial={{ opacity: 0, scale: 0.9 }}
           animate={{ opacity: 1, scale: 1 }}
           transition={{ delay: 0.4 }}
           className="flex items-center justify-center gap-3 pt-4"
        >
          <span className="px-4 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-sm uppercase tracking-wider border border-primary/20">
            AI Powered
          </span>
          <span className="px-4 py-1.5 rounded-full bg-secondary/10 text-secondary-foreground font-bold text-sm uppercase tracking-wider border border-secondary/20">
            Studio Quality
          </span>
        </motion.div>
      </div>
    </header>
  );
}
