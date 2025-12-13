'use client';

/**
 * Life Wheel Visualization - Tony Robbins' 6 Human Needs
 *
 * Uses Recharts RadialBarChart to create a beautiful concentric rings visualization
 * showing fulfillment levels across the 6 Human Needs framework.
 *
 * The 6 Human Needs:
 * 1. Certainty - safety, stability, comfort
 * 2. Variety - novelty, change, challenge
 * 3. Significance - feeling unique, important
 * 4. Connection/Love - closeness, belonging
 * 5. Growth - expansion, development (Need of the Spirit)
 * 6. Contribution - service, helping others (Need of the Spirit)
 *
 * Built on existing components:
 * - Recharts RadialBarChart, RadialBar, Legend, PolarAngleAxis
 * - shadcn/ui ChartContainer, ChartTooltip
 * - AI Elements Artifact component
 */

import { Download, Share2 } from 'lucide-react';
import {
  RadialBarChart,
  RadialBar,
  Legend,
  PolarAngleAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
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
import type { LifeWheelCategory, ShowLifeWheelArgs } from '@/lib/growth-tools/types';

interface LifeWheelProps {
  data: ShowLifeWheelArgs;
  variant?: 'full' | 'compact';
  onClose?: () => void;
  isPinned?: boolean;
  onTogglePin?: () => void;
  onDelete?: () => void;
}

// Color palette for the 6 Human Needs
// First 4 = Needs of Personality (warmer tones)
// Last 2 = Needs of Spirit (cooler, elevated tones)
const categoryColors: Record<LifeWheelCategory, string> = {
  'certainty': 'hsl(25 95% 53%)',      // Orange - stability, grounding
  'variety': 'hsl(280 65% 60%)',       // Purple - excitement, novelty
  'significance': 'hsl(45 93% 47%)',   // Gold - importance, worth
  'connection': 'hsl(350 80% 60%)',    // Rose - love, warmth
  'growth': 'hsl(200 80% 50%)',        // Blue - expansion, spirit
  'contribution': 'hsl(160 70% 45%)',  // Teal - giving, transcendence
};

// Human-readable labels with descriptions
const categoryLabels: Record<LifeWheelCategory, string> = {
  'certainty': 'Certainty',
  'variety': 'Variety',
  'significance': 'Significance',
  'connection': 'Connection',
  'growth': 'Growth',
  'contribution': 'Contribution',
};

// Short descriptions for tooltips
const categoryDescriptions: Record<LifeWheelCategory, string> = {
  'certainty': 'Safety, stability, comfort',
  'variety': 'Novelty, change, challenge',
  'significance': 'Feeling unique & important',
  'connection': 'Love, belonging, intimacy',
  'growth': 'Expansion & development',
  'contribution': 'Service & giving to others',
};

export function LifeWheel({
  data,
  variant = 'full',
  onClose,
  isPinned,
  onTogglePin,
  onDelete,
}: LifeWheelProps) {
  const isCompact = variant === 'compact';

  // Transform data for RadialBarChart - sorted by score for visual clarity
  const chartData = data.areas
    .map((area) => ({
      name: area.label || categoryLabels[area.category] || area.category,
      category: area.category,
      score: area.score,
      description: categoryDescriptions[area.category],
      fill: categoryColors[area.category] || 'hsl(var(--primary))',
      fullMark: 10,
    }))
    .sort((a, b) => b.score - a.score); // Largest on outside

  // Calculate overall score if not provided
  const overallScore = data.overallScore ??
    Math.round((data.areas.reduce((sum, a) => sum + a.score, 0) / data.areas.length) * 10) / 10;

  // Chart configuration for shadcn
  const chartConfig: ChartConfig = chartData.reduce((acc, item) => {
    acc[item.category] = {
      label: item.name,
      color: item.fill,
    };
    return acc;
  }, {} as ChartConfig);

  const handleExport = () => {
    const exportData = {
      date: new Date().toISOString(),
      framework: 'Tony Robbins 6 Human Needs',
      areas: data.areas,
      insights: data.insights,
      overallScore,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `6-human-needs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: 'My 6 Human Needs Assessment',
        text: `Overall fulfillment: ${overallScore}/10. ${data.insights[0] || ''}`,
      });
    }
  };

  // Custom legend renderer with need descriptions
  const renderLegend = (props: any) => {
    const { payload } = props;
    return (
      <ul className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs mt-3 px-2">
        {payload?.map((entry: any, index: number) => (
          <li key={`legend-${index}`} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-muted-foreground">
              {entry.value}: <span className="font-semibold text-foreground">{entry.payload?.score}/10</span>
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Artifact className="h-full shadow-2xl border-0 bg-background/95 backdrop-blur-sm">
      <ArtifactHeader>
        <div>
          <ArtifactTitle>6 Human Needs Assessment</ArtifactTitle>
          <ArtifactDescription>
            Overall Fulfillment: <span className="font-semibold text-foreground">{overallScore}/10</span>
          </ArtifactDescription>
        </div>
        <ArtifactActions>
          {onTogglePin && (
            <ArtifactPinAction
              isPinned={isPinned}
              onClick={onTogglePin}
              tooltip={isPinned ? 'Unpin' : 'Pin'}
            />
          )}
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
          {onDelete && (
            <ArtifactDeleteAction onClick={onDelete} tooltip="Delete" />
          )}
          {onClose && <ArtifactClose onClick={onClose} />}
        </ArtifactActions>
      </ArtifactHeader>

      <ArtifactContent className="flex flex-col">
        {/* Radial Bar Chart */}
        <ChartContainer
          config={chartConfig}
          className={cn(
            'relative flex-shrink-0 mx-auto',
            isCompact
              ? 'h-[200px] w-[200px] sm:h-[240px] sm:w-[240px]'
              : 'h-[280px] w-[280px] sm:h-[340px] sm:w-[340px] md:h-[380px] md:w-[380px]'
          )}
        >
          <RadialBarChart
            data={chartData}
            innerRadius={isCompact ? '30%' : '25%'}
            outerRadius={isCompact ? '90%' : '85%'}
            startAngle={90}
            endAngle={-270}
            cx="50%"
            cy="50%"
          >
            <PolarAngleAxis
              type="number"
              domain={[0, 10]}
              angleAxisId={0}
              tick={false}
            />
            <RadialBar
              background={{ fill: 'hsl(var(--muted))' }}
              dataKey="score"
              cornerRadius={6}
              label={
                isCompact
                  ? false
                  : {
                      position: 'insideStart',
                      fill: '#fff',
                      fontSize: 11,
                      fontWeight: 600,
                    }
              }
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name, item) => (
                    <div className="space-y-1">
                      <p className="font-semibold text-sm">{item.payload.name}</p>
                      <p className="text-xs text-muted-foreground">{item.payload.description}</p>
                      <p className="text-xs">
                        Fulfillment: <span className="font-bold">{value}/10</span>
                      </p>
                    </div>
                  )}
                />
              }
            />
            {!isCompact && (
              <Legend
                content={renderLegend}
                verticalAlign="bottom"
              />
            )}
            {/* Center label showing overall score */}
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground"
            >
              <tspan
                x="50%"
                dy="-0.5em"
                className="text-2xl sm:text-3xl font-bold"
              >
                {overallScore}
              </tspan>
              <tspan
                x="50%"
                dy="1.6em"
                className="text-[10px] sm:text-xs fill-muted-foreground"
              >
                /10 Fulfilled
              </tspan>
            </text>
          </RadialBarChart>
        </ChartContainer>

        {/* Compact legend for small variant */}
        {isCompact && (
          <div className="flex flex-wrap justify-center gap-2 mt-2 px-2">
            {chartData.map((item) => (
              <div key={item.category} className="flex items-center gap-1 text-xs">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: item.fill }}
                />
                <span className="text-muted-foreground truncate max-w-[70px]">
                  {item.name}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Insights */}
        {data.insights && data.insights.length > 0 && (
          <div className="flex-1 overflow-y-auto mt-4 px-2 sm:px-4">
            <h3 className="font-medium text-sm sm:text-base mb-3">Key Insights</h3>
            <ul className="space-y-1.5 sm:space-y-2">
              {(isCompact ? data.insights.slice(0, 2) : data.insights).map(
                (insight, index) => (
                  <li
                    key={index}
                    className="text-xs sm:text-sm text-muted-foreground flex"
                  >
                    <span className="mr-2 text-primary">•</span>
                    <span className={cn('leading-relaxed', isCompact && 'line-clamp-2')}>
                      {insight}
                    </span>
                  </li>
                )
              )}
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
