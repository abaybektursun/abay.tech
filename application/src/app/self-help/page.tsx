'use client';

import Container from '@/components/container';
import { motion } from 'framer-motion';
import { Brain, Heart, Sparkles, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SelfHelpLandingPage() {
  const conversations = [
    {
      id: 'needs-assessment',
      title: 'Needs Assessment',
      description:
        'Explore your fundamental human needs across physical, emotional, mental, and spiritual dimensions.',
      icon: Heart,
      href: '/self-help/needs-assessment',
      gradient: 'from-rose-400 to-pink-600',
      iconBg: 'bg-gradient-to-br from-rose-500/20 to-pink-500/20',
    },
    {
      id: 'goal-setting',
      title: 'Goal Setting',
      description: 'Set meaningful goals aligned with your values and create actionable plans.',
      icon: Sparkles,
      href: '/self-help/goal-setting',
      gradient: 'from-amber-400 to-orange-600',
      iconBg: 'bg-gradient-to-br from-amber-500/20 to-orange-500/20',
      comingSoon: true,
    },
    {
      id: 'daily-reflection',
      title: 'Daily Reflection',
      description: 'Reflect on your day, celebrate wins, and identify areas for growth.',
      icon: Brain,
      href: '/self-help/daily-reflection',
      gradient: 'from-blue-400 to-indigo-600',
      iconBg: 'bg-gradient-to-br from-blue-500/20 to-indigo-500/20',
      comingSoon: true,
    },
  ];

  return (
    <Container>
      <div className="space-y-12 py-12">
        {/* Header */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
              <Activity className="size-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h1 className="font-bold text-2xl text-gray-900 dark:text-white">
                Self-Help Tools
              </h1>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                AI-powered conversations for personal growth
              </p>
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
            Explore your needs, set meaningful goals, and track your progress through guided conversations with an empathetic AI coach.
          </p>
        </motion.div>

        {/* Conversation Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          {conversations.map((conversation, index) => {
            const Icon = conversation.icon;
            return (
              <motion.div
                key={conversation.id}
                animate={{ opacity: 1, y: 0 }}
                initial={{ opacity: 0, y: 20 }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1
                }}
              >
                <Link
                  className={
                    conversation.comingSoon
                      ? 'pointer-events-none'
                      : 'group block'
                  }
                  href={conversation.href}
                >
                  <div
                    className={`relative h-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 transition-all duration-200 ${
                      conversation.comingSoon
                        ? 'opacity-50'
                        : 'hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-lg'
                    }`}
                  >
                    {/* Coming Soon Badge */}
                    {conversation.comingSoon && (
                      <div className="absolute top-4 right-4 rounded-full bg-gray-100 dark:bg-gray-800 px-3 py-1 text-gray-500 dark:text-gray-400 text-xs font-medium">
                        Coming Soon
                      </div>
                    )}

                    {/* Icon */}
                    <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-lg ${conversation.iconBg}`}>
                      <Icon className="size-5 text-gray-700 dark:text-gray-300" />
                    </div>

                    {/* Content */}
                    <h3 className="mb-2 font-semibold text-lg text-gray-900 dark:text-white">
                      {conversation.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed mb-4">
                      {conversation.description}
                    </p>

                    {/* Start link */}
                    {!conversation.comingSoon && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-purple-600 dark:text-purple-400 font-medium group-hover:underline">
                          Start →
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Footer */}
        <motion.div
          animate={{ opacity: 1 }}
          className="pt-8 border-t border-gray-200 dark:border-gray-800"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center">
            Powered by GPT-4 • Your data is private and secure
          </p>
        </motion.div>
      </div>
    </Container>
  );
}
