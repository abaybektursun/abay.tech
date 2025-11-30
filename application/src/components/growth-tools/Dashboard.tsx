'use client';

import { useState, useEffect } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Pin, PinOff, Trash2, BarChart2, Quote, Lightbulb, FileText, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Artifact } from '@/lib/artifacts';
import { NeedsChart } from '@/components/growth-tools/visualizations/NeedsChart';
import type { ShowNeedsChartArgs } from '@/lib/growth-tools/types';

// Icon mapping for artifact types
const artifactIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'needs-chart': BarChart2,
  'quote': Quote,
  'insight': Lightbulb,
  'action-plan': FileText,
};

// Demo artifacts for unauthenticated users
const DEMO_ARTIFACTS = [
  {
    id: 'demo-1',
    type: 'needs-chart',
    title: 'Needs Assessment',
    data: JSON.stringify({
      needs: [
        { name: 'Connection', category: 'emotional', fulfilled: 72, importance: 85 },
        { name: 'Purpose', category: 'spiritual', fulfilled: 45, importance: 90 },
        { name: 'Energy', category: 'physical', fulfilled: 60, importance: 75 },
      ]
    }),
    pinned: true,
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'demo-2',
    type: 'quote',
    title: 'Daily Insight',
    data: JSON.stringify({ text: 'The quality of your life is the quality of your questions.' }),
    pinned: false,
    createdAt: Date.now() - 172800000,
  },
  {
    id: 'demo-3',
    type: 'insight',
    title: 'Growth Pattern',
    data: JSON.stringify({ text: 'You tend to prioritize others\' needs over your own rest.' }),
    pinned: false,
    createdAt: Date.now() - 259200000,
  },
];

