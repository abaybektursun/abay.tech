// src/components/layout/header.tsx
'use client';

import Link from "next/link";
import Container from "@/components/layout/container";
import { motion, useAnimationControls } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { navigationConfig } from '@/config/navigation';
import { themeConfig } from '@/config/site';

export default function Header() {
  const pathname = usePathname();
  const controls = useAnimationControls();
  const [hoveredLink, setHoveredLink] = useState<string | null>(null);
  const [showTestimonials, setShowTestimonials] = useState(false);

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

  const handleNavMouseEnter = () => {
    setShowTestimonials(true);
  };

  const handleNavMouseLeave = () => {
    setShowTestimonials(false);
  };

  const renderLink = (item: {
    title: string;
    href: string;
    highlight?: boolean;
    isHidden?: boolean;
    isExternal?: boolean;
  }) => {
    const { title, href, highlight, isExternal } = item;
    
    return (
      <div key={href}>
        <Link 
          href={href}
          className="relative inline-block"
          target={isExternal ? "_blank" : undefined}
          onMouseEnter={() => setHoveredLink(href)}
          onMouseLeave={() => setHoveredLink(null)}
        >
          <motion.span 
            className={`text-base font-medium ${
              pathname === href || hoveredLink === href 
                ? themeConfig.colors.primary 
                : themeConfig.colors.secondary
            } transition-colors duration-200`}
            animate={highlight ? controls : undefined}
            style={highlight ? {
              background: themeConfig.colors.accent,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
            } : undefined}
          >
            {title}
          </motion.span>
          
          {pathname === href && (
            <motion.div
              layoutId="underline"
              className={`absolute left-0 top-full h-[1px] w-full ${themeConfig.colors.primary}`}
              transition={themeConfig.animations.underline}
            />
          )}
          
          <span 
            className={`absolute left-0 bottom-0 h-[1px] ${themeConfig.colors.primary} transition-all duration-200 ${
              hoveredLink === href && pathname !== href ? 'w-full' : 'w-0'
            }`}
          />
        </Link>
      </div>
    );
  };

  return (
    <header 
      className="py-6"
      onMouseLeave={handleNavMouseLeave}
    >
      <Container>
        <nav 
          className="flex justify-between items-center"
          onMouseEnter={handleNavMouseEnter}
        >
          <div className="flex items-center">
            <div className="flex space-x-4">
              {navigationConfig.main
                .filter(item => !item.isHidden)
                .map((item, index) => {
                  if (item.href === '/portfolio') {
                    return (
                      <div key={item.href} className="relative flex items-center space-x-4">
                        {renderLink(item)}
                        <motion.div
                          initial={{ width: 0, opacity: 0 }}
                          animate={{
                            width: showTestimonials ? 'auto' : 0,
                            opacity: showTestimonials ? 1 : 0,
                          }}
                          transition={{
                            duration: 0.3,
                            ease: "easeOut"
                          }}
                          className="overflow-hidden"
                        >
                          {renderLink(navigationConfig.main.find(nav => nav.href === '/testimonials')!)}
                        </motion.div>
                      </div>
                    );
                  }
                  
                  // Skip testimonials as it's handled specially above
                  if (item.href === '/testimonials') return null;
                  
                  return renderLink(item);
                })}
            </div>
          </div>
        </nav>
      </Container>
    </header>
  );
}