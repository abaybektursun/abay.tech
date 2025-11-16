'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Brain, Heart, Sparkles, Activity, ExternalLink, Github, Code2, Zap } from 'lucide-react';
import Container from '@/components/container';

interface App {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  icon: React.ElementType;
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
      id: 'self-help',
      title: 'Self-Help AI Coach',
      description: 'AI-powered conversations for personal growth and self-discovery',
      longDescription: 'An intelligent coaching system that helps you explore your fundamental human needs, set meaningful goals, and track your personal development journey through empathetic AI-guided conversations.',
      icon: Heart,
      href: '/self-help',
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
      'live': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      'beta': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      'coming-soon': 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
    };

    const labels = {
      'live': 'Live',
      'beta': 'Beta',
      'coming-soon': 'Coming Soon',
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${styles[status]}`}>
        {labels[status]}
      </span>
    );
  };

  return (
    <div className="min-h-screen">
      <Container>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-12 sm:py-16"
        >
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
                <Code2 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
                Apps
              </h1>
            </div>
            <p className="text-lg text-muted-foreground max-w-3xl">
              Interactive web applications and tools I've built to explore ideas, solve problems, and help people.
            </p>
          </div>

          {/* Apps Grid */}
          <div className="grid gap-8 md:grid-cols-1 lg:grid-cols-2">
            {apps.map((app, index) => {
              const Icon = app.icon;

              return (
                <motion.div
                  key={app.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1
                  }}
                  className="group"
                >
                  <div className="relative overflow-hidden rounded-2xl border bg-card hover:shadow-xl transition-all duration-300 h-full">
                    {/* Gradient Background */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${app.gradient} opacity-5 group-hover:opacity-10 transition-opacity`}
                    />

                    <div className="relative p-6 sm:p-8">
                      {/* App Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${app.gradient} shadow-lg`}>
                            <Icon className="h-7 w-7 text-white" />
                          </div>
                          <div>
                            <h2 className="text-xl sm:text-2xl font-semibold text-foreground">
                              {app.title}
                            </h2>
                            <div className="mt-1">
                              {statusBadge(app.status)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-muted-foreground mb-6 leading-relaxed">
                        {app.longDescription}
                      </p>

                      {/* Features */}
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Sparkles className="h-4 w-4" />
                          Features
                        </h3>
                        <ul className="space-y-2">
                          {app.features.map((feature) => (
                            <li key={feature} className="text-sm text-muted-foreground flex items-start gap-2">
                              <span className="text-primary mt-0.5">•</span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Tech Stack */}
                      <div className="mb-6">
                        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                          <Zap className="h-4 w-4" />
                          Built with
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {app.tech.map((tech) => (
                            <span
                              key={tech}
                              className="px-2.5 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-md"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 pt-4 border-t">
                        {app.status === 'live' ? (
                          <>
                            <Link
                              href={app.href}
                              className="flex-1"
                            >
                              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                                <span>Launch App</span>
                                {app.external ? (
                                  <ExternalLink className="h-4 w-4" />
                                ) : (
                                  <ArrowRight className="h-4 w-4" />
                                )}
                              </button>
                            </Link>
                            {app.github && (
                              <Link
                                href={app.github}
                                target="_blank"
                                rel="noopener noreferrer"
                              >
                                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-secondary transition-colors">
                                  <Github className="h-4 w-4" />
                                  <span className="sr-only">View on GitHub</span>
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

          {/* Future Apps Teaser */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16 text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50">
              <Activity className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                More apps coming soon...
              </span>
            </div>
          </motion.div>
        </motion.div>
      </Container>
    </div>
  );
}