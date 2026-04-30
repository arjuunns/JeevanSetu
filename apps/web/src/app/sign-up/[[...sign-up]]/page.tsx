import { SignUp } from '@clerk/nextjs';

/** Clerk sign-up page (Phase 2). New accounts are provisioned as NURSE by default; a Super Admin assigns roles. */
export default function SignUpPage() {
  const hasClerk = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      {hasClerk ? (
        <SignUp />
      ) : (
        <div className="card max-w-md text-center">
          <h1 className="text-lg font-semibold text-slate-900">Authentication not configured</h1>
          <p className="mt-2 text-sm text-slate-600">
            Set <code>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</code> to enable Clerk sign-up.
          </p>
        </div>
      )}
    </div>
  );
}
