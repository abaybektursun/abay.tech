export type AppStatus = 'live' | 'beta' | 'coming-soon';

export interface AppItem {
  id: string;
  title: string;
  tagline: string;
  description: string;
  href: string;
  external?: boolean;
  status: AppStatus;
  year: string;
  stack: string[];
  accent: string;
}

export const APPS: AppItem[] = [
  {
    id: 'growth-tools',
    title: 'Growth Tools',
    tagline: 'Frameworks for becoming.',
    description:
      'Personal transformation frameworks and mental models. Distilled from years of practice.',
    href: '/apps/growth-tools',
    status: 'live',
    year: '2025',
    stack: ['Next.js', 'Frameworks'],
    accent: '#a78bfa',
  },
  {
    id: 'fuelos',
    title: 'fuelOS',
    tagline: 'Track food in seconds.',
    description:
      'Zero friction nutrition tracking powered by AI. Photograph, speak, or type — it logs.',
    href: 'https://fuelos.site/',
    external: true,
    status: 'live',
    year: '2025',
    stack: ['AI', 'Mobile'],
    accent: '#34d399',
  },
  {
    id: 'clawddy',
    title: 'Clawddy',
    tagline: 'Multi-agent terminal workspace.',
    description:
      'Fork of Ghostty. Manage many Claude Code agents from a native macOS interface. Spotlight to switch.',
    href: 'https://github.com/abaybektursun/clawddy',
    external: true,
    status: 'live',
    year: '2026',
    stack: ['Swift', 'Zig', 'Ghostty'],
    accent: '#f472b6',
  },
];
