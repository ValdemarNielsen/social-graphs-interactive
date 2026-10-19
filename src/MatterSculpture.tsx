import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './matter-sculpture.css';

export type MatterSculptureProps = {
  week: 2 | 4;
  reduced: boolean;
  /** Increment to launch a fresh expansion pulse without recompiling the shader. */
  phase?: number;
  /** Optional sustained separation, independent of the transient phase pulse. */
  active?: boolean;
};

// Original procedural sculptures and studio lighting. These are visual metaphors,
// not network simulations, physical fluid models, or measured optical materials.
// Technique references (no third-party shader implementation is included):
// https://tympanus.net/codrops/2025/06/09/how-to-create-interactive-droplet-like-metaballs-with-three-js-and-glsl/
// https://tympanus.net/Tutorials/LiquidRaymarching/
const vertexSource = `
attribute vec2 position;
void main() { gl_Position = vec4(position, 0.0, 1.0); }
`;

const commonShader = `
precision highp float;
uniform vec2 resolution;
uniform vec2 pointer;
uniform float clock;
uniform float burst;
uniform float travel;
uniform float phase;
uniform vec4 lobes[7];

mat2 rotation(float angle) {
  float c = cos(angle), s = sin(angle);
  return mat2(c, -s, s, c);
}
vec3 objectSpace(vec3 p) {
  p.yz = rotation(0.38 + pointer.y * 0.32 + travel * 0.11) * p.yz;
  p.xz = rotation(clock * 0.17 + pointer.x * 0.55 + travel * 0.45 + phase * 0.13) * p.xz;
  p.xy = rotation(-0.22 + 0.06 * sin(clock * 0.31)) * p.xy;
  return p;
}
float roundBox(vec3 p, vec3 halfSize, float radius) {
  vec3 exterior = abs(p) - halfSize;
  return length(max(exterior, 0.0)) + min(max(exterior.x, max(exterior.y, exterior.z)), 0.0) - radius;
}
float ringDistance(vec3 p, float radius, float thickness) {
  return length(vec2(length(p.xy) - radius, p.z)) - thickness;
}
vec2 nearer(vec2 a, vec2 b) { return a.x < b.x ? a : b; }
float fused(float a, float b, float reach) {
  float overlap = max(reach - abs(a - b), 0.0) / reach;
  return min(a, b) - overlap * overlap * reach * 0.25;
}

// A procedural studio: broad softboxes, dark negative fill, a thin white strip,
// and a warm light reflected in the object. No cubemap or image assets required.
vec3 studio(vec3 direction, float pearl) {
  float sky = smoothstep(-0.45, 0.8, direction.y);
  vec3 dark = mix(vec3(0.012, 0.025, 0.048), vec3(0.035, 0.045, 0.105), pearl);
  vec3 light = mix(vec3(0.34, 0.48, 0.64), vec3(0.50, 0.65, 0.83), pearl);
  vec3 result = mix(dark, light, sky);
  float largeBox = pow(max(dot(direction, normalize(vec3(-0.65, 0.75, 0.55))), 0.0), 15.0);
  float smallBox = pow(max(dot(direction, normalize(vec3(0.75, 0.15, 0.65))), 0.0), 48.0);
  float strip = pow(max(1.0 - abs(dot(direction, normalize(vec3(0.6, 0.18, -0.7)))), 0.0), 125.0);
  float warm = pow(max(dot(direction, normalize(vec3(-0.1, -0.6, 0.8))), 0.0), 9.0);
  result += vec3(3.7, 3.9, 4.0) * largeBox;
  result += mix(vec3(1.1, 1.9, 3.1), vec3(3.2, 0.70, 2.0), pearl) * smallBox;
  result += mix(vec3(3.5, 3.8, 3.7), vec3(0.65, 3.3, 3.8), pearl) * strip;
  result += mix(vec3(2.8, 0.43, 0.035), vec3(1.5, 0.24, 0.72), pearl) * warm;
  float violetBox = pow(max(dot(direction, normalize(vec3(0.15,0.35,-0.85))),0.0),12.0);
  result += vec3(1.5,0.55,2.6)*violetBox*pearl;
  float flag = smoothstep(0.22, 0.25, direction.x) * (1.0 - smoothstep(0.44, 0.47, direction.x));
  return result * (1.0 - flag * 0.63);
}
`;

