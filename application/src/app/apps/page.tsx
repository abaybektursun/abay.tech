'use client';

import Link from 'next/link';
import { useRef } from 'react';
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Container from '@/components/container';
import { APPS, type AppItem } from '@/lib/apps-data';
import ClawddyAscii from './ClawddyAscii';
import FuelOSIcon from './FuelOSIcon';
import GrowthFluids from './GrowthFluids';

const ease = [0.16, 1, 0.3, 1] as const;
const SPRING = { stiffness: 180, damping: 24, mass: 0.6 } as const;

function MagneticCard({ app, i }: { app: AppItem; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const hover = useMotionValue(0);

  const sx = useSpring(mx, SPRING);
  const sy = useSpring(my, SPRING);
  const sh = useSpring(hover, { stiffness: 140, damping: 22 });

  const rotateX = useTransform(sy, [-0.5, 0.5], [6, -6]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-8, 8]);

  const liftX = useTransform(sx, [-0.5, 0.5], [-4, 4]);
  const liftY = useTransform(sy, [-0.5, 0.5], [-4, 4]);

  const specX = useTransform(sx, [-0.5, 0.5], [10, 90]);
  const specY = useTransform(sy, [-0.5, 0.5], [10, 90]);
  const specOpacity = useTransform(sh, [0, 1], [0, 0.55]);
  const specBg = useMotionTemplate`radial-gradient(220px circle at ${specX}% ${specY}%, rgba(255,255,255,${specOpacity}), transparent 60%)`;

  const edgeOpacity = useTransform(sy, [-0.5, 0.5], [0.6, 0]);
  const edgeBg = useMotionTemplate`linear-gradient(to bottom, rgba(255,255,255,${edgeOpacity}), transparent 30%)`;

  const shadowX = useTransform(sx, [-0.5, 0.5], [10, -10]);
  const shadowY = useTransform(sy, [-0.5, 0.5], [-2, 22]);
  const shadowBlur = useTransform(sh, [0, 1], [22, 44]);
  const shadowAlpha = useTransform(sh, [0, 1], [0.06, 0.14]);
  const filter = useMotionTemplate`drop-shadow(${shadowX}px ${shadowY}px ${shadowBlur}px rgba(15, 15, 18, ${shadowAlpha}))`;

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onEnter = () => hover.set(1);
  const onLeave = () => {
    mx.set(0);
    my.set(0);
    hover.set(0);
  };

  const Inner = (
    <motion.div style={{ filter }} className="will-change-[filter]">
      <motion.div
        ref={ref}
        onMouseMove={onMove}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease, delay: i * 0.08 }}
        className="relative h-72 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-stone-950 overflow-hidden group"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          transformPerspective: 1100,
        }}
      >
        {app.id === 'growth-tools' && <GrowthFluids />}

        <motion.div
          aria-hidden
          className="absolute inset-0 pointer-events-none mix-blend-soft-light"
          style={{ background: specBg }}
        />
        <motion.div
          aria-hidden
          className="absolute inset-x-0 top-0 h-px pointer-events-none"
          style={{ background: edgeBg }}
        />

        <motion.div
          className="relative h-full p-7 flex flex-col justify-between"
          style={{ x: liftX, y: liftY, transform: 'translateZ(30px)' }}
        >
          <div className="flex items-baseline justify-between">
            <span className="text-[11px] tracking-[0.2em] uppercase text-stone-400 dark:text-stone-600">
              {app.year}
            </span>
            <span
              aria-hidden
              className="block w-1 h-1 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-300"
              style={{ backgroundColor: app.accent }}
            />
          </div>

          {app.id === 'clawddy' && (
            <div className="flex-1 flex items-center justify-center min-h-0 -my-1">
              <ClawddyAscii />
            </div>
          )}

          {app.id === 'fuelos' && (
            <div className="flex-1 flex items-center justify-center min-h-0">
              <FuelOSIcon />
            </div>
          )}

          <div>
            <h3 className="text-2xl font-medium tracking-tight text-stone-900 dark:text-stone-100 mb-2">
              {app.title}
            </h3>
            <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed max-w-[22ch]">
              {app.tagline}
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );

  return app.external ? (
    <a
      href={app.href}
      target="_blank"
      rel="noopener noreferrer"
      className="block active:scale-[0.99] transition-transform duration-150"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {Inner}
    </a>
  ) : (
    <Link
      href={app.href}
      className="block active:scale-[0.99] transition-transform duration-150"
      style={{ WebkitTapHighlightColor: 'transparent' }}
    >
      {Inner}
    </Link>
  );
}

export default function AppsPage() {
  return (
    <Container>
      <div
        className="max-w-5xl mx-auto py-16 md:py-24 grid grid-cols-1 md:grid-cols-3 gap-8"
        style={{ perspective: 1400 }}
      >
        {APPS.map((app, i) => (
          <MagneticCard key={app.id} app={app} i={i} />
        ))}
      </div>
    </Container>
  );
}
