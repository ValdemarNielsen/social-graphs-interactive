import { useEffect, useId, useRef, useState } from 'react';
import './hero-experience.css';

type Point = { x: number; y: number };
const WORD = 'connected.';
const clamp = (value: number, low = 0, high = 1) => Math.max(low, Math.min(high, value));
const mix = (a: number, b: number, t: number) => a + (b - a) * t;

/** Original vector illustration: articulated limbs, suit panels and drawn webbing. */
function SpiderIllustration({ prefix }: { prefix: string }) {
  const head = 'M202 77 C214 58 248 62 260 82 C270 102 256 132 238 145 C220 144 199 129 194 110 C190 97 194 86 202 77Z';
  const torso = 'M195 151 C214 143 243 143 262 157 C283 177 287 209 274 236 L252 294 C233 309 210 310 191 298 L174 254 C166 225 163 185 178 166Z';
  return <svg viewBox="0 0 420 500" xmlns="http://www.w3.org/2000/svg" className="hx-spider-art" aria-hidden="true">
    <defs>
      <linearGradient id={`${prefix}-red`} x1="0" x2="1" y1="0" y2="1"><stop stopColor="#ff644f"/><stop offset=".48" stopColor="#eb3e36"/><stop offset="1" stopColor="#a91f32"/></linearGradient>
      <linearGradient id={`${prefix}-blue`} x1="0" x2="1" y1="0" y2="1"><stop stopColor="#2c74ac"/><stop offset=".55" stopColor="#24517c"/><stop offset="1" stopColor="#132c4f"/></linearGradient>
      <linearGradient id={`${prefix}-eye`} x1="0" x2="1" y1="0" y2="1"><stop stopColor="#fffef2"/><stop offset="1" stopColor="#c5e1dc"/></linearGradient>
      <clipPath id={`${prefix}-mask`}><path d={head}/></clipPath>
      <clipPath id={`${prefix}-chest`}><path d={torso}/></clipPath>
    </defs>
    <g stroke="#13273a" strokeWidth="4.5" strokeLinejoin="round" strokeLinecap="round">
      {/* The two bent legs have distinct thigh, calf and boot silhouettes. */}
      <path d="M226 280 C256 282 279 302 299 320 L339 306 C355 304 368 316 368 333 C363 348 347 360 327 367 C311 373 296 368 278 358 L229 332 C213 316 211 294 226 280Z" fill={`url(#${prefix}-blue)`}/>
      <path d="M337 310 C353 308 369 316 371 335 L379 374 L400 390 C409 398 407 410 396 416 L365 409 C352 402 344 390 339 376 L326 346Z" fill={`url(#${prefix}-red)`}/>
      <path d="M340 342 C351 342 362 339 371 334 M342 357 C352 357 366 352 374 348 M346 372 C355 374 369 368 377 361 M355 389 C366 390 375 384 381 376 M370 401 L383 382 M350 322 C353 346 360 369 372 394" fill="none" strokeWidth="1.3" opacity=".6"/>
      <path d="M198 280 C171 291 144 313 122 337 C111 348 112 367 128 374 C145 379 161 367 175 354 L223 325 C242 314 239 289 222 281Z" fill={`url(#${prefix}-blue)`}/>
      <path d="M121 342 C135 337 148 343 154 359 L169 407 L181 431 C185 444 178 454 164 456 L129 455 C116 451 118 439 131 434 L141 428 L127 391 C113 372 110 355 121 342Z" fill={`url(#${prefix}-red)`}/>
      <path d="M118 356 C129 363 143 363 155 357 M120 373 C132 380 147 379 160 374 M128 390 C141 396 153 391 164 387 M135 409 C148 415 161 410 170 405 M139 427 C152 431 169 427 177 424 M130 348 C132 376 144 402 152 432 M127 445 L174 441" fill="none" strokeWidth="1.3" opacity=".58"/>
      <path d="M238 304 C260 312 280 335 302 343 M143 348 C156 332 177 318 195 310" fill="none" stroke="#a5d5df" strokeWidth="2" opacity=".24"/>
      {/* Raised arm grips the overhead web. */}
      <path d="M252 160 C266 143 279 129 292 108 L314 71 C323 61 339 64 344 77 C346 89 331 113 323 127 L293 175 C285 190 265 193 253 180Z" fill={`url(#${prefix}-blue)`}/>
      <path d="M291 109 L310 73 L314 58 C312 46 316 35 323 33 C329 33 330 42 329 49 L333 35 C337 28 344 31 343 39 L342 51 C348 43 355 47 352 55 L344 76 C345 89 332 106 320 122Z" fill={`url(#${prefix}-red)`}/>
      <path d="M302 90 C314 96 327 102 335 104 M310 75 C321 81 335 85 342 84 M315 59 L344 70 M319 43 L340 55 M321 70 L307 111 M337 79 L323 115" fill="none" strokeWidth="1.3" opacity=".6"/>
      <path d="M322 53 L339 57 M322 61 L338 65" fill="none" strokeWidth="2"/>
      {/* Torso, blue side panels, abdominal articulation, and chest emblem. */}
      <path d={torso} fill={`url(#${prefix}-red)`}/>
      <path d="M181 183 C182 217 189 230 204 242 L212 299 L190 294 L176 251 C169 227 170 200 181 183Z" fill={`url(#${prefix}-blue)`} strokeWidth="3"/>
      <path d="M263 168 C275 191 277 219 264 237 L246 298 L229 304 L233 240 C255 222 258 194 263 168Z" fill={`url(#${prefix}-blue)`} strokeWidth="3"/>
      <g clipPath={`url(#${prefix}-chest)`} fill="none" strokeWidth="1.1" opacity=".45">
        <path d="M226 151 L220 303 M226 151 L181 281 M226 151 L267 278 M226 151 L166 215 M226 151 L286 207"/>
        <path d="M173 174 Q224 196 275 173 M169 191 Q224 215 281 190 M171 211 Q224 234 281 209 M177 232 Q225 253 273 231 M183 254 Q226 273 262 252 M188 276 Q226 291 255 275"/>
      </g>
      <path d="M212 248 Q221 253 233 247 M213 266 Q221 271 230 266 M215 285 L228 285" fill="none" strokeWidth="2" opacity=".72"/>
      <g fill="#14263a" stroke="#14263a" strokeWidth="2.4">
        <ellipse cx="225" cy="208" rx="5" ry="10"/><ellipse cx="225" cy="194" rx="3.5" ry="4"/>
        <path d="M221 201 L209 191 L206 177 M229 201 L240 190 L244 177 M221 207 L205 203 L197 192 M229 207 L245 202 L253 190 M221 213 L206 222 L201 235 M229 213 L241 220 L247 231 M222 216 L214 231 L215 244 M228 216 L235 229 L233 243" fill="none"/>
      </g>
      {/* Forward arm and characteristic web-shooting hand. */}
      <g className="hx-reaching-arm">
      <path d="M185 165 C168 166 157 180 145 190 L116 193 C105 198 105 214 116 224 C129 230 146 222 161 217 L193 197 C204 185 200 171 185 165Z" fill={`url(#${prefix}-red)`}/>
      <path d="M122 192 C105 190 86 195 71 201 L57 196 L44 184 C38 181 33 185 38 192 L49 204 L33 200 C25 200 24 206 32 210 L48 218 C39 222 43 230 49 228 L64 222 L80 222 L121 218 C136 211 136 199 122 192Z" fill={`url(#${prefix}-red)`}/>
      <path d="M63 200 L63 219 M78 199 Q81 209 80 221 M96 194 Q101 205 98 220 M115 193 Q120 204 116 220 M73 211 L126 205 M142 192 Q146 204 154 217 M159 177 Q160 193 171 209 M176 167 Q176 181 188 200" fill="none" strokeWidth="1.2" opacity=".6"/>
      <path d="M52 203 L60 207 L52 215 M46 214 L55 217" fill="none" strokeWidth="2"/>
      </g>
      {/* Neck and the mask are deliberately larger than realistic proportions. */}
      <g className="hx-mask-joint">
      <path d="M217 134 L211 154 Q232 168 247 149 L243 127Z" fill={`url(#${prefix}-red)`}/>
      <path d={head} fill={`url(#${prefix}-red)`}/>
      <g clipPath={`url(#${prefix}-mask)`} fill="none" strokeWidth="1.2" opacity=".56">
        <path d="M225 105 L212 59 M225 105 L236 61 M225 105 L262 75 M225 105 L275 98 M225 105 L261 124 M225 105 L239 151 M225 105 L213 148 M225 105 L189 125 M225 105 L184 94 M225 105 L195 73"/>
        <path d="M198 78 Q225 88 256 80 M191 94 Q224 103 268 95 M192 113 Q225 124 261 112 M203 131 Q225 140 251 128 M211 64 Q202 103 221 144 M240 65 Q249 105 235 145"/>
      </g>
      <path d="M201 92 C208 95 216 101 220 111 C211 113 203 110 200 104 C199 100 199 95 201 92Z" fill={`url(#${prefix}-eye)`} strokeWidth="4"/>
      <path d="M231 108 C234 96 243 86 255 82 C256 94 251 108 239 113 C236 113 233 111 231 108Z" fill={`url(#${prefix}-eye)`} strokeWidth="4"/>
      </g>
      <path d="M207 76 C216 69 230 69 238 73 M186 172 C178 178 173 184 172 190 M124 347 Q132 344 138 350" fill="none" stroke="#ffe0c2" strokeWidth="2.2" opacity=".55"/>
    </g>
  </svg>;
}

