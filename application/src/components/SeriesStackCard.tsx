'use client'

import { useMemo, useState } from 'react'
import { AnimatePresence, motion, type Variants } from 'framer-motion'
import type { Post, SeriesNode } from '@/lib/posts-types'
import { formatDateShort } from '@/lib/posts-types'
import PostCard from './PostCard'

const EASE = [0.23, 1, 0.32, 1] as const
const SHARED = { duration: 0.5, ease: EASE }

const ghost2Variants: Variants = {
  idle: { y: 12, x: 8, rotate: 1.5, opacity: 0.5, scale: 0.97 },
  hover: { y: 22, x: 28, rotate: 3, opacity: 0.85, scale: 0.97 },
  expanded: { y: 0, x: 0, rotate: 0, opacity: 0, scale: 1 },
}
const ghost1Variants: Variants = {
  idle: { y: 6, x: 4, rotate: 0.75, opacity: 0.75, scale: 0.985 },
  hover: { y: 12, x: 14, rotate: 1.5, opacity: 0.95, scale: 0.985 },
  expanded: { y: 0, x: 0, rotate: 0, opacity: 0, scale: 1 },
}
const headerVariants: Variants = {
  idle: { y: 0, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' },
  hover: { y: -2, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' },
  expanded: { y: 0, boxShadow: '0 6px 20px rgba(0,0,0,0.06)' },
}
const iconVariants: Variants = {
  idle: { rotate: 0, scale: 1 },
  hover: { rotate: 0, scale: 1.08 },
  expanded: { rotate: 45, scale: 1 },
}
const listVariants: Variants = {
  collapsed: { transition: { staggerChildren: 0.025, staggerDirection: -1 } },
  open: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
}
const listItemVariants: Variants = {
  collapsed: { opacity: 0, y: -6 },
  open: { opacity: 1, y: 0 },
}

type ChildItem =
  | { kind: 'post'; date: string; post: Post }
  | { kind: 'series'; date: string; node: SeriesNode }

export default function SeriesStackCard({ node }: { node: SeriesNode }) {
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [clipped, setClipped] = useState(true)
  const state = expanded ? 'expanded' : hovered ? 'hover' : 'idle'

  const children: ChildItem[] = useMemo(() => {
    const out: ChildItem[] = []
    for (const p of node.directPosts) out.push({ kind: 'post', date: p.date, post: p })
    for (const s of node.subSeries) out.push({ kind: 'series', date: s.latestDate, node: s })
    out.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    return out
  }, [node])

  const range =
    formatDateShort(node.earliestDate) === formatDateShort(node.latestDate)
      ? formatDateShort(node.latestDate)
      : `${formatDateShort(node.earliestDate)} – ${formatDateShort(node.latestDate)}`

  return (
    <motion.div
      initial={false}
      animate={state}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
    >
      <div className="px-6 pt-6 pb-8">
        <div className="relative">
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-lg bg-white border border-gray-200 pointer-events-none"
            style={{ transformOrigin: 'center bottom' }}
            variants={ghost2Variants}
            transition={SHARED}
          />
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-lg bg-white border border-gray-200 pointer-events-none"
            style={{ transformOrigin: 'center bottom' }}
            variants={ghost1Variants}
            transition={SHARED}
          />
          <motion.button
            type="button"
            onClick={() => setExpanded(v => !v)}
            aria-expanded={expanded}
            variants={headerVariants}
            transition={SHARED}
            className="relative w-full text-left rounded-lg bg-white border border-gray-200 px-6 py-8 cursor-pointer transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            <div className="flex items-start justify-between gap-6">
              <div className="flex-1 space-y-3">
                <h2 className="font-semibold text-xl text-gray-900">{node.meta.label}</h2>
                <p className="text-base text-gray-600">{node.meta.blurb}</p>
                <div className="text-sm text-gray-500">
                  {node.totalCount} posts · {range}
                </div>
              </div>
              <motion.span
                aria-hidden
                className="text-gray-400 text-xl leading-none pt-1 select-none inline-block"
                variants={iconVariants}
                transition={SHARED}
              >
                +
              </motion.span>
            </div>
          </motion.button>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="list-wrap"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            onAnimationStart={() => setClipped(true)}
            onAnimationComplete={(def) => {
              const h =
                def && typeof def === 'object' && 'height' in def
                  ? (def as { height?: unknown }).height
                  : undefined
              if (h === 'auto') setClipped(false)
            }}
            style={{ overflow: clipped ? 'hidden' : 'visible' }}
          >
            <motion.div
              className="divide-y divide-gray-200 border-t border-gray-200"
              variants={listVariants}
              initial="collapsed"
              animate="open"
              exit="collapsed"
            >
              {children.map(child => (
                <motion.div
                  key={child.kind === 'post' ? child.post.slug : child.node.id}
                  variants={listItemVariants}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  {child.kind === 'post' ? (
                    <PostCard post={child.post} />
                  ) : (
                    <SeriesStackCard node={child.node} />
                  )}
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
