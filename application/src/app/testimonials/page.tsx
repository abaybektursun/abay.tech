import { Reviews } from "@/components/reviews";
import { reviews } from "@/data/testimonials";

export default function ReviewsPage() {
  return <Reviews reviews={reviews} />;
}