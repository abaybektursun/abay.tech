'use client'

import * as React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  AI_PROVENANCE,
  EXECUTION_TIERS,
  PROSE_TIERS,
  provenanceLabel,
} from '@/lib/ai-provenance'
import { cn } from '@/lib/utils'

/**
 * Article eyebrow row: the eyebrow text on the left, the AI tag on the right.
 * The tag inherits the row's typography; clicking it opens the details popover.
 */
export function PostEyebrowWithProvenance({
  ai: slug,
  children,
  className,
}: {
  ai: string
  children: React.ReactNode
  className?: string
}) {
  const ai = AI_PROVENANCE[slug]
  if (!ai) throw new Error(`No AI provenance entry for post "${slug}"`)

  const axes = [
    { tier: EXECUTION_TIERS[ai.execution], axis: 'research & code' },
    { tier: PROSE_TIERS[ai.prose], axis: 'writing' },
  ]
  const handmade = ai.execution === 'manual' && ai.prose === 'human'

  return (
    <div
      className={cn(
        'mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-xs uppercase tracking-widest text-zinc-500',
        className
      )}
    >
      <div>{children}</div>

      <Popover>
        <PopoverTrigger className="group inline-flex items-center gap-1 rounded-sm uppercase transition-colors hover:text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300 data-[state=open]:text-zinc-900">
          <span className="sr-only">How AI was used: </span>
          {provenanceLabel(ai)}
          <svg
            width="8"
            height="8"
            viewBox="0 0 8 8"
            fill="none"
            aria-hidden
            className="transition-transform duration-200 group-data-[state=open]:rotate-180"
          >
            <path
              d="M2 3L4 5L6 3"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </PopoverTrigger>

        <PopoverContent
          align="end"
          sideOffset={8}
          collisionPadding={16}
          className="w-[calc(100vw-2rem)] sm:w-80 rounded-lg border-zinc-200 bg-white p-4 text-[13px] leading-relaxed text-zinc-600 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.15)]"
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-zinc-500">
            How this was made
          </p>

          <dl className="mt-3 space-y-3">
            {axes.map(({ tier, axis }) => (
              <div key={axis}>
                <dt className="font-medium text-zinc-900">
                  {tier.label} <span className="font-normal text-zinc-500">· {axis}</span>
                </dt>
                <dd>{tier.description}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-3 space-y-3 border-t border-zinc-100 pt-3">
            <p>{ai.summary}</p>
            <p>
              <span className="font-medium text-zinc-900">My role.</span> {ai.humanRole}
            </p>
            {!handmade && (
              <p className="font-mono text-[11px] text-zinc-500">Built with Claude Code</p>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
