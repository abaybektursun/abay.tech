import 'server-only'
import type { Metadata } from 'next'
import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import path from 'path'
import matter from 'gray-matter'
import { SERIES_ASSIGNMENT, SERIES_META } from './posts-types'

export const OG_SIZE = { width: 1200, height: 630 }
export const OG_CONTENT_TYPE = 'image/png'

const INK = '#0B0D12'
const INK_2 = '#E7E8EB'
const INK_3 = '#8A8E97'
const RULE = '#1C2028'
const ACCENT = '#E8513A'

const FONT_URLS: Record<string, string> = {
  'Inter:400': 'https://cdn.jsdelivr.net/gh/rsms/inter@v3.19/docs/font-files/Inter-Regular.otf',
  'Inter:600': 'https://cdn.jsdelivr.net/gh/rsms/inter@v3.19/docs/font-files/Inter-SemiBold.otf',
  'JetBrains Mono:500': 'https://cdn.jsdelivr.net/gh/JetBrains/JetBrainsMono@v2.304/fonts/ttf/JetBrainsMono-Medium.ttf',
}

async function loadFont(family: string, weight: number) {
  const key = `${family}:${weight}`
  const url = FONT_URLS[key]
  if (!url) throw new Error(`No font URL configured for ${key}`)
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Font fetch failed ${res.status} for ${key} (${url})`)
  return await res.arrayBuffer()
}

type CardInput = {
  eyebrow?: string
  title: string
  subtitle?: string
  date?: string
}

function formatDate(iso?: string) {
  if (!iso) return ''
  const d = new Date(iso)
  if (isNaN(d.getTime())) return iso
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()
}

export async function renderOg({ eyebrow, title, subtitle, date }: CardInput) {
  const [interRegular, interSemibold, jetbrains] = await Promise.all([
    loadFont('Inter', 400),
    loadFont('Inter', 600),
    loadFont('JetBrains Mono', 500),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: INK,
          backgroundImage: `radial-gradient(circle at 18% 8%, rgba(232,81,58,0.12), transparent 42%), radial-gradient(circle at 82% 92%, rgba(80,140,255,0.08), transparent 50%)`,
          color: INK_2,
          fontFamily: 'Inter',
          padding: '64px 72px',
          position: 'relative',
        }}
      >
        {/* grid lines */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `linear-gradient(${RULE} 1px, transparent 1px), linear-gradient(90deg, ${RULE} 1px, transparent 1px)`,
            backgroundSize: '120px 120px',
            opacity: 0.35,
            display: 'flex',
          }}
        />
        {/* corner mark */}
        <div
          style={{
            position: 'absolute',
            top: 64,
            right: 72,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            fontFamily: 'JetBrains Mono',
            fontSize: 14,
            letterSpacing: '0.18em',
            color: INK_3,
            textTransform: 'uppercase',
          }}
        >
          <div style={{ width: 8, height: 8, background: ACCENT, borderRadius: 9999 }} />
          ABAY.TECH
        </div>

        {/* eyebrow */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            fontFamily: 'JetBrains Mono',
            fontSize: 16,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: ACCENT,
            zIndex: 1,
          }}
        >
          {eyebrow ?? 'ESSAY'}
        </div>

        {/* title */}
        <div
          style={{
            display: 'flex',
            marginTop: 36,
            fontSize: title.length > 48 ? 68 : 84,
            fontWeight: 600,
            lineHeight: 1.05,
            letterSpacing: '-0.025em',
            color: '#F5F6F8',
            maxWidth: 1000,
            zIndex: 1,
          }}
        >
          {title}
        </div>

        {/* subtitle */}
        {subtitle ? (
          <div
            style={{
              display: 'flex',
              marginTop: 28,
              fontSize: 26,
              fontWeight: 400,
              lineHeight: 1.4,
              color: INK_3,
              maxWidth: 980,
              zIndex: 1,
            }}
          >
            {subtitle.length > 180 ? subtitle.slice(0, 177) + '…' : subtitle}
          </div>
        ) : null}

        <div style={{ flex: 1, display: 'flex' }} />

        {/* footer rule + meta */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            borderTop: `1px solid ${RULE}`,
            paddingTop: 24,
            zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: 14,
                letterSpacing: '0.18em',
                color: INK_3,
                textTransform: 'uppercase',
              }}
            >
              by Abay Bektursun
            </div>
            <div style={{ fontSize: 22, color: '#F5F6F8', fontWeight: 500 }}>
              ML · systems · writing
            </div>
          </div>
          {date ? (
            <div
              style={{
                fontFamily: 'JetBrains Mono',
                fontSize: 14,
                letterSpacing: '0.18em',
                color: INK_3,
              }}
            >
              {formatDate(date)}
            </div>
          ) : null}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
        { name: 'Inter', data: interSemibold, weight: 600, style: 'normal' },
        { name: 'JetBrains Mono', data: jetbrains, weight: 500, style: 'normal' },
      ],
    },
  )
}

export type PostMeta = {
  slug: string
  title: string
  subtitle?: string
  date?: string
}

export async function readPostFrontmatter(slug: string): Promise<PostMeta> {
  const file = path.join(process.cwd(), 'src/app/posts', slug, 'index.mdx')
  const raw = await readFile(file, 'utf8')
  const { data } = matter(raw)
  return {
    slug,
    title: data.title ?? slug,
    subtitle: data.subtitle ?? '',
    date: data.date ?? '',
  }
}

function eyebrowForSlug(slug: string) {
  const tags = SERIES_ASSIGNMENT[slug] ?? []
  const primary = tags[0]
  if (primary && SERIES_META[primary]) return SERIES_META[primary].label.toUpperCase()
  return 'ESSAY'
}

export async function renderPostOg(slug: string) {
  const meta = await readPostFrontmatter(slug)
  return renderOg({
    eyebrow: eyebrowForSlug(slug),
    title: meta.title,
    subtitle: meta.subtitle,
    date: meta.date,
  })
}

export async function buildPostMetadata(slug: string): Promise<Metadata> {
  const meta = await readPostFrontmatter(slug)
  const description = meta.subtitle || `An essay by Abay Bektursun.`
  const url = `/posts/${slug}`
  return {
    title: meta.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: meta.title,
      description,
      url,
      type: 'article',
      publishedTime: meta.date || undefined,
      authors: ['Abay Bektursun'],
      siteName: 'abay.tech',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description,
    },
  }
}
