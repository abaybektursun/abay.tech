'use client';

import Link from 'next/link';
import ThreeWrapper from '@/components/404/ThreeWrapper';

const buttonClass = "px-6 py-3 rounded-lg bg-white/80 text-black backdrop-blur-sm border border-black/20 hover:bg-white/90 transition-all duration-300";

export default function NotFound() {
  return (
    <main className="relative h-screen">
      <ThreeWrapper />

      <div className="absolute inset-0 z-20 flex items-end justify-center pb-32 px-6 pointer-events-none">
        <div className="flex gap-4 pointer-events-auto">
          <Link href="/" className={buttonClass}>
            Go Home
          </Link>
          <button onClick={() => window.history.back()} className={buttonClass}>
            Go Back
          </button>
        </div>
      </div>
    </main>
  );
}