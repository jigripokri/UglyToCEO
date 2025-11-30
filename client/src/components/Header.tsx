import mascot from "@assets/generated_images/mascot_3d.png";
import { motion } from "framer-motion";

export function Header() {
  return (
    <header className="flex flex-col items-center justify-center py-12 space-y-6 relative z-10">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <div className="absolute -inset-10 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-full blur-3xl opacity-50 animate-pulse" />
        <img 
          src={mascot} 
          alt="HeadShot Hero Mascot" 
          className="w-32 h-32 md:w-40 md:h-40 object-contain drop-shadow-2xl relative z-10 hover:scale-105 transition-transform duration-300"
        />
      </motion.div>
      
      <div className="text-center space-y-2">
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="text-5xl md:text-7xl font-extrabold tracking-tight"
        >
          <span className="text-slate-800">HeadShot</span>
          <span className="text-gradient ml-2">Hero</span>
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-slate-500 text-xl font-medium max-w-md mx-auto leading-relaxed"
        >
          Professional AI headshots from your casual selfies.
          <span className="block text-sm mt-2 font-semibold text-primary/80 uppercase tracking-widest">Instant • Private • Magic</span>
        </motion.p>
      </div>
    </header>
  );
}
