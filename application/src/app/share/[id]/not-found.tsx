import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-2">Chat Not Found</h1>
      <p className="text-muted-foreground mb-6">
        This shared conversation doesn't exist or is no longer available.
      </p>
      <Link
        href="/apps/growth-tools"
        className="text-primary hover:underline"
      >
        Start your own conversation →
      </Link>
    </main>
  );
}
