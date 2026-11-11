import type { Metadata } from 'next'
import { buildPostMetadata } from '@/lib/og'

export async function generateMetadata(): Promise<Metadata> {
  return buildPostMetadata('pgolf-meta')
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
