// src/app/page.tsx
'use client';

import Image from "next/image";
import Container from "@/components/container";
import { motion } from 'framer-motion';
import { variants, transition } from '@/lib/animations';

export default function HomePage() {
  return (
    <>
      <Container>
        <motion.div 
          className="space-y-6"
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
            Hey, I&apos;m a consultant and fractional CTO. I enjoy turning 
            AI models into products deeply aligned with customers.
          </motion.h1>
          <motion.p
            variants={variants.softFadeUp}
            transition={{ ...transition, delay: 0.2 }}
          >
            I specialize in ML engineering, computer vision, and application of LLMs.
          </motion.p>
        </motion.div>
      </Container>

      <div className="container max-w-4xl m-auto px-4 mt-20">
        <motion.div 
          className="relative aspect-[3/2] w-full"
          initial="hidden"
          animate="visible"
          variants={variants.gentleScale}
          transition={{ ...transition, delay: 0.2 }}
        >
          <Image
            src="/locked_in.jpg"
            alt="lock in"
            fill
            priority
            className="object-contain"
          />
        </motion.div>
      </div>
    </>
  );
}