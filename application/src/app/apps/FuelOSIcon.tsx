'use client';

import Image from 'next/image';

export default function FuelOSIcon() {
  return (
    <div
      className="relative transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] [transform:translateZ(0)] group-hover:[transform:translateZ(40px)]"
      style={{
        width: 'min(60%, 8rem)',
        aspectRatio: '1 / 1',
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        aria-hidden
        className="absolute left-[8%] right-[8%] -bottom-3 h-3 rounded-full blur-lg bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ transform: 'translateZ(-30px)' }}
      />

      <div className="relative w-full h-full rounded-[22%] overflow-hidden">
        <Image
          src="/images/fuelos-icon.png"
          alt="fuelOS"
          fill
          sizes="128px"
          className="object-cover"
          priority={false}
        />

        <div
          aria-hidden
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] pointer-events-none"
        >
          <div
            className="absolute inset-0 mix-blend-screen"
            style={{
              background:
                'radial-gradient(60% 50% at 28% 18%, rgba(255,255,255,0.42), transparent 70%)',
            }}
          />
          <div
            className="absolute inset-x-0 top-0 h-[18%]"
            style={{
              background:
                'linear-gradient(to bottom, rgba(255,255,255,0.35), transparent)',
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(135deg, transparent 55%, rgba(0,0,0,0.10))',
            }}
          />
          <div
            className="absolute inset-0 rounded-[22%]"
            style={{
              boxShadow: [
                'inset 0 1px 0 0 rgba(255,255,255,0.55)',
                'inset 0 -1px 0 0 rgba(0,0,0,0.08)',
                'inset -2px -3px 8px rgba(0,0,0,0.06)',
                'inset 2px 3px 8px rgba(255,255,255,0.4)',
                'inset 0 0 0 1px rgba(255,255,255,0.18)',
              ].join(', '),
            }}
          />
        </div>
      </div>
    </div>
  );
}
