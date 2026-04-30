import { SignIn } from '@clerk/nextjs';

/**
 * Clerk sign-in page (Phase 2). Renders Clerk's hosted component when configured.
 * In local dev without Clerk keys, it shows guidance instead of crashing.
 */
export default function SignInPage() {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      {hasClerk ? (
        <SignIn />
      ) : (
        <div className="card max-w-md text-center">
          <h1 className="text-lg font-semibold text-slate-900">Authentication not configured</h1>
          <p className="mt-2 text-sm text-slate-600">
            Set <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> to enable Clerk sign-in. The dashboard
            is open in development mode.
          </p>
          <a href="/dashboard" className="btn-primary mt-4 inline-flex">
            Continue to dashboard
          </a>
        </div>
      )}
    </div>
  );
}
