'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Pin,
  PinOff,
  Trash2,
  BarChart2,
  Quote,
  Lightbulb,
  FileText,
  Lock,
  ArrowRight,
  GripVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Artifact } from '@/lib/artifacts';
import { NeedsChart, LifeWheel } from '@/components/growth-tools/visualizations/NeedsChart';
import type { ShowNeedsChartArgs, ShowLifeWheelArgs } from '@/lib/growth-tools/types';
import { cn } from '@/lib/utils';
import { DynamicGrid } from './DynamicGrid';

// Type for grid layout item
interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

// Icon mapping for artifact types
const artifactIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  'needs-chart': BarChart2,
  'life-wheel': BarChart2,
  quote: Quote,
  insight: Lightbulb,
  'action-plan': FileText,
};

// Layout storage key
const LAYOUT_KEY = 'growth-tools-dashboard-layout';

// Demo artifacts for unauthenticated users
const DEMO_ARTIFACTS = [
  {
    id: 'demo-1',
    type: 'life-wheel',
    title: '6 Human Needs Assessment',
    data: JSON.stringify({
      areas: [
        { category: 'certainty', label: 'Certainty', score: 7 },
        { category: 'variety', label: 'Variety', score: 5 },
        { category: 'significance', label: 'Significance', score: 8 },
        { category: 'connection', label: 'Connection', score: 6 },
        { category: 'growth', label: 'Growth', score: 4 },
        { category: 'contribution', label: 'Contribution', score: 5 },
      ],
      insights: ['Focus on Growth to unlock lasting fulfillment'],
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
    data: JSON.stringify({ text: "You tend to prioritize others' needs over your own rest." }),
    pinned: false,
    createdAt: Date.now() - 259200000,
  },
];

// Grid item wrapper with drag handle
function GridItem({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('h-full group relative', className)}>
      <div className="grid-drag-handle absolute top-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      {children}
    </div>
  );
}

// Artifact card for text-based artifacts
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
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm font-medium">{artifact.title}</CardTitle>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => onTogglePin(artifact.id)}
          >
            {artifact.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => onDelete(artifact.id)}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {artifact.type === 'quote' && (
          <p className="text-sm italic text-muted-foreground">&ldquo;{data.text}&rdquo;</p>
        )}
        {artifact.type === 'insight' && <p className="text-sm text-muted-foreground">{data.text}</p>}
        <p className="text-xs text-muted-foreground mt-2">
          {new Date(artifact.createdAt).toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}

// Demo card with blur
function DemoArtifactCard({ artifact }: { artifact: (typeof DEMO_ARTIFACTS)[0] }) {
  const Icon = artifactIcons[artifact.type] || FileText;
  const data = JSON.parse(artifact.data);

  return (
    <Card className="h-full opacity-60 blur-[0.5px]">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-muted-foreground" />
          <CardTitle className="text-sm">{artifact.title}</CardTitle>
        </div>
        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded">Demo</span>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">
        {artifact.type === 'life-wheel' && data.areas && (
          <div className="space-y-1">
            {data.areas.slice(0, 3).map((area: any, i: number) => (
              <div key={i} className="flex justify-between">
                <span>{area.label}</span>
                <span>{area.score}/10</span>
              </div>
            ))}
          </div>
        )}
        {artifact.type === 'quote' && <p className="italic">&ldquo;{data.text}&rdquo;</p>}
        {artifact.type === 'insight' && <p>{data.text}</p>}
      </CardContent>
    </Card>
  );
}

export function Dashboard() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [layouts, setLayouts] = useState<Record<string, LayoutItem[]>>({});

  const isAuthenticated = status === 'authenticated' && session?.user;

  // Load saved layouts from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(LAYOUT_KEY);
    if (saved) {
      try {
        setLayouts(JSON.parse(saved));
      } catch {
        // Ignore invalid JSON
      }
    }
  }, []);

  // Save layouts to localStorage
  const handleLayoutChange = (_: LayoutItem[], allLayouts: Record<string, LayoutItem[]>) => {
    setLayouts(allLayouts);
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(allLayouts));
  };

  // Generate default layout for artifacts
  const generateLayout = useMemo(() => {
    return artifacts.map((artifact, index) => {
      // Charts get larger default size
      const isChart = artifact.type === 'needs-chart' || artifact.type === 'life-wheel';
      return {
        i: artifact.id,
        x: (index % 2) * 6,
        y: Math.floor(index / 2) * (isChart ? 8 : 4),
        w: isChart ? 6 : 6,
        h: isChart ? 8 : 4,
        minW: isChart ? 4 : 3,
        minH: isChart ? 6 : 3,
      };
    });
  }, [artifacts]);

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
        setArtifacts((prev) => prev.map((a) => (a.id === id ? { ...a, pinned } : a)));
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
        setArtifacts((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete artifact:', error);
    }
  };

  // Unauthenticated view
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

        {/* Demo grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {DEMO_ARTIFACTS.map((artifact) => (
            <DemoArtifactCard key={artifact.id} artifact={artifact} />
          ))}
        </div>

        {/* Sign in CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex justify-center"
        >
          <Card className="max-w-md text-center p-6">
            <Lock className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <h3 className="font-semibold mb-2">Sign in to save your insights</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Complete exercises and your charts, quotes, and insights will be saved here
              automatically.
            </p>
            <Button onClick={() => signIn()} className="gap-2">
              Sign In
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Card>
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

  // Empty state
  if (artifacts.length === 0) {
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

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <BarChart2 className="h-8 w-8 text-muted-foreground" />
          </div>
          <h3 className="font-semibold mb-2">No artifacts yet</h3>
          <p className="text-sm text-muted-foreground mb-4 max-w-sm">
            Complete exercises to generate insights. Charts and quotes will appear here
            automatically.
          </p>
          <Button onClick={() => router.push('/apps/growth-tools')} className="gap-2">
            Start an Exercise
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Drag to rearrange, resize from corners. Your layout is saved automatically.
        </p>
      </motion.div>

      <DynamicGrid
        layouts={Object.keys(layouts).length > 0 ? layouts : { lg: generateLayout }}
        onLayoutChange={handleLayoutChange}
      >
        {artifacts.map((artifact) => (
          <div key={artifact.id}>
            <GridItem>
              {artifact.type === 'needs-chart' ? (
                <NeedsChart
                  data={JSON.parse(artifact.data) as ShowNeedsChartArgs}
                  variant="compact"
                  isPinned={artifact.pinned}
                  onTogglePin={() => handleTogglePin(artifact.id)}
                  onDelete={() => handleDelete(artifact.id)}
                />
              ) : artifact.type === 'life-wheel' ? (
                <LifeWheel
                  data={JSON.parse(artifact.data) as ShowLifeWheelArgs}
                  variant="compact"
                  isPinned={artifact.pinned}
                  onTogglePin={() => handleTogglePin(artifact.id)}
                  onDelete={() => handleDelete(artifact.id)}
                />
              ) : (
                <ArtifactCard
                  artifact={artifact}
                  onTogglePin={handleTogglePin}
                  onDelete={handleDelete}
                />
              )}
            </GridItem>
          </div>
        ))}
      </DynamicGrid>
    </div>
  );
}
