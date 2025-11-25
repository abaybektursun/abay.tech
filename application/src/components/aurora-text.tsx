'use client';

interface AuroraTextProps {
  children: string;
  className?: string;
  isActive?: boolean;
}

export function AuroraText({ children, className = '', isActive = false }: AuroraTextProps) {
  return (
    <span
      className={`aurora-text ${className}`}
      data-active={isActive}
      data-text={children}
    >
      <style jsx>{`
        .aurora-text {
          position: relative;
          display: inline-block;
          cursor: pointer;

          /* Start with normal text color */
          color: inherit;

          /* Slower transition */
          transition: color 0.6s ease;
        }

        /* Gradient overlay */
        .aurora-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;

          /* Aurora gradient colors */
          background: linear-gradient(
            135deg,
            #667eea 0%,
            #764ba2 20%,
            #f093fb 40%,
            #c2e9fb 60%,
            #a1c4fd 80%,
            #667eea 100%
          );

          /* Large size for animation */
          background-size: 400% 400%;

          /* Clip to text */
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;

          /* Hidden by default */
          opacity: 0;

          /* Slower transition */
          transition: opacity 0.6s ease, filter 0.6s ease;

          /* Ensure proper alignment */
          pointer-events: none;
        }

        /* On hover: transition from normal to aurora */
        .aurora-text:hover {
          color: transparent;
          text-shadow: 0 0 30px rgba(102, 126, 234, 0.3);
        }

        .aurora-text:hover::after {
          opacity: 1;
          animation: aurora-shift 3s ease infinite; /* Slower animation */
          filter: brightness(1.4) contrast(1.1);
        }

        /* Slower aurora animation */
        @keyframes aurora-shift {
          0% {
            background-position: 0% 50%;
          }
          25% {
            background-position: 50% 100%;
          }
          50% {
            background-position: 100% 50%;
          }
          75% {
            background-position: 50% 0%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
      `}</style>
      {children}
    </span>
  );
}