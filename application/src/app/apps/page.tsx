'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Container from '@/components/container';

interface App {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  href: string;
  external?: boolean;
  github?: string;
  status: 'live' | 'beta' | 'coming-soon';
  features: string[];
  tech: string[];
  gradient: string;
}

export default function AppsPage() {
  const apps: App[] = [
    {
      id: 'growth-tools',
      title: 'Personal Growth Tools',
      description: 'A personal transformation companion using proven frameworks from master teachers',
      longDescription: 'This app is a personal transformation companion that uses the exact exercises and frameworks from teachers I respect like Tony Robbins, Martha Beck, and others who speak to me.',
      href: '/apps/growth-tools',
      status: 'live',
      features: [
        'Needs Assessment with visual charts',
        'Goal Setting & Planning',
        'Daily Reflection Tools',
        'Progress Tracking'
      ],
      tech: ['GPT-4o', 'AI SDK', 'Next.js 15', 'Recharts', 'Tailwind CSS'],
      gradient: 'from-rose-500 to-pink-500',
    },
    // Future apps can be added here
  ];

  const statusBadge = (status: App['status']) => {
    const styles = {
      'live': 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400',
      'beta': 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400',
      'coming-soon': 'bg-stone-50 text-stone-500 dark:bg-stone-950/30 dark:text-stone-400',
    };

    const labels = {
      'live': 'Live',
      'beta': 'Beta',
      'coming-soon': 'Coming Soon',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-md ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  // Determine grid layout based on number of apps
  const getGridClass = () => {
    if (apps.length === 1) {
      // Single app: centered, reasonable width
      return 'flex justify-center';
    } else if (apps.length === 2) {
      // Two apps: side by side on large screens
      return 'grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl mx-auto';
    } else if (apps.length === 3) {
      // Three apps: 3 columns on large screens
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto';
    } else {
      // 4+ apps: responsive grid
      return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
    }
  };

  const getCardWidth = () => {
    if (apps.length === 1) {
      return 'w-full max-w-md';
    }
    return 'w-full';
  };

  return (
    <Container>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="pb-16"
      >
          {/* Adaptive grid */}
          <div className={getGridClass()}>
            {apps.map((app, index) => {
              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1
                  }}
                  className={getCardWidth()}
                >
                  <div className="relative overflow-hidden rounded-2xl border-[0.5px] border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-950 hover:border-stone-300 dark:hover:border-stone-700 hover:shadow-lg transition-all duration-300 h-full">
                    <div className="relative p-6">
                      {/* App Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h2 className="text-xl font-semibold text-foreground">
                            {app.title}
                          </h2>
                          <div className="mt-1">
                            {statusBadge(app.status)}
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
                        {app.longDescription}
                      </p>

                      {/* Features */}
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-100 mb-3">
                          Features
                        </h3>
                        <ul className="space-y-2">
                          {app.features.map((feature) => (
                            <li key={feature} className="text-sm text-stone-600 dark:text-stone-400 flex items-start gap-2">
                              <span className="text-rose-300 dark:text-rose-400 mt-0.5">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-4">
                        {app.status === 'live' ? (
                          <>
                            <Link
                              href={app.href}
                              className="flex-1"
                            >
                              <button className="w-full flex items-center justify-center px-4 py-2 bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-md hover:bg-stone-800 dark:hover:bg-stone-200 transition-all hover:shadow-sm">
                                <span>Launch App</span>
                              </button>
                            </Link>
                            {app.github && (
                              <Link
                                href={app.github}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <button className="px-4 py-2 border border-gray-200 dark:border-gray-800 rounded-md hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                                  <span>GitHub</span>
                                </button>
                              </Link>
                            )}
                          </>
                        ) : (
                          <button
                            disabled
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-muted-foreground rounded-lg cursor-not-allowed opacity-50"
                          >
                            <span>{app.status === 'beta' ? 'In Beta' : 'Coming Soon'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Coming soon section - only show if we have less than 4 apps */}
          {apps.length < 4 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="mt-16 text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50">
                <span className="text-sm text-muted-foreground">
                  More apps coming soon...
                </span>
              </div>
            </motion.div>
          )}
      </motion.div>
    </Container>
  );
}