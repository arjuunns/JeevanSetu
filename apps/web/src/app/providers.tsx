'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useState, type ReactNode, useEffect, Suspense } from 'react';

// Initialize PostHog client-side if the key is provided
if (typeof window !== 'undefined') {
  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com';
  
  if (posthogKey) {
    posthog.init(posthogKey, {
      api_host: posthogHost,
      person_profiles: 'identified_only',
      capture_pageview: false, // Track manually for SPA route changes
      capture_pageleave: true,
    });
  }
}

// Track pageviews on client-side route changes
function PostHogPageView(): null {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname && typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
      let url = window.origin + pathname;
      if (searchParams.toString()) {
        url = url + `?${searchParams.toString()}`;
      }
      posthog.capture('$pageview', {
        $current_url: url,
      });
    }
  }, [pathname, searchParams]);

  return null;
}

/** Client-side providers: React Query for server-state caching and PostHog for analytics. */
export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 15_000, retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );

  const hasPostHog = Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY);

  const tree = (
    <QueryClientProvider client={client}>
      {children}
    </QueryClientProvider>
  );

  if (hasPostHog) {
    return (
      <PostHogProvider client={posthog}>
        <Suspense fallback={null}>
          <PostHogPageView />
        </Suspense>
        {tree}
      </PostHogProvider>
    );
  }

  return tree;
}

