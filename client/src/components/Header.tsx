import logo from "@assets/generated_images/headshot_hero_app_logo.png";
import { motion } from "framer-motion";

export function Header() {
  return (
    <header className="flex flex-col items-center justify-center py-8 space-y-4">
      <motion.div 
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="relative"
      >
        <img 
          src={logo} 
          alt="HeadShot Hero Logo" 
          className="w-32 h-32 object-contain drop-shadow-xl"
        />
        <motion.div 
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="absolute -top-2 -right-2 bg-secondary text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg rotate-12"
        >
          AI Powered!
        </motion.div>
      </motion.div>
      
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight drop-shadow-sm">
          HeadShot <span className="text-secondary">Hero</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-lg font-medium">
          Turn casual selfies into pro shots instantly! ✨
        </p>
      </div>
    </header>
  );
}
