// src/components/reviews.tsx
import { Suspense } from 'react';
import ReviewWithHighlight from './ReviewWithHighlight';
import { AnimatedStaggerChildren, AnimatedItem } from './AnimatedPageWrapper';
import type { Review } from '@/interfaces';

export function Reviews({ reviews }: { reviews: Review[] }) {
  return (
    <AnimatedStaggerChildren className="mx-auto px-4 md:px-6 max-w-2xl grid gap-12" staggerDelay={0.15}>
      {reviews.map((review) => (
        <AnimatedItem key={review.content} variant="softFadeUp">
          <Suspense fallback={<div>Loading...</div>}>
            <ReviewWithHighlight review={review} />
          </Suspense>
        </AnimatedItem>
      ))}
    </AnimatedStaggerChildren>
  );
}

export default Reviews;
