"use client";

import { motion } from "framer-motion";

interface BrickIconProps {
  size?: number;
  className?: string;
  animate?: boolean;
}

function BrickSvg({ size = 48 }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="brickGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#c2410c" />
          <stop offset="50%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#b45309" />
        </linearGradient>
        <linearGradient id="brickGrad2" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0%" stopColor="#9a3412" />
          <stop offset="100%" stopColor="#c2410c" />
        </linearGradient>
        <linearGradient id="topFace" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#ea580c" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <pattern id="texture" patternUnits="userSpaceOnUse" width="6" height="6">
          <circle cx="3" cy="3" r="0.8" fill="rgba(0,0,0,0.08)" />
          <circle cx="1" cy="5" r="0.5" fill="rgba(0,0,0,0.05)" />
          <circle cx="5" cy="1" r="0.6" fill="rgba(255,255,255,0.08)" />
        </pattern>
        <filter id="shadow">
          <feDropShadow dx="1" dy="2" stdDeviation="2" floodColor="rgba(0,0,0,0.2)" />
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <path d="M12 35h76v30H12z" fill="url(#brickGrad)" rx="3" />
        <path d="M12 35h76v30H12z" fill="url(#texture)" rx="3" />
        <path d="M12 35h38v14H12z" fill="rgba(255,255,255,0.05)" rx="3" />
        <path d="M12 65v-4c4-2 8-3 12-3s8 1 12 3v4H12z" fill="url(#brickGrad2)" opacity="0.6" />
        <path d="M12 35h76v2H12z" fill="rgba(255,255,255,0.1)" />
        <rect x="50" y="49" width="38" height="2" rx="1" fill="rgba(255,255,255,0.15)" />
        <rect x="12" y="49" width="38" height="2" rx="1" fill="rgba(255,255,255,0.15)" />
        <rect x="30" y="35" width="2" height="14" rx="1" fill="rgba(255,255,255,0.08)" />
      </g>
    </svg>
  );
}

export function BrickIcon({ size = 48, className = "", animate = true }: BrickIconProps) {
  if (!animate) {
    return <span className={className}><BrickSvg size={size} /></span>;
  }

  return (
    <motion.span
      className={`inline-block ${className}`}
      animate={{ y: [0, -4, 0] }}
      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
    >
      <BrickSvg size={size} />
    </motion.span>
  );
}

export function StackedBricks({ count = 3, size = 36, className = "" }: { count?: number; size?: number; className?: string }) {
  return (
    <div className={`flex flex-col items-center gap-1 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: -20 * (count - i) }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.2, type: "spring", stiffness: 200 }}
          style={{ marginLeft: i % 2 === 0 ? 0 : size * 0.3 }}
        >
          <BrickSvg size={size} />
        </motion.div>
      ))}
    </div>
  );
}

export function FloatingBrick({ size = 24, className = "", delay = 0 }: { size?: number; className?: string; delay?: number }) {
  return (
    <motion.div
      className={`absolute opacity-20 ${className}`}
      initial={{ opacity: 0, scale: 0 }}
      animate={{
        opacity: 0.15,
        scale: 1,
        y: [0, -15, 0],
        rotate: [0, 5, -5, 0],
      }}
      transition={{
        y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay },
        rotate: { duration: 6, repeat: Infinity, ease: "easeInOut", delay },
        opacity: { duration: 0.5 },
        scale: { duration: 0.5 },
      }}
    >
      <BrickSvg size={size} />
    </motion.div>
  );
}

export function AnimatedBricks() {
  return (
    <>
      <FloatingBrick size={20} className="top-20 left-[10%]" delay={0} />
      <FloatingBrick size={28} className="top-40 right-[8%]" delay={1} />
      <FloatingBrick size={16} className="bottom-32 left-[5%]" delay={2} />
      <FloatingBrick size={24} className="bottom-20 right-[15%]" delay={0.5} />
      <FloatingBrick size={18} className="top-60 left-[45%]" delay={1.5} />
    </>
  );
}
