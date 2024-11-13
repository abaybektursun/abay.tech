// src/app/page.tsx
import Image from "next/image";
import Container from "@/components/container";

export default function HomePage() {
  return (
    <>
      <Container>
        <div className="space-y-6">
          <h1 className="text-2xl font-bold">
            Hey, I'm a consultant and fractional CTO. I enjoy turning 
            AI models into products deeply aligned with customers.
          </h1>
          <p>
            This portfolio is built with Next.js and a library called next-mdx.
            It allows you to write Markdown and focus on the content of your
            portfolio.
          </p>
          <p>Deploy your own in a few minutes.</p>
        </div>
      </Container>

      <div className="container max-w-4xl m-auto px-4 mt-20">
        <Image
          src="/locked_in.jpg"
          alt="my desk"
          width={1920 / 2}
          height={1280 / 2}
          priority
        />
      </div>
    </>
  );
}