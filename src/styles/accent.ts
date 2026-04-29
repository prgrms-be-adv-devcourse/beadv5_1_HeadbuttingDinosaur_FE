/* Source: docs/archive/v2-cutover/prototype/common.jsx — accent() + ACCENT map.
 *
 * §3.0 contract: components do not know about colors; callers compute
 * accent(eventId) and pass the hex into <AccentMediaBox accent={...}>.
 *
 * The static a–h map covers prototype mock events; production UUID
 * eventIds always hit the fallback. A hash-based variant is a follow-up
 * (out of scope for the prototype port). */

export const ACCENT: Record<string, string> = {
  a: '#4F46E5',
  b: '#0EA5E9',
  c: '#10B981',
  d: '#F59E0B',
  e: '#8B5CF6',
  f: '#EC4899',
  g: '#EF4444',
  h: '#0EA5E9',
};

const FALLBACK = '#4F46E5';

export function accent(id: string): string {
  return ACCENT[id] ?? FALLBACK;
}
