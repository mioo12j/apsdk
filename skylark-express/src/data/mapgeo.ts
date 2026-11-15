// Projects office coordinates with the SAME projection as the bundled boundary geometry.
import { geoConicConformal } from 'd3-geo';
import map from './generated/india-map.json';
import { offices, type Office } from './offices';
const p = map.projection;
const projection = geoConicConformal().parallels(p.parallels as [number, number]).rotate(p.rotate as [number, number]).center(p.center as [number, number]).scale(p.scale).translate(p.translate as [number, number]);
export const project = (lon: number, lat: number) => projection([lon, lat]) as [number, number];
export type Marker = { id: string; x: number; y: number; members: Office[]; hq: boolean; published: boolean; label: string };
const pts = offices.map((o) => ({ o, xy: project(o.lon, o.lat) }));
// Nearby points are clustered so every marker keeps a usable target; a cluster fans back into the directory on tap.
// The marker sits on its lead record (headquarters first, then a published office), never on an average position.
function cluster(threshold: number): Marker[] {
  const used = new Set<string>(); const out: Marker[] = [];
  const order = [...pts].sort((a, b) => rank(a.o) - rank(b.o));
  for (const a of order) {
    if (used.has(a.o.id)) continue;
    const group = order.filter((b) => !used.has(b.o.id) && Math.hypot(a.xy[0] - b.xy[0], a.xy[1] - b.xy[1]) < threshold);
    group.forEach((g) => used.add(g.o.id));
    out.push({
      id: group.map((g) => g.o.id).join('+'), x: +a.xy[0].toFixed(1), y: +a.xy[1].toFixed(1), members: group.map((g) => g.o), hq: a.o.kind === 'hq',
      published: group.some((g) => g.o.kind !== 'city'),
      label: group.length > 1 ? `${a.o.kind === 'hq' ? 'Gurugram headquarters' : a.o.label} and ${group.length - 1} nearby` : a.o.label,
    });
  }
  return out;
}
function rank(o: Office) { return o.kind === 'hq' ? 0 : o.kind === 'registered' ? 1 : o.kind === 'branch' ? 2 : 3; }
/** Two scales: maps drawn wider than ~480px, and the small phone map. */
export const markers = cluster(46);
export const markersNarrow = cluster(74);
export const hqPoint = project(77.07, 28.4925);
export { map };
