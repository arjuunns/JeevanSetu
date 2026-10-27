export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-sm bg-neutral-200/80 dark:bg-zinc-800/80 ${className}`} />
  );
}
