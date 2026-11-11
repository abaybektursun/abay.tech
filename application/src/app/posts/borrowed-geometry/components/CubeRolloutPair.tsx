"use client";

interface Clip {
  src: string;
  label: string;
  sublabel: string;
  scoreLabel: string;
  score: string;
}

const CLIPS: Clip[] = [
  {
    src: "/videos/cube-pretrained.mp4",
    label: "Pretrained Gemma 4 31B (frozen)",
    sublabel: "488M frozen · 13M trainable IQL heads",
    scoreLabel: "best-ckpt success",
    score: "96%",
  },
  {
    src: "/videos/cube-random.mp4",
    label: "Random-init Gemma (frozen)",
    sublabel: "same architecture, no pretrained weights",
    scoreLabel: "mean success (n=3)",
    score: "0.89%",
  },
];

export default function CubeRolloutPair() {
  return (
    <div className="grid grid-cols-2 gap-3 md:gap-4">
      {CLIPS.map((c) => (
        <div key={c.src} className="flex flex-col">
          <div className="bg-[#0E1118] border border-[--rule] overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
            <video
              src={c.src}
              autoPlay
              loop
              muted
              playsInline
              preload="metadata"
              className="w-full h-full block"
            />
          </div>
          <div className="mt-2 px-1 flex flex-col gap-0.5">
            <div className="t-eyebrow accent">{c.label}</div>
            <div className="t-caption" style={{ color: "var(--ink-3)" }}>{c.sublabel}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="t-data uppercase tracking-wider" style={{ color: "var(--ink-3)" }}>{c.scoreLabel}</span>
              <span className="t-numeral accent" style={{ fontSize: "1.05rem" }}>{c.score}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
