'use client';

interface FloweryTextProps {
  children: string;
  className?: string;
  isActive?: boolean;
}

export function FloweryTextAlt({ children, className = '', isActive = false }: FloweryTextProps) {
  return (
    <span
      className={`flowery-text-alt ${className}`}
      data-active={isActive}
      data-text={children}
    >
      <style jsx>{`
        .flowery-text-alt {
          position: relative;
          display: inline-block;
          cursor: pointer;

          /* Start with normal text color */
          color: inherit;

          /* Slower transition */
          transition: color 0.7s cubic-bezier(0.4, 0.0, 0.2, 1);
        }

        /* Gradient overlay */
        .flowery-text-alt::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;

          /* Dreamy gradient with flowery, iridescent colors */
          background: linear-gradient(
            90deg,
            #FFB3D9 0%,     /* Soft pink - cherry blossom */
            #E0BBE4 14.28%, /* Lilac */
            #C9A9E2 28.57%, /* Wisteria */
            #AED9E0 42.86%, /* Powder blue */
            #B5EAD7 57.14%, /* Mint green */
            #FFE5CC 71.43%, /* Peach cream */
            #FFB3D9 85.71%, /* Back to pink */
            #E0BBE4 100%    /* End with lilac for seamless loop */
          );

          /* Make gradient large for smooth animation */
          background-size: 200% auto;

          /* Use text as mask */
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;

          /* Hidden by default */
          opacity: 0;

          /* Slower transition */
          transition: opacity 0.7s cubic-bezier(0.4, 0.0, 0.2, 1);

          /* Ensure proper alignment */
          pointer-events: none;
        }

        /* On hover: smoothly transition from normal to gradient */
        .flowery-text-alt:hover {
          color: transparent;
        }

        .flowery-text-alt:hover::after {
          opacity: 1;
          animation: flowery-shimmer 4s ease-in-out infinite;
          filter: brightness(1.15) drop-shadow(0 0 15px rgba(255, 179, 217, 0.3));
        }

        /* Slower gradient animation */
        @keyframes flowery-shimmer {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
      `}</style>
      {children}
    </span>
  );
}