// Projects office coordinates with the SAME projection as the bundled boundary geometry.
import { geoConicConformal } from 'd3-geo';
import map from './generated/india-map.json';
import { offices, type Office } from './offices';
const p = map.projection;
const projection = geoConicConformal().parallels(p.parallels as [number, number]).rotate(p.rotate as [number, number]).center(p.center as [number, number]).scale(p.scale).translate(p.translate as [number, number]);
export const project = (lon: number, lat: number) => projection([lon, lat]) as [number, number];
export type Marker = { id: string; x: number; y: number; members: Office[]; hq: boolean; published: boolean; label: string };
const pts = offices.map((o) => ({ o, xy: project(o.lon, o.lat) }));
const used = new Set<string>();
export const markers: Marker[] = [];
const THRESH = 13; // px in the 1000-wide map space
for (const a of pts) {
  if (used.has(a.o.id)) continue;
  const group = pts.filter((b) => !used.has(b.o.id) && Math.hypot(a.xy[0] - b.xy[0], a.xy[1] - b.xy[1]) < THRESH);
  group.forEach((g) => used.add(g.o.id));
  const x = group.reduce((s, g) => s + g.xy[0], 0) / group.length, y = group.reduce((s, g) => s + g.xy[1], 0) / group.length;
  const hq = group.some((g) => g.o.kind === 'hq');
  const lead = group.find((g) => g.o.kind === 'hq') ?? group[0];
  markers.push({
    id: group.map((g) => g.o.id).join('+'), x: +x.toFixed(1), y: +y.toFixed(1), members: group.map((g) => g.o), hq,
    published: group.some((g) => g.o.kind !== 'city'),
    label: group.length > 1 ? `${lead.o.kind === 'hq' ? 'Gurugram headquarters' : lead.o.city} and ${group.length - 1} nearby` : lead.o.label,
  });
}
export const hqPoint = project(77.07, 28.4925);
export { map };
