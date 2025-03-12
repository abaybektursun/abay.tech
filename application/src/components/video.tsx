// /src/components/video.tsx
import React from 'react';

interface VideoBackgroundProps {
  src: string;
  className?: string;
  // Optional props for more customization
  fallbackImage?: string;
  priority?: boolean;
  quality?: string | number;
}

const VideoBackground: React.FC<VideoBackgroundProps> = ({
  src,
  className = '',
  fallbackImage,
  priority = false,
  quality = 'high'
}) => {
  console.log("VIDEO!")
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <video
        autoPlay
        muted
        loop
        playsInline
        disablePictureInPicture
        controlsList="nodownload noplaybackrate"
        preload={priority ? 'auto' : 'metadata'}
        className="w-full h-full object-cover"
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        <source src={src} type="video/mp4" />
        {fallbackImage && (
          <img
            src={fallbackImage}
            alt="Video fallback"
            className="w-full h-full object-cover"
          />
        )}
      </video>
    </div>
  );
};

export default VideoBackground;