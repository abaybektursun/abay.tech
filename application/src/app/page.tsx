// src/app/page.tsx
'use client';

import Container from "@/components/container";
import { motion } from 'framer-motion';
import { variants, transition } from '@/lib/animations';
import RotatingText from '@/components/RotatingText';
import { ExternalLinks } from "@/components/external";
import PixelatedImage from "@/components/progressive"
import CompanyLogos from "@/components/CompanyLogos";


export default function HomePage() {
  const lowResUrl = `/_next/image?url=${encodeURIComponent('/DSC07673.jpg')}&w=40&q=25`;

  return (
    <Container>
      <div className="flex flex-col md:flex-row md:items-center md:gap-12">
        <motion.div
          className="md:w-1/2"
          initial="hidden"
          animate="visible"
          variants={variants.gentleScale}
          transition={{ ...transition, delay: 0.2 }}
        >
          <div className="relative aspect-[3/2] w-full rounded-2xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.06)]">
          <PixelatedImage
            src="/DSC07673.jpg"
            lowResSrc={`/_next/image?url=${encodeURIComponent('/DSC07673.jpg')}&w=64&q=75`}
            alt="Abay"
            width={2048}
            height={1365}
            className="rounded-lg"
          />
          </div>
        </motion.div>

        <motion.div 
          className="space-y-6 mt-6 md:mt-0 md:w-1/2"
          initial="hidden"
          animate="visible"
          variants={variants.fadeIn}
          transition={{ ...transition, duration: 0.3 }}
        >
          <motion.h1 
            className="text-2xl font-bold"
            variants={variants.softFadeUp}
            transition={{ ...transition, delay: 0.1 }}
          >
            👋 I&apos;m <RotatingText />
          </motion.h1>
            <motion.p
            variants={variants.softFadeUp}
            transition={{ ...transition, delay: 0.2 }}
            >
            I build computer vision and AI systems. After Apple and HPE, I've helped startups ship AI products and provided technical direction to research teams at Cambridge and Columbia. I solve challenging ML problems and get teams unstuck. <br/><br/> <a href="https://calendar.app.google/uCtVm1dzyCeoEBCz9" className="underline hover:text-blue-600" target="_blank" rel="noopener noreferrer">Let's discuss your AI challenges.</a> 
            </motion.p>
          <motion.div
            variants={variants.softFadeUp}
            transition={{ ...transition, delay: 0.3 }}
          >
            <div className="hidden md:flex gap-4 mt-6"> <CompanyLogos /> </div>
          </motion.div>
        </motion.div>
      </div>
      <motion.div
        className="mt-12"
        initial="hidden"
        animate="visible"
        variants={variants.fadeIn}
        transition={{ ...transition, duration: 0.3 }}
      >
        <ExternalLinks/>
      </motion.div>
    </Container>
  );
} 