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

// Original procedural aperture and folded-paper sculptures under studio lighting.
// These visual metaphors are not network simulations or measured optical materials.
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
  p.yz = rotation(0.32 + pointer.y * 0.20 + travel * 0.08) * p.yz;
  p.xz = rotation(0.30 + 0.18*sin(clock*0.10) + pointer.x*0.32 + travel*0.16 + phase*0.08) * p.xz;
  p.xy = rotation(-0.22 + 0.04 * sin(clock * 0.18)) * p.xy;
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
  vec3 dark = mix(vec3(0.018, 0.025, 0.032), vec3(0.07, 0.075, 0.064), pearl);
  vec3 light = mix(vec3(0.38, 0.43, 0.48), vec3(0.60, 0.59, 0.51), pearl);
  vec3 result = mix(dark, light, sky);
  float largeBox = pow(max(dot(direction, normalize(vec3(-0.65, 0.75, 0.55))), 0.0), 15.0);
  float smallBox = pow(max(dot(direction, normalize(vec3(0.75, 0.15, 0.65))), 0.0), 48.0);
  float strip = pow(max(1.0 - abs(dot(direction, normalize(vec3(0.6, 0.18, -0.7)))), 0.0), 125.0);
  float warm = pow(max(dot(direction, normalize(vec3(-0.1, -0.6, 0.8))), 0.0), 9.0);
  result += vec3(2.8, 2.85, 2.75) * largeBox;
  result += mix(vec3(0.70, 0.88, 1.05), vec3(0.8, 0.76, 0.61), pearl) * smallBox;
  result += mix(vec3(2.5, 2.65, 2.55), vec3(1.4, 1.32, 1.10), pearl) * strip;
  result += vec3(0.42,0.24,0.13) * warm;
  float violetBox = pow(max(dot(direction, normalize(vec3(0.15,0.35,-0.85))),0.0),12.0);
  result += vec3(0.24,0.29,0.25)*violetBox*pearl;
  float flag = smoothstep(0.22, 0.25, direction.x) * (1.0 - smoothstep(0.44, 0.47, direction.x));
  return result * (1.0 - flag * 0.63);
}
`;

const machineGeometry = `
float annulus(vec3 p, float radius, vec2 section, float bevel) {
  vec2 q = abs(vec2(length(p.xy)-radius,p.z))-section;
  return length(max(q,0.0))+min(max(q.x,q.y),0.0)-bevel;
}
vec2 scene(vec3 point) {
  vec3 p = objectSpace(point);
  float opening = 0.12+burst*0.8+0.04*sin(clock*0.38);
  // A precise housing, a recessed rear rim, and eight independently bevelled leaves.
  vec2 result = vec2(annulus(p,1.08,vec2(0.075,0.065),0.018),1.0);
  vec3 rear = p-vec3(0.0,0.0,-0.13);
  result = nearer(result,vec2(annulus(rear,1.04,vec2(0.10,0.025),0.012),2.0));
  float sector = floor((atan(p.y,p.x)+0.392699)/0.785398)*0.785398;
  vec3 blade = p;
  blade.xy = rotation(sector)*blade.xy;
  blade.xy -= vec2(0.67+opening*0.16,0.0);
  blade.xy = rotation(-0.50-opening*0.56)*blade.xy;
  blade.z -= 0.012+0.018*sin(sector);
  float leaf = roundBox(blade,vec3(0.35,0.115,0.029),0.022);
  result = nearer(result,vec2(leaf,2.0));
  vec3 pin = p;
  pin.xy = rotation(sector)*pin.xy;
  pin -= vec3(1.075,0.0,0.077);
  result = nearer(result,vec2(length(pin)-0.024,1.0));
  vec3 aperture = p-vec3(0.0,0.0,-0.075);
  float innerRim = annulus(aperture,0.31+opening*0.25,vec2(0.011,0.012),0.008);
  result = nearer(result,vec2(innerRim,3.0));
  return result;
}
`;

const paperGeometry = `
vec2 scene(vec3 point) {
  vec3 p = objectSpace(point);
  float radial = length(p.xy);
  vec2 unit = p.xy/max(radial,0.0001);
  float sinTwo = 2.0*unit.x*unit.y;
  float cosTwo = unit.x*unit.x-unit.y*unit.y;
  vec2 result = vec2(5.0,4.0);
  // Seven continuous folded paper bands. The blend field is intentionally gone:
  // clear edges, open space, and cast shadows keep every sheet distinguishable.
  for (int i=0; i<7; i++) {
    float radius = lobes[i].w+0.10*(unit.x*lobes[i].x-unit.y*lobes[i].y);
    float fold = 0.20*(sinTwo*lobes[i].x+cosTwo*lobes[i].y);
    vec2 crossSection = abs(vec2(radial-radius,p.z-fold-lobes[i].z))-vec2(0.135,0.012);
    float sheet = length(max(crossSection,0.0))+min(max(crossSection.x,crossSection.y),0.0)-0.005;
    result = nearer(result,vec2(sheet,4.0+float(i)*0.1));
  }
  return result;
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
    distance += max(sampleValue.x*0.64, 0.001);
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
      vec3 metal = mix(vec3(0.72,0.77,0.78),vec3(0.32,0.39,0.43),step(1.5,material));
      color = environment*metal*(0.86+0.65*fresnel);
      color += vec3(0.12,0.15,0.17)*diffuse*visibility;
      color += vec3(0.22,0.105,0.045)*pow(max(0.0,1.0-length(p)/1.25),3.0);
      color = color*ambient + vec3(2.7,2.7,2.5)*shine*visibility;
      if (material > 2.5) {
        color = vec3(1.05,0.42,0.13)+vec3(1.0,0.85,0.61)*shine;
      }
    } else {
      float sheetIndex = (material-4.0)*10.0;
      float tinted = smoothstep(3.5,5.5,sheetIndex)*0.10;
      vec3 paper = mix(vec3(0.98,0.955,0.88),vec3(0.84,0.89,0.80),tinted);
      float backLight = pow(max(dot(-n,light),0.0),2.0);
      color = paper*(0.88+0.18*diffuse*visibility)*(0.84+0.16*ambient);
      color += environment*0.014*fresnel;
      color += vec3(0.065,0.055,0.035)*backLight;
      color += vec3(0.085,0.080,0.063)*pow(1.0-facing,1.7);
    }
    color=pearl<0.5 ? finishColor(color) : clamp(color,0.0,1.0);
    alpha=1.0;
  }
  if (pearl < 0.5 && emission > 0.0) {
    float glow = min(emission,0.18);
    color += vec3(0.75,0.35,0.11)*glow*0.15;
    alpha = max(alpha,glow*0.15);
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
      const source = commonShader + (week === 2 ? machineGeometry : paperGeometry) + lightingShader.replace('PEARL_MODE', week === 4 ? '1.0' : '0.0');
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
    let last = 0, lastDraw = 0, elapsed = week === 2 ? 3.8 : 5.1, quality = 1, limitedFrameRate = false;
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
      canvas.dataset.renderQuality = quality.toFixed(2);
      canvas.dataset.frameBudget = limitedFrameRate ? '30' : '60';
      gpu.viewport(0, 0, canvas.width, canvas.height);
    };
    const updateLobes = (t: number, separation: number) => {
      // Precompute the seven fold phases and sheet spacings once per frame.
      // The inner raymarch evaluates continuous bands without per-sheet trig.
      for (let i=0; i<7; i++) {
        const angle = i*.57+t*.08;
        blobData[i*4] = Math.cos(angle);
        blobData[i*4+1] = Math.sin(angle);
        blobData[i*4+2] = (i-3)*(.15+separation*.13);
        blobData[i*4+3] = .70+i*.035+separation*.08;
      }
      gpu.uniform4fv(locations.lobes, blobData);
    };
    const draw = (now: number) => {
      if (lost || disposed || document.hidden) return;
      // Preserve the machined edges on slower devices: reduce frame frequency,
      // not successively the spatial detail of the material.
      if (limitedFrameRate && !reduced && lastDraw && now - lastDraw < 30) {
        if (visible) raf = requestAnimationFrame(draw);
        return;
      }
      const rawDt = last ? Math.max(0, now - last) : 16.7;
      const dt = Math.min(rawDt, 65);
      last = now; lastDraw = now;
      if (!reduced) elapsed += dt * .001;
      const ease = reduced ? 1 : 1 - Math.exp(-dt * .005);
      pointer.x += (target.x - pointer.x) * ease;
      pointer.y += (target.y - pointer.y) * ease;
      scroll += (targetScroll - scroll) * ease;
      const trigger = controls.current;
      const burstTarget = reduced ? (trigger.active || trigger.phase % 2 ? .72 : .18) : Math.max(trigger.active ? .65 : 0, trigger.pulse);
      smoothedBurst += (burstTarget - smoothedBurst) * (reduced ? 1 : 1 - Math.exp(-dt * .009));
      if (!reduced) trigger.pulse *= Math.exp(-dt * .00072);
      if (!reduced && visible && !limitedFrameRate && rawDt < 150) {
        sampledFrames++; sampledTime += rawDt;
        if (sampledFrames >= 75) {
          if (sampledTime / sampledFrames > 26) { quality = .85; limitedFrameRate = true; resizeBuffer(); }
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

  return <div className={`matter-sculpture matter-${week} ${unavailable ? 'matter-unavailable' : ''} ${reduced ? 'matter-still' : ''}`} data-active={active} aria-hidden="true">
    <div className="matter-atmosphere" />
    <div className="matter-orbit matter-orbit-one" /><div className="matter-orbit matter-orbit-two" />
    <canvas ref={canvasRef} className="matter-canvas" />
    {unavailable && <div className="matter-fallback"><i className="matter-fallback-core" />{Array.from({ length: week === 2 ? 8 : 7 }, (_, i) => <span key={i} style={{ '--part': i } as CSSProperties} />)}</div>}
    <div className="matter-notations"><span>{week === 2 ? 'APERTURE / A STUDY IN POSSIBILITY' : 'PAPER / FORMS OF BELONGING'}</span><span>{week === 2 ? 'STRUCTURE / CHANGE' : 'SEPARATE / TOGETHER'}</span><span>{reduced ? 'A STILL PERSPECTIVE' : 'MOVE CLOSER. CHANGE THE VIEW.'}</span></div>
  </div>;
}