const machineGeometry = `
vec2 scene(vec3 point) {
  vec3 p = objectSpace(point);
  float breathing = 0.5 + 0.5 * sin(clock * 0.68);
  float spacing = 0.47 + breathing * 0.12 + burst * 0.34;
  vec3 folded = abs(p) - vec3(spacing);
  float cube = roundBox(folded, vec3(0.175), 0.055);
  float ball = length(folded) - 0.235;
  float rounding = 0.13 + 0.75 * pow(0.5 + 0.5 * sin(clock * 0.37), 3.0);
  vec2 result = vec2(mix(cube, ball, rounding), 1.0);

  // Twelve telescoping struts: a different folded axis creates each family.
  vec3 a = abs(p);
  float rods = roundBox(vec3(p.x, a.y-spacing, a.z-spacing), vec3(spacing, 0.018, 0.018), 0.015);
  rods = min(rods, roundBox(vec3(a.x-spacing, p.y, a.z-spacing), vec3(0.018, spacing, 0.018), 0.015));
  rods = min(rods, roundBox(vec3(a.x-spacing, a.y-spacing, p.z), vec3(0.018, 0.018, spacing), 0.015));
  result = nearer(result, vec2(rods, 2.0));

  vec3 g = p;
  g.yz = rotation(clock * 0.36 + burst * 0.7) * g.yz;
  float outerRing = ringDistance(g, 1.17 + burst * 0.18, 0.031);
  g = p;
  g.xz = rotation(1.15 - clock * 0.29) * g.xz;
  float middleRing = ringDistance(g, 0.92 + burst * 0.12, 0.045);
  g = p;
  g.yz = rotation(1.5708) * g.yz;
  g.xz = rotation(clock * 0.40) * g.xz;
  float innerRing = ringDistance(g, 0.53 + burst * 0.04, 0.027);
  result = nearer(result, vec2(min(outerRing, middleRing), 1.0));
  result = nearer(result, vec2(innerRing, 3.0));

  float core = length(p) - (0.245 + 0.025 * sin(clock * 1.5));
  result = nearer(result, vec2(core, 3.0));
  return result;
}
`;

const liquidGeometry = `
vec2 scene(vec3 point) {
  vec3 p = objectSpace(point);
  float distance = 5.0;
  float reach = 0.33 - burst * 0.13;
  for (int i = 0; i < 7; i++) {
    float sphere = length(p - lobes[i].xyz) - lobes[i].w;
    distance = fused(distance, sphere, reach);
  }
  return vec2(distance, 4.0);
}
`;

