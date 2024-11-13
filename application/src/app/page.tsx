// src/app/page.tsx
import Image from "next/image";
import Container from "@/components/container";

export default function HomePage() {
  return (
    <>
      <Container>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">
            Hey, I&apos;m a consultant and fractional CTO. I enjoy turning 
            AI models into products deeply aligned with customers.
          </h1>
          <p>
            I specialize in ML engineering, computer vision, and application of LLMs.
          </p>
        </div>
      </Container>

       <div className="container max-w-4xl m-auto px-4 mt-20">
        <div className="relative aspect-[3/2] w-full">
          <Image
            src="/locked_in.jpg"
            alt="lock in"
            fill
            priority
            className="object-contain"
          />
        </div>
      </div>
    </>
  );
}