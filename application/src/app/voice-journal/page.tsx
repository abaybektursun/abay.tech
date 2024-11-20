// app/voice-notes/page.tsx
'use client';

import Container from "@/components/container";
import VoiceToText from "@/components/VoiceToText";
import { motion } from 'framer-motion';
import { variants, transition } from '@/lib/animations';
import RotatingText from '@/components/RotatingText';

export default function VoiceNotesPage() {
  return (
    <Container>
    <div className="flex flex-col items-start gap-6 w-full">

        <motion.div
          className="w-full"
          initial="hidden"
          animate="visible"
          variants={variants.gentleScale}
          transition={{ ...transition, delay: 0.2 }}
        >
          <VoiceToText />
        </motion.div>


      </div>
    </Container>
  );
}