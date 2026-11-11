"use client";

/**
 * Walker2d-medium-v2 best episode — pre-rendered MP4.
 *
 * Source: /runs/renders/iter_030000/ep01_len1001_score79.8.mp4 (480x480, 33s).
 * Replaces the live Three.js / Mixamo viewer that shipped earlier; the
 * pre-rendered video is faster to load, deterministic, and renders correctly
 * across browsers without WebGL fragility.
 */

const VIDEO_SRC = "/videos/walker2d-best.mp4";
const EPISODE_LABEL = "Walker2d-medium-v2";
const EPISODE_SCORE = 79.8;

export default function Walker2dViewer() {
  return (
    <div
      className="relative overflow-hidden border border-[--rule] bg-[#070912] mx-auto"
      style={{ maxWidth: 560, aspectRatio: "1 / 1" }}
    >
      <video
        src={VIDEO_SRC}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover"
      />
      {/* HUD overlay */}
      <div className="absolute inset-0 pointer-events-none p-5 flex items-start justify-between">
        <div className="t-eyebrow" style={{ color: "#A8B0BE" }}>
          {EPISODE_LABEL}
        </div>
        <div className="text-right">
          <div className="t-eyebrow" style={{ color: "#A8B0BE" }}>norm. score</div>
          <div
            className="t-numeral mt-1"
            style={{
              color: "#5C7BA8",
              fontSize: 44,
              lineHeight: 1,
              textShadow: "0 0 16px rgba(92, 123, 168, 0.5)",
            }}
          >
            {EPISODE_SCORE.toFixed(1)}
          </div>
        </div>
      </div>
    </div>
  );
}
