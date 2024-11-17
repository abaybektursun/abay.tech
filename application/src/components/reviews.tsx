// src/components/reviews.tsx
import { Suspense } from 'react';
import ReviewWithHighlight from './ReviewWithHighlight';
import type { Review } from '@/interfaces';

export function Reviews({ reviews }: { reviews: Review[] }) {
  return (
    <div className="mx-auto px-4 md:px-6 max-w-2xl grid gap-12">
      {reviews.map((review) => (
        <div key={review.content}>
          <Suspense fallback={<div>Loading...</div>}>
            <ReviewWithHighlight review={review} />
          </Suspense>
        </div>
      ))}
    </div>
  );
}

export default Reviews;
