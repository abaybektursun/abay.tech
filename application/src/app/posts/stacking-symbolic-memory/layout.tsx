import type { Metadata } from 'next'
import { buildPostMetadata } from '@/lib/og'

export async function generateMetadata(): Promise<Metadata> {
  return buildPostMetadata('stacking-symbolic-memory')
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
