'use client';

import { motion } from 'framer-motion';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';

export default function GrowthToolsLandingPage() {
  const conversations = [
    {
      name: 'Needs Assessment',
      description:
        "Utilize Tony Robbins' framework of the 6 human needs to evaluate where you are right now: what needs are lacking and which are fulfilled.",
      href: '/apps/growth-tools/needs-assessment',
      cta: 'Start Assessment',
      available: true,
      className: 'md:col-span-2', // Featured - spans 2 columns
      background: <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 via-pink-500/20 to-purple-500/20" />
    },
    {
      name: 'Goal Setting',
      description: 'Set meaningful goals aligned with your values and create actionable plans.',
      href: '/apps/growth-tools/goal-setting',
      cta: 'Set Goals',
      available: false,
      className: 'md:col-span-1',
      background: <div className="absolute inset-0 bg-gradient-to-br from-amber-500/20 via-orange-500/20 to-yellow-500/20" />
    },
    {
      name: 'Daily Reflection',
      description: 'Reflect on your day, celebrate wins, and identify areas for growth.',
      href: '/apps/growth-tools/daily-reflection',
      cta: 'Start Reflecting',
      available: false,
      className: 'md:col-span-1',
      background: <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-cyan-500/20 to-teal-500/20" />
    },
    {
      name: 'Habit Tracking',
      description: 'Build and maintain positive habits with daily tracking and accountability.',
      href: '/apps/growth-tools/habit-tracking',
      cta: 'Track Habits',
      available: false,
      className: 'md:col-span-1',
      background: <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 via-emerald-500/20 to-teal-500/20" />
    },
    {
      name: 'Values Clarification',
      description: 'Discover and define your core values to guide decision-making.',
      href: '/apps/growth-tools/values-clarification',
      cta: 'Clarify Values',
      available: false,
      className: 'md:col-span-1',
      background: <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-violet-500/20 to-indigo-500/20" />
    },
    {
      name: 'Life Wheel',
      description: 'Evaluate balance across all areas of your life.',
      href: '/apps/growth-tools/life-wheel',
      cta: 'Assess Balance',
      available: false,
      className: 'md:col-span-2',
      background: <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 via-blue-500/20 to-purple-500/20" />
    },
    {
      name: 'Vision Board',
      description: 'Create a visual representation of your goals and dreams.',
      href: '/apps/growth-tools/vision-board',
      cta: 'Create Vision',
      available: false,
      className: 'md:col-span-1',
      background: <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 via-rose-500/20 to-orange-500/20" />
    },
    {
      name: 'Gratitude Journal',
      description: 'Cultivate positivity by documenting what you\'re grateful for.',
      href: '/apps/growth-tools/gratitude',
      cta: 'Start Journal',
      available: false,
      className: 'md:col-span-1',
      background: <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-amber-500/20 to-orange-500/20" />
    },
  ];

  return (
    <div className="h-full bg-background">
      {/* Using standard Tailwind container instead of custom Container */}
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 h-full">
        <div className="space-y-8">
          {/* Header - Responsive */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                Growth Tools
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Personal transformation through proven frameworks
              </p>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Work through proven exercises and frameworks from master teachers like Tony Robbins and Martha Beck. This companion guides you step by step, keeping you focused and helping you complete the inner work that matters.
            </p>
          </motion.div>

          {/* Bento Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <BentoGrid>
              {conversations.map((item) => (
                <BentoCard key={item.name} {...item} />
              ))}
            </BentoGrid>
          </motion.div>
        </div>
      </div>
    </div>
  );
}