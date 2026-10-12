// IAMJARL marketing kit v1.29.0: generated from kit/loose.js, do not edit
// A loose, hand-drawn stroke for a line given as points (#75).
//
// The drawings and a site's own data lines take the same hand: Wean's taper
// staircase is computed from the app's maths and then drawn through here, so it
// reads as one of the drawings rather than as a chart. Pure and deterministic:
// the same points and seed give the same path, so a page built twice is the
// same page, and a site can run it at build time with no JavaScript shipped.
//
//   loosePath(points, { seed, wobble, step, overshoot })  -> SVG path data
//   stairsPoints(values, box)                            -> the points of a staircase
//
// The wobble is low-frequency, a slow drift rather than jitter, because a pen
// line wanders and a scanned one shakes. Corners round a little, as a pen
// turning does, and each end overshoots by a hair.

// mulberry32: a small seeded generator, enough for a drawing.
function random(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const round = n => Math.round(n * 10) / 10;

export function loosePath(points, { seed = 1, wobble = 1.4, step = 14, overshoot = 1.5 } = {}) {
  if (!Array.isArray(points) || points.length < 2) throw new Error('loosePath needs at least two points');
  const rnd = random(seed);
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const len = Math.hypot(x1 - x0, y1 - y0);
    if (len === 0) continue;
    const ux = (x1 - x0) / len, uy = (y1 - y0) / len;   // along
    const nx = -uy, ny = ux;                            // across
    const n = Math.max(1, Math.round(len / step));
    // Two slow waves of random phase and frequency: a drift, not a shake.
    const f1 = 0.6 + rnd() * 0.9, f2 = 1.7 + rnd() * 1.6;
    const p1 = rnd() * Math.PI * 2, p2 = rnd() * Math.PI * 2;
    const amp = wobble * Math.min(1, len / (step * 3));  // short runs wander less
    const start = i === 0 ? 0 : 1;
    for (let k = start; k <= n; k++) {
      const t = k / n;
      const drift = amp * (Math.sin(f1 * Math.PI * t + p1) * 0.7 + Math.sin(f2 * Math.PI * t + p2) * 0.3) * Math.sin(Math.PI * t);
      let x = x0 + (x1 - x0) * t + nx * drift;
      let y = y0 + (y1 - y0) * t + ny * drift;
      if (i === 0 && k === 0) { x -= ux * overshoot; y -= uy * overshoot; }
      if (i === points.length - 2 && k === n) { x += ux * overshoot; y += uy * overshoot; }
      out.push([x, y]);
    }
  }
  // Through the midpoints with quadratic curves: smooth, with corners that
  // round over about half a step.
  let d = `M${round(out[0][0])} ${round(out[0][1])}`;
  for (let i = 1; i < out.length - 1; i++) {
    const [x, y] = out[i];
    const [nx2, ny2] = out[i + 1];
    d += `Q${round(x)} ${round(y)} ${round((x + nx2) / 2)} ${round((y + ny2) / 2)}`;
  }
  const last = out[out.length - 1];
  d += `L${round(last[0])} ${round(last[1])}`;
  return d;
}

// The points of a staircase for a run of values, one tread per value, left to
// right: across at each value's height, then down (or up) to the next. Values
// map into the box with `max` at its top and 0 at its bottom.
export function stairsPoints(values, { x = 0, y = 0, width, height, max = Math.max(...values) }) {
  if (!values.length) throw new Error('stairsPoints needs at least one value');
  const tread = width / values.length;
  const at = v => y + height - (v / max) * height;
  const pts = [];
  values.forEach((v, i) => {
    const left = x + i * tread, right = left + tread;
    // From the second tread on, the first point sits under the last one: the riser.
    pts.push([left, at(v)], [right, at(v)]);
  });
  return pts;
}
