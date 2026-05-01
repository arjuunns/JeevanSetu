import { ClerkProvider } from '@clerk/nextjs';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'JeevanSetu — Clinical Triage & Routing',
  description:
    'AI-assisted clinical triage, referral and hospital routing with human-in-the-loop validation.',
};

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function RootLayout({ children }: { children: ReactNode }) {
  const tree = (
    <html lang="en">
      <body className="min-h-screen antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );

  // Only wrap in ClerkProvider when configured, so the app runs in dev without keys.
  return hasClerk ? <ClerkProvider>{tree}</ClerkProvider> : tree;
}
