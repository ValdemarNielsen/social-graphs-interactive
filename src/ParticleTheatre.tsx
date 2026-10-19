import { useEffect, useRef } from 'react';
import './particle-theatre.css';

export type ParticleTheatreProps = { week: 1 | 3 | 5; reduced: boolean; active?: boolean };
type XYZ = { x: number; y: number; z: number };
type Projection = { cy: number; sy: number; cx: number; sx: number; cz: number; sz: number; scale: number; centerX: number; centerY: number; pointerX: number; pointerY: number; influence: number };
const TAU = Math.PI * 2;
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;
const hash = (n: number) => { const value = Math.sin(n * 127.1 + 311.7) * 43758.5453; return value - Math.floor(value); };

/** Perspective projection of actual 3D coordinates. Pointer deformation happens
 * in view space after projection, so the same function bends strands and lights. */
function project(x: number, y: number, z: number, camera: Projection, out: Float32Array, offset: number, repel = 1) {
  const xx = x * camera.cy + z * camera.sy;
  const zz = -x * camera.sy + z * camera.cy;
  const yy = y * camera.cx - zz * camera.sx;
  const depth = y * camera.sx + zz * camera.cx;
  const rotatedX = xx * camera.cz - yy * camera.sz;
  const rotatedY = xx * camera.sz + yy * camera.cz;
  const perspective = 760 / Math.max(300, 760 + depth);
  let px = camera.centerX + rotatedX * perspective * camera.scale;
  let py = camera.centerY + rotatedY * perspective * camera.scale;
  if (camera.influence > .001 && repel) {
    const dx = px - camera.pointerX, dy = py - camera.pointerY;
    const distance = Math.hypot(dx, dy);
    const radius = 115 * Math.min(1.5, camera.scale);
    const force = Math.max(0, 1 - distance / radius) ** 2 * camera.influence * 54 * repel;
    px += dx / Math.max(9, distance) * force;
    py += dy / Math.max(9, distance) * force;
  }
  out[offset] = px; out[offset + 1] = py; out[offset + 2] = perspective; out[offset + 3] = depth;
}

function makeGlow(color: string) {
  const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64;
  const context = canvas.getContext('2d');
  if (context) {
    const gradient = context.createRadialGradient(32, 32, 0, 32, 32, 31);
    gradient.addColorStop(0, '#fff8e5'); gradient.addColorStop(.12, color);
    gradient.addColorStop(.35, `${color}80`); gradient.addColorStop(1, `${color}00`);
    context.fillStyle = gradient; context.fillRect(0, 0, 64, 64);
  }
  return canvas;
}

/** Sample the pixels of a locally rendered word, not a downloaded texture. Both
 * targets share a point count, allowing deterministic particle-to-particle flight. */
function wordSamples(word: string, maximum: number): Float32Array {
  const canvas = document.createElement('canvas'); canvas.width = 1100; canvas.height = 320;
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) return new Float32Array(0);
  context.font = `600 ${word.length > 5 ? 185 : 245}px "Space Grotesk", sans-serif`;
  context.textAlign = 'center'; context.textBaseline = 'middle'; context.fillStyle = '#000';
  context.fillText(word, 550, 164, 1050);
  const pixels = context.getImageData(0, 0, 1100, 320).data;
  const points: number[] = [];
  let minX = 1100, maxX = 0, minY = 320, maxY = 0;
  for (let y = 8; y < 312; y += 3) for (let x = 8; x < 1092; x += 3) {
    if (pixels[(y * 1100 + x) * 4 + 3] > 150) { points.push(x, y); minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y); }
  }
  if (!points.length) return new Float32Array(0);
  const count = Math.min(maximum, points.length / 2);
  const result = new Float32Array(count * 3);
  const scale = 620 / Math.max(1, maxX - minX);
  const available = points.length / 2;
  // A deterministic shuffle mixes rows without allocating point objects.
  const order = Array.from({ length: available }, (_, i) => i);
  for (let i = available - 1; i > 0; i--) { const j = Math.floor(hash(i + word.length * 71) * (i + 1)); [order[i], order[j]] = [order[j], order[i]]; }
  for (let i = 0; i < count; i++) {
    const source = order[Math.floor(i * available / count)] * 2;
    result[i * 3] = (points[source] - (minX + maxX) / 2) * scale;
    result[i * 3 + 1] = (points[source + 1] - (minY + maxY) / 2) * scale;
    result[i * 3 + 2] = (hash(i + 85) - .5) * 42;
  }
  return result;
}