export default function HeroExperience({ reduced }: { reduced: boolean }) {
  const root = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const actor = useRef<HTMLDivElement>(null);
  const letters = useRef<(HTMLSpanElement | null)[]>([]);
  const threads = useRef<SVGSVGElement>(null);
  const rope = useRef<SVGPathElement>(null);
  const shot = useRef<SVGPathElement>(null);
  const fan = useRef<SVGPathElement>(null);
  const chain = useRef<SVGPathElement>(null);
  const burst = useRef<SVGGElement>(null);
  const phase = useRef<HTMLOutputElement>(null);
  const replay = useRef<() => void>(() => {});
  const [played, setPlayed] = useState(false);
  const prefix = useId().replaceAll(':', '');

  useEffect(() => {
    const section = root.current, viewport = stage.current, figure = actor.current;
    if (!section || !viewport || !figure) return;
    let alive = true, visible = true, frameId = 0, lastTime: number | null = null, progress = 0, drawnFrames = 0;
    let mode: 'scroll' | 'replay' | 'hold' | 'static' = reduced ? 'static' : 'scroll';
    let requestedProgress = reduced ? .5 : 0, lastScrollProgress = 0, staticEnd = false;
    let needsMeasure = true, scrollDirty = true, scrollInput = false;
    let replayElapsed = 0, replayClock: number | null = null, replayFrom = 0, replayLeadIn = 0;
    const replayDuration = 5800;
    // A 50 ms time constant closes 96% of a scroll gap in 160 ms. Only this
    // RAF owns the playhead, articulated pose, and attached SVG webs. This
    // first-order response approaches its target without velocity or overshoot.
    const scrubTimeConstant = .05;
    let width = 1, height = 1;
    let scrollStart = 0, scrollRange = 1;
    let actorBox = { x: 0, y: 0, width: 1, height: 1 };
    let letterBoxes: { x: number; y: number; width: number; height: number }[] = [];
    const pose = { x: 40, y: -24, rotation: 6 };
    const reachingArm = figure.querySelector('.hx-reaching-arm');
    const maskJoint = figure.querySelector('.hx-mask-joint');
    const target = { x: 40, y: -24, rotation: 6, shoot: 0, tension: 0, hang: 0 };
    // One approach, one pull, one controlled release. No recoil keyframes:
    // a fixed progress always yields exactly the same actor and letter pose.
    const beats = [
      [0, 40, -24, 6, 0, 0, 0],
      [.24, 0, 0, -4, 0, 0, 0],
      [.36, 0, 0, -4, 1, 0, 0],
      [.55, 48, -54, -12, 1, 1, 0],
      [.63, 48, -54, -12, 1, 1, 0],
      [.88, 12, -6, -4, 1, 0, 1],
      [1, 12, -6, -4, 1, 0, 1],
    ];
    const pointOnActor = (x: number, y: number): Point => {
      const originX = actorBox.width * .5, originY = actorBox.height * .25;
      const dx = x / 420 * actorBox.width - originX, dy = y / 500 * actorBox.height - originY;
      const angle = pose.rotation * Math.PI / 180;
      return { x: actorBox.x + originX + pose.x + dx * Math.cos(angle) - dy * Math.sin(angle), y: actorBox.y + originY + pose.y + dx * Math.sin(angle) + dy * Math.cos(angle) };
    };
    function updateTarget(value: number) {
      progress = clamp(value);
      section!.dataset.heroProgress = progress.toFixed(3);
      let index = beats.findIndex((beat, i) => i < beats.length - 1 && progress <= beats[i + 1][0]);
      if (index < 0) index = beats.length - 2;
      const a = beats[index], b = beats[index + 1];
      const t = clamp((progress - a[0]) / (b[0] - a[0]));
      const eased = t * t * (3 - 2 * t);
      const scale = width < 650 ? .56 : 1;
      target.x = mix(a[1], b[1], eased) * scale;
      target.y = mix(a[2], b[2], eased) * scale;
      target.rotation = mix(a[3], b[3], eased);
      target.shoot = mix(a[4], b[4], eased);
      target.tension = mix(a[5], b[5], eased);
      target.hang = mix(a[6], b[6], eased);
      if (phase.current) phase.current.textContent = progress < .28 ? '01 / Follow the thread' : progress < .63 ? '02 / One connection changes everything' : '03 / Nothing moves alone';
    }
    function draw() {
      const scale = width < 650 ? .56 : 1;
      // The playhead is already eased. A second actor-only filter would make
      // its shoulder and hand trail the web-shooting beat by a different amount.
      for (const key of ['x', 'y', 'rotation'] as const) pose[key] = target[key];
      figure!.style.transform = `translate3d(${pose.x}px,${pose.y}px,0) rotate(${pose.rotation}deg)`;
      reachingArm?.setAttribute('transform', `rotate(${target.tension * 18} 185 185)`);
      maskJoint?.setAttribute('transform', `rotate(${-target.tension * 9} 230 145)`);
      const anchors: Point[] = [];
      Array.from(WORD).forEach((_, i) => {
        const influence = Math.pow((i + 1) / WORD.length, 1.8);
        const arc = Math.sin(i / (WORD.length - 1) * Math.PI);
        const tx = (54 * influence * target.tension - (i - 4) * .8 * target.hang) * scale;
        const direction = width < 650 ? 1 : -1;
        const ty = (direction * 118 * influence * target.tension + arc * 54 * target.hang) * scale;
        const tr = direction * 19 * influence * target.tension + Math.cos(i / (WORD.length - 1) * Math.PI) * 13 * target.hang;
        // Sag is part of the pose, not a spring simulation. The letters retain
        // their limp arc while stopping and reversing with the character.
        const particle = { x: tx, y: ty, rotation: tr };
        const element = letters.current[i];
        if (element) element.style.transform = `translate3d(${particle.x}px,${particle.y}px,0) rotate(${particle.rotation}deg)`;
        const box = letterBoxes[i];
        if (box) {
          const angle = particle.rotation * Math.PI / 180;
          const anchorOffset = box.height * -.06;
          anchors.push({ x: box.x + box.width * .5 + particle.x - anchorOffset * Math.sin(angle), y: box.y + box.height * .25 + particle.y + anchorOffset * Math.cos(angle) });
        }
      });
      const armAngle = target.tension * 18 * Math.PI / 180;
      const wristLocal = { x: 185 - 140 * Math.cos(armAngle) - 18 * Math.sin(armAngle), y: 185 - 140 * Math.sin(armAngle) + 18 * Math.cos(armAngle) };
      const grip = pointOnActor(331, 54), wrist = pointOnActor(wristLocal.x, wristLocal.y);
      rope.current?.setAttribute('d', `M ${width * .87} -90 Q ${width * .84 + pose.x * .2} ${grip.y * .35} ${grip.x} ${grip.y}`);
      if (anchors.length === WORD.length) {
        const contact = anchors[8];
        const end = { x: mix(wrist.x, contact.x, target.shoot), y: mix(wrist.y, contact.y, target.shoot) };
        shot.current?.setAttribute('d', `M ${wrist.x} ${wrist.y} Q ${(wrist.x + end.x) / 2 - 18 * target.hang} ${(wrist.y + end.y) / 2 + 20 * target.hang} ${end.x} ${end.y}`);
        shot.current?.setAttribute('opacity', String(target.shoot));
        fan.current?.setAttribute('d', [2, 5].map(i => `M ${wrist.x} ${wrist.y} Q ${(wrist.x + anchors[i].x) / 2} ${(wrist.y + anchors[i].y) / 2 + 22} ${anchors[i].x} ${anchors[i].y}`).join(' '));
        fan.current?.setAttribute('opacity', String(target.shoot * .48));
        chain.current?.setAttribute('d', anchors.map((anchor, i) => i ? `Q ${(anchors[i - 1].x + anchor.x) / 2} ${(anchors[i - 1].y + anchor.y) / 2 + 10 * target.hang} ${anchor.x} ${anchor.y}` : `M ${anchor.x} ${anchor.y}`).join(' '));
        chain.current?.setAttribute('opacity', String(target.shoot * .72));
        burst.current?.setAttribute('transform', `translate(${contact.x} ${contact.y})`);
        burst.current?.setAttribute('opacity', String(reduced ? 0 : Math.max(0, 1 - Math.abs(progress - .36) / .025)));
      }
      section!.style.setProperty('--hx-pull', String(target.tension));
      section!.dataset.heroFrame = String(++drawnFrames);
    }
    function advanceReplayClock(now: number) {
      if (mode === 'replay' && replayClock !== null) replayElapsed += Math.max(0, now - replayClock);
      replayClock = mode === 'replay' ? now : null;
    }
    function tick() {
      frameId = 0;
      if (!alive || !visible || document.hidden) { pause(); return; }
      const now = performance.now();
      const elapsed = lastTime === null ? 1 / 60 : Math.max(0, (now - lastTime) / 1000);
      lastTime = now;
      if (needsMeasure) measure();
      if (scrollDirty && !reduced) {
        const next = clamp((window.scrollY - scrollStart) / scrollRange);
        const userMoved = scrollInput && Math.abs(next - lastScrollProgress) > .00001;
        lastScrollProgress = next;
        if (userMoved) { mode = 'scroll'; replayClock = null; }
        if (mode === 'scroll') requestedProgress = next;
        scrollDirty = scrollInput = false;
      }
      if (mode === 'replay') {
        advanceReplayClock(now);
        if (replayElapsed < replayLeadIn) {
          const t = clamp(replayElapsed / replayLeadIn);
          requestedProgress = mix(replayFrom, 0, t * t * (3 - 2 * t));
        } else requestedProgress = clamp((replayElapsed - replayLeadIn) / replayDuration);
        // A monotonic local clock catches up after sparse frames. Real hidden
        // or offscreen periods are explicitly excluded by pause()/wake().
        progress = requestedProgress;
        if (replayElapsed >= replayLeadIn + replayDuration) { mode = 'hold'; replayClock = null; }
      } else if (reduced || drawnFrames === 0) progress = requestedProgress;
      else {
        progress += (requestedProgress - progress) * -Math.expm1(-elapsed / scrubTimeConstant);
        if (Math.abs(requestedProgress - progress) < .0001) progress = requestedProgress;
      }
      updateTarget(progress);
      draw();
      section!.dataset.heroTarget = requestedProgress.toFixed(3);
      section!.dataset.heroMode = mode;
      section!.dataset.heroReplayTime = (replayElapsed / 1000).toFixed(3);
      if (!reduced && (mode === 'replay' || progress !== requestedProgress)) wake();
      else { lastTime = null; section!.dataset.heroRunning = 'false'; }
    }
    function wake() {
      if (!alive || !visible || document.hidden || frameId) return;
      if (mode === 'replay' && replayClock === null) replayClock = performance.now();
      section!.dataset.heroPaused = 'false';
      section!.dataset.heroRunning = 'true';
      frameId = requestAnimationFrame(tick);
    }
    function pause() {
      advanceReplayClock(performance.now());
      replayClock = null;
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0; lastTime = null;
      section!.dataset.heroPaused = 'true';
      section!.dataset.heroRunning = 'false';
    }
    function measure() {
      needsMeasure = false;
      const bounds = viewport!.getBoundingClientRect();
      width = bounds.width; height = bounds.height;
      // Layout offsets exclude transforms. Never clear live transforms to
      // measure: that would force an unnecessary layout reset during motion.
      const layoutBox = (element: HTMLElement) => {
        let x = 0, y = 0, parent: HTMLElement | null = element;
        while (parent && parent !== viewport) {
          x += parent.offsetLeft; y += parent.offsetTop;
          parent = parent.offsetParent as HTMLElement | null;
        }
        const style = getComputedStyle(element);
        return { x, y, width: Number.parseFloat(style.width) || element.offsetWidth, height: Number.parseFloat(style.height) || element.offsetHeight };
      };
      actorBox = layoutBox(figure!);
      letterBoxes = letters.current.map(element => layoutBox(element!));
      const stickyOffset = Number.parseFloat(getComputedStyle(viewport!).top) || 0;
      scrollStart = section!.getBoundingClientRect().top + window.scrollY - stickyOffset;
      scrollRange = Math.max(1, section!.offsetHeight - viewport!.offsetHeight);
      threads.current?.setAttribute('viewBox', `0 0 ${width} ${height}`);
    }
    function scroll() {
      if (reduced) return;
      scrollDirty = scrollInput = true;
      wake();
    }
    replay.current = () => {
      setPlayed(true);
      if (reduced) { staticEnd = !staticEnd; requestedProgress = staticEnd ? 1 : 0; wake(); return; }
      mode = 'replay'; replayElapsed = 0; replayFrom = progress;
      replayLeadIn = progress > .015 ? 240 : 0;
      replayClock = visible && !document.hidden ? performance.now() : null;
      wake();
    };
    const observer = new IntersectionObserver(entries => {
      visible = entries[0].isIntersecting;
      section!.dataset.heroVisible = String(visible);
      if (!visible) pause();
      else wake();
    }, { threshold: 0 });
    observer.observe(viewport);
    const visibility = () => { if (document.hidden) pause(); else wake(); };
    const requestMeasure = () => { if (!alive) return; needsMeasure = scrollDirty = true; wake(); };
    const resize = new ResizeObserver(requestMeasure); resize.observe(viewport);
    document.addEventListener('visibilitychange', visibility);
    window.addEventListener('scroll', scroll, { passive: true });
    section.dataset.heroVisible = 'true';
    wake();
    void document.fonts.ready.then(requestMeasure);
    return () => {
      alive = false; cancelAnimationFrame(frameId);
      observer.disconnect(); resize.disconnect(); window.removeEventListener('scroll', scroll); document.removeEventListener('visibilitychange', visibility);
      replay.current = () => {};
    };
  }, [reduced]);

  return <section ref={root} className={`hx-experience${reduced ? ' hx-reduced' : ''}`} aria-label="Everything is connected: an interactive opening">
    <div ref={stage} className="hx-stage">
      <div className="hx-paper-grid" aria-hidden="true"/>
      <div className="hx-orbits" aria-hidden="true"><i/><i/><i/></div>
      <div className="hx-topline"><span className="hx-cross" aria-hidden="true">✳</span><span>An interactive field guide / DTU 02805</span><span className="hx-edition">VOL. 01—06 / 2026</span></div>
      <h1 className="hx-title" aria-label="Everything is connected."><span className="hx-line" aria-hidden="true">Everything</span><span className="hx-line hx-second" aria-hidden="true"><span className="hx-is">is </span><span className="hx-word">{Array.from(WORD).map((letter, i) => <span ref={element => { letters.current[i] = element; }} className="hx-letter" key={i}>{letter}</span>)}</span></span></h1>
      <svg ref={threads} className="hx-threads" aria-hidden="true" preserveAspectRatio="none"><path ref={rope} className="hx-rope"/><path ref={fan} className="hx-web-fan"/><path ref={chain} className="hx-web-chain"/><path ref={shot} className="hx-web-shot"/><g ref={burst} opacity="0" className="hx-impact">{Array.from({ length: 7 }, (_, i) => <line key={i} x1={Math.cos(i * Math.PI * 2 / 7) * 13} y1={Math.sin(i * Math.PI * 2 / 7) * 13} x2={Math.cos(i * Math.PI * 2 / 7) * 27} y2={Math.sin(i * Math.PI * 2 / 7) * 27}/>)}</g></svg>
      <div ref={actor} className="hx-actor"><SpiderIllustration prefix={prefix}/></div>
      <div className="hx-replay"><button type="button" onClick={() => replay.current()} aria-label={reduced ? 'Switch between static connected typography compositions' : 'Replay Spider-Man pulling the connected letters with his web'}><span className="hx-replay-icon" aria-hidden="true">↗</span>{reduced ? 'Reveal the connection' : played ? 'Pull it again' : 'Pull the thread'}<span className="hx-replay-arrow" aria-hidden="true">↻</span></button><span>{reduced ? 'A still scene, with every connection visible.' : 'Or scroll. See what one little link can do.'}</span></div>
      <div className="hx-copy"><p>The hidden architecture of our world.<br/>Six chapters. A different way of seeing.</p><div className="hx-actions"><a href="#/week/1" className="hx-enter">Enter the network <span aria-hidden="true">↗</span></a><button type="button" className="hx-explore" onClick={() => document.getElementById('chapters')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' })}>Explore chapters <span aria-hidden="true">↓</span></button></div></div>
      <aside className="hx-specimen" aria-label="The idea behind the interaction"><div className="hx-specimen-top"><span>FIELD NOTE / 001</span><span aria-hidden="true">↗</span></div><p>Change one link.<br/><em>Move the whole.</em></p><svg viewBox="0 0 220 46" aria-hidden="true"><path d="M12 23 Q52 -3 84 23 T158 23 L208 23" fill="none" stroke="currentColor" strokeWidth="1"/>{[12,84,158,208].map((x,i)=><circle key={x} cx={x} cy="23" r={i===2?5:3} fill={i===2?'#d84035':'currentColor'}/>)}</svg></aside>
      <div className="hx-footer"><output ref={phase}>01 / Follow the thread</output><span className="hx-marvel-note">A web of ideas. An original Spider-Man illustration.</span><span className="hx-scroll">{reduced ? 'REDUCED MOTION' : 'SCROLL TO CONNECT'} <span aria-hidden="true">↓</span></span></div>
    </div>
  </section>;
}