function ArtifactCard({
  artifact,
  onTogglePin,
  onDelete,
}: {
  artifact: Artifact;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const Icon = artifactIcons[artifact.type] || FileText;
  const data = JSON.parse(artifact.data);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="relative p-4 rounded-lg border bg-card"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium text-sm">{artifact.title}</h3>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onTogglePin(artifact.id)}
          >
            {artifact.pinned ? (
              <PinOff className="h-4 w-4" />
            ) : (
              <Pin className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(artifact.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="mt-3 text-sm text-muted-foreground">
        {artifact.type === 'quote' && (
          <p className="italic">&ldquo;{data.text}&rdquo;</p>
        )}
        {artifact.type === 'insight' && (
          <p>{data.text}</p>
        )}
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        {new Date(artifact.createdAt).toLocaleDateString()}
      </div>
    </motion.div>
  );
}

// Demo card with blur and pulse animation
function DemoArtifactCard({ artifact }: { artifact: typeof DEMO_ARTIFACTS[0] }) {
  const Icon = artifactIcons[artifact.type] || FileText;
  const data = JSON.parse(artifact.data);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{
        opacity: [0.6, 0.8, 0.6],
        scale: 1,
      }}
      transition={{
        opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
        scale: { duration: 0.3 }
      }}
      className="relative p-4 rounded-lg border bg-card/50 blur-[1px] select-none"
    >
      {/* Demo badge */}
      <div className="absolute -top-2 -right-2 bg-muted text-muted-foreground text-[10px] px-2 py-0.5 rounded-full font-medium">
        Demo
      </div>

      <div className="flex items-start gap-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-medium text-sm">{artifact.title}</h3>
      </div>

      <div className="mt-3 text-xs text-muted-foreground">
        {artifact.type === 'needs-chart' && data.needs && (
          <div className="space-y-1">
            {data.needs.slice(0, 3).map((need: any, i: number) => (
              <div key={i} className="flex justify-between">
                <span>{need.name}</span>
                <span>{need.fulfilled}%</span>
              </div>
            ))}
          </div>
        )}
        {artifact.type === 'quote' && (
          <p className="italic line-clamp-2">&ldquo;{data.text}&rdquo;</p>
        )}
        {artifact.type === 'insight' && (
          <p className="line-clamp-2">{data.text}</p>
        )}
      </div>
    </motion.div>
  );
}

// Skeleton placeholder card for empty state
function SkeletonArtifactCard() {
  return (
    <div className="p-4 rounded-lg border-2 border-dashed border-muted-foreground/20 bg-muted/5">
      <div className="flex items-center gap-2">
        <div className="h-5 w-5 rounded bg-muted-foreground/10" />
        <div className="h-4 w-24 rounded bg-muted-foreground/10" />
      </div>
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-muted-foreground/10" />
        <div className="h-3 w-2/3 rounded bg-muted-foreground/10" />
      </div>
    </div>
  );
}

export function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = status === 'authenticated' && session?.user;

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const fetchArtifacts = async () => {
      try {
        const response = await fetch('/api/apps/growth-tools/artifacts');
        if (response.ok) {
          const data = await response.json();
          setArtifacts(data);
        }
      } catch (error) {
        console.error('Failed to fetch artifacts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtifacts();
  }, [isAuthenticated]);

  const handleTogglePin = async (id: string) => {
    try {
      const response = await fetch('/api/apps/growth-tools/artifacts', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        const { pinned } = await response.json();
        setArtifacts(prev =>
          prev.map(a => (a.id === id ? { ...a, pinned } : a))
        );
      }
    } catch (error) {
      console.error('Failed to toggle pin:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch('/api/apps/growth-tools/artifacts', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        setArtifacts(prev => prev.filter(a => a.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete artifact:', error);
    }
  };

  const pinnedArtifacts = artifacts.filter(a => a.pinned);
  const allArtifacts = artifacts;

  if (!isAuthenticated) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Your saved insights and visualizations from Growth Tools exercises
          </p>
        </motion.div>

        {/* Demo artifacts grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DEMO_ARTIFACTS.map(artifact => (
              <DemoArtifactCard key={artifact.id} artifact={artifact} />
            ))}
          </div>
        </motion.div>

        {/* Sign in CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center"
        >
          <div className="relative p-6 rounded-xl border-2 border-dashed border-muted-foreground/30 bg-card/50 text-center max-w-md">
            <Lock className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Sign in to save your insights</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete exercises and your charts, quotes, and insights will be saved here automatically.
            </p>
            <Button onClick={() => signIn()} className="gap-2">
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Loading your artifacts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Your saved insights and visualizations from Growth Tools exercises
        </p>
      </motion.div>

      {/* Pinned Section */}
      {pinnedArtifacts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="space-y-4"
        >
          <div className="flex items-center gap-2">
            <Pin className="h-4 w-4" />
            <h2 className="text-lg font-semibold">Pinned</h2>
          </div>
          <div className="grid grid-cols-1 gap-6">
            {pinnedArtifacts.map(artifact => (
              artifact.type === 'needs-chart' ? (
                <NeedsChart
                  key={artifact.id}
                  data={JSON.parse(artifact.data) as ShowNeedsChartArgs}
                  variant="compact"
                  isPinned={artifact.pinned}
                  onTogglePin={() => handleTogglePin(artifact.id)}
                  onDelete={() => handleDelete(artifact.id)}
                />
              ) : (
                <ArtifactCard
                  key={artifact.id}
                  artifact={artifact}
                  onTogglePin={handleTogglePin}
                  onDelete={handleDelete}
                />
              )
            ))}
          </div>
        </motion.div>
      )}

      {/* All Artifacts Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="space-y-4"
      >
        <h2 className="text-lg font-semibold">All Artifacts</h2>
        {allArtifacts.length === 0 ? (
          <div className="space-y-6">
            {/* Skeleton placeholders */}
            <div className="grid grid-cols-1 gap-6">
              <SkeletonArtifactCard />
            </div>

            {/* Empty state message */}
            <div className="text-center py-4">
              <p className="text-muted-foreground text-sm mb-4">
                Complete exercises to generate insights. Charts and quotes will appear here automatically.
              </p>
              <Button
                variant="outline"
                onClick={() => router.push('/apps/growth-tools')}
                className="gap-2"
              >
                Start an Exercise
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {allArtifacts.map(artifact => (
              artifact.type === 'needs-chart' ? (
                <NeedsChart
                  key={artifact.id}
                  data={JSON.parse(artifact.data) as ShowNeedsChartArgs}
                  variant="compact"
                  isPinned={artifact.pinned}
                  onTogglePin={() => handleTogglePin(artifact.id)}
                  onDelete={() => handleDelete(artifact.id)}
                />
              ) : (
                <ArtifactCard
                  key={artifact.id}
                  artifact={artifact}
                  onTogglePin={handleTogglePin}
                  onDelete={handleDelete}
                />
              )
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
