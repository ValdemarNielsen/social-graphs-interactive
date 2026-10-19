import { useEffect, useRef } from 'react';
import './particle-theatre.css';

export type ParticleTheatreProps = { week: 1 | 3 | 5; reduced: boolean; active?: boolean };
type XYZ = { x: number; y: number; z: number };
type Projection = { cy: number; sy: number; cx: number; sx: number; cz: number; sz: number; scale: number; centerX: number; centerY: number; pointerX: number; pointerY: number; influence: number };
const TAU = Math.PI * 2;
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

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

/** Continuous locally typeset ink. Each sheet is a solid print, not a dot sample. */
function wordPlate(word: string, shadow = false) {
  const plate = document.createElement('canvas'); plate.width = 1440; plate.height = 440;
  const ink = plate.getContext('2d');
  if (ink) {
    ink.font = `500 ${word.length > 5 ? 230 : 300}px "Space Grotesk", sans-serif`;
    ink.textAlign = 'center'; ink.textBaseline = 'middle';
    const finish = ink.createLinearGradient(0, 80, 0, 355);
    finish.addColorStop(0, '#344c91'); finish.addColorStop(.42, '#19366b'); finish.addColorStop(1, '#5873ad');
    ink.fillStyle = shadow ? '#172746' : finish;
    ink.fillText(word, 720, 232, 1340);
  }
  return plate;
}

