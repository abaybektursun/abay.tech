'use client';

import React, { useState, useEffect, useRef } from 'react';
import { type ImageProps } from 'next/image';

interface PixelatedImageProps extends Omit<ImageProps, 'src' | 'alt' | 'width' | 'height'> {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
}

const PixelatedImage: React.FC<PixelatedImageProps> = ({
  src,
  alt,
  width,
  height,
  className = '',
  ...props
}) => {
  const [highResLoaded, setHighResLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [pixelationFactor, setPixelationFactor] = useState(64);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const aspectRatio = height / width;

  const pixelateImage = (factor: number) => {
    if (!canvasRef.current || !imageRef.current) return;
    
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
  };

  // Initial setup and low-res loading
  useEffect(() => {
    if (!imageRef.current) {
      imageRef.current = document.createElement('img');
      imageRef.current.crossOrigin = 'anonymous';
      imageRef.current.onload = () => pixelateImage(pixelationFactor);
      imageRef.current.src = src;
    }

    // Start loading high-res version
    const highResImage = document.createElement('img');
    highResImage.crossOrigin = 'anonymous';
    highResImage.onload = () => setHighResLoaded(true);
    highResImage.src = src;

    return () => {
      if (imageRef.current) {
        imageRef.current.onload = null;
      }
      highResImage.onload = null;
    };
  }, [src]);

  // Progressive pixelation animation
  useEffect(() => {
    if (!imageRef.current?.complete) return;

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
  }, [imageRef.current?.complete, highResLoaded]);

  // Update pixelation when factor changes
  useEffect(() => {
    pixelateImage(pixelationFactor);
  }, [pixelationFactor]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => pixelateImage(pixelationFactor);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pixelationFactor]);

  return (
    <div className="relative w-full" style={{ aspectRatio: `${width}/${height}` }}>
      {/* Canvas for pixelated rendering */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full ${className}`}
      />

      {/* Full resolution image (hidden until loaded) */}
      {highResLoaded && (
        <img
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full ${className}`}
          style={{
            opacity: highResLoaded ? 1 : 0,
            transition: 'opacity 0.3s ease-in-out'
          }}
        />
      )}
    </div>
  );
};

export default PixelatedImage;