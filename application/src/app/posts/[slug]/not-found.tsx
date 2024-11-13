// src/app/posts/[slug]/not-found.tsx
export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-20">
      <h2 className="text-2xl font-bold mb-4">Post Not Found</h2>
      <p>Sorry, the requested post could not be found.</p>
    </div>
  );
}