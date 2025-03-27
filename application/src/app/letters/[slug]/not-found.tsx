// src/app/posts/[slug]/not-found.tsx
export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-20">
      <h2 className="text-2xl font-bold mb-4">Letter Not Found</h2>
      <p>Sorry, the requested letter could not be found.</p>
    </div>
  );
}