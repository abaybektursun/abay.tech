'use client';

import type { ShowNeedsChartArgs, ShowLifeWheelArgs } from '@/lib/growth-tools/types';
import { Download, Share2 } from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';
import {
  Artifact,
  ArtifactHeader,
  ArtifactTitle,
  ArtifactDescription,
  ArtifactContent,
  ArtifactActions,
  ArtifactAction,
  ArtifactClose,
  ArtifactPinAction,
  ArtifactDeleteAction,
} from '@/components/ai-elements/artifact';
import { cn } from '@/lib/utils';

// Union type to accept both data formats
type ChartData = ShowNeedsChartArgs | ShowLifeWheelArgs;

// Type guard to detect format
function isLifeWheelData(data: ChartData): data is ShowLifeWheelArgs {
  return 'areas' in data;
}

interface NeedsChartProps {
  data: ChartData;
  variant?: 'full' | 'compact';
  onClose?: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
  onDelete?: () => void;
}

export function NeedsChart({
  data,
  variant = 'full',
  onClose,
  isPinned,
  onTogglePin,
  onDelete,
}: NeedsChartProps) {
  const isCompact = variant === 'compact';
  const isLifeWheel = isLifeWheelData(data);

  // Transform data for RadarChart based on format
  const chartData = isLifeWheel
    ? data.areas.map((area) => ({
        name: area.label,
        score: area.score * 10, // Convert 0-10 to 0-100 for chart
        category: area.category,
      }))
    : data.needs.map((need) => ({
        name: need.name,
        fulfilled: need.fulfilled,
        importance: need.importance,
        category: need.category,
      }));

  // Chart configuration based on format
  const chartConfig: ChartConfig = isLifeWheel
    ? {
        score: {
          label: 'Fulfillment',
          color: 'hsl(var(--chart-1))',
        },
      }
    : {
        fulfilled: {
          label: 'Fulfilled',
          color: 'hsl(var(--chart-1))',
        },
        importance: {
          label: 'Importance',
          color: 'hsl(var(--chart-2))',
        },
      };

  // Title and description based on format
  const title = isLifeWheel ? '6 Human Needs Assessment' : 'Your Needs Assessment';
  const description = isLifeWheel
    ? `Overall: ${data.overallScore ?? Math.round(data.areas.reduce((s, a) => s + a.score, 0) / data.areas.length)}/10`
    : `${data.needs.length} needs analyzed`;

  const handleExport = () => {
    const exportData = {
      date: new Date().toISOString(),
      ...(isLifeWheel ? { areas: data.areas } : { needs: data.needs }),
      insights: data.insights,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${isLifeWheel ? '6-human-needs' : 'needs-assessment'}-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title,
        text: `${description}. ${data.insights[0] || ''}`,
      });
    }
  };

  return (
    <Artifact className="h-full shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
      <ArtifactHeader>
        <div>
          <ArtifactTitle>{title}</ArtifactTitle>
          <ArtifactDescription>{description}</ArtifactDescription>
        </div>
        <ArtifactActions>
          {onTogglePin && (
            <ArtifactPinAction
              isPinned={isPinned}
              onClick={onTogglePin}
              tooltip={isPinned ? 'Unpin' : 'Pin'}
            />
          )}
          <ArtifactAction tooltip="Export data" label="Export" onClick={handleExport}>
            <Download className="h-4 w-4" />
          </ArtifactAction>
          <ArtifactAction tooltip="Share results" label="Share" onClick={handleShare}>
            <Share2 className="h-4 w-4" />
          </ArtifactAction>
          {onDelete && <ArtifactDeleteAction onClick={onDelete} tooltip="Delete" />}
          {onClose && <ArtifactClose onClick={onClose} />}
        </ArtifactActions>
      </ArtifactHeader>

      <ArtifactContent className="flex flex-col">
        <ChartContainer
          config={chartConfig}
          className={cn(
            'relative flex-shrink-0 w-full px-2 sm:px-4',
            isCompact ? 'h-[180px] sm:h-[200px]' : 'h-[250px] sm:h-[300px] md:h-[350px]'
          )}
        >
          <RadarChart data={chartData}>
            <PolarGrid gridType="polygon" stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="name"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
            />
            {isLifeWheel ? (
              <Radar
                dataKey="score"
                fill="var(--color-score)"
                fillOpacity={0.5}
                stroke="var(--color-score)"
                strokeWidth={2}
              />
            ) : (
              <>
                <Radar
                  dataKey="fulfilled"
                  fill="var(--color-fulfilled)"
                  fillOpacity={0.5}
                  stroke="var(--color-fulfilled)"
                  strokeWidth={2}
                />
                <Radar
                  dataKey="importance"
                  fill="var(--color-importance)"
                  fillOpacity={0.3}
                  stroke="var(--color-importance)"
                  strokeWidth={2}
                />
              </>
            )}
            <ChartTooltip content={<ChartTooltipContent indicator="dot" />} />
            <ChartLegend verticalAlign="bottom" content={<ChartLegendContent />} />
          </RadarChart>
        </ChartContainer>

        {data.insights?.length > 0 && (
          <div className="flex-1 overflow-y-auto mt-4 px-2 sm:px-4">
            <h3 className="font-medium text-sm sm:text-base mb-3">Key Insights</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {(isCompact ? data.insights.slice(0, 2) : data.insights).map((insight, i) => (
                <li key={i} className="text-xs sm:text-sm text-muted-foreground flex">
                  <span className="mr-2 text-primary">•</span>
                  <span className={cn('leading-relaxed', isCompact && 'line-clamp-2')}>{insight}</span>
                </li>
              ))}
              {isCompact && data.insights.length > 2 && (
                <li className="text-xs text-muted-foreground/70 italic">
                  +{data.insights.length - 2} more insights
                </li>
              )}
            </ul>
          </div>
        )}
      </ArtifactContent>
    </Artifact>
  );
}

// Re-export as LifeWheel for backwards compatibility
export { NeedsChart as LifeWheel };
