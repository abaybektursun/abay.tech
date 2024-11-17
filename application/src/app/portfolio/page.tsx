// src/app/portfolio/page.tsx
import { Image as ImageIcon } from 'lucide-react';
import Link from "next/link";
import Container from "@/components/container";
import { AutoScrollReviews } from "@/components/AutoScrollTestimonials";
import distanceToNow from "@/lib/dateRelative";
import { getAllPosts } from "@/lib/getPost";
import { reviews } from "@/data/testimonials";

interface ProjectPost {
  slug: string;
  title: string;
  excerpt: string;
  date?: Date;
  image?: string;
}

export default async function PortfolioPage() {
  const allPosts = getAllPosts("src/_portfolio", ["slug", "title", "excerpt", "date"]) as ProjectPost[];

  return (
    <Container>
      <div className="space-y-8">
        
        {/* Projects Section */}
        <section id="projects" className="space-y-8">
          {allPosts.length ? (
            <div className="relative -mx-4 px-4">
              <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                {allPosts.map((post) => (
                  <Link 
                    href={`/portfolio/${post.slug}`}
                    key={post.slug} 
                    className=""
                  >
                    <div className="relative aspect-[4/2] mb-4 bg-gray-100 rounded-lg overflow-hidden">
                      {post.image ? (
                        <img 
                          src={post.image} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                          <ImageIcon className="w-10 h-10" />
                        </div>
                      )}
                    </div>
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
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No projects posted yet</p>
          )}
        </section>
        {/* Testimonials Section */}
        <section id="testimonials" className="space-y-8">
          <AutoScrollReviews reviews={reviews} />
        </section>

      </div>
    </Container>
  );
}