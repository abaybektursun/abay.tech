// src/components/ReviewWithHighlight.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { AvatarImage, AvatarFallback, Avatar } from '@/components/ui/avatar';
import type { Review } from '@/interfaces';

export function ReviewWithHighlight({ review }: { review: Review }) {
  const searchParams = useSearchParams();
  const selectedId = searchParams.get('highlight');
  const isHighlighted = selectedId === review.content;
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHighlighted && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isHighlighted]);

  return (
    <div
      ref={ref}
      className={`flex gap-4 p-4 rounded-lg transition-colors ${
        isHighlighted
          ? 'bg-blue-50 ring-2 ring-blue-200'
          : 'hover:bg-gray-50'
      }`}
    >
      <Avatar className="w-10 h-10 border">
        <AvatarImage alt={review.name} src="/placeholder-user.jpg" />
        <AvatarFallback>
          {review.name
            .split(' ')
            .map((n) => n[0])
            .join('')}
        </AvatarFallback>
      </Avatar>
      <div className="grid gap-4">
        <div className="flex gap-4 items-start">
          <div className="grid gap-0.5 text-sm">
            <h3 className="font-semibold">{review.name}</h3>
            <div className="text-sm text-gray-500">
              <p>{review.role}</p>
            </div>
          </div>
        </div>
        <div className="text-sm leading-loose text-gray-500">
          <p>{review.content}</p>
        </div>
      </div>
    </div>
  );
}

export default ReviewWithHighlight;
