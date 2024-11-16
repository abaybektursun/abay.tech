// src/app/page.tsx
'use client';

import Image from "next/image";
import Container from "@/components/container";
import { motion } from 'framer-motion';
import { variants, transition } from '@/lib/animations';
import RotatingText from '@/components/RotatingText';
import { ExternalLinks } from "@/components/external";
import ProgressiveImage from "@/components/progressive"

export default function HomePage() {
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
        <ProgressiveImage
        src="/DSC07673.jpg"
        alt="Description"
        width={2048}
        height={1365}
        className="rounded-lg" // optional
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
            I specialize in ML engineering, computer vision, and application of LLMs.
          </motion.p>
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