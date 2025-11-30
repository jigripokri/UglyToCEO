import studioHero from "@assets/generated_images/studio_setup_3d.png";
import { motion } from "framer-motion";

export function Header() {
  return (
    <header className="flex flex-col items-center justify-center py-12 space-y-8 relative z-10">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, type: "spring" }}
        className="relative w-full max-w-lg mx-auto"
      >
        {/* Background Glow Effect */}
        <div className="absolute -inset-4 bg-gradient-to-t from-primary/10 to-secondary/10 rounded-[3rem] blur-3xl opacity-60" />
        
        {/* Hero Image */}
        <img 
          src={studioHero} 
          alt="Professional Studio Setup" 
          className="w-full h-auto object-contain drop-shadow-2xl relative z-10 rounded-2xl"
        />
        
        {/* Floating Badge */}
        <motion.div 
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="absolute -top-6 -right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-white/50 rotate-6 z-20 hidden md:block"
        >
          <span className="text-2xl">📸</span>
        </motion.div>
      </motion.div>
      
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight"
        >
          <span className="text-slate-800">HeadShot</span>
          <span className="text-gradient ml-3">Hero</span>
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-slate-500 text-xl font-medium leading-relaxed"
        >
          Your personal AI photography studio.
          <br className="hidden md:block" />
          Turn casual selfies into professional portraits in seconds.
        </motion.p>
      </div>
    </header>
  );
}