const titles = {
  1: ['RELATIONSHIP FIELD', 'A knot becomes a constellation.'],
  3: ['TRANSIT THROUGH POSSIBILITY', 'Follow a route into the unknown.'],
  5: ['THE MATTER OF LANGUAGE', 'Words dissolve. Another form arrives.'],
};

/** Decorative, original projected-3D scenes. `active` selects the alternate
 * composition; it is not the play/pause flag. No per-frame React updates. */
export default function ParticleTheatre({ week, reduced, active = false }: ParticleTheatreProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const wakeRef = useRef<(() => void) | null>(null);
  activeRef.current = active;

  useEffect(() => {
    const canvas = canvasRef.current, root = rootRef.current;
    if (!canvas || !root) return;
    const context = canvas.getContext('2d', { alpha: true });
    if (!context) { root.dataset.canvas = 'unavailable'; return; }
    const ctx = context;
    delete root.dataset.canvas;
    const glows = [makeGlow('#ec5345'), makeGlow('#b7a0ff'), makeGlow('#e8f597'), makeGlow('#2c55d6')];
    const strandCount = 34, strandSteps = 83;
    const strands = Array.from({ length: strandCount }, () => new Float32Array(strandSteps * 4));
    const scratch = new Float32Array(12);
    const maximumParticles = window.innerWidth < 760 ? 1500 : 2500;
    const particleSeeds = new Float32Array(maximumParticles * 6);
    for (let i = 0; i < maximumParticles; i++) for (let channel = 0; channel < 6; channel++) particleSeeds[i * 6 + channel] = hash(i + [12, 52, 18, 29, 30, 9][channel]);
    let wordA = week === 5 ? wordSamples('WORDS', maximumParticles) : new Float32Array(0);
    let wordB = week === 5 ? wordSamples('LANGUAGE', maximumParticles) : new Float32Array(0);
    const projected = new Float32Array(maximumParticles * 4);
    const previous = new Float32Array(maximumParticles * 2); previous.fill(Number.NaN);
    const order = Array.from({ length: maximumParticles }, (_, i) => i);
    const tangent: XYZ = { x: 0, y: 0, z: 0 };
    let width = 1, height = 1, dpr = 1, frame = 0, visible = false, disposed = false, drawnFrames = 0;
    let time = reduced ? 4.7 : 0, lastTime = 0, lastDraw = 0, travel = 250;
    let phase = activeRef.current ? 1 : 0, previousActive = activeRef.current;
    let burst = 0, burstAge = 9, pointerOver = false, pointerStrength = 0;
    const pointer = { x: 0, y: 0, targetX: 0, targetY: 0, pixelX: -1000, pixelY: -1000 };
    let bounds = canvas.getBoundingClientRect();
    let background: CanvasGradient | null = null;
    let averageCost = 0, slowFrames = 0, quality = 1;

    function camera(yaw: number, pitch: number, roll: number, scale: number): Projection {
      return { cy: Math.cos(yaw), sy: Math.sin(yaw), cx: Math.cos(pitch), sx: Math.sin(pitch), cz: Math.cos(roll), sz: Math.sin(roll), scale, centerX: width * .5, centerY: height * .49, pointerX: pointer.pixelX, pointerY: pointer.pixelY, influence: pointerStrength };
    }
    function line(points: Float32Array, count: number, color: string, strokeWidth: number, stride = 4) {
      ctx.beginPath();
      for (let i = 0; i < count; i++) { const at = i * stride; if (i === 0) ctx.moveTo(points[at], points[at + 1]); else ctx.lineTo(points[at], points[at + 1]); }
      ctx.strokeStyle = color; ctx.lineWidth = strokeWidth; ctx.stroke();
    }
    function glow(x: number, y: number, size: number, type: number, opacity = 1) {
      ctx.globalAlpha = opacity; ctx.drawImage(glows[type], x - size / 2, y - size / 2, size, size); ctx.globalAlpha = 1;
    }
    function pointOnStrand(strand: number, u: number, out: XYZ) {
      const angle = strand / strandCount * TAU;
      const breathing = Math.sin(u * 5 + time * .7 + angle) * 3.4;
      const radius = 151 + 38 * Math.cos(3 * u) + Math.cos(angle) * (12 + breathing);
      const knotX = radius * Math.cos(2 * u), knotY = radius * Math.sin(2 * u) * 1.06;
      const knotZ = 84 * Math.sin(3 * u) + Math.sin(angle) * (18 + breathing);
      const latitude = u;
      const longitude = angle + Math.sin(u * 3 + time * .18) * .22;
      const sphere = 187 + Math.sin(u * 8 + angle * 3 + time * .5) * 12;
      const sphereX = sphere * Math.sin(latitude) * Math.cos(longitude);
      const sphereY = sphere * Math.cos(latitude);
      const sphereZ = sphere * Math.sin(latitude) * Math.sin(longitude);
      const expansion = 1 + burst * .28 + Math.sin(time * .6) * .018;
      out.x = mix(knotX, sphereX, phase) * expansion;
      out.y = mix(knotY, sphereY, phase) * expansion;
      out.z = mix(knotZ, sphereZ, phase) * expansion;
    }

    function drawFilaments() {
      const size = Math.min(width / 520, height / 560);
      const view = camera(time * .115 + pointer.x * .48, -.32 + pointer.y * .35, -.36 + phase * .25, size * 1.16);
      // Fine orbit tracks frame the tangled sculpture, while the core remains dense.
      ctx.globalAlpha = .22; ctx.strokeStyle = '#345c91'; ctx.lineWidth = .65;
      for (let ring = 0; ring < 3; ring++) {
        ctx.beginPath();
        for (let i = 0; i <= 100; i++) {
          const t = i / 100 * TAU, r = 237 + ring * 7;
          project(Math.cos(t) * r, Math.sin(t) * r, Math.sin(t * 2) * (22 + ring * 8), view, scratch, 0, .3);
          if (i === 0) ctx.moveTo(scratch[0], scratch[1]); else ctx.lineTo(scratch[0], scratch[1]);
        }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      const every = quality < .8 ? 2 : 1;
      for (let strand = 0; strand < strandCount; strand += every) {
        const points = strands[strand]; let depth = 0;
        for (let i = 0; i < strandSteps; i++) {
          pointOnStrand(strand, i / (strandSteps - 1) * TAU, tangent);
          project(tangent.x, tangent.y, tangent.z, view, points, i * 4);
          depth += points[i * 4 + 3];
        }
        const front = clamp(.6 - depth / strandSteps / 500, .3, .9);
        const red = strand % 5 < 2;
        if (strand % 5 === 0) line(points, strandSteps, red ? '#d6442921' : '#36619e18', 7 * size);
        ctx.globalAlpha = front;
        line(points, strandSteps, red ? '#b9322d' : '#203d68', (strand % 5 === 0 ? 1.3 : .6) * Math.max(.75, size));
        ctx.globalAlpha = 1;
      }
      // Signals share the same parametric strands: they visibly traverse the form.
      const signals = quality < .8 ? 90 : 150;
      for (let i = 0; i < signals; i++) {
        const strand = i * 7 % strandCount;
        const u = (hash(i + 19) * TAU + time * (.18 + hash(i + 100) * .34) * (i % 2 ? 1 : -1)) % TAU;
        pointOnStrand(strand, u, tangent); project(tangent.x, tangent.y, tangent.z, view, scratch, 0);
        pointOnStrand(strand, u - .035, tangent); project(tangent.x, tangent.y, tangent.z, view, scratch, 4);
        const front = clamp(1.1 - (scratch[3] + 220) / 530, .2, 1);
        ctx.globalAlpha = front; ctx.strokeStyle = i % 3 ? '#dc5141' : '#264e8b'; ctx.lineWidth = 1.5 * scratch[2] * size;
        ctx.beginPath(); ctx.moveTo(scratch[4], scratch[5]); ctx.lineTo(scratch[0], scratch[1]); ctx.stroke();
        ctx.fillStyle = '#f8edd4'; ctx.beginPath(); ctx.arc(scratch[0], scratch[1], Math.max(.65, scratch[2] * size * 1.7), 0, TAU); ctx.fill();
        ctx.globalAlpha = 1;
        if (i % 12 === 0) glow(scratch[0], scratch[1], 17 * scratch[2] * size, i % 3 ? 0 : 3, front * .65);
      }
      // Six larger focal lights make the overall structure legible at a glance.
      for (let i = 0; i < 6; i++) {
        pointOnStrand(i * 5, i / 6 * TAU + .28, tangent); project(tangent.x, tangent.y, tangent.z, view, scratch, 0);
        const r = (4.2 + (i === 2 ? 3 : 0)) * scratch[2] * size;
        glow(scratch[0], scratch[1], r * 9, 0, .48);
        ctx.fillStyle = '#be3e32'; ctx.strokeStyle = '#fff4df'; ctx.lineWidth = 1.6;
        ctx.beginPath(); ctx.arc(scratch[0], scratch[1], r, 0, TAU); ctx.fill(); ctx.stroke();
        if (i === 2 || i === 4) {
          const direction = i === 2 ? 1 : -1;
          ctx.strokeStyle = '#253e6860'; ctx.lineWidth = .7; ctx.beginPath(); ctx.moveTo(scratch[0] + direction * r * 2, scratch[1]); ctx.lineTo(scratch[0] + direction * 58 * size, scratch[1] - 30 * size); ctx.stroke();
        }
      }
      if (burst > .03) {
        ctx.strokeStyle = `rgba(188,56,44,${burst * .3})`; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.ellipse(width * .5, height * .49, (170 + burstAge * 150) * size, (155 + burstAge * 120) * size, -.25, 0, TAU); ctx.stroke();
      }
    }

    function tunnelPoint(angle: number, z: number, out: Float32Array, offset: number, radiusOffset = 0) {
      const depth = Math.max(65, z);
      const bend = depth / 1600;
      const twist = time * .095 + Math.sin(depth * .0013 + time * .16) * .13 + phase * .8;
      const radius = (251 + Math.sin(depth * .002 + time * .4) * 24 + phase * 45 + radiusOffset) * (1 + .075 * Math.cos(angle * 6 + phase * 2));
      const cx = Math.sin(depth * .00115 + time * .14) * 140 * bend + pointer.x * 160 * bend;
      const cy = Math.cos(depth * .0009 + time * .12) * 80 * bend + pointer.y * 140 * bend;
      const x = cx + Math.cos(angle + twist) * radius;
      const y = cy + Math.sin(angle + twist) * radius;
      const perspective = 470 / depth;
      const scale = Math.min(width / 660, height / 620);
      const roll = -.17 + phase * .48 + pointer.x * .12;
      // On the wide, full-bleed cover the left side holds the title. Keep the
      // vanishing point in the exposed right field; small screens stay centered.
      const centerX = width * (width / height > 1.45 ? .7 : .5);
      out[offset] = centerX + (x * Math.cos(roll) - y * Math.sin(roll)) * perspective * scale;
      out[offset + 1] = height * .46 + (x * Math.sin(roll) + y * Math.cos(roll)) * perspective * scale;
      out[offset + 2] = perspective * scale;
      out[offset + 3] = depth;
    }

    function drawTunnel() {
      const stride = quality < .8 ? 2 : 1;
      // The centerline bends through depth, rather than scaling concentric circles.
      for (let ring = 30; ring >= 0; ring -= stride) {
        const z = 115 + ring * 99 - (travel % 99);
        const points = strands[ring % strandCount];
        for (let i = 0; i < strandSteps; i++) tunnelPoint(i / (strandSteps - 1) * TAU, z, points, i * 4);
        const alpha = clamp(1 - z / 3400, .06, .8);
        const selected = ring % 5 === 0;
        ctx.globalAlpha = alpha * (selected ? .95 : .6);
        if (selected) line(points, strandSteps, phase > .5 ? '#cbdc7970' : '#a088de70', 10 * Math.min(1.6, 470 / z));
        line(points, strandSteps, selected ? '#e2ed96' : '#b9a8ee', selected ? 2 : 1);
        ctx.globalAlpha = 1;
      }
      // Longitudinal rails describe the curved tunnel surface.
      const railPoints = strands[33];
      for (let rail = 0; rail < 16; rail += stride) {
        const angle = rail / 16 * TAU + Math.sin(time * .08) * .08;
        for (let i = 0; i < strandSteps; i++) tunnelPoint(angle, 95 + i / (strandSteps - 1) * 3100, railPoints, i * 4, rail % 4 === 0 ? -8 : 0);
        line(railPoints, strandSteps, rail % 4 === 0 ? '#ddea9568' : '#ac96e227', rail % 4 === 0 ? 1.8 : .75);
      }
      // Perspective streaks approach the camera. Their tails are farther down
      // the same curved route, so travel remains attached to the tunnel surface.
      const travelers = quality < .8 ? 120 : 210;
      for (let i = 0; i < travelers; i++) {
        const angle = (i % 16) / 16 * TAU + hash(i + 6) * .07;
        const z = 115 + ((hash(i + 80) * 3000 - travel * (1.1 + hash(i + 9) * .5)) % 3000 + 3000) % 3000;
        tunnelPoint(angle, z, scratch, 0, -10);
        tunnelPoint(angle, z + 22 + phase * 55 + 30 * (470 / z), scratch, 4, -10);
        if (scratch[0] < -70 || scratch[0] > width + 70 || scratch[1] < -70 || scratch[1] > height + 70) continue;
        const alpha = clamp(1 - z / 3250, .08, .95);
        ctx.globalAlpha = alpha; ctx.strokeStyle = i % 4 ? '#beabea' : '#e8f3a4'; ctx.lineWidth = clamp(scratch[2] * 2.2, .6, 4.5);
        ctx.beginPath(); ctx.moveTo(scratch[4], scratch[5]); ctx.lineTo(scratch[0], scratch[1]); ctx.stroke(); ctx.globalAlpha = 1;
        if (i % 10 === 0) glow(scratch[0], scratch[1], clamp(scratch[2] * 24, 6, 45), i % 4 ? 1 : 2, alpha * .8);
      }
      const words = ['TRANSFER', 'OTHER ROUTES', 'EXPRESS'];
      for (let i = 0; i < 3; i++) {
        const z = 450 + ((i * 650 + 1250 - travel * .55) % 1850 + 1850) % 1850;
        tunnelPoint(i * 2.1 + .7, z, scratch, 0, -20);
        const font = clamp(scratch[2] * 22, 7, 21);
        ctx.save(); ctx.translate(scratch[0], scratch[1]); ctx.rotate(-.18 + phase * .3);
        ctx.globalAlpha = clamp(1 - z / 2600, .15, .7); ctx.font = `500 ${font}px "Space Grotesk", sans-serif`; ctx.fillStyle = i === 2 ? '#e8f3a4' : '#bfaee8'; ctx.fillText(words[i], 0, 0); ctx.restore();
      }
    }

    function drawTypography() {
      const countA = wordA.length / 3, countB = wordB.length / 3;
      if (!countA || !countB) return;
      const count = Math.floor(Math.min(maximumParticles, Math.max(countA, countB)) * (quality < .8 ? .72 : 1));
      const scale = Math.min(width / 750, height / 330) * 1.02;
      const flight = Math.sin(phase * Math.PI);
      const view = camera(pointer.x * .26 + Math.sin(time * .18) * .11 + flight * .25, -.17 + pointer.y * .2, -.025 + Math.sin(time * .12) * .02, scale);
      view.centerY = height * .48;
      // Three offset drafting planes give the letterform a visible volume.
      ctx.lineWidth = .6; ctx.strokeStyle = '#264bb41c';
      for (let plane = -1; plane <= 1; plane++) {
        const corners = [[-348, -106], [348, -106], [348, 106], [-348, 106], [-348, -106]];
        ctx.beginPath(); corners.forEach(([x, y], i) => { project(x, y, plane * 63, view, scratch, 0, 0); if (i) ctx.lineTo(scratch[0], scratch[1]); else ctx.moveTo(scratch[0], scratch[1]); }); ctx.stroke();
      }
      for (let i = 0; i < count; i++) {
        const ia = i % countA * 3, ib = i % countB * 3;
        const seed = i * 6;
        const angle = particleSeeds[seed] * TAU + time * .25;
        const energy = flight * (.6 + particleSeeds[seed + 1] * .6) + burst * .5;
        const spiral = angle + energy * (particleSeeds[seed + 2] > .5 ? 2.6 : -2.6);
        const x = mix(wordA[ia], wordB[ib], phase) + Math.cos(spiral) * energy * (80 + particleSeeds[seed + 3] * 180);
        const y = mix(wordA[ia + 1], wordB[ib + 1], phase) + Math.sin(spiral) * energy * (80 + particleSeeds[seed + 4] * 120);
        const z = mix(wordA[ia + 2], wordB[ib + 2], phase) + Math.sin(angle * 3 + phase * TAU) * energy * 290 + Math.sin(time * .7 + i * .13) * 3;
        project(x, y, z, view, projected, i * 4, 1.8);
      }
      // A real depth sort gives front particles priority over distant ink dust.
      if (order.length !== count) { order.length = count; for (let i = 0; i < count; i++) order[i] = i; }
      order.sort((a, b) => projected[b * 4 + 3] - projected[a * 4 + 3]);
      if (!reduced && (flight > .03 || burst > .03)) {
        ctx.strokeStyle = '#b945322d'; ctx.lineWidth = .7; ctx.beginPath();
        for (let i = 0; i < count; i += 3) {
          const x = projected[i * 4], y = projected[i * 4 + 1], lastX = previous[i * 2], lastY = previous[i * 2 + 1];
          if (Number.isFinite(lastX) && Math.hypot(x - lastX, y - lastY) < 90) { ctx.moveTo(lastX, lastY); ctx.lineTo(x, y); }
        }
        ctx.stroke();
      }
      const inkColors = ['#6e82bc', '#b84d3e', '#254ab3', '#172f80'];
      for (let layer = 0; layer < 4; layer++) {
        ctx.fillStyle = inkColors[layer]; ctx.beginPath();
        for (let at = 0; at < order.length; at++) {
          const i = order[at], offset = i * 4, depth = projected[offset + 3];
          const color = depth > 45 ? 0 : i % 11 === 0 ? 1 : depth > -4 ? 2 : 3;
          if (color !== layer) continue;
          const radius = clamp((1.35 + particleSeeds[i * 6 + 5] * .5) * projected[offset + 2] * scale, .65, 4);
          ctx.rect(projected[offset] - radius, projected[offset + 1] - radius, radius * 2, radius * 2);
        }
        ctx.fill();
      }
      for (let i = 0; i < count; i++) { previous[i * 2] = projected[i * 4]; previous[i * 2 + 1] = projected[i * 4 + 1]; }
      // Large optical registration marks anchor the scene on its paper surface.
      ctx.strokeStyle = '#b64a3b80'; ctx.lineWidth = 1;
      for (const side of [-1, 1]) {
        const x = width * .5 + side * 335 * scale, y = height * .48;
        ctx.beginPath(); ctx.moveTo(x - 9, y); ctx.lineTo(x + 9, y); ctx.moveTo(x, y - 9); ctx.lineTo(x, y + 9); ctx.stroke();
      }
    }

    function render(now: number, firstPaint = false) {
      frame = 0;
      if (disposed || (!firstPaint && (!visible || document.hidden))) { lastTime = 0; return; }
      // A consistently expensive device steps down to a 30fps render budget,
      // while elapsed-time integration keeps speed independent of frame rate.
      if (!firstPaint && !reduced && quality < .7 && now - lastDraw < 30) { frame = requestAnimationFrame(render); return; }
      const started = performance.now();
      const dt = !firstPaint && lastTime ? Math.min((now - lastTime) / 1000, .05) : 0;
      lastTime = now; lastDraw = now;
      if (activeRef.current !== previousActive) { previousActive = activeRef.current; burstAge = 0; previous.fill(Number.NaN); }
      const target = activeRef.current ? 1 : 0;
      if (reduced) { phase = target; burst = 0; pointerStrength = 0; }
      else {
        time += dt; travel += dt * (380 + phase * 740);
        phase += (target - phase) * (1 - Math.exp(-dt * 2.8));
        if (Math.abs(target - phase) < .0002) phase = target;
        burstAge += dt; burst = burstAge < 2 ? Math.sin(Math.min(1, burstAge / .26) * Math.PI / 2) * Math.exp(-burstAge * 2.7) : 0;
        pointer.x += (pointer.targetX - pointer.x) * (1 - Math.exp(-dt * 4.5));
        pointer.y += (pointer.targetY - pointer.y) * (1 - Math.exp(-dt * 4.5));
        pointerStrength += ((pointerOver ? 1 : 0) - pointerStrength) * (1 - Math.exp(-dt * 7));
      }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, width, height);
      if (background) { ctx.fillStyle = background; ctx.fillRect(0, 0, width, height); }
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      if (week === 1) drawFilaments(); else if (week === 3) drawTunnel(); else drawTypography();
      ctx.globalAlpha = 1;
      drawnFrames++;
      if (drawnFrames === 1 || drawnFrames % 60 === 0 || reduced) {
        canvas!.dataset.renderFrames = String(drawnFrames);
        canvas!.dataset.renderScene = String(week);
      }
      const theatreState = document.hidden ? 'hidden' : !visible ? 'offscreen' : reduced ? 'static' : 'playing';
      if (root!.dataset.theatreState !== theatreState) root!.dataset.theatreState = theatreState;
      averageCost = averageCost * .95 + (performance.now() - started) * .05;
      if (averageCost > 18) { slowFrames++; if (slowFrames > 45) quality = .65; } else slowFrames = Math.max(0, slowFrames - 1);
      if (!reduced && visible && !document.hidden) frame = requestAnimationFrame(render);
    }
    function wake() {
      if (!disposed && visible && !document.hidden && !frame) frame = requestAnimationFrame(render);
    }
    function resize() {
      bounds = canvas!.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return;
      width = bounds.width; height = bounds.height;
      // Cap both density and total pixels: a tall high-DPI window cannot silently
      // turn one decorative scene into a multi-megapixel per-frame paint.
      dpr = Math.min(window.devicePixelRatio || 1, width < 760 ? 1.35 : 1.65, Math.sqrt(1_550_000 / (width * height)));
      const pixelWidth = Math.round(width * dpr), pixelHeight = Math.round(height * dpr);
      if (canvas!.width !== pixelWidth || canvas!.height !== pixelHeight) { canvas!.width = pixelWidth; canvas!.height = pixelHeight; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const centerX = width * (week === 3 && width / height > 1.45 ? .7 : .5);
      background = ctx.createRadialGradient(centerX, height * .46, 0, centerX, height * .49, Math.max(width, height) * .63);
      if (week === 3) { background.addColorStop(0, '#4b376b70'); background.addColorStop(.42, '#30243c25'); background.addColorStop(1, '#16132100'); }
      else if (week === 1) { background.addColorStop(0, '#fcf0cf30'); background.addColorStop(.4, '#d8924930'); background.addColorStop(1, '#efe7d200'); }
      else { background.addColorStop(0, '#c7c4d51a'); background.addColorStop(.6, '#f3eedf00'); background.addColorStop(1, '#f3eedf00'); }
      previous.fill(Number.NaN);
      // Canvas resizing erases its bitmap. Paint one complete frame immediately,
      // even before IO or visibility events; only the animation loop is gated.
      cancelAnimationFrame(frame); frame = 0; render(performance.now(), true);
    }
    function move(event: PointerEvent) {
      if (reduced || event.pointerType === 'touch') return;
      bounds = canvas!.getBoundingClientRect(); pointerOver = true;
      pointer.pixelX = event.clientX - bounds.left; pointer.pixelY = event.clientY - bounds.top;
      pointer.targetX = clamp((pointer.pixelX / Math.max(1, width) - .5) * 2, -1, 1);
      pointer.targetY = clamp((pointer.pixelY / Math.max(1, height) - .5) * 2, -1, 1); wake();
    }
    function leave() { pointerOver = false; pointer.targetX = 0; pointer.targetY = 0; wake(); }
    function press(event: PointerEvent) { if (!reduced && event.pointerType !== 'touch') { burstAge = 0; wake(); } }
    function visibility() { cancelAnimationFrame(frame); frame = 0; lastTime = 0; root!.dataset.theatreState = document.hidden ? 'hidden' : visible ? reduced ? 'static' : 'playing' : 'offscreen'; if (!document.hidden) wake(); }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      root!.dataset.theatreState = visible ? reduced ? 'static' : 'playing' : 'offscreen';
      if (visible) { lastTime = 0; wake(); } else { cancelAnimationFrame(frame); frame = 0; lastTime = 0; }
    }, { threshold: .01 });
    const resizeObserver = new ResizeObserver(resize);
    observer.observe(root); resizeObserver.observe(root); resize();
    canvas.addEventListener('pointermove', move, { passive: true });
    canvas.addEventListener('pointerleave', leave, { passive: true });
    canvas.addEventListener('pointerdown', press, { passive: true });
    document.addEventListener('visibilitychange', visibility);
    wakeRef.current = wake;
    if (week === 5) void document.fonts.load('600 180px "Space Grotesk"').then(() => {
      if (disposed) return;
      wordA = wordSamples('WORDS', maximumParticles); wordB = wordSamples('LANGUAGE', maximumParticles); previous.fill(Number.NaN); wake();
    }).catch(() => { /* The system-font sample remains a valid local fallback. */ });
    return () => {
      disposed = true; wakeRef.current = null; cancelAnimationFrame(frame);
      observer.disconnect(); resizeObserver.disconnect();
      canvas.removeEventListener('pointermove', move); canvas.removeEventListener('pointerleave', leave); canvas.removeEventListener('pointerdown', press);
      document.removeEventListener('visibilitychange', visibility);
    };
  }, [week, reduced]);

  useEffect(() => { wakeRef.current?.(); }, [active]);

  return <div ref={rootRef} className={`particle-theatre particle-theatre-${week}`} data-reduced={reduced} data-active={active} role="img" aria-label={`${titles[week][0]}. ${titles[week][1]} An illustrative 3D composition, not measured course data.`}>
    <canvas ref={canvasRef} aria-hidden="true" />
    <div className="pt-fallback" aria-hidden="true">{week === 5 ? 'WORDS' : week === 3 ? '↗' : '✳'}</div>
    <div className="pt-caption" aria-hidden="true"><span>{titles[week][0]}</span><span>{week === 5 ? active ? 'LANGUAGE / PARTICLE FORM' : 'WORDS / PARTICLE FORM' : active ? 'ALTERNATE PERSPECTIVE' : 'FOLLOW THE CONNECTIONS'}</span></div>
    {!reduced && <span className="pt-pointer-cue" aria-hidden="true">MOVE THROUGH THE FIELD <i>↗</i></span>}
  </div>;
}
