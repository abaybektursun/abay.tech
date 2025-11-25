'use client';

import type { ShowNeedsChartArgs } from '@/lib/growth-tools/types';
import { Download, Share2, X } from 'lucide-react';
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

  // Chart configuration for Shadcn UI
  const chartConfig = {
    fulfilled: {
      label: 'Fulfilled',
      color: 'hsl(var(--primary))',
    },
    importance: {
      label: 'Importance',
      color: 'hsl(var(--secondary))',
    },
  } satisfies ChartConfig;

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
        <ChartContainer
          config={chartConfig}
          className={cn(
            "relative flex-shrink-0",
            "h-[250px] sm:h-[300px] md:h-[350px] lg:h-[400px]",
            "px-2 sm:px-4",
            "w-full"
          )}
        >
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
              fill="var(--color-fulfilled)"
              fillOpacity={0.5}
              name="Fulfilled"
              stroke="var(--color-fulfilled)"
              strokeWidth={2}
            />
            <Radar
              dataKey="importance"
              fill="var(--color-importance)"
              fillOpacity={0.3}
              name="Importance"
              stroke="var(--color-importance)"
              strokeWidth={2}
            />
            <ChartTooltip
              content={<ChartTooltipContent
                indicator="dot"
                formatter={(value, name, item) => {
                  const data = item.payload;
                  return (
                    <div className="space-y-0.5">
                      <p className="font-medium text-sm">{data.need}</p>
                      <div className="text-xs">
                        <span className="text-muted-foreground">
                          {name}: {' '}
                        </span>
                        <span className="font-medium">{value}%</span>
                      </div>
                      <p className="capitalize text-muted-foreground text-xs">
                        {data.category}
                      </p>
                    </div>
                  );
                }}
              />}
            />
            <ChartLegend
              verticalAlign="bottom"
              content={<ChartLegendContent />}
            />
          </RadarChart>
        </ChartContainer>

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
      </ArtifactContent>
    </Artifact>
  );
}