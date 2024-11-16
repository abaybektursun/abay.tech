'use client';

import Link from "next/link";
import Container from "@/components/container";
import { motion, useAnimationControls } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function Header() {
  const pathname = usePathname();
  const controls = useAnimationControls();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);

  useEffect(() => {
    controls.start({
      opacity: [1, 0.5, 1],
      filter: [
        'hue-rotate(0deg) blur(0px)',
        'hue-rotate(5deg) blur(0.5px)',
        'hue-rotate(0deg) blur(0px)'
      ],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    });
  }, [controls]);

  const renderLink = (href: string, label: string) => {
    const isPortfolio = label === 'Portfolio';
    
    return (
      <div key={href}>
        <Link 
          href={href}
          className="relative inline-block"
          onMouseEnter={() => setHoveredLink(href)}
          onMouseLeave={() => setHoveredLink(null)}
        >
          <motion.span 
            className={`text-base font-medium ${
              pathname === href || hoveredLink === href 
                ? 'text-gray-900' 
                : 'text-gray-600'
            } transition-colors duration-200`}
            animate={isPortfolio ? controls : undefined}
            style={isPortfolio ? {
              background: 'linear-gradient(to right, #000000, #434343)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
            } : undefined}
          >
            {label}
          </motion.span>
          
          {/* Active page underline with animation */}
          {pathname === href && (
            <motion.div
              layoutId="underline"
              className="absolute left-0 top-full h-[1px] w-full bg-gray-900"
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 40
              }}
            />
          )}
          
          {/* Hover underline */}
          <span 
            className={`absolute left-0 bottom-0 h-[1px] bg-gray-900 transition-all duration-200 ${
              hoveredLink === href && pathname !== href ? 'w-full' : 'w-0'
            }`}
          />
        </Link>
      </div>
    );
  };

  return (
    <header className="py-6">
      <Container>
        <nav className="flex justify-between items-center">
          <div className="flex space-x-4">
            {renderLink('/', 'About')}
            {renderLink('/posts', 'Posts')}
            {renderLink('/portfolio', 'Portfolio')}
          </div>
        </nav>
      </Container>
    </header>
  );
}