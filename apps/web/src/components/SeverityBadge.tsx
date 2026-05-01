import type { SeverityLevel } from '@jeevansetu/types';

import { cn, severityClasses } from '@/lib/utils';

/** Coloured severity pill used across triage and review surfaces. */
export function SeverityBadge({ severity }: { severity: SeverityLevel | string | null }) {
  return (
    <span className={cn('badge', severityClasses(severity))}>{severity ?? 'PENDING'}</span>
  );
}
