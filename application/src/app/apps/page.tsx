'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Container from '@/components/container';

interface App {
  id: string;
  title: string;
  description: string;
  href: string;
  external?: boolean;
  status: 'live' | 'beta' | 'coming-soon';
}

export default function AppsPage() {
  const apps: App[] = [
    {
      id: 'growth-tools',
      title: 'Growth Tools',
      description: 'Personal transformation frameworks and mental models.',
      href: '/apps/growth-tools',
      status: 'live',
    },
    {
      id: 'fuelos',
      title: 'fuelOS',
      description: 'Zero friction nutrition tracking powered by AI.',
      href: 'https://fuelos.site/',
      external: true,
      status: 'live',
    },
  ];

  return (
    <Container>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="max-w-2xl mx-auto py-12 md:py-20"
      >
        <div className="grid grid-cols-1 gap-12">
          {apps.map((app) => (
            <div key={app.id} className="group relative">
              <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-2 mb-2">
                <h3 className="text-lg font-medium text-stone-900 dark:text-stone-100">
                  {app.title}
                </h3>
                <span className="text-xs tracking-widest uppercase text-stone-400 dark:text-stone-500">
                  {app.status}
                </span>
              </div>

              <p className="text-stone-500 dark:text-stone-400 leading-relaxed max-w-lg mb-6">
                {app.description}
              </p>

              {app.status === 'live' ? (
                <Link
                  href={app.href}
                  {...(app.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                  className="inline-flex items-center text-sm font-medium text-stone-900 dark:text-stone-200 opacity-60 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <span className="border-b border-stone-300 dark:border-stone-700 pb-0.5 group-hover:border-stone-900 dark:group-hover:border-stone-100 transition-colors">
                    {app.external ? 'Visit Site' : 'Open App'}
                  </span>
                </Link>
              ) : (
                <span className="text-sm text-stone-300 dark:text-stone-700 cursor-not-allowed">
                  Coming soon
                </span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-24 pt-12 border-t border-stone-100 dark:border-stone-900/50 text-center">
          <p className="text-sm text-stone-400 dark:text-stone-600">
            More tools in development
          </p>
        </div>
      </motion.div>
    </Container>
  );
}
