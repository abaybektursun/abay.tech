'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface PixelatedImageProps {
  src: string;
  lowResSrc?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

const PixelatedImage: React.FC<PixelatedImageProps> = ({
  src,
  lowResSrc,
  alt,
  width,
  height,
  className = '',
}) => {
  const [highResLoaded, setHighResLoaded] = useState(false);
  const [lowResLoaded, setLowResLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pixelationFactor, setPixelationFactor] = useState(64);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const aspectRatio = height / width;

  const pixelateImage = (factor: number) => {
    if (!canvasRef.current || !imageRef.current || !lowResLoaded) return;
    
    try {
      const context = canvasRef.current.getContext('2d');
      if (!context) return;

      const containerWidth = canvasRef.current.clientWidth;
      const containerHeight = containerWidth * aspectRatio;

      canvasRef.current.width = containerWidth;
      canvasRef.current.height = containerHeight;

      context.drawImage(imageRef.current, 0, 0, containerWidth, containerHeight);
      const imageData = context.getImageData(0, 0, containerWidth, containerHeight).data;
      context.clearRect(0, 0, containerWidth, containerHeight);
      
      const pixelSize = Math.max(1, Math.floor(factor * (containerWidth / width)));
      
      for (let y = 0; y < containerHeight; y += pixelSize) {
        for (let x = 0; x < containerWidth; x += pixelSize) {
          const pixelIndex = (Math.floor(x) + Math.floor(y) * containerWidth) * 4;
          const red = imageData[pixelIndex];
          const green = imageData[pixelIndex + 1];
          const blue = imageData[pixelIndex + 2];
          const alpha = imageData[pixelIndex + 3];
          
          context.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha / 255})`;
          context.fillRect(x, y, pixelSize, pixelSize);
        }
      }
    } catch (error) {
      console.error('Error during pixelation:', error);
    }
  };

  // Initial setup with low-res image
  useEffect(() => {
    const img = document.createElement('img');
    img.crossOrigin = 'anonymous';
    
    img.onload = () => {
      imageRef.current = img;
      setLowResLoaded(true);
      pixelateImage(pixelationFactor);
    };

    img.onerror = (event: ErrorEvent) => {
      console.error('Error loading low-res image:', event);
    };

    // Use the low-res version for initial pixelation if available
    img.src = lowResSrc || src;

    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [lowResSrc, src, pixelationFactor]);

  // Load high-res version
  useEffect(() => {
    if (!lowResLoaded || !lowResSrc) return;

    const highResImage = document.createElement('img');
    highResImage.crossOrigin = 'anonymous';
    
    highResImage.onload = () => {
      if (imageRef.current) {
        imageRef.current.src = src;
        setHighResLoaded(true);
      }
    };

    highResImage.onerror = (event: ErrorEvent) => {
      console.error('Error loading high-res image:', event);
    };

    highResImage.src = src;

    return () => {
      highResImage.onload = null;
      highResImage.onerror = null;
    };
  }, [src, lowResLoaded, lowResSrc]);

  // Progressive pixelation animation
  useEffect(() => {
    if (!lowResLoaded) return;

    const steps = [64, 48, 32, 24, 16, 12, 8, 6, 4, 2, 1];
    let currentStep = 0;
    let animationFrame: number;

    const animate = () => {
      if (currentStep >= steps.length || highResLoaded) {
        setPixelationFactor(1);
        return;
      }
      
      setPixelationFactor(steps[currentStep]);
      currentStep++;

      if (currentStep < steps.length && !highResLoaded) {
        animationFrame = requestAnimationFrame(() => {
          setTimeout(animate, 200);
        });
      }
    };

    animate();

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [lowResLoaded, highResLoaded]);

  // Update pixelation when factor changes
  useEffect(() => {
    if (lowResLoaded) {
      pixelateImage(pixelationFactor);
    }
  }, [pixelationFactor, lowResLoaded]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (lowResLoaded) {
        pixelateImage(pixelationFactor);
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pixelationFactor, lowResLoaded]);

  return (
    <div className="relative w-full" style={{ aspectRatio: `${width}/${height}` }}>
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${className}`}
      />
      {highResLoaded && (
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`absolute inset-0 w-full h-full ${className} transition-opacity duration-300 ${
            highResLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          priority={false}
        />
      )}
    </div>
  );
};

export default PixelatedImage;