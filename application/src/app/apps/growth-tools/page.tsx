'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { LayoutGrid, MessagesSquare, ChevronDown } from 'lucide-react';

export default function GrowthToolsLandingPage() {
  // State for sidebar
  const [isChatsOpen, setIsChatsOpen] = useState(true);
  const conversations = [
    {
      name: 'Needs Assessment',
      description:
        "Utilize Tony Robbins' framework of the 6 human needs to evaluate where you are right now: what needs are lacking and which are fulfilled.",
      href: '/apps/growth-tools/needs-assessment',
      cta: 'Start Assessment',
      available: true,
      className: 'md:col-span-2', // Featured - spans 2 columns
      glowColor: 'bg-rose-500/80 dark:bg-rose-400/80',
      layoutId: 'needs-assessment-card'
    },
    {
      name: 'Integrity Alignment',
      description:
        "Work through Martha Beck's Way of Integrity exercises to align your actions with your true nature and find your path to authentic living.",
      href: '/apps/growth-tools/integrity-alignment',
      cta: 'Begin Journey',
      available: true,
      className: 'md:col-span-1',
      glowColor: 'bg-emerald-500/80 dark:bg-emerald-400/80',
      layoutId: 'integrity-alignment-card'
    },
  ];

  return (
    <div className="container max-w-6xl mx-auto px-4">
      <div className="flex gap-8">
        {/* Enhanced sidebar menu */}
        <nav className="hidden md:block w-48 flex-shrink-0">
          <div className="sticky top-24 space-y-2">
            {/* Exercises button */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Button
                variant="ghost"
                className="w-full justify-start text-sm hover:bg-accent/50 transition-all duration-200"
                onClick={() => window.location.href = '/apps/growth-tools'}
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Exercises
              </Button>
            </motion.div>

            {/* Collapsible Chats section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Collapsible open={isChatsOpen} onOpenChange={setIsChatsOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between text-sm hover:bg-accent/50 transition-all duration-200"
                  >
                    <span className="flex items-center">
                      <MessagesSquare className="mr-2 h-4 w-4" />
                      Chats
                    </span>
                    <motion.div
                      animate={{ rotate: isChatsOpen ? 180 : 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </motion.div>
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <div className="mt-2 pl-6 space-y-1">
                    <div className="text-xs text-muted-foreground py-2">
                      No saved chats
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          </div>
        </nav>

        {/* Main content */}
        <div className="flex-1 space-y-8">
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