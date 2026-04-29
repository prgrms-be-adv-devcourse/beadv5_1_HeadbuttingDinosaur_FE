/* Source: docs/archive/v2-cutover/prototype/common.jsx — fmtDate / fmtPrice / fmtISO.
 *
 * Output matches prototype verbatim:
 *   fmtDate('2026-05-18T14:00')   →  '2026.05.18 14:00'   (local time)
 *   fmtPrice(0)                   →  'free'
 *   fmtPrice(49000)               →  '49,000원'
 *   fmtISO('2026-05-18T14:00Z')   →  '2026-05-18 14:00'   (UTC)
 *
 * Kept separate from src/utils/index.ts (v1 ko-KR locale formatters) so
 * the v1 cutover does not touch v2 callers. */

export function fmtDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${y}.${m}.${day} ${h}:${mi}`;
}

export function fmtPrice(p: number): string {
  return p === 0 ? 'free' : `${p.toLocaleString()}원`;
}

export function fmtISO(iso: string): string {
  const d = new Date(iso);
  return d.toISOString().slice(0, 16).replace('T', ' ');
}
