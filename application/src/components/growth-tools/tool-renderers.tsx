'use client';

import { Loader } from '@/components/ai-elements/loader';
import { Shimmer } from '@/components/ai-elements/shimmer';
import {
  Artifact,
  ArtifactHeader,
  ArtifactTitle,
  ArtifactDescription,
  ArtifactContent,
} from '@/components/ai-elements/artifact';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { BarChart2, ExternalLink, Quote, Check } from 'lucide-react';
import type { ShowLifeWheelArgs, RequestSliderArgs, SliderField, SaveQuoteArgs } from '@/lib/growth-tools/types';
import { LifeWheel } from '@/components/growth-tools/visualizations/NeedsChart';

interface ToolPartRenderOptions {
  /** If true, interactive elements (sliders, buttons) are disabled */
  readOnly?: boolean;
  /** For sliders: current values by toolCallId */
  sliderValues?: Record<string, Record<string, number>>;
  /** For sliders: callback when values change */
  onSliderChange?: (toolCallId: string, fieldName: string, value: number) => void;
  /** For sliders: callback when submitted */
  onSliderSubmit?: (toolCallId: string, fields: SliderField[], values: Record<string, number>) => void;
  /** For life wheel: callback to open full view */
  onLifeWheelClick?: (data: ShowLifeWheelArgs) => void;
  /** Set of already-handled tool call IDs */
  handledToolCalls?: Set<string>;
  /** Is parent component in loading state */
  isLoading?: boolean;
}

export function renderToolPart(part: any, options: ToolPartRenderOptions = {}) {
  const toolName = part.type.replace('tool-', '');
  const { toolCallId, state, input } = part;
  const {
    readOnly = false,
    sliderValues = {},
    onSliderChange,
    onSliderSubmit,
    onLifeWheelClick,
    handledToolCalls = new Set(),
    isLoading = false,
  } = options;

  // show_life_wheel tool
  if (toolName === 'show_life_wheel') {
    const isComplete = state === 'output-available';
    const wheelData = input as ShowLifeWheelArgs;

    if (isComplete) {
      // In readOnly mode or no click handler, show static compact view
      if (readOnly || !onLifeWheelClick) {
        return (
          <div className="mt-3 max-w-md">
            <LifeWheel data={wheelData} variant="compact" />
          </div>
        );
      }

      // Interactive mode - clickable card
      return (
        <div className="mt-3 max-w-sm">
          <Artifact
            className="cursor-pointer hover:border-primary/50 hover:shadow-md transition-all"
            onClick={() => onLifeWheelClick(wheelData)}
          >
            <ArtifactHeader className="py-2 px-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="h-4 w-4 text-primary" />
                <ArtifactTitle>6 Human Needs</ArtifactTitle>
              </div>
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </ArtifactHeader>
            <ArtifactContent className="py-2 px-3">
              <ArtifactDescription>
                {wheelData.areas.length} needs assessed • Click to view
              </ArtifactDescription>
            </ArtifactContent>
          </Artifact>
        </div>
      );
    }

    return (
      <div className="mt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-md text-xs text-muted-foreground">
          <Loader size={12} />
          <Shimmer>Generating life wheel...</Shimmer>
        </div>
      </div>
    );
  }

  // request_slider tool
  if (toolName === 'request_slider') {
    const isComplete = state === 'output-available';
    const sliderData = input as RequestSliderArgs;
    const isSubmitted = handledToolCalls.has(toolCallId);
    const toolValues = sliderValues[toolCallId] ?? {};

    if (isComplete) {
      return (
        <div className="mt-3 w-full max-w-md">
          <Artifact>
            <ArtifactContent className="p-4 space-y-4">
              <p className="text-sm font-medium">{sliderData.question}</p>
              <div className="space-y-4">
                {sliderData.fields.map((field) => {
                  const min = field.min ?? 0;
                  const max = field.max ?? 100;
                  const step = field.step ?? 1;
                  const currentValue = toolValues[field.name] ?? field.defaultValue ?? Math.round((min + max) / 2);

                  return (
                    <div key={field.name} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">{field.name}</span>
                        <span className="text-sm font-medium">{currentValue}</span>
                      </div>
                      <Slider
                        className="cursor-pointer"
                        value={[currentValue]}
                        min={min}
                        max={max}
                        step={step}
                        disabled={readOnly || isSubmitted || isLoading}
                        onValueChange={([value]) => {
                          if (!readOnly && onSliderChange) {
                            onSliderChange(toolCallId, field.name, value);
                          }
                        }}
                      />
                      {field.labels && (
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{field.labels[0]}</span>
                          <span>{field.labels[1]}</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {!readOnly && !isSubmitted && onSliderSubmit && (
                <Button
                  size="sm"
                  className="w-full"
                  disabled={isLoading}
                  onClick={() => onSliderSubmit(toolCallId, sliderData.fields, toolValues)}
                >
                  Submit
                </Button>
              )}
              {(readOnly || isSubmitted) && (
                <p className="text-xs text-muted-foreground text-center">Submitted</p>
              )}
            </ArtifactContent>
          </Artifact>
        </div>
      );
    }

    return (
      <div className="mt-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-muted rounded-md text-xs text-muted-foreground">
          <Loader size={12} />
          <Shimmer>Preparing question...</Shimmer>
        </div>
      </div>
    );
  }

  // save_quote tool
  if (toolName === 'save_quote') {
    const isComplete = state === 'output-available';
    const quoteData = input as SaveQuoteArgs;

    return (
      <div className="mt-3 max-w-sm">
        <Artifact>
          <ArtifactHeader className="py-2 px-3">
            <div className="flex items-center gap-2">
              <Quote className="h-4 w-4 text-primary" />
              <ArtifactTitle>Saved Quote</ArtifactTitle>
            </div>
            {isComplete && <Check className="h-4 w-4 text-green-500" />}
          </ArtifactHeader>
          <ArtifactContent className="py-2 px-3">
            <blockquote className="italic text-sm border-l-2 border-primary/30 pl-3">
              "{quoteData.quote}"
            </blockquote>
            {quoteData.source && (
              <p className="text-xs text-muted-foreground mt-2">— {quoteData.source}</p>
            )}
            {quoteData.context && (
              <p className="text-xs text-muted-foreground/70 mt-1 italic">{quoteData.context}</p>
            )}
          </ArtifactContent>
        </Artifact>
      </div>
    );
  }

  // Unknown tools - don't render
  return null;
}
