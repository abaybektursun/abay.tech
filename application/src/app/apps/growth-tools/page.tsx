'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { LayoutGrid, MessagesSquare, ChevronDown, MessageCircle } from 'lucide-react';
import { GrowthToolChat } from '@/components/growth-tools/GrowthToolChat';
import { getLocalChats, type LocalChat } from '@/lib/growth-tools/local-storage';
import { getChats } from '@/lib/actions';

interface ChatItem {
  id: string;
  title: string;
}

function GrowthToolsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  // Get exercise and chatId from URL
  const exercise = searchParams.get('exercise');
  const chatId = searchParams.get('chatId');

  // State for sidebar
  const [isChatsOpen, setIsChatsOpen] = useState(true);
  const [savedChats, setSavedChats] = useState<ChatItem[]>([]);

  const isAuthenticated = sessionStatus === 'authenticated' && session?.user;

  // Load chats based on auth state
  useEffect(() => {
    if (sessionStatus === 'loading') return;

    const loadChats = async () => {
      if (isAuthenticated && session?.user?.email) {
        // Fetch from DB for authenticated users
        const dbChats = await getChats(session.user.email);
        setSavedChats(dbChats.map((c) => ({ id: c.id as string, title: c.title as string })));
      } else {
        // Load from localStorage for anonymous users
        const localChats = getLocalChats();
        setSavedChats(localChats.map((c) => ({ id: c.id, title: c.title })));
      }
    };

    loadChats();
  }, [sessionStatus, isAuthenticated, session?.user?.email]);

  const conversations = [
    {
      name: 'Needs Assessment',
      description:
        "Utilize Tony Robbins' framework of the 6 human needs to evaluate where you are right now: what needs are lacking and which are fulfilled.",
      onClick: () => router.push('/apps/growth-tools?exercise=needs-assessment'),
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
      onClick: () => router.push('/apps/growth-tools?exercise=integrity-alignment'),
      cta: 'Begin Journey',
      available: true,
      className: 'md:col-span-1',
      glowColor: 'bg-emerald-500/80 dark:bg-emerald-400/80',
      layoutId: 'integrity-alignment-card'
    },
    {
      name: 'Open World Mode',
      description:
        "Develop high-agency thinking: treat life as a game with hackable rules, turn obstacles into fuel, and discover that building from nothing is the greatest adventure.",
      onClick: () => router.push('/apps/growth-tools?exercise=open-world-mode'),
      cta: 'Enter Open World',
      available: true,
      className: 'md:col-span-1',
      glowColor: 'bg-cyan-500/80 dark:bg-cyan-400/80',
      layoutId: 'open-world-mode-card'
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
                onClick={() => router.push('/apps/growth-tools')}
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
                    {savedChats.length === 0 ? (
                      <div className="text-xs text-muted-foreground py-2">
                        No saved chats
                      </div>
                    ) : (
                      savedChats.map((chat) => (
                        <Button
                          key={chat.id}
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-xs font-normal truncate"
                          onClick={() => router.push(`/apps/growth-tools?exercise=needs-assessment&chatId=${chat.id}`)}
                        >
                          <MessageCircle className="mr-2 h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{chat.title}</span>
                        </Button>
                      ))
                    )}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </motion.div>
          </div>
        </nav>

        {/* Main content */}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            {exercise ? (
              <motion.div
                key={`${exercise}-${chatId ?? 'new'}`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <GrowthToolChat exercise={exercise} id={chatId ?? undefined} />
              </motion.div>
            ) : (
              <motion.div
                key="exercise-list"
                className="space-y-8"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
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
                  {conversations.map((item) => {
                    const { onClick, ...cardProps } = item;
                    return (
                      <div key={item.name} onClick={onClick} className="cursor-pointer">
                        <BentoCard {...cardProps} />
                      </div>
                    );
                  })}
                </BentoGrid>
              </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function GrowthToolsLandingPage() {
  return (
    <Suspense fallback={<div className="container max-w-6xl mx-auto px-4">Loading...</div>}>
      <GrowthToolsContent />
    </Suspense>
  );
}