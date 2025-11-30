import { motion } from "framer-motion";

interface TransformArrowProps {
  className?: string;
  vertical?: boolean;
}

export function TransformArrow({ className = "", vertical = false }: TransformArrowProps) {
  const horizontalPath = "M 10 25 Q 40 5 70 25 Q 100 45 130 25";
  const verticalPath = "M 25 10 Q 5 40 25 70 Q 45 100 25 130";
  
  const arrowPath = vertical ? verticalPath : horizontalPath;
  const viewBox = vertical ? "0 0 50 140" : "0 0 140 50";
  const width = vertical ? 50 : 140;
  const height = vertical ? 140 : 50;
  
  const arrowHeadPath = vertical 
    ? "M 20 125 L 25 135 L 30 125" 
    : "M 125 20 L 135 25 L 125 30";

  return (
    <div className={`relative ${className}`}>
      <svg
        width={width}
        height={height}
        viewBox={viewBox}
        fill="none"
        className="overflow-visible"
      >
        <defs>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <motion.path
          d={arrowPath}
          stroke="rgba(0,0,0,0.15)"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          filter="url(#glow)"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 1.2, ease: "easeInOut", delay: 0.5 },
            opacity: { duration: 0.3, delay: 0.5 }
          }}
          style={{
            strokeDasharray: "6 4",
          }}
        />

        <motion.path
          d={arrowPath}
          stroke="rgba(0,0,0,0.4)"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{
            pathLength: { duration: 1.2, ease: "easeInOut", delay: 0.6 },
            opacity: { duration: 0.3, delay: 0.6 }
          }}
        />

        <motion.path
          d={arrowHeadPath}
          stroke="rgba(0,0,0,0.4)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.3,
            delay: 1.6,
            type: "spring",
            stiffness: 300
          }}
        />

        <motion.circle
          cx={vertical ? 25 : 10}
          cy={vertical ? 10 : 25}
          r="3"
          fill="rgba(0,0,0,0.3)"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ 
            scale: [0, 1.2, 1], 
            opacity: [0, 1, 0.8] 
          }}
          transition={{
            duration: 0.5,
            delay: 0.4,
          }}
        />
      </svg>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.3, 0] }}
        transition={{
          duration: 2,
          delay: 1.8,
          repeat: Infinity,
          repeatDelay: 3,
        }}
      >
        <svg
          width={width}
          height={height}
          viewBox={viewBox}
          fill="none"
          className="overflow-visible"
        >
          <path
            d={arrowPath}
            stroke="rgba(0,0,0,0.2)"
            strokeWidth="4"
            strokeLinecap="round"
            fill="none"
            filter="url(#glow)"
          />
        </svg>
      </motion.div>
    </div>
  );
}
