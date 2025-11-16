'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { BrainIcon, HeartIcon, SparklesIcon, ActivityIcon } from 'lucide-react';
import Link from 'next/link';

export default function SelfHelpLandingPage() {
  const conversations = [
    {
      id: 'needs-assessment',
      title: 'Needs Assessment',
      description:
        'Explore your fundamental human needs across physical, emotional, mental, and spiritual dimensions.',
      icon: HeartIcon,
      href: '/self-help/needs-assessment',
      color: 'bg-rose-500/10 text-rose-500',
    },
    {
      id: 'goal-setting',
      title: 'Goal Setting',
      description: 'Set meaningful goals aligned with your values and create actionable plans.',
      icon: SparklesIcon,
      href: '/self-help/goal-setting',
      color: 'bg-amber-500/10 text-amber-500',
      comingSoon: true,
    },
    {
      id: 'daily-reflection',
      title: 'Daily Reflection',
      description: 'Reflect on your day, celebrate wins, and identify areas for growth.',
      icon: BrainIcon,
      href: '/self-help/daily-reflection',
      color: 'bg-blue-500/10 text-blue-500',
      comingSoon: true,
    },
  ];

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        {/* Header */}
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="space-y-3 text-center"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.5 }}
        >
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <ActivityIcon className="size-8 text-primary" />
          </div>
          <h1 className="font-bold text-4xl tracking-tight">Self-Help Chat</h1>
          <p className="mx-auto max-w-2xl text-muted-foreground text-lg">
            AI-powered conversations to help you understand yourself better and
            grow intentionally.
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
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  className={
                    conversation.comingSoon
                      ? 'pointer-events-none'
                      : 'group'
                  }
                  href={conversation.href}
                >
                  <div
                    className={`relative h-full rounded-lg border bg-card p-6 transition-all ${
                      conversation.comingSoon
                        ? 'opacity-60'
                        : 'hover:border-primary/50 hover:shadow-md'
                    }`}
                  >
                    {/* Coming Soon Badge */}
                    {conversation.comingSoon && (
                      <div className="absolute top-4 right-4 rounded-full bg-muted px-3 py-1 text-muted-foreground text-xs">
                        Coming Soon
                      </div>
                    )}

                    {/* Icon */}
                    <div
                      className={`mb-4 flex h-12 w-12 items-center justify-center rounded-lg ${conversation.color}`}
                    >
                      <Icon className="size-6" />
                    </div>

                    {/* Content */}
                    <h3 className="mb-2 font-semibold text-lg">
                      {conversation.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {conversation.description}
                    </p>

                    {/* Start Button */}
                    {!conversation.comingSoon && (
                      <Button
                        className="mt-4 w-full"
                        size="sm"
                        variant="outline"
                      >
                        Start Conversation
                      </Button>
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
          className="pt-8 text-center text-muted-foreground text-sm"
          initial={{ opacity: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <p>
            Choose a conversation type above to begin your self-discovery
            journey.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