const lightingShader = `
vec3 normalAt(vec3 p) {
  vec2 offset = vec2(0.0018, 0.0);
  return normalize(vec3(
    scene(p+offset.xyy).x-scene(p-offset.xyy).x,
    scene(p+offset.yxy).x-scene(p-offset.yxy).x,
    scene(p+offset.yyx).x-scene(p-offset.yyx).x
  ));
}
float occlusion(vec3 p, vec3 n) {
  float shade = 0.0;
  for (int i=1; i<=3; i++) {
    float stepSize = 0.08 * float(i);
    shade += (stepSize-scene(p+n*stepSize).x) / float(i);
  }
  return clamp(1.0-shade*1.7, 0.28, 1.0);
}
float lightVisibility(vec3 p, vec3 direction) {
  float visible = 1.0, distance = 0.045;
  for (int i=0; i<8; i++) {
    float h = scene(p+direction*distance).x;
    visible = min(visible, 8.0*h/distance);
    distance += clamp(h, 0.06, 0.25);
  }
  return clamp(visible, 0.22, 1.0);
}
vec3 finishColor(vec3 color) {
  color = max(color, vec3(0.0));
  return pow(color/(vec3(1.0)+color*0.72), vec3(0.82));
}
void main() {
  vec2 uv = (gl_FragCoord.xy-resolution*0.5)/min(resolution.x,resolution.y);
  vec3 origin = vec3(0.0, 0.0, 4.7);
  vec3 direction = normalize(vec3(uv*3.45, -4.2));
  float distance = 2.2, hit = 0.0, material = 0.0, emission = 0.0;
  for (int i=0; i<80; i++) {
    vec3 point = origin+direction*distance;
    vec2 sampleValue = scene(point);
    if (sampleValue.y > 2.5 && sampleValue.y < 3.5) emission += 0.0018/(0.02+abs(sampleValue.x));
    if (sampleValue.x < 0.0018) { hit=1.0; material=sampleValue.y; break; }
    distance += max(sampleValue.x*0.75, 0.001);
    if (distance > 7.0) break;
  }

  float pearl = PEARL_MODE;
  vec2 groundUV = vec2(uv.x*3.8,(uv.y+0.36)*24.0);
  float ground = exp(-dot(groundUV,groundUV));
  float halo = exp(-dot(uv,uv)*8.0);
  vec3 background = mix(vec3(0.8,0.18,0.025), vec3(0.19,0.30,0.21), pearl);
  float alpha = mix(halo*0.045+ground*0.20, ground*0.12, pearl);
  vec3 color = background;
  if (hit > 0.5) {
    vec3 p = origin+direction*distance;
    vec3 n = normalAt(p);
    vec3 reflection = reflect(direction,n);
    float facing = clamp(dot(-direction,n),0.0,1.0);
    float fresnel = pow(1.0-facing,4.0);
    vec3 light = normalize(vec3(-0.7,0.95,1.1));
    float diffuse = max(dot(n,light),0.0);
    float visibility = lightVisibility(p+n*0.008,light);
    float ambient = occlusion(p,n);
    float shine = pow(max(dot(reflect(-light,n),-direction),0.0),110.0);
    vec3 environment = studio(reflection,pearl);

    if (pearl < 0.5) {
      vec3 metal = mix(vec3(0.57,0.65,0.71),vec3(0.14,0.21,0.26),step(1.5,material));
      color = environment*metal*(0.84+0.92*fresnel);
      color += vec3(0.13,0.20,0.27)*diffuse*visibility;
      color += vec3(1.6,0.23,0.018)*pow(max(0.0,1.0-length(p)/1.45),3.0);
      color = color*ambient + vec3(4.1,4.2,3.9)*shine*visibility;
      if (material > 2.5) {
        float bands = 0.7+0.3*sin(objectSpace(p).y*45.0+clock*2.0);
        color = vec3(3.2,0.47,0.035)*bands + vec3(1.0,0.7,0.22)*shine;
      }
    } else {
      vec3 transmittedR = refract(direction,n,1.0/1.39);
      vec3 transmittedG = refract(direction,n,1.0/1.42);
      vec3 transmittedB = refract(direction,n,1.0/1.45);
      vec3 transmission = vec3(studio(transmittedR,1.0).r,studio(transmittedG,1.0).g,studio(transmittedB,1.0).b);
      vec3 interference = 0.5+0.5*cos(vec3(0.1,2.2,4.3)+facing*8.8+p.y*0.65+clock*0.055);
      vec3 pearlTint = mix(vec3(0.70,0.89,0.80),interference,0.38+0.27*fresnel);
      float thickness = clamp(-scene(p+direction*0.36).x*2.0,0.0,1.0);
      color = environment*(0.65+fresnel*1.20)*mix(vec3(0.94,0.98,1.0),pearlTint,0.42);
      color += transmission*vec3(0.74,0.93,1.0)*(0.49+thickness*0.26);
      color += pearlTint*(0.09+diffuse*0.16)*visibility;
      color = color*(0.70+ambient*0.30) + vec3(5.2,5.4,5.0)*shine*visibility;
      color += interference*pow(1.0-facing,2.0)*0.39;
    }
    color=finishColor(color);
    alpha=1.0;
  }
  if (pearl < 0.5 && emission > 0.0) {
    float glow = min(emission,0.55);
    color += vec3(1.0,0.24,0.025)*glow*0.35;
    alpha = max(alpha,glow*0.25);
  }
  gl_FragColor=vec4(color,alpha);
}
`;

