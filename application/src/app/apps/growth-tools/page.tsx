'use client';

import { Suspense, useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { motion, AnimatePresence } from 'framer-motion';
import { BentoGrid, BentoCard } from '@/components/ui/bento-grid';
import { GrowthToolChat } from '@/components/growth-tools/GrowthToolChat';
import { Dashboard } from '@/components/growth-tools/Dashboard';
import { AppLayout } from '@/components/growth-tools/AppLayout';
import { AppSidebar } from '@/components/growth-tools/AppSidebar';
import { getLocalChats, toggleLocalChatPin, deleteLocalChat } from '@/lib/growth-tools/local-storage';
import { getChats, toggleChatPin, deleteChat } from '@/lib/actions';

interface ChatItem {
  id: string;
  title: string;
  pinned?: boolean;
}

function GrowthToolsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();

  const exercise = searchParams.get('exercise');
  const chatId = searchParams.get('chatId');
  const view = searchParams.get('view');

  const [isChatsOpen, setIsChatsOpen] = useState(true);
  const [savedChats, setSavedChats] = useState<ChatItem[]>([]);

  const isAuthenticated = sessionStatus === 'authenticated' && session?.user;

  // Load chats based on auth state
  useEffect(() => {
    if (sessionStatus === 'loading') return;

    const loadChats = async () => {
      if (isAuthenticated && session?.user?.email) {
        const dbChats = await getChats(session.user.email);
        setSavedChats(dbChats.map((c) => ({
          id: c.id as string,
          title: c.title as string,
          pinned: c.pinned as boolean
        })));
      } else {
        const localChats = getLocalChats();
        setSavedChats(localChats.map((c) => ({
          id: c.id,
          title: c.title,
          pinned: c.pinned
        })));
      }
    };

    loadChats();
  }, [sessionStatus, isAuthenticated, session?.user?.email]);

  const handleTogglePin = async (chatId: string) => {
    if (isAuthenticated && session?.user?.email) {
      const newPinned = await toggleChatPin(chatId, session.user.email);
      setSavedChats(prev => prev.map(c =>
        c.id === chatId ? { ...c, pinned: newPinned } : c
      ));
    } else {
      const newPinned = toggleLocalChatPin(chatId);
      setSavedChats(prev => prev.map(c =>
        c.id === chatId ? { ...c, pinned: newPinned } : c
      ));
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    if (isAuthenticated && session?.user?.email) {
      await deleteChat(chatId, session.user.email);
    } else {
      deleteLocalChat(chatId);
    }
    setSavedChats(prev => prev.filter(c => c.id !== chatId));

    // If currently viewing the deleted chat, redirect to exercises
    if (chatId === searchParams.get('chatId')) {
      router.push('/apps/growth-tools');
    }
  };

  const conversations = [
    {
      name: 'Needs Assessment',
      description:
        "Utilize Tony Robbins' framework of the 6 human needs to evaluate where you are right now: what needs are lacking and which are fulfilled.",
      onClick: () => router.push('/apps/growth-tools?exercise=needs-assessment'),
      cta: 'Start Assessment',
      available: true,
      className: 'md:col-span-2',
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

  // Sidebar component
  const sidebar = (
    <AppSidebar
      chats={savedChats}
      isChatsOpen={isChatsOpen}
      onChatsOpenChange={setIsChatsOpen}
      onTogglePin={handleTogglePin}
      onDeleteChat={handleDeleteChat}
    />
  );

  // Main content based on current view
  const mainContent = (
    <AnimatePresence mode="wait">
      {view === 'dashboard' ? (
        <motion.div
          key="dashboard"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <Dashboard />
        </motion.div>
      ) : exercise ? (
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
          {/* Header */}
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
              Work through proven exercises and frameworks from master teachers like
              Tony Robbins and Martha Beck. This companion guides you step by step,
              keeping you focused and helping you complete the inner work that matters.
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
  );

  return (
    <AppLayout sidebar={sidebar}>
      {mainContent}
    </AppLayout>
  );
}

export default function GrowthToolsLandingPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto px-4" style={{ maxWidth: '1152px' }}>
        Loading...
      </div>
    }>
      <GrowthToolsContent />
    </Suspense>
  );
}
