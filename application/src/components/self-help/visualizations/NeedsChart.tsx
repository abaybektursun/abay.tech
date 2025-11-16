'use client';

import { Button } from '@/components/ui/button';
import type { ShowNeedsChartArgs } from '@/lib/self-help/types';
import { XIcon } from 'lucide-react';
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

interface NeedsChartProps {
  data: ShowNeedsChartArgs;
  onClose?: () => void;
}

export function NeedsChart({ data, onClose }: NeedsChartProps) {

  // Debug: log the data being passed
  console.log('NeedsChart received data:', data);

  // Transform needs data for Recharts
  const chartData = data.needs.map((need) => ({
    need: need.name,
    fulfilled: need.fulfilled,
    importance: need.importance,
    category: need.category,
  }));

  console.log('Transformed chart data:', chartData);

  // Get unique categories for color coding
  const categories = Array.from(new Set(data.needs.map((n) => n.category)));
  const categoryColors: Record<string, string> = {
    physical: 'hsl(var(--chart-1))',
    emotional: 'hsl(var(--chart-2))',
    mental: 'hsl(var(--chart-3))',
    spiritual: 'hsl(var(--chart-4))',
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="font-semibold text-lg">Your Needs Assessment</h2>
          <p className="text-muted-foreground text-sm">
            {data.needs.length} needs across {categories.length} categories
          </p>
        </div>
        {onClose && (
          <Button
            onClick={onClose}
            size="icon"
            variant="ghost"
          >
            <XIcon className="size-4" />
            <span className="sr-only">Close visualization</span>
          </Button>
        )}
      </div>

      {/* Chart */}
      <div className="h-[350px] flex-shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData}>
            <PolarGrid gridType="polygon" stroke="hsl(var(--border))" />
            <PolarAngleAxis
              dataKey="need"
              style={{
                fontSize: '12px',
                fill: 'hsl(var(--muted-foreground))',
              }}
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              style={{
                fontSize: '10px',
                fill: 'hsl(var(--muted-foreground))',
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
                  <div className="rounded-lg border bg-background p-3 shadow-md">
                    <p className="mb-2 font-medium">{data.need}</p>
                    <div className="space-y-1 text-sm">
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

      {/* Insights & Legend Container */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Insights */}
        {data.insights && data.insights.length > 0 && (
          <div className="flex-1 overflow-y-auto mt-4 space-y-3 border-t pt-4">
            <h3 className="font-medium text-sm">Key Insights</h3>
            <ul className="space-y-2">
              {data.insights.map((insight, index) => (
                <li key={index} className="text-muted-foreground text-sm">
                  <span className="mr-2">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 border-t pt-4 text-sm flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-primary" />
            <span className="text-muted-foreground">Fulfilled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-secondary" />
            <span className="text-muted-foreground">Importance</span>
          </div>
        </div>
      </div>
    </div>
  );
}
