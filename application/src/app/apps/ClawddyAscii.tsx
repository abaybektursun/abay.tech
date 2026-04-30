'use client';

import { useEffect, useRef, useState } from 'react';

const FPS = 24;
const FRAME_MS = 1000 / FPS;

class FrameLoop {
  private raf: number | null = null;
  private last = -1;
  constructor(private onTick: () => void) {}
  start() {
    if (this.raf != null) return;
    this.raf = requestAnimationFrame(this.tick);
  }
  stop() {
    if (this.raf != null) cancelAnimationFrame(this.raf);
    this.raf = null;
    this.last = -1;
  }
  private tick = (t: number) => {
    if (this.last === -1) this.last = t;
    let dt = t - this.last;
    while (dt >= FRAME_MS) {
      this.onTick();
      dt -= FRAME_MS;
      this.last += FRAME_MS;
    }
    this.raf = requestAnimationFrame(this.tick);
  };
}

export default function ClawddyAscii() {
  const [frames, setFrames] = useState<string[][] | null>(null);
  const [idx, setIdx] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancel = false;
    import('./clawddy-frames.json').then((mod) => {
      if (!cancel) setFrames(mod.default as string[][]);
    });
    return () => {
      cancel = true;
    };
  }, []);

  useEffect(() => {
    if (!frames) return;
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const loop = new FrameLoop(() => {
      setIdx((i) => (i + 1) % frames.length);
    });

    let visible = true;
    let onScreen = true;
    const sync = () => (visible && onScreen ? loop.start() : loop.stop());

    const onVis = () => {
      visible = document.visibilityState === 'visible';
      sync();
    };
    const onBlur = () => {
      visible = false;
      sync();
    };
    const onFocus = () => {
      visible = document.visibilityState === 'visible';
      sync();
    };

    document.addEventListener('visibilitychange', onVis);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);

    let io: IntersectionObserver | null = null;
    const target = containerRef.current;
    if (target && 'IntersectionObserver' in window) {
      io = new IntersectionObserver(
        (entries) => {
          onScreen = entries[0]?.isIntersecting ?? true;
          sync();
        },
        { threshold: 0.01 }
      );
      io.observe(target);
    }

    sync();

    return () => {
      loop.stop();
      document.removeEventListener('visibilitychange', onVis);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
      io?.disconnect();
    };
  }, [frames]);

  const lines = frames ? frames[idx] : null;

  return (
    <div
      ref={containerRef}
      className="clawddy-ascii w-full h-full flex items-center justify-center overflow-hidden"
      style={{ containerType: 'size' }}
    >
      <pre
        aria-hidden
        className="leading-[1] tracking-[0] text-stone-500 dark:text-stone-400 select-none whitespace-pre"
        style={{
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 'min(calc(100cqh / 28), calc(100cqw / 26))',
          fontVariantLigatures: 'none',
        }}
      >
        {lines
          ? lines.map((line, i) => (
              <div
                key={i}
                dangerouslySetInnerHTML={{ __html: line || '&nbsp;' }}
              />
            ))
          : Array.from({ length: 26 }).map((_, i) => (
              <div key={i}>&nbsp;</div>
            ))}
      </pre>
      <style jsx>{`
        .clawddy-ascii :global(.o) {
          color: #d76a45;
        }
        .clawddy-ascii :global(.b) {
          color: rgb(28 25 23);
          font-weight: 500;
        }
        .clawddy-ascii :global(.s) {
          color: rgb(168 162 158);
        }
        :global(.dark) .clawddy-ascii :global(.o) {
          color: #e88566;
        }
        :global(.dark) .clawddy-ascii :global(.b) {
          color: rgb(245 245 244);
        }
        :global(.dark) .clawddy-ascii :global(.s) {
          color: rgb(120 113 108);
        }
      `}</style>
    </div>
  );
}
