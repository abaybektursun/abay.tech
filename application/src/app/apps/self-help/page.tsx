'use client';

import { motion } from 'framer-motion';
import { Brain, Heart, Sparkles, Activity, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function SelfHelpLandingPage() {
  const conversations = [
    {
      id: 'needs-assessment',
      title: 'Needs Assessment',
      description:
        'Explore your fundamental human needs across physical, emotional, mental, and spiritual dimensions.',
      icon: Heart,
      href: '/apps/self-help/needs-assessment',
      theme: 'rose', // Semantic theme name
      available: true,
    },
    {
      id: 'goal-setting',
      title: 'Goal Setting',
      description: 'Set meaningful goals aligned with your values and create actionable plans.',
      icon: Sparkles,
      href: '/apps/self-help/goal-setting',
      theme: 'amber',
      available: false,
    },
    {
      id: 'daily-reflection',
      title: 'Daily Reflection',
      description: 'Reflect on your day, celebrate wins, and identify areas for growth.',
      icon: Brain,
      href: '/apps/self-help/daily-reflection',
      theme: 'blue',
      available: false,
    },
  ];

  // Theme-based styling using Tailwind utilities only
  const getThemeClasses = (theme: string) => ({
    iconBg: {
      rose: 'bg-rose-100 dark:bg-rose-900/30',
      amber: 'bg-amber-100 dark:bg-amber-900/30',
      blue: 'bg-blue-100 dark:bg-blue-900/30',
    }[theme],
    iconColor: {
      rose: 'text-rose-600 dark:text-rose-400',
      amber: 'text-amber-600 dark:text-amber-400',
      blue: 'text-blue-600 dark:text-blue-400',
    }[theme],
    hoverBorder: {
      rose: 'hover:border-rose-300 dark:hover:border-rose-700',
      amber: 'hover:border-amber-300 dark:hover:border-amber-700',
      blue: 'hover:border-blue-300 dark:hover:border-blue-700',
    }[theme],
  });

  return (
    <div className="h-full bg-background">
      {/* Using standard Tailwind container instead of custom Container */}
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 h-full">
        <div className="space-y-12 py-8 sm:py-12 lg:py-16">
          {/* Header - Responsive */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-3 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                <Activity className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
                  Self-Help Tools
                </h1>
                <p className="text-sm sm:text-base text-muted-foreground">
                  AI-powered conversations for personal growth
                </p>
              </div>
            </div>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-3xl">
              Explore your needs, set meaningful goals, and track your progress through guided conversations with an empathetic AI coach.
            </p>
          </motion.div>

          {/* Conversation Cards - Responsive Grid */}
          <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
            {conversations.map((conversation, index) => {
              const Icon = conversation.icon;
              const themeClasses = getThemeClasses(conversation.theme);

              return (
                <motion.div
                  key={conversation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1
                  }}
                >
                  <Card
                    className={cn(
                      "relative h-full transition-all duration-200",
                      conversation.available
                        ? cn(
                            "hover:shadow-lg hover:-translate-y-1",
                            themeClasses.hoverBorder
                          )
                        : "opacity-60"
                    )}
                  >
                    {/* Coming Soon Badge */}
                    {!conversation.available && (
                      <Badge
                        variant="secondary"
                        className="absolute top-4 right-4 text-xs"
                      >
                        Coming Soon
                      </Badge>
                    )}

                    <CardHeader>
                      {/* Icon - Using theme classes */}
                      <div className={cn(
                        "mb-4 flex h-10 w-10 items-center justify-center rounded-lg",
                        themeClasses.iconBg
                      )}>
                        <Icon className={cn("h-5 w-5", themeClasses.iconColor)} />
                      </div>

                      <CardTitle className="text-lg sm:text-xl">
                        {conversation.title}
                      </CardTitle>
                      <CardDescription className="text-sm sm:text-base">
                        {conversation.description}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      {/* Action Button */}
                      {conversation.available ? (
                        <Link href={conversation.href}>
                          <Button
                            variant="ghost"
                            className="w-full justify-between group"
                          >
                            <span>Start Conversation</span>
                            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </Link>
                      ) : (
                        <Button
                          variant="secondary"
                          disabled
                          className="w-full"
                        >
                          Coming Soon
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

          {/* Footer - Responsive */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="pt-8 border-t border-border"
          >
            <p className="text-xs sm:text-sm text-muted-foreground text-center">
              Powered by GPT-4 • Your data is private and secure
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}