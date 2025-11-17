'use client';

import type { ShowNeedsChartArgs } from '@/lib/growth-tools/types';
import { Download, Share2, X } from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Artifact,
  ArtifactHeader,
  ArtifactTitle,
  ArtifactDescription,
  ArtifactContent,
  ArtifactActions,
  ArtifactAction,
  ArtifactClose,
} from '@/components/ai-elements/artifact';
import { cn } from '@/lib/utils';

interface NeedsChartProps {
  data: ShowNeedsChartArgs;
  onClose?: () => void;
}

export function NeedsChart({ data, onClose }: NeedsChartProps) {
  // Transform needs data for Recharts
  const chartData = data.needs.map((need) => ({
    need: need.name,
    fulfilled: need.fulfilled,
    importance: need.importance,
    category: need.category,
  }));

  // Get unique categories for color coding
  const categories = Array.from(new Set(data.needs.map((n) => n.category)));
  const categoryColors: Record<string, string> = {
    physical: 'hsl(var(--chart-1))',
    emotional: 'hsl(var(--chart-2))',
    mental: 'hsl(var(--chart-3))',
    spiritual: 'hsl(var(--chart-4))',
  };

  // Export functionality
  const handleExport = () => {
    // Export chart data as JSON
    const exportData = {
      date: new Date().toISOString(),
      needs: data.needs,
      insights: data.insights,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `needs-assessment-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const handleShare = () => {
    // Share functionality (could be expanded)
    if (navigator.share) {
      navigator.share({
        title: 'My Needs Assessment',
        text: `I completed a needs assessment. Key insights: ${data.insights[0]}`,
      });
    }
  };

  return (
    <Artifact className="h-full">
      <ArtifactHeader>
        <div>
          <ArtifactTitle>Your Needs Assessment</ArtifactTitle>
          <ArtifactDescription>
            {data.needs.length} needs across {categories.length} categories
          </ArtifactDescription>
        </div>
        <ArtifactActions>
          <ArtifactAction
            tooltip="Export data"
            label="Export"
            onClick={handleExport}
          >
            <Download className="h-4 w-4" />
          </ArtifactAction>
          <ArtifactAction
            tooltip="Share results"
            label="Share"
            onClick={handleShare}
          >
            <Share2 className="h-4 w-4" />
          </ArtifactAction>
          {onClose && (
            <ArtifactClose onClick={onClose} />
          )}
        </ArtifactActions>
      </ArtifactHeader>

      <ArtifactContent className="flex flex-col">
        {/* Chart - Responsive heights */}
        <div className={cn(
          "relative flex-shrink-0",
          "h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]",
          "px-2 sm:px-4"
        )}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={chartData}>
              <PolarGrid gridType="polygon" stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="need"
                className="text-[10px] sm:text-xs"
                tick={{
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: '10px',
                }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                className="text-[10px]"
                tick={{
                  fill: 'hsl(var(--muted-foreground))',
                  fontSize: '10px',
                }}
              />
              <Radar
                dataKey="fulfilled"
                fill="hsl(var(--primary))"
                fillOpacity={0.5}
                name="Fulfilled"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
              <Radar
                dataKey="importance"
                fill="hsl(var(--secondary))"
                fillOpacity={0.3}
                name="Importance"
                stroke="hsl(var(--secondary))"
                strokeWidth={2}
              />
              <Tooltip
                content={({ payload }) => {
                  if (!payload || payload.length === 0) return null;
                  const data = payload[0]?.payload;
                  return (
                    <div className="rounded-lg border bg-background p-2 sm:p-3 shadow-md">
                      <p className="mb-1 sm:mb-2 font-medium text-sm">{data.need}</p>
                      <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm">
                        <p>
                          <span className="text-muted-foreground">
                            Fulfilled:{' '}
                          </span>
                          <span className="font-medium">{data.fulfilled}%</span>
                        </p>
                        <p>
                          <span className="text-muted-foreground">
                            Importance:{' '}
                          </span>
                          <span className="font-medium">{data.importance}%</span>
                        </p>
                        <p className="capitalize text-muted-foreground text-xs">
                          {data.category}
                        </p>
                      </div>
                    </div>
                  );
                }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Insights - Responsive text sizes */}
        {data.insights && data.insights.length > 0 && (
          <div className="flex-1 overflow-y-auto mt-4 px-2 sm:px-4">
            <h3 className="font-medium text-sm sm:text-base mb-3">Key Insights</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {data.insights.map((insight, index) => (
                <li key={index} className="text-xs sm:text-sm text-muted-foreground flex">
                  <span className="mr-2 text-primary">•</span>
                  <span className="leading-relaxed">{insight}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Legend - Responsive */}
        <div className="mt-4 flex items-center gap-3 sm:gap-4 border-t pt-3 sm:pt-4 px-2 sm:px-4 text-xs sm:text-sm flex-shrink-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Fulfilled</span>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <div className="h-2.5 w-2.5 sm:h-3 sm:w-3 rounded-full bg-secondary" />
            <span className="text-muted-foreground">Importance</span>
          </div>
        </div>
      </ArtifactContent>
    </Artifact>
  );
}