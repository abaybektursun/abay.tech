import type { Metadata } from 'next'
import { buildPostMetadata } from '@/lib/og'

export async function generateMetadata(): Promise<Metadata> {
  return buildPostMetadata('pr-1420-model-autopsy')
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children
}
