// /src/components/AutoScrollTestimonials.tsx
"use client";

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import type { Review } from "@/interfaces";

interface AutoScrollReviewsProps {
  reviews: Review[];
}

const ReviewCard = ({ review }: { review: Review }) => (
  <Link 
    href={`/testimonials?highlight=${encodeURIComponent(review.content)}`} 
    className="block w-64 h-[140px] p-3 cursor-pointer transition-colors hover:bg-gray-50 rounded-lg"
  >
    <div className="flex gap-4 h-full">
      <Avatar className="w-10 h-10 border shrink-0">
        <AvatarImage alt={review.name} src="/placeholder-user.jpg" />
        <AvatarFallback>{review.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
      </Avatar>
      <div className="grid gap-2 overflow-hidden">
        <div className="flex gap-4 items-start">
          <div className="grid gap-0.5 text-sm">
            <h3 className="font-semibold truncate">{review.name}</h3>
            <div className="text-sm text-gray-500">
              <p className="truncate">{review.role}</p>
            </div>
          </div>
        </div>
        <div className="text-sm leading-normal text-gray-500">
          <p className="line-clamp-3">{review.content}</p>
        </div>
      </div>
    </div>
  </Link>
);


export function AutoScrollReviews({ reviews }: AutoScrollReviewsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(true);
  const animationRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const scrollPositionRef = useRef(0);
  const autoScrollTimeoutRef = useRef<NodeJS.Timeout>();
  const SCROLL_SPEED = 0.05; // pixels per millisecond

  const animate = useCallback((currentTime: number) => {
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = currentTime;
    }

    const deltaTime = currentTime - previousTimeRef.current;
    previousTimeRef.current = currentTime;

    const scrollContainer = scrollRef.current;
    const container = containerRef.current;
    if (!scrollContainer || !container || !isScrolling) return;

    scrollPositionRef.current += deltaTime * SCROLL_SPEED;

    // Reset scroll position when reaching the end
    if (scrollPositionRef.current >= (container.scrollWidth / 2)) {
      scrollPositionRef.current = 0;
    }

    // Use transform instead of scrollLeft for smoother animation
    container.style.transform = `translateX(${-scrollPositionRef.current}px)`;
    animationRef.current = requestAnimationFrame(animate);
  }, [isScrolling]);

  const startScrolling = useCallback(() => {
    setIsScrolling(true);
    if (!animationRef.current) {
      previousTimeRef.current = undefined;
      animationRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  const stopScrolling = useCallback(() => {
    setIsScrolling(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
  }, []);

  // Handle auto-scroll restart after interruptions
  const handleScrollPause = useCallback(() => {
    stopScrolling();
    // Clear any existing timeout
    if (autoScrollTimeoutRef.current) {
      clearTimeout(autoScrollTimeoutRef.current);
    }
    // Set new timeout to restart scrolling after 2 seconds of inactivity
    autoScrollTimeoutRef.current = setTimeout(startScrolling, 2000);
  }, [stopScrolling, startScrolling]);

  // Handle mouse wheel (middle mouse) scrolling
  const handleWheel = useCallback((e: WheelEvent) => {
    const container = containerRef.current;
    if (!container) return;

    // Stop animation while manually scrolling
    handleScrollPause();

    // Update scroll position based on wheel delta
    scrollPositionRef.current = Math.max(
      0,
      Math.min(
        scrollPositionRef.current + e.deltaX,
        container.scrollWidth / 2
      )
    );
    
    container.style.transform = `translateX(${-scrollPositionRef.current}px)`;
    
    // Prevent default scrolling behavior
    e.preventDefault();
  }, [handleScrollPause]);

  useEffect(() => {
    const scrollContainer = scrollRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('wheel', handleWheel, { passive: false });
    }

    startScrolling();

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener('wheel', handleWheel);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (autoScrollTimeoutRef.current) {
        clearTimeout(autoScrollTimeoutRef.current);
      }
    };
  }, [startScrolling, handleWheel]);

  return (
    <div className="overflow-hidden relative max-w-6xl mx-auto" ref={scrollRef}>
      <div
        ref={containerRef}
        className="flex gap-4 py-2 w-max"
        style={{ willChange: 'transform' }}
        onMouseEnter={handleScrollPause}
        onMouseLeave={startScrolling}
      >
        {[...reviews, ...reviews].map((review, index) => (
          <div key={`${review.content}-${index}`}>
            <ReviewCard review={review} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default AutoScrollReviews;