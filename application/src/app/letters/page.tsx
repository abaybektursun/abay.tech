// src/app/letters/page.tsx
import { Image as ImageIcon } from 'lucide-react';
import Link from "next/link";
import Image from "next/image";
import Container from "@/components/container";
import { AnimatedSection } from "@/components/AnimatedPageWrapper";
import { PortfolioGrid } from "@/components/PortfolioGrid";
import { AutoScrollReviews } from "@/components/AutoScrollTestimonials";
import distanceToNow from "@/lib/dateRelative";
import { getAllPosts } from "@/lib/getPost";
import { reviews } from "@/data/testimonials";
import VideoBackground from '@/components/video';

interface ProjectPost {
  slug: string;
  title: string;
  excerpt: string;
  date?: Date;
  image?: string;
  video?: string;
}

export default async function PortfolioPage() {
  const allPosts = getAllPosts("src/app/letters/_content", ["slug", "title", "excerpt", "date", "image", "video"]) as ProjectPost[];

  return (
    <Container>
      <AnimatedSection className="space-y-8" variant="fadeIn">
        <AnimatedSection className="space-y-8" variant="gentleScale" delay={0.1}>
          {allPosts.length ? (
            <div className="relative -mx-4 px-4">
              <PortfolioGrid>
                {allPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/letters/${post.slug}`}
                    className="group block h-full"
                  >
                  {post.video ? (
                    <div className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden aspect-video">
                      <VideoBackground
                          src={post.video}
                          className="w-full h-full"
                          priority={true}
                        />
                    </div>
                  ) : (
                    <div className="relative mb-4 bg-gray-100 rounded-lg overflow-hidden aspect-video">
                      {post.image ? (
                        <Image 
                          src={post.image}
                          alt={post.title}
                          fill
                          sizes="(max-width: 640px) 288px, 320px"
                          priority={false}
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          <ImageIcon className="w-10 h-10" />
                        </div>
                      )}
                    </div>
                  )}
                    <div className="space-y-2">
                      <h3 className="font-medium text-lg leading-tight group-hover:text-blue-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {post.excerpt}
                      </p>
                      <time className="block text-xs text-gray-400">
                        {post.date ? distanceToNow(new Date(post.date)) : ""}
                      </time>
                    </div>
                  </Link>
                ))}
              </PortfolioGrid>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No projects posted yet</p>
          )}
        </AnimatedSection>
      </AnimatedSection>
    </Container>
  );
}