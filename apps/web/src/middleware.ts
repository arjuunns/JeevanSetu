import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

/**
 * Phase 2 — protected routes. Everything under the app dashboard requires an
 * authenticated session; the marketing/auth pages are public. When Clerk keys
 * are absent (local dev) the middleware is a no-op pass-through.
 */
const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)', '/referrals/verify(.*)']);

const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default hasClerk
  ? clerkMiddleware(async (auth, req) => {
      if (!isPublicRoute(req)) {
        await auth.protect();
      }
    })
  : function passthrough() {
      // Clerk not configured — allow all (development only).
    };

export const config = {
  matcher: ['/((?!_next|.*\\..*).*)', '/(api|trpc)(.*)'],
};
