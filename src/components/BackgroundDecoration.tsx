import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TrendingUp, TrendingDown, DollarSign, Bitcoin, Zap, CirclePercent, Activity, BarChart3 } from "lucide-react";

const BACKGROUNDS = [
  "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1920&h=1080&auto=format&fit=crop&blur=10",
  "https://images.unsplash.com/photo-1644088379091-d574269d422f?q=80&w=1920&h=1080&auto=format&fit=crop&blur=10",
  "https://images.unsplash.com/photo-1611974714851-142010e9c8c1?q=80&w=1920&h=1080&auto=format&fit=crop&blur=10",
  "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=1920&h=1080&auto=format&fit=crop&blur=10",
  "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=1920&h=1080&auto=format&fit=crop&blur=10"
];

const FloatingIcon = ({ 
  icon: Icon, 
  delay, 
  duration, 
  initialX, 
  initialY, 
  size = 40,
  color = "rgba(255, 255, 255, 0.05)"
}: { 
  icon: any, 
  delay: number, 
  duration: number, 
  initialX: string, 
  initialY: string,
  size?: number,
  color?: string
}) => (
  <motion.div
    initial={{ x: initialX, y: initialY, rotate: 0 }}
    animate={{ 
      y: [ "0%", "-20%", "0%" ],
      rotate: [ 0, 10, -10, 0 ],
      x: [ "0%", "5%", "0%" ]
    }}
    transition={{
      duration: duration,
      delay: delay,
      repeat: Infinity,
      ease: "easeInOut"
    }}
    className="absolute pointer-events-none z-0"
    style={{ left: initialX, top: initialY }}
  >
    <Icon 
      size={size} 
      strokeWidth={0.5}
      style={{ 
        color,
        filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.5)) blur(0.5px)",
      }} 
    />
  </motion.div>
);

export const BackgroundDecoration: React.FC = () => {
  const [bgIndex, setBgIndex] = useState(0);

  useEffect(() => {
    // 5 minutes interval = 300,000ms
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % BACKGROUNDS.length);
    }, 300000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-[#000814]">
      {/* Premium Background Image Layer with Cross-fade */}
      <AnimatePresence mode="wait">
        <motion.img 
          key={BACKGROUNDS[bgIndex]}
          src={BACKGROUNDS[bgIndex]}
          alt="Premium Background"
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.2 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 3, ease: "easeInOut" }}
          className="absolute inset-0 w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      </AnimatePresence>
      
      {/* Background radial gradient for depth */}
      <div className="absolute inset-0 bg-radial-at-tr from-blue-900/10 via-transparent to-[#000814]" />
      
      {/* TradingView-style technical grid */}
      <div 
        className="absolute inset-0 opacity-[0.07]" 
        style={{ 
          backgroundImage: `
            linear-gradient(rgba(0,33,71,0.2) 1px, transparent 1px), 
            linear-gradient(90deg, rgba(0,33,71,0.2) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `
            linear-gradient(rgba(0,33,71,0.5) 2px, transparent 2px), 
            linear-gradient(90deg, rgba(0,33,71,0.5) 2px, transparent 2px)
          `,
          backgroundSize: '200px 200px'
        }}
      />

      {/* 3D-like Floating Elements */}
      <FloatingIcon icon={TrendingUp} delay={0} duration={12} initialX="10%" initialY="15%" size={120} color="rgba(46, 125, 50, 0.05)" />
      <FloatingIcon icon={BarChart3} delay={2} duration={14} initialX="75%" initialY="10%" size={180} color="rgba(0, 33, 71, 0.03)" />
      <FloatingIcon icon={Activity} delay={1} duration={16} initialX="5%" initialY="65%" size={200} color="rgba(0, 75, 145, 0.02)" />
      <FloatingIcon icon={Bitcoin} delay={4} duration={18} initialX="85%" initialY="75%" size={140} color="rgba(247, 147, 26, 0.03)" />
      <FloatingIcon icon={Zap} delay={3} duration={20} initialX="45%" initialY="35%" size={250} color="rgba(0, 75, 145, 0.02)" />
      
      {/* Moving Chart Lines in background */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" preserveAspectRatio="none">
        <motion.path
          d="M0 400 Q 200 300 400 450 T 800 350 T 1200 400 T 1600 300"
          stroke="#002147"
          strokeWidth="4"
          fill="none"
          animate={{ d: [
            "M0 400 Q 200 300 400 450 T 800 350 T 1200 400 T 1600 300",
            "M0 350 Q 200 450 400 300 T 800 400 T 1200 350 T 1600 450",
            "M0 400 Q 200 300 400 450 T 800 350 T 1200 400 T 1600 300",
          ]}}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        />
      </svg>
    </div>
  );
};
