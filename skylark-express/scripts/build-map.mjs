// Builds the India map assets from the checked boundary data in map-src/.
// Source: DataMeet "States/Admin2" (derived from Survey of India state maps), CC BY 4.0.
// Output: src/data/generated/india-map.json  (paths + dot grid + projection parameters)
import fs from 'node:fs';
import { geoConicConformal, geoPath, geoContains } from 'd3-geo';

const read = (f) => JSON.parse(fs.readFileSync(new URL(`../map-src/${f}`, import.meta.url)));
const states = read('states-simplified.geojson');
const outline = read('outline-simplified.geojson');
const inner = read('innerlines.geojson');

const W = 1000, PAD = 14;
// Lambert conformal conic, the projection family used for Survey of India small-scale maps of India.
const projection = geoConicConformal().parallels([12.47, 35.17]).rotate([-82.5, 0]).center([0, 22]);
projection.fitWidth(W - PAD * 2, outline);
const [[x0, y0], [x1, y1]] = geoPath(projection).bounds(outline);
const t = projection.translate();
projection.translate([t[0] - x0 + PAD, t[1] - y0 + PAD]);
const H = Math.ceil(y1 - y0 + PAD * 2);
const path = geoPath(projection).digits(1);

// dot grid: sample on a regular screen grid, keep dots whose lon/lat fall inside India
const STEP = 11;
const dots = [];
const feat = outline.features ? outline.features[0] : outline.geometries ? { type: 'Feature', geometry: outline.geometries[0] } : outline;
for (let y = PAD; y < H - PAD; y += STEP) {
  for (let x = PAD + ((Math.round(y / STEP) % 2) * STEP) / 2; x < W - PAD; x += STEP) {
    const ll = projection.invert([x, y]);
    if (ll && geoContains(feat, ll)) dots.push([+x.toFixed(1), +y.toFixed(1)]);
  }
}
// make sure small island groups are represented by at least a few dots
const islandDots = [[72.64, 10.57], [73.05, 8.28], [72.19, 11.69], [92.75, 11.67], [92.95, 12.9], [92.6, 10.6], [93.85, 7.1], [92.8, 9.2], [93.5, 8.0]];
for (const ll of islandDots) { const p = projection(ll); dots.push([+p[0].toFixed(1), +p[1].toFixed(1)]); }

const out = {
  width: W, height: H,
  projection: { type: 'conicConformal', parallels: [12.47, 35.17], rotate: [-82.5, 0], center: [0, 22], scale: projection.scale(), translate: projection.translate() },
  outline: path(outline),
  inner: path(inner),
  states: states.features.map((f) => ({ name: f.properties.ST_NM, centroid: path.centroid(f).map((n) => +n.toFixed(1)) })),
  dots,
  attribution: 'Boundary data: DataMeet India community, States (Admin2), derived from Survey of India maps. CC BY 4.0.',
};
fs.writeFileSync(new URL('../src/data/generated/india-map.json', import.meta.url), JSON.stringify(out));
console.log('map', W, H, 'dots', dots.length, 'outline bytes', out.outline.length, 'inner', out.inner.length);