const titles = {
  1: ['THE SHAPE OF A RELATIONSHIP', 'Continuous strands open into a connected form.'],
  3: ['AN ARCHITECTURE OF ROUTES', 'A continuous passage changes its perspective.'],
  5: ['LANGUAGE, IN FORM', 'Printed words separate into ribbons and become another word.'],
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
    const strandCount = 16, strandSteps = 145;
    const strands = Array.from({ length: strandCount }, () => new Float32Array(strandSteps * 4));
    const scratch = new Float32Array(16);
    let plates = week === 5 ? [wordPlate('WORDS'), wordPlate('LANGUAGE'), wordPlate('WORDS', true), wordPlate('LANGUAGE', true)] : [];
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
    function line(points: Float32Array, count: number, color: string | CanvasGradient, strokeWidth: number, stride = 4) {
      ctx.beginPath();
      for (let i = 0; i < count; i++) { const at = i * stride; if (i === 0) ctx.moveTo(points[at], points[at + 1]); else ctx.lineTo(points[at], points[at + 1]); }
      ctx.strokeStyle = color; ctx.lineWidth = strokeWidth; ctx.stroke();
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
      const scale = Math.min(width / 540, height / 540) * 1.12;
      const view = camera(.45 + Math.sin(time * .09) * .35 + pointer.x * .25, -.24 + pointer.y * .17, -.38 + phase * .17, scale);
      const sorted: { strand: number; depth: number }[] = [];
      for (let strand = 0; strand < strandCount; strand++) {
        let depth = 0;
        for (let i = 0; i < strandSteps; i++) {
          pointOnStrand(strand, i / (strandSteps - 1) * TAU, tangent);
          project(tangent.x, tangent.y, tangent.z, view, strands[strand], i * 4, .45);
          depth += strands[strand][i * 4 + 3];
        }
        sorted.push({ strand, depth: depth / strandSteps });
      }
      sorted.sort((a, b) => b.depth - a.depth);
      const copper = ctx.createLinearGradient(width * .25, height * .15, width * .68, height * .75);
      copper.addColorStop(0, '#e1b99c'); copper.addColorStop(.25, '#9b594a'); copper.addColorStop(.48, '#d49676'); copper.addColorStop(.72, '#713e38'); copper.addColorStop(1, '#c99b7c');
      const blue = ctx.createLinearGradient(width * .2, height * .1, width * .75, height * .85);
      blue.addColorStop(0, '#a9b9c6'); blue.addColorStop(.3, '#4c6072'); blue.addColorStop(.6, '#273f56'); blue.addColorStop(1, '#7b929d');
      for (const { strand, depth } of sorted) {
        const points = strands[strand], front = clamp(.86 - depth / 600, .45, 1);
        ctx.globalAlpha = front;
        line(points, strandSteps, '#26323e14', 6 * scale);
        line(points, strandSteps, strand < 5 ? copper : blue, (strand % 4 === 0 ? 2.65 : 1.65) * Math.max(.75, scale));
        if (strand % 4 === 0) { ctx.globalAlpha = front * .42; line(points, strandSteps, '#fff9e3', .55 * scale); }
      }
      ctx.globalAlpha = 1;
      // Six quiet anchors and six travelling inlays replace the scattered lights.
      for (let i = 0; i < 6; i++) {
        pointOnStrand(i * 2, i / 6 * TAU + .32, tangent); project(tangent.x, tangent.y, tangent.z, view, scratch, 0, .45);
        const radius = (i === 2 ? 5.4 : 3.7) * scratch[2] * scale;
        const pearl = ctx.createRadialGradient(scratch[0] - radius * .3, scratch[1] - radius * .4, 0, scratch[0], scratch[1], radius);
        pearl.addColorStop(0, '#fff5dd'); pearl.addColorStop(.3, '#d5b18e'); pearl.addColorStop(1, '#775c49');
        ctx.fillStyle = pearl; ctx.strokeStyle = '#fff3da'; ctx.lineWidth = .7;
        ctx.beginPath(); ctx.arc(scratch[0], scratch[1], Math.max(1.4, radius), 0, TAU); ctx.fill(); ctx.stroke();
        const u = i / 6 * TAU + time * .14;
        pointOnStrand(i * 2 + 1, u, tangent); project(tangent.x, tangent.y, tangent.z, view, scratch, 0, .45);
        pointOnStrand(i * 2 + 1, u - .045, tangent); project(tangent.x, tangent.y, tangent.z, view, scratch, 4, .45);
        ctx.strokeStyle = '#efe4c8'; ctx.lineWidth = 2 * scale;
        ctx.beginPath(); ctx.moveTo(scratch[4], scratch[5]); ctx.lineTo(scratch[0], scratch[1]); ctx.stroke();
      }
      ctx.strokeStyle = '#4654662a'; ctx.lineWidth = .7;
      ctx.beginPath(); ctx.ellipse(width * .5, height * .49 + 219 * scale, 117 * scale, 8 * scale, 0, 0, TAU); ctx.stroke();
    }

    function tunnelPoint(angle: number, z: number, out: Float32Array, offset: number, radialOffset = 0) {
      const depth = Math.max(100, z), bend = depth / 1900;
      const twist = .13 * Math.sin(depth * .001 + time * .06) + phase * .5;
      const radius = 253 + Math.sin(depth * .0015) * 12 + phase * 28 + radialOffset;
      const x = Math.sin(depth * .001 + time * .055) * 105 * bend + pointer.x * 95 * bend + Math.cos(angle + twist) * radius;
      const y = Math.cos(depth * .0009 + time * .045) * 48 * bend + pointer.y * 80 * bend + Math.sin(angle + twist) * radius;
      const perspective = 470 / depth, scale = Math.min(width / 660, height / 620), roll = -.13 + phase * .32;
      out[offset] = width * (width / height > 1.45 ? .7 : .5) + (x * Math.cos(roll) - y * Math.sin(roll)) * perspective * scale;
      out[offset + 1] = height * .46 + (x * Math.sin(roll) + y * Math.cos(roll)) * perspective * scale;
      out[offset + 2] = perspective * scale; out[offset + 3] = depth;
    }

    function drawTunnel() {
      // Six continuous ribs, with material gradients and precise edges.
      for (let rib = 0; rib < 6; rib++) {
        const angle = rib / 6 * TAU, band = rib % 2 ? .06 : .105, points = strands[rib];
        ctx.beginPath();
        for (let side = 0; side < 2; side++) for (let i = 0; i < 110; i++) {
          const j = side ? 109 - i : i, z = 145 + j / 109 * 2900;
          tunnelPoint(angle + (side ? band : -band), z, scratch, 0);
          if (!side && !i) ctx.moveTo(scratch[0], scratch[1]); else ctx.lineTo(scratch[0], scratch[1]);
        }
        ctx.closePath();
        const material = ctx.createLinearGradient(width * .3, height * .1, width * .9, height * .8);
        material.addColorStop(0, rib % 2 ? '#a8a4bf1f' : '#bfc5b029'); material.addColorStop(.5, '#8b829b14'); material.addColorStop(1, '#d0c3b847');
        ctx.fillStyle = material; ctx.fill();
        for (let i = 0; i < strandSteps; i++) tunnelPoint(angle - band, 145 + i / (strandSteps - 1) * 2900, points, i * 4);
        line(points, strandSteps, rib % 2 ? '#b8a9cc69' : '#d1d5b684', 1.1);
      }
      // Widely spaced frames give depth without a dense wire cloud.
      for (let ring = 12; ring >= 0; ring--) {
        const z = 180 + ring * 230 - travel % 230, points = strands[ring];
        for (let i = 0; i < strandSteps; i++) tunnelPoint(i / (strandSteps - 1) * TAU, z, points, i * 4);
        ctx.globalAlpha = clamp(1 - z / 3300, .08, .8);
        line(points, strandSteps, '#0d132338', 5.5 * Math.min(1.3, 470 / Math.max(150, z)));
        line(points, strandSteps, ring % 3 ? '#9e9aaf' : '#d3d4bd', ring % 3 ? .8 : 1.45);
      }
      ctx.globalAlpha = 1;
      for (let i = 0; i < 12; i++) {
        const angle = i / 6 * TAU, z = 190 + ((i * 253 - travel * 1.3) % 2650 + 2650) % 2650;
        tunnelPoint(angle, z, scratch, 0, -5); tunnelPoint(angle, z + 38, scratch, 4, -5);
        ctx.globalAlpha = clamp(1 - z / 3000, .1, .8); ctx.strokeStyle = i % 3 ? '#cec3dd' : '#e3dfba'; ctx.lineWidth = clamp(scratch[2] * 1.7, .65, 3);
        ctx.beginPath(); ctx.moveTo(scratch[4], scratch[5]); ctx.lineTo(scratch[0], scratch[1]); ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    function drawTypography() {
      if (plates.length !== 4) return;
      const scale = Math.min(width / 770, height / 350), flight = Math.max(Math.sin(phase * Math.PI), burst * .7);
      const view = camera(pointer.x * .12 + flight * .13, -.07 + pointer.y * .12, -.015, scale);
      view.centerY = height * .48;
      const slices = 12, stripHeight = 220 / slices;
      const change = clamp((phase - .27) / .46, 0, 1), blend = change * change * (3 - 2 * change);
      if (flight < .002) {
        // At rest, one projected sheet and one image have no internal raster edges.
        project(-360, -110, 0, view, scratch, 0, 0);
        project(360, -110, 0, view, scratch, 4, 0);
        project(-360, 110, 0, view, scratch, 8, 0);
        ctx.save();
        ctx.transform((scratch[4] - scratch[0]) / 720, (scratch[5] - scratch[1]) / 720, (scratch[8] - scratch[0]) / 220, (scratch[9] - scratch[1]) / 220, scratch[0], scratch[1]);
        const paper = ctx.createLinearGradient(0, 0, 0, 220);
        paper.addColorStop(0, '#f8f2e2'); paper.addColorStop(.76, '#f0e9d9'); paper.addColorStop(1, '#e8e0cd');
        ctx.globalAlpha = 1; ctx.fillStyle = paper; ctx.fillRect(0, 0, 720, 220);
        ctx.drawImage(plates[phase > .5 ? 1 : 0], 0, 0, 1440, 440, 0, 0, 720, 220);
        ctx.restore();
      } else for (let i = 0; i < slices; i++) {
        const y = -110 + i * stripHeight, shift = (i % 2 ? 1 : -1) * flight * (20 + i * 3.5);
        const lift = Math.sin(i * .68) * flight * 115, spreadY = (i - 5.5) * flight * 8;
        project(-360 + shift, y + spreadY, lift, view, scratch, 0, 0);
        project(360 + shift, y + spreadY + flight * (i - 5.5) * 1.8, lift + flight * 26, view, scratch, 4, 0);
        project(-360 + shift, y + stripHeight + spreadY, lift, view, scratch, 8, 0);
        ctx.save();
        ctx.transform((scratch[4] - scratch[0]) / 720, (scratch[5] - scratch[1]) / 720, (scratch[8] - scratch[0]) / stripHeight, (scratch[9] - scratch[1]) / stripHeight, scratch[0], scratch[1]);
        // Sample one continuous paper gradient across all strips. Separate edges
        // and cast shadows emerge only while the sheet is being peeled apart.
        const paper = ctx.createLinearGradient(0, -i * stripHeight, 0, 220 - i * stripHeight);
        paper.addColorStop(0, '#f8f2e2'); paper.addColorStop(.76, '#f0e9d9'); paper.addColorStop(1, '#e8e0cd');
        ctx.globalAlpha = flight * .32; ctx.fillStyle = '#29364e'; ctx.fillRect(3, 4 + flight * 4, 720, stripHeight);
        ctx.globalAlpha = 1; ctx.fillStyle = paper; ctx.fillRect(0, 0, 720, stripHeight + .35);
        const sourceY = i * 440 / slices, sourceHeight = 440 / slices + .6;
        const stamp = (texture: HTMLCanvasElement, alpha: number, extrusion: boolean) => {
          if (alpha < .001) return;
          ctx.globalAlpha = alpha * (extrusion ? .12 * flight : 1);
          ctx.drawImage(texture, 0, sourceY, 1440, sourceHeight, extrusion ? 1.4 : 0, extrusion ? 2 : 0, 720, stripHeight + .3);
        };
        stamp(plates[2], 1 - blend, true); stamp(plates[3], blend, true);
        stamp(plates[0], 1 - blend, false); stamp(plates[1], blend, false);
        ctx.restore();
      }
      ctx.globalAlpha = 1; ctx.strokeStyle = '#314c8236'; ctx.lineWidth = .7;
      for (const side of [-1, 1]) {
        const x = width * .5 + side * 374 * scale, y = height * .48;
        ctx.beginPath(); ctx.moveTo(x, y - 91 * scale); ctx.lineTo(x, y + 91 * scale); ctx.moveTo(x - side * 12, y - 91 * scale); ctx.lineTo(x, y - 91 * scale); ctx.stroke();
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
      if (activeRef.current !== previousActive) { previousActive = activeRef.current; burstAge = 0; }
      const target = activeRef.current ? 1 : 0;
      if (reduced) { phase = target; burst = 0; pointerStrength = 0; }
      else {
        time += dt; travel += dt * (72 + phase * 48);
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
      if (week === 3) { background.addColorStop(0, '#54485c36'); background.addColorStop(.55, '#29253b13'); background.addColorStop(1, '#16132100'); }
      else if (week === 1) { background.addColorStop(0, '#fff4db27'); background.addColorStop(.5, '#c9b59816'); background.addColorStop(1, '#efe7d200'); }
      else { background.addColorStop(0, '#e6e1d626'); background.addColorStop(1, '#f3eedf00'); }
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
    if (week === 5) void document.fonts.load('500 230px "Space Grotesk"').then(() => {
      if (disposed) return;
      plates = [wordPlate('WORDS'), wordPlate('LANGUAGE'), wordPlate('WORDS', true), wordPlate('LANGUAGE', true)]; wake();
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
    <div className="pt-caption" aria-hidden="true"><span>{titles[week][0]}</span><span>{week === 5 ? active ? 'LANGUAGE / PRINTED FORM' : 'WORDS / PRINTED FORM' : active ? 'ANOTHER PERSPECTIVE' : 'FORM / RELATIONSHIP'}</span></div>
    {!reduced && <span className="pt-pointer-cue" aria-hidden="true">CHANGE THE PERSPECTIVE <i>↗</i></span>}
  </div>;
}
