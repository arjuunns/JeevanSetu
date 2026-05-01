export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded bg-slate-200/80 dark:bg-slate-700/80 ${className}`} />
  );
}
