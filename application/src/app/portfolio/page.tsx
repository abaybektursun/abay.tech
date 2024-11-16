// src/app/portfolio/page.tsx
import { Image as ImageIcon } from 'lucide-react';
import Link from "next/link";
import Container from "@/components/container";
import { AutoScrollTestimonials } from "@/components/AutoScrollTestimonials";
import distanceToNow from "@/lib/dateRelative";
import { getAllPosts } from "@/lib/getPost";

interface ProjectPost {
  slug: string;
  title: string;
  excerpt: string;
  date?: Date;
  image?: string;
}

interface Testimonial {
  id: number;
  type: 'video' | 'text';
  content: string;
  name: string;
  role: string;
}

export default async function PortfolioPage() {
  const allPosts = getAllPosts("src/_portfolio", ["slug", "title", "excerpt", "date"]) as ProjectPost[];

  const testimonials: Testimonial[] = [
    {
      id: 2,
      type: 'text',
      content: "Abay did outstanding work. His skills with code optimization and GPU implementations are exceptional. Highly recommended!",
      name: 'Joshua Mitts',
      role: 'Professor, Columbia University'
    },
    {
      id: 3,
      type: 'text',
      content: 'Abay quickly set us down the right path with our model selection and training needs. He is both broad and deep on ML/AI knowledge and is skilled at application development as well.',
      name: 'John Lupher',
      role: 'CEO, Modern Motion'
    },
    {
      id: 4,
      type: 'text',
      content: 'I definitely recommend working with Abay. From our first conversation, I could tell he was passionate about what he does and that passion still shines through. He has a cool personality and I feel like I learn about both machine learning and life simultaneously while working with him which I appreciate. Abay embodies the \"think different\" mentality. He has great agency and has done an exceptional job both planning and implementing our machine learning project from start to finish. It\'s a challenging problem, but he\'s up for the challenge. Computer vision / machine learning is at the core of our product, and it was a significant task for anyone to take on. I trust him a great deal, which speaks for itself. I\'m excited to continue working together!',
      name: 'Stephanie Goldman',
      role: 'Founder, Gridlines'
    },
    { 
      id: 5,
      type: 'text',
      content: 'Abay was excellent. This was my second time working with him and I couldn\'t have been happier with his performance. Abay is an expert on Machine Learning and was completely dedicated to the quality of the final product . Beyond that he was highly available and would do whatever it took to make sure the final product was high quality.',
      name: 'Client',
      role: 'Healthcare Industry'
    },
    {
      id: 6,
      type: 'text',
      content: 'Abay was fantastic. He\'s extremely knowledgeable on all things AI & ML. I had him complete a project in competition with some other very strong computer vision programmers, and his submission was by far the best. He\'s very knowledgeable all around, but especially strong with computer vision etc. I consider him a valuable resource and will definitely be working with him again.',
      name: 'Client',
      role: 'Healthcare Industry'
    },
    {
      id: 7,
      type: 'text',
      content: 'Abay was the best choice for AI developers. He is extremely fast, and detailed with his work. He was available quickly when any issues occured with our operating environment and was able to develop an efficient and accurate AI. We will be hiring Abay again in the future!',
      name: 'Kevin Cantrell',
      role: 'CTO'
    },
    {
      id: 1,
      type: 'text',
      content: 'It\'d be six stars down the line if I could. Abay is the man - top flight developer and guy.',
      name: 'Client',
      role: 'Fashion Industry'
    },
  ];

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
          <AutoScrollTestimonials testimonials={testimonials} />
        </section>

      </div>
    </Container>
  );
}