/**
 * @jeevansetu/ui — shared, framework-agnostic UI primitives.
 *
 * Kept intentionally small: the web app currently composes UI from Tailwind
 * utility classes and local components. As shared components emerge (cross-app
 * design system), they are promoted here. The first export is the severity
 * colour map so server-rendered emails and the web app stay visually consistent.
 */
export const SEVERITY_COLORS = {
  CRITICAL: '#b91c1c',
  HIGH: '#ea580c',
  MODERATE: '#ca8a04',
  LOW: '#16a34a',
} as const;

export type SeverityColorKey = keyof typeof SEVERITY_COLORS;
