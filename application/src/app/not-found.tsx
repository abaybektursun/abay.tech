'use client';
import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

const NotFound = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  useEffect(() => {
    interface MousePosition {
      x: number;
      y: number;
    }

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      
      const rect = (containerRef.current as HTMLElement).getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
      
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen w-full from-white to-neutral-50">
      <div 
        ref={containerRef}
        className="relative w-full max-w-4xl mx-auto pt-16 lg:pt-24 p-8"
      >
        {/* Softer, more sophisticated halo effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] -z-10">
        </div>

        <motion.div
          animate={{
            rotateX: -mousePosition.y,
            rotateY: mousePosition.x,
            transformPerspective: 1000,
          }}
          transition={{
            type: "spring",
            stiffness: 75,
            damping: 15,
          }}
          className="relative z-10"
        >
          <div className="bg-white/70 rounded-2xl p-12 backdrop-blur-xl border border-neutral-100 shadow-[0_8px_32px_rgba(0,0,0,0.04)]">
            <div className="flex items-center space-x-4 mb-8">
              <AlertCircle className="w-8 h-8 text-neutral-400" />
              <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neutral-800 to-neutral-600">
                404
              </h1>
            </div>
            
            <p className="text-neutral-600 text-lg mb-8">
              The page you're looking for seems to have vanished into the digital void.
            </p>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-lg bg-neutral-400 text-white hover:bg-neutral-800 transition-colors shadow-sm"
              onClick={() => window.history.back()}
            >
              Go Back
            </motion.button>
          </div>
        </motion.div>
      </div>
      
      {/* Removed additional background decoration for cleaner look */}
      <div className="h-96" />
    </div>
  );
};

export default NotFound;