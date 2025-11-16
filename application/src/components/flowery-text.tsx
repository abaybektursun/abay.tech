'use client';

interface FloweryTextProps {
  children: string;
  className?: string;
  isActive?: boolean;
}

export function FloweryText({ children, className = '', isActive = false }: FloweryTextProps) {
  return (
    <span
      className={`flowery-text ${className}`}
      data-active={isActive}
      data-text={children}
    >
      {/* SVG Pattern Definition */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <pattern id="flower-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
            {/* Simple 5-petal flower */}
            <circle cx="10" cy="8" r="2" fill="#FFB5E8" opacity="0.8" />
            <circle cx="10" cy="12" r="2" fill="#FFB5E8" opacity="0.8" />
            <circle cx="8" cy="10" r="2" fill="#FFB5E8" opacity="0.8" />
            <circle cx="12" cy="10" r="2" fill="#FFB5E8" opacity="0.8" />
            <circle cx="10" cy="10" r="1.5" fill="#FFCCF9" />

            {/* Second flower offset */}
            <circle cx="2" cy="2" r="1.5" fill="#FF9CEE" opacity="0.7" />
            <circle cx="0" cy="2" r="1.5" fill="#FF9CEE" opacity="0.7" />
            <circle cx="4" cy="2" r="1.5" fill="#FF9CEE" opacity="0.7" />
            <circle cx="2" cy="0" r="1.5" fill="#FF9CEE" opacity="0.7" />
            <circle cx="2" cy="4" r="1.5" fill="#FF9CEE" opacity="0.7" />

            {/* Third tiny flower */}
            <circle cx="17" cy="17" r="1" fill="#FCC2FF" opacity="0.6" />
            <circle cx="15" cy="17" r="1" fill="#FCC2FF" opacity="0.6" />
            <circle cx="19" cy="17" r="1" fill="#FCC2FF" opacity="0.6" />
            <circle cx="17" cy="15" r="1" fill="#FCC2FF" opacity="0.6" />
            <circle cx="17" cy="19" r="1" fill="#FCC2FF" opacity="0.6" />
          </pattern>

          <linearGradient id="flower-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFB5E8">
              <animate attributeName="stop-color"
                values="#FFB5E8;#FF9CEE;#FFCCF9;#FFB5E8"
                dur="4s"
                repeatCount="indefinite" />
            </stop>
            <stop offset="50%" stopColor="#FCC2FF">
              <animate attributeName="stop-color"
                values="#FCC2FF;#F6A6FF;#B28DFF;#FCC2FF"
                dur="4s"
                repeatCount="indefinite" />
            </stop>
            <stop offset="100%" stopColor="#B28DFF">
              <animate attributeName="stop-color"
                values="#B28DFF;#FFB5E8;#FF9CEE;#B28DFF"
                dur="4s"
                repeatCount="indefinite" />
            </stop>
          </linearGradient>
        </defs>
      </svg>

      <style jsx>{`
        .flowery-text {
          position: relative;
          display: inline-block;
          cursor: pointer;

          /* Start with normal text color */
          color: inherit;

          /* Smooth transition for color change */
          transition: color 0.6s ease;
        }

        /* Create gradient overlay using ::after */
        .flowery-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;

          /* Use the flower pattern */
          background-image: url(#flower-pattern);
          background-size: 20px 20px;

          /* Apply gradient overlay */
          background:
            url(#flower-pattern),
            linear-gradient(
              135deg,
              #FFB5E8 0%,
              #FF9CEE 20%,
              #FFCCF9 40%,
              #FCC2FF 60%,
              #F6A6FF 80%,
              #B28DFF 100%
            );
          background-blend-mode: multiply;
          background-size: 20px 20px, 200% 200%;

          /* Use the text as a mask for the background */
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;

          /* Hidden by default */
          opacity: 0;

          /* Slower, smoother transition */
          transition: opacity 0.6s cubic-bezier(0.4, 0.0, 0.2, 1);

          /* Ensure proper alignment */
          pointer-events: none;
        }

        /* On hover: fade out normal text, fade in gradient */
        .flowery-text:hover {
          /* Make the normal text transparent */
          color: transparent;
        }

        .flowery-text:hover::after {
          opacity: 1;
          animation: flower-dance 3s ease infinite;
          filter: brightness(1.1) drop-shadow(0 0 20px rgba(255, 181, 232, 0.5));
        }

        /* Gentle flower pattern animation */
        @keyframes flower-dance {
          0%, 100% {
            background-position: 0 0, 0% 0%;
          }
          50% {
            background-position: 10px 10px, 100% 100%;
          }
        }
      `}</style>
      {children}
    </span>
  );
}