import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Design Demo — Clinical Glassmorphism | JeevanSetu' };

export default function GlassLayout({ children }: { children: React.ReactNode }) {
  return children;
}
