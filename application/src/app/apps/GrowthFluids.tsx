'use client';

export default function GrowthFluids() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none overflow-hidden"
    >
      <div className="blob b1" />
      <div className="blob b2" />
      <div className="blob b3" />
      <div className="blob b4" />

      <style jsx>{`
        .blob {
          position: absolute;
          border-radius: 50%;
          filter: blur(56px);
          mix-blend-mode: multiply;
          will-change: transform;
        }
        .b1 {
          width: 70%;
          aspect-ratio: 1;
          top: -20%;
          left: -15%;
          background: radial-gradient(
            circle,
            rgba(167, 139, 250, 0.55) 0%,
            rgba(167, 139, 250, 0) 70%
          );
          animation: drift1 26s ease-in-out infinite;
        }
        .b2 {
          width: 65%;
          aspect-ratio: 1;
          top: 25%;
          right: -25%;
          background: radial-gradient(
            circle,
            rgba(244, 114, 182, 0.45) 0%,
            rgba(244, 114, 182, 0) 70%
          );
          animation: drift2 32s ease-in-out infinite;
        }
        .b3 {
          width: 80%;
          aspect-ratio: 1;
          bottom: -30%;
          left: 10%;
          background: radial-gradient(
            circle,
            rgba(94, 234, 212, 0.42) 0%,
            rgba(94, 234, 212, 0) 70%
          );
          animation: drift3 40s ease-in-out infinite;
        }
        .b4 {
          width: 50%;
          aspect-ratio: 1;
          top: 10%;
          left: 30%;
          background: radial-gradient(
            circle,
            rgba(253, 186, 116, 0.35) 0%,
            rgba(253, 186, 116, 0) 70%
          );
          animation: drift4 22s ease-in-out infinite;
        }

        @keyframes drift1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33%      { transform: translate(35%, 28%) scale(1.18); }
          66%      { transform: translate(18%, -12%) scale(0.88); }
        }
        @keyframes drift2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50%      { transform: translate(-28%, 22%) scale(1.12); }
        }
        @keyframes drift3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25%      { transform: translate(-18%, -25%) scale(1.22); }
          75%      { transform: translate(28%, 8%) scale(0.85); }
        }
        @keyframes drift4 {
          0%, 100% { transform: translate(0, 0) scale(0.95); }
          40%      { transform: translate(-25%, 30%) scale(1.1); }
          80%      { transform: translate(15%, -20%) scale(1.05); }
        }

        :global(.dark) .blob {
          mix-blend-mode: screen;
          filter: blur(64px);
        }
        :global(.dark) .b1 {
          background: radial-gradient(circle, rgba(167, 139, 250, 0.32) 0%, transparent 70%);
        }
        :global(.dark) .b2 {
          background: radial-gradient(circle, rgba(244, 114, 182, 0.28) 0%, transparent 70%);
        }
        :global(.dark) .b3 {
          background: radial-gradient(circle, rgba(94, 234, 212, 0.26) 0%, transparent 70%);
        }
        :global(.dark) .b4 {
          background: radial-gradient(circle, rgba(253, 186, 116, 0.24) 0%, transparent 70%);
        }

        @media (prefers-reduced-motion: reduce) {
          .blob {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
