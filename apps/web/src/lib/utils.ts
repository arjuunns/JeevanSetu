import type { SeverityLevel } from '@jeevansetu/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Map a clinical severity to a badge colour class (Swiss hairline style). */
export function severityClasses(severity: SeverityLevel | string | null): string {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900';
    case 'HIGH':
      return 'bg-orange-50 text-orange-700 border border-orange-200 dark:bg-orange-950/40 dark:text-orange-400 dark:border-orange-900';
    case 'MODERATE':
      return 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-950/40 dark:text-yellow-500 dark:border-yellow-900';
    case 'LOW':
      return 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900';
    default:
      return 'bg-neutral-100 text-neutral-600 border border-neutral-200 dark:bg-zinc-800/60 dark:text-zinc-400 dark:border-zinc-700';
  }
}
