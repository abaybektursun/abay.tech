'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Pin, PinOff, Trash2, BarChart2, Quote, Lightbulb, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Artifact } from '@/lib/artifacts';

// Icon mapping for artifact types
const artifactIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'needs-chart': BarChart2,
  'quote': Quote,
  'insight': Lightbulb,
  'action-plan': FileText,
};

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
      className="relative p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
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

      {/* Render artifact preview based on type */}
      <div className="mt-3 text-xs text-muted-foreground">
        {artifact.type === 'needs-chart' && data.needs && (
          <div className="space-y-1">
            {data.needs.slice(0, 3).map((need: any, i: number) => (
              <div key={i} className="flex justify-between">
                <span>{need.name}</span>
                <span>{need.fulfilled}%</span>
              </div>
            ))}
            {data.needs.length > 3 && (
              <span className="text-muted-foreground">+{data.needs.length - 3} more</span>
            )}
          </div>
        )}
        {artifact.type === 'quote' && (
          <p className="italic line-clamp-2">&ldquo;{data.text}&rdquo;</p>
        )}
        {artifact.type === 'insight' && (
          <p className="line-clamp-2">{data.text}</p>
        )}
      </div>

      <div className="mt-2 text-xs text-muted-foreground">
        {new Date(artifact.createdAt).toLocaleDateString()}
      </div>
    </motion.div>
  );
}

export function Dashboard() {
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Sign in to view your saved artifacts</p>
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pinnedArtifacts.map(artifact => (
              <ArtifactCard
                key={artifact.id}
                artifact={artifact}
                onTogglePin={handleTogglePin}
                onDelete={handleDelete}
              />
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
          <p className="text-muted-foreground text-sm">
            No artifacts yet. Complete exercises to generate insights and visualizations.
          </p>
        ) : (
          <ScrollArea className="h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
              {allArtifacts.map(artifact => (
                <ArtifactCard
                  key={artifact.id}
                  artifact={artifact}
                  onTogglePin={handleTogglePin}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </ScrollArea>
        )}
      </motion.div>
    </div>
  );
}
