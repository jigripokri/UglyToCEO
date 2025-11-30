import { ReactCompareSlider, ReactCompareSliderImage } from 'react-compare-slider';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface ComparisonViewProps {
  original: string;
  processed: string;
}

export function ComparisonView({ original, processed }: ComparisonViewProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="relative w-full max-w-2xl mx-auto"
    >
      <div className="glass-panel rounded-3xl overflow-hidden shadow-soft-xl ring-1 ring-white/50 p-2">
        <div className="relative rounded-2xl overflow-hidden aspect-[4/5] md:aspect-square">
          <ReactCompareSlider
            itemOne={<ReactCompareSliderImage src={original} alt="Original" />}
            itemTwo={<ReactCompareSliderImage src={processed} alt="Processed" />}
            style={{ height: '100%', width: '100%' }}
            handle={
              <div className="h-full w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.2)] flex items-center justify-center">
                <div className="bg-white rounded-full p-3 shadow-lg text-primary border border-gray-100">
                   <Sparkles className="w-5 h-5 fill-current" />
                </div>
              </div>
            }
          />
          
          {/* Labels */}
          <div className="absolute top-4 left-4 bg-black/30 backdrop-blur-md text-white px-4 py-1.5 rounded-full text-sm font-medium border border-white/10">
            Before
          </div>
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-primary px-4 py-1.5 rounded-full text-sm font-bold shadow-lg">
            After ✨
          </div>
        </div>
      </div>
    </motion.div>
  );
}
