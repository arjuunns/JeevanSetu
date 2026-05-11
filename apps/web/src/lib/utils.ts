import type { SeverityLevel } from '@jeevansetu/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Map a clinical severity to a badge colour class. */
export function severityClasses(severity: SeverityLevel | string | null): string {
  switch (severity) {
    case 'CRITICAL':
      return 'bg-red-100 text-critical';
    case 'HIGH':
      return 'bg-orange-100 text-high';
    case 'MODERATE':
      return 'bg-yellow-100 text-moderate';
    case 'LOW':
      return 'bg-green-100 text-low';
    default:
      return 'bg-slate-100 text-slate-600';
  }
}
