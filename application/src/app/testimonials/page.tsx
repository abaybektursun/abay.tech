// src/app/testimonials/page.tsx
import Reviews from '@/components/reviews';
import { reviews } from '@/data/testimonials';

export const metadata = {
  title: 'Testimonials',
};

export default function ReviewsPage() {
  return <Reviews reviews={reviews} />;
}
