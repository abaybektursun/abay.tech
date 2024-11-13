// src/components/header.tsx
import Link from "next/link";
import Container from "@/components/container";

export default function Header() {
  return (
    <header className="py-6">
      <Container>
        <nav className="flex justify-between items-center">
          <div className="flex space-x-4">
            <Link href="/">About</Link>
            <Link href="/posts">Posts</Link>
          </div>
        </nav>
      </Container>
    </header>
  );
}