type Controls = { phase: number; active: boolean; pulse: number };

export default function MatterSculpture({ week, reduced, phase = 0, active = false }: MatterSculptureProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const redrawRef = useRef<(() => void) | null>(null);
  const controls = useRef<Controls>({ phase, active, pulse: 0 });
  const [unavailable, setUnavailable] = useState(false);
  const [generation, setGeneration] = useState(0);

  useEffect(() => {
    const previous = controls.current;
    if (previous.active && !active) previous.pulse = 0;
    else if (previous.phase !== phase || (!previous.active && active)) previous.pulse = 1;
    controls.current.phase = phase;
    controls.current.active = active;
    redrawRef.current?.();
  }, [phase, active]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let gl: WebGLRenderingContext | null = null;
    try {
      gl = canvas.getContext('webgl', { alpha: true, antialias: false, premultipliedAlpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false });
    } catch { setUnavailable(true); return; }
    if (!gl) { setUnavailable(true); return; }
    const gpu = gl;
    const shaders: WebGLShader[] = [];
    let program: WebGLProgram | null = null;
    let buffer: WebGLBuffer | null = null;
    const releaseResources = () => {
      if (buffer) gpu.deleteBuffer(buffer);
      if (program) gpu.deleteProgram(program);
      shaders.forEach(shader => gpu.deleteShader(shader));
    };
    const compile = (kind: number, source: string) => {
      const shader = gpu.createShader(kind);
      if (!shader) throw new Error('No shader allocation');
      shaders.push(shader);
      gpu.shaderSource(shader, source);
      gpu.compileShader(shader);
      if (!gpu.getShaderParameter(shader, gpu.COMPILE_STATUS)) throw new Error('Shader unavailable');
      return shader;
    };
    try {
      const highPrecision = (gpu.getShaderPrecisionFormat(gpu.FRAGMENT_SHADER, gpu.HIGH_FLOAT)?.precision ?? 0) > 0;
      const source = commonShader + (week === 2 ? machineGeometry : liquidGeometry) + lightingShader.replace('PEARL_MODE', week === 4 ? '1.0' : '0.0');
      const vertex = compile(gpu.VERTEX_SHADER, vertexSource);
      const fragment = compile(gpu.FRAGMENT_SHADER, highPrecision ? source : source.replace('precision highp float;', 'precision mediump float;'));
      program = gpu.createProgram();
      if (!program) throw new Error('No program allocation');
      gpu.attachShader(program, vertex);
      gpu.attachShader(program, fragment);
      gpu.linkProgram(program);
      if (!gpu.getProgramParameter(program, gpu.LINK_STATUS)) throw new Error('Program unavailable');
      buffer = gpu.createBuffer();
      if (!buffer) throw new Error('No geometry allocation');
      gpu.bindBuffer(gpu.ARRAY_BUFFER, buffer);
      gpu.bufferData(gpu.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gpu.STATIC_DRAW);
      gpu.useProgram(program);
      const position = gpu.getAttribLocation(program, 'position');
      gpu.enableVertexAttribArray(position);
      gpu.vertexAttribPointer(position, 2, gpu.FLOAT, false, 0, 0);
    } catch {
      releaseResources();
      setUnavailable(true);
      return;
    }
    setUnavailable(false);
    const locations = {
      resolution: gpu.getUniformLocation(program, 'resolution'),
      pointer: gpu.getUniformLocation(program, 'pointer'),
      clock: gpu.getUniformLocation(program, 'clock'),
      burst: gpu.getUniformLocation(program, 'burst'),
      travel: gpu.getUniformLocation(program, 'travel'),
      phase: gpu.getUniformLocation(program, 'phase'),
      lobes: gpu.getUniformLocation(program, 'lobes[0]'),
    };
    let raf = 0, visible = false, lost = false, disposed = false;
    let last = 0, elapsed = week === 2 ? 3.8 : 5.1, quality = 1;
    let sampledFrames = 0, sampledTime = 0, smoothedBurst = reduced ? 0.18 : 0;
    let targetScroll = 0, scroll = 0;
    const target = { x: 0, y: 0 }, pointer = { x: 0, y: 0 };
    const blobData = new Float32Array(28);
    let bounds = canvas.getBoundingClientRect();

    const resizeBuffer = () => {
      if (lost || disposed) return;
      bounds = canvas.getBoundingClientRect();
      const pixelBudget = window.innerWidth < 760 ? 280000 : 650000;
      const factor = Math.min(devicePixelRatio || 1, 1.4, Math.sqrt(pixelBudget / Math.max(1, bounds.width * bounds.height))) * quality;
      canvas.width = Math.max(1, Math.round(bounds.width * factor));
      canvas.height = Math.max(1, Math.round(bounds.height * factor));
      gpu.viewport(0, 0, canvas.width, canvas.height);
    };
    const updateLobes = (t: number, separation: number) => {
      // Seven independent centers share a blend field. CPU evaluation keeps
      // uniform trigonometry out of the distance function's inner GPU loop.
      const spread = 1 + separation * 0.82 + 0.13 * (0.5 + 0.5 * Math.sin(t * .52));
      const set = (i: number, x: number, y: number, z: number, radius: number) => {
        blobData[i * 4] = x * spread;
        blobData[i * 4 + 1] = y * spread;
        blobData[i * 4 + 2] = z * spread;
        blobData[i * 4 + 3] = radius;
      };
      set(0, -.46 + Math.sin(t * .46) * .17, .15 + Math.cos(t * .38) * .16, .10, .51);
      set(1, .47 + Math.cos(t * .39) * .14, -.06 + Math.sin(t * .51) * .17, -.05, .49);
      set(2, .07 + Math.sin(t * .31) * .22, .62 + Math.cos(t * .42) * .12, Math.sin(t * .41) * .21, .40);
      set(3, -.04 + Math.cos(t * .43) * .18, -.63 + Math.sin(t * .37) * .10, .08, .42);
      set(4, -.18 + Math.sin(t * .58) * .40, .08, .55 + Math.cos(t * .32) * .10, .32);
      set(5, Math.cos(t * .36) * .94, Math.sin(t * .36) * .72, -.27, .22);
      set(6, Math.sin(t * .42 + 1.7) * .99, Math.cos(t * .42 + 1.7) * .76, .15, .18);
      gpu.uniform4fv(locations.lobes, blobData);
    };
    const draw = (now: number) => {
      if (lost || disposed || document.hidden) return;
      const rawDt = last ? Math.max(0, now - last) : 16.7;
      const dt = Math.min(rawDt, 65);
      last = now;
      if (!reduced) elapsed += dt * .001;
      const ease = reduced ? 1 : 1 - Math.exp(-dt * .005);
      pointer.x += (target.x - pointer.x) * ease;
      pointer.y += (target.y - pointer.y) * ease;
      scroll += (targetScroll - scroll) * ease;
      const trigger = controls.current;
      const burstTarget = reduced ? (trigger.active || trigger.phase % 2 ? .72 : .18) : Math.max(trigger.active ? .65 : 0, trigger.pulse);
      smoothedBurst += (burstTarget - smoothedBurst) * (reduced ? 1 : 1 - Math.exp(-dt * .009));
      if (!reduced) trigger.pulse *= Math.exp(-dt * .00072);
      if (!reduced && visible && rawDt < 150) {
        sampledFrames++; sampledTime += rawDt;
        if (sampledFrames >= 75) {
          if (sampledTime / sampledFrames > 26 && quality > .46) { quality = Math.max(.45, quality * .78); resizeBuffer(); }
          sampledFrames = 0; sampledTime = 0;
        }
      }
      gpu.uniform2f(locations.resolution, canvas.width, canvas.height);
      gpu.uniform2f(locations.pointer, pointer.x, pointer.y);
      gpu.uniform1f(locations.clock, elapsed);
      gpu.uniform1f(locations.burst, smoothedBurst);
      gpu.uniform1f(locations.travel, reduced ? 0 : scroll);
      gpu.uniform1f(locations.phase, trigger.phase);
      if (week === 4) updateLobes(elapsed, smoothedBurst);
      gpu.drawArrays(gpu.TRIANGLES, 0, 3);
      if (visible && !reduced) raf = requestAnimationFrame(draw);
    };
    const redraw = () => {
      if (lost || disposed || document.hidden) return;
      cancelAnimationFrame(raf);
      last = performance.now();
      draw(last);
    };
    redrawRef.current = redraw;
    const resize = () => { resizeBuffer(); redraw(); };
    const move = (event: PointerEvent) => {
      if (reduced || lost) return;
      const rect = canvas.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, (event.clientX - rect.left) / Math.max(1, rect.width) * 2 - 1));
      target.y = Math.max(-1, Math.min(1, (event.clientY - rect.top) / Math.max(1, rect.height) * 2 - 1));
    };
    const leave = () => { target.x = 0; target.y = 0; };
    const pulse = () => { controls.current.pulse = 1; if (reduced) return; redraw(); };
    const onScroll = () => {
      if (!visible || reduced || lost) return;
      const stage = canvas.closest('.cover-stage') ?? canvas;
      const rect = stage.getBoundingClientRect();
      targetScroll = Math.max(-1, Math.min(1, (window.innerHeight * .35 - rect.top) / Math.max(1, rect.height)));
    };
    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (visible && !document.hidden) redraw();
    };
    const onLoss = (event: Event) => {
      event.preventDefault(); lost = true;
      cancelAnimationFrame(raf);
      setUnavailable(true);
    };
    const onRestore = () => { if (!disposed) setGeneration(value => value + 1); };
    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) { onScroll(); redraw(); }
    }, { threshold: .01 });
    const resizer = new ResizeObserver(resize);
    canvas.addEventListener('pointermove', move);
    canvas.addEventListener('pointerleave', leave);
    canvas.addEventListener('click', pulse);
    canvas.addEventListener('webglcontextlost', onLoss);
    canvas.addEventListener('webglcontextrestored', onRestore);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('scroll', onScroll, { passive: true });
    resizeBuffer();
    intersection.observe(canvas);
    resizer.observe(canvas);
    return () => {
      disposed = true;
      redrawRef.current = null;
      cancelAnimationFrame(raf);
      intersection.disconnect(); resizer.disconnect();
      canvas.removeEventListener('pointermove', move);
      canvas.removeEventListener('pointerleave', leave);
      canvas.removeEventListener('click', pulse);
      canvas.removeEventListener('webglcontextlost', onLoss);
      canvas.removeEventListener('webglcontextrestored', onRestore);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('scroll', onScroll);
      releaseResources();
    };
  }, [week, reduced, generation]);

  return <div className={`matter-sculpture matter-${week} ${unavailable ? 'matter-unavailable' : ''} ${reduced ? 'matter-still' : ''}`} aria-hidden="true">
    <div className="matter-atmosphere" />
    <div className="matter-orbit matter-orbit-one" /><div className="matter-orbit matter-orbit-two" />
    <canvas ref={canvasRef} className="matter-canvas" />
    {unavailable && <div className="matter-fallback"><i className="matter-fallback-core" />{Array.from({ length: week === 2 ? 8 : 7 }, (_, i) => <span key={i} style={{ '--part': i, left: `${(week === 2 ? 14 : 3) + i % 3 * (week === 2 ? 27 : 24)}%`, top: `${(week === 2 ? 12 : 3) + Math.floor(i / 3) * (week === 2 ? 27 : 24)}%` } as CSSProperties} />)}</div>}
    <div className="matter-notations"><span>{week === 2 ? 'THE POSSIBILITY ENGINE' : 'FORMS OF BELONGING'}</span><span>{week === 2 ? 'STRUCTURE / CHANGE' : 'SEPARATE / TOGETHER'}</span><span>{reduced ? 'A STILL PERSPECTIVE' : 'MOVE CLOSER. CHANGE THE VIEW.'}</span></div>
  </div>;
}
