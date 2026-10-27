import type { ReactNode } from 'react';

/** Swiss editorial metric tile: top rule, mono label, tabular figures. */
export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: ReactNode;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <div className="border-t-2 border-neutral-900 pt-4 dark:border-white">
      <div className="flex items-center justify-between">
        <p className="eyebrow dark:text-zinc-500">{label}</p>
        {icon ? <span className="text-neutral-400 dark:text-zinc-600 [&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span> : null}
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight tabular text-neutral-900 dark:text-white">{value}</p>
      {hint ? <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-neutral-400 dark:text-zinc-600">{hint}</p> : null}
    </div>
  );
}
