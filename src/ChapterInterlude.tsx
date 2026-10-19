import { useCallback, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { useVisibleSequence } from './useVisibleSequence';
import { adjacencyList, barabasiAlbert, bfsDistances, connectedComponents, countTokens, degrees, disparityAlpha, erdosRenyi, modularity, tfidf, tokenize, type Edge } from './math';
import './chapter-interlude.css';

type EpisodeProps = { reduced: boolean };
type Point = { x: number; y: number };
type ChapterInterludeProps = EpisodeProps & { week: number; variant: 'before-study' | 'after-study' };
const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const graphEdges: Edge[] = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [2, 3]];
const palette = ['var(--ci-ink)', 'var(--ci-accent)', 'var(--ci-secondary)'];

function ring(n: number, radius = 145, cx = 380, cy = 218): Point[] {
  return Array.from({ length: n }, (_, i) => ({ x: cx + Math.cos(i * Math.PI * 2 / n - Math.PI / 2) * radius, y: cy + Math.sin(i * Math.PI * 2 / n - Math.PI / 2) * radius }));
}

/** The accents repeat only while the artwork is visible. Teaching controls
 * continue to own the graph, corpus, parameters, and calculated results. */
function Scene({ children, label, reduced, change = 0, className = '' }: { children: ReactNode; label: string; reduced: boolean; change?: number | string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  const build = useCallback((element: HTMLElement) => {
    const svg = element.querySelector('svg')!;
    const timeline = gsap.timeline({ paused: true });
    const contextEdges = new Map([...svg.querySelectorAll<SVGLineElement>('[data-ci-context-edge]')].map(edge => [edge.dataset.ciContextEdge, edge]));
    const contextPairs = [...svg.querySelectorAll<SVGGElement>('[data-ci-context-node]')].map(node => ({
      key: node.dataset.ciContextNode!, node, edge: contextEdges.get(node.dataset.ciContextNode),
      target: { x: Number(node.dataset.ciTargetX), y: Number(node.dataset.ciTargetY) },
    }));
    // One point writes the word and its edge endpoint together. Only the
    // hand-placed display position moves; the selected context stays fixed.
    const place = (pair: typeof contextPairs[number], point: Point) => {
      pair.node.setAttribute('transform', `translate(${point.x} ${point.y})`);
      pair.edge?.setAttribute('x2', String(point.x));
      pair.edge?.setAttribute('y2', String(point.y));
    };
      contextPairs.forEach(pair => {
        const point = { x: 380 + (pair.target.x - 380) * .94, y: 210 + (pair.target.y - 210) * .94 };
        timeline.fromTo(point, { ...point }, { ...pair.target, duration: 1.4, ease: 'power2.out', onUpdate: () => place(pair, point) }, 0);
      });
      const strokes = svg.querySelectorAll('[data-ci-stroke]');
      if (strokes.length) timeline.fromTo(strokes, { strokeDasharray: '1 1', strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.1, stagger: .035, ease: 'power2.inOut' }, 0);
      const arrivals = svg.querySelectorAll('[data-ci-arrive]');
      if (arrivals.length) timeline.fromTo(arrivals, { opacity: .3 }, { opacity: 1, duration: .8, stagger: .035, ease: 'power2.out' }, .15);
      if (!strokes.length && !arrivals.length && !contextPairs.length) {
        const marks = [...svg.querySelectorAll('.ci-tile,.ci-letter-tile,.ci-document,.ci-type-block,.ci-map-node,.ci-weighted-link,.ci-bar')];
        const opacity = marks.map(mark => Number.parseFloat(getComputedStyle(mark).opacity) || 1);
        if (marks.length) timeline.fromTo(marks, { opacity: .35 }, { opacity: i => opacity[i], duration: 1.1, stagger: .04, ease: 'power2.out' }, .1);
      }
      svg.querySelectorAll<SVGCircleElement>('[data-ci-flight]').forEach(packet => {
        const points = (packet.dataset.ciFlight ?? '').split(';').map(pair => pair.split(',').map(Number));
        if (points.length < 2) return;
        timeline.set(packet, { attr: { cx: points[0][0], cy: points[0][1] }, opacity: 1 }, .4);
        points.slice(1).forEach(([x, y], i) => timeline.to(packet, { attr: { cx: x, cy: y }, duration: .28, ease: 'none' }, .4 + i * .28));
        timeline.to(packet, { opacity: 0, duration: .25 }, .4 + (points.length - 1) * .28);
      });
      timeline.to({ reading: 0 }, { reading: 1, duration: .65 }, 2.1);
      return gsap.timeline({ paused: true }).add(timeline.paused(false).timeScale(timeline.duration() / 4.5));
  }, [change]);
  const { paused, togglePause, restart } = useVisibleSequence({ root: ref, reduced, build });
  return <div ref={ref} className="ci-visible-sequence">
    <div className="sequence-playback"><span>{reduced ? 'Still view · reduced motion' : 'Repeats while this artwork is in view'}</span>{!reduced && <div><button type="button" aria-pressed={paused} onClick={togglePause}>{paused ? 'Resume' : 'Pause'}</button><button type="button" onClick={restart}>Restart ↻</button></div>}</div>
    <div className="ci-artwork" data-sequence-stage=""><svg className={`ci-scene ${className}`} viewBox="0 0 760 420" role="img" aria-labelledby={titleId}>
      <title id={titleId}>{label}</title>{children}
    </svg></div>
  </div>;
}

function Action({ children, onClick, pressed, disabled = false }: { children: ReactNode; onClick: () => void; pressed?: boolean; disabled?: boolean }) {
  return <button className="ci-action" onClick={onClick} aria-pressed={pressed} disabled={disabled}>{children}<span aria-hidden="true">↗</span></button>;
}

function Status({ children }: { children: ReactNode }) { return <p className="ci-status" aria-live="polite" aria-atomic="true">{children}</p>; }
function Note({ children }: { children: ReactNode }) { return <p className="ci-note">{children}</p>; }

function Handshake({ reduced }: EpisodeProps) {
  const [count, setCount] = useState(3);
  const points = ring(6, 134, 290, 218);
  const edges = graphEdges.slice(0, count);
  const degree = degrees(6, edges);
  const sum = degree.reduce((a, b) => a + b, 0);
  return <>
    <Scene reduced={reduced} change={count} label={`A six-person graph with ${count} edges; the degrees sum to ${sum}.`} className="ci-comic-scene">
      <path className="ci-comic-burst" d="M493 89 530 105 550 69 571 109 615 95 607 138 650 159 611 181 626 224 581 217 554 257 536 217 492 231 502 188 466 164 507 146Z" />
      <text x="558" y="156" className="ci-shout" textAnchor="middle">LINK!</text>
      {edges.map(([a, b], i) => <line key={`${a}-${b}`} x1={points[a].x} y1={points[a].y} x2={points[b].x} y2={points[b].y} className={`ci-link ${i === count - 1 ? 'is-new' : ''}`} data-ci-stroke="" pathLength={1} />)}
      {points.map((p, i) => <g key={i} className="ci-person" style={{ transform: `translate(${p.x}px, ${p.y}px)` }}>
        <circle r={26} /><text y="7" textAnchor="middle" className="ci-node-label">{alphabet[i]}</text>
        <g transform="translate(22,-24)"><circle r={13} className="ci-degree-badge" /><text y="4" textAnchor="middle" className="ci-small">{degree[i]}</text></g>
      </g>)}
      <text x="545" y="304" className="ci-equation" textAnchor="middle">{sum} = 2 × {count}</text>
      <text x="545" y="334" className="ci-small" textAnchor="middle">DEGREE SUM = 2 × EDGES</text>
      <path d="M65 355 695 355" className="ci-rule" /><text x="67" y="385" className="ci-small">ONE CONNECTION. TWO ENDPOINTS. EVERY TIME.</text>
    </Scene>
    <div className="ci-controls"><Action onClick={() => setCount(count === graphEdges.length ? 1 : count + 1)}>{count === graphEdges.length ? 'Start a new chain' : 'Make an introduction'}</Action><Status>{count} edges · degrees {degree.join(' + ')} = {sum}</Status></div>
    <Note>Exact counts for this six-node, simple undirected toy graph. Badge numbers are degrees; the handshaking identity holds even when a person is isolated.</Note>
  </>;
}

function DegreeStacks({ reduced }: EpisodeProps) {
  const [stacked, setStacked] = useState(false);
  const values = degrees(6, graphEdges);
  const slots = new Map<number, number>();
  const targets = values.map(degree => { const slot = slots.get(degree) ?? 0; slots.set(degree, slot + 1); return { x: 95 + degree * 110, y: 315 - slot * 48 }; });
  return <>
    <Scene reduced={reduced} change={Number(stacked)} label={stacked ? 'The same six nodes stacked into degree bins: two at degree one, two at degree two, one at degree three, one at degree five.' : 'Six labelled nodes, each with its degree, ready to sort into a histogram.'}>
      <text x="55" y="58" className="ci-micro">SAME PEOPLE / A DIFFERENT VIEW</text>
      {Array.from({ length: 6 }, (_, k) => <g key={k} opacity={stacked ? 1 : .35}><line x1={95 + k * 110} y1="120" x2={95 + k * 110} y2="346" className="ci-grid-line" /><text x={95 + k * 110} y="374" textAnchor="middle" className="ci-small">{k}</text></g>)}
      <line x1="70" y1="346" x2="690" y2="346" className="ci-rule" /><text x="380" y="407" textAnchor="middle" className="ci-micro">DEGREE k · ONE TILE = ONE NODE</text>
      {values.map((degree, i) => <g key={i} className="ci-moving" style={{ transform: `translate(${stacked ? targets[i].x : 95 + i * 110}px, ${stacked ? targets[i].y : 190 + (i % 2) * 24}px) rotate(${stacked ? 0 : (i % 2 ? 7 : -6)}deg)` }}>
        <rect x="-23" y="-21" width="46" height="42" rx="3" className="ci-tile" /><text y="5" textAnchor="middle" className="ci-node-label">{alphabet[i]}</text>
        {!stacked && <text y="49" textAnchor="middle" className="ci-small">k = {degree}</text>}
      </g>)}
      <text x="55" y="100" className="ci-large-caption">{stacked ? 'A distribution emerges.' : 'Count. Then rearrange.'}</text>
    </Scene>
    <div className="ci-controls"><Action onClick={() => setStacked(!stacked)} pressed={stacked}>{stacked ? 'Unstack the people' : 'Stack by degree'}</Action><Status>6 nodes · 7 edges · average degree {(values.reduce((a, b) => a + b, 0) / 6).toFixed(2)}</Status></div>
    <Note>Exact degree frequencies, with no binning ambiguity. A histogram loses the identities of the connections, even when all degrees are preserved.</Note>
  </>;
}

function GrowthMachine({ reduced }: EpisodeProps) {
  const [n, setN] = useState(5);
  const edges = useMemo(() => barabasiAlbert(n, 2, 19), [n]);
  const degree = degrees(n, edges);
  const points = Array.from({ length: 17 }, (_, i) => ({ x: 380 + Math.cos(i * 2.4) * (i < 3 ? 44 : 62 + i * 7), y: 211 + Math.sin(i * 2.4) * (i < 3 ? 44 : 58 + i * 6.5) }));
  const hub = degree.indexOf(Math.max(...degree));
  return <>
    <Scene reduced={reduced} change={n} label={`Preferential attachment with ${n} nodes and ${edges.length} edges. Node ${alphabet[hub]} currently has the highest degree, ${degree[hub]}.`}>
      {[75, 125, 175].map(r => <circle key={r} cx="380" cy="211" r={r} className="ci-machine-ring" />)}
      <path d="M30 90V30H120M640 30H730V90M30 330V390H120M640 390H730V330" className="ci-machine-brackets" />
      <text x="50" y="62" className="ci-micro">GROWTH ENGINE</text><text x="710" y="62" className="ci-micro" textAnchor="end">SEED 19 / m = 2</text>
      {edges.map(([a, b]) => <line key={`${a}-${b}`} x1={points[a].x} y1={points[a].y} x2={points[b].x} y2={points[b].y} className={`ci-link ${b === n - 1 ? 'is-new' : ''}`} data-ci-stroke="" pathLength={1} />)}
      {points.slice(0, n).map((p, i) => <g key={i} data-ci-arrive=""><circle cx={p.x} cy={p.y} r={7 + degree[i] * 2} className={i === hub ? 'ci-hub' : 'ci-machine-node'} /><text x={p.x} y={p.y + 4} textAnchor="middle" className="ci-small">{alphabet[i]}</text></g>)}
      <text x="50" y="348" className="ci-counter">{String(n).padStart(2, '0')}</text><text x="51" y="373" className="ci-micro">NODES IN THE MACHINE</text>
      <text x="710" y="348" className="ci-counter" textAnchor="end">{degree[hub]}</text><text x="710" y="373" className="ci-micro" textAnchor="end">LARGEST DEGREE</text>
    </Scene>
    <div className="ci-controls"><Action onClick={() => setN(n === 17 ? 3 : n + 1)}>{n === 17 ? 'Rewind the machine' : 'Admit a new node'}</Action><Status>{n} nodes · {edges.length} edges · newest node makes 2 links</Status></div>
    <Note>Calculated preferential attachment, seeded at 19, starting from a complete three-node graph. New nodes choose two distinct targets in proportion to degree. Positions are illustrative; circle radius grows with degree.</Note>
  </>;
}

function RandomWorlds({ reduced }: EpisodeProps) {
  const [seed, setSeed] = useState(100);
  const samples = useMemo(() => Array.from({ length: 96 }, (_, i) => erdosRenyi(12, .18, seed + i).length), [seed]);
  const finalBin = Math.max(30, Math.ceil(Math.max(...samples) / 5) * 5);
  const bins = Array.from({ length: finalBin + 1 }, (_, i) => samples.filter(value => value === i).length);
  const max = Math.ceil(Math.max(1, ...bins) / 2) * 2;
  const step = 620 / bins.length;
  const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
  return <>
    <Scene reduced={reduced} change={seed} label={`Histogram of edge counts from 96 calculated G(12, 0.18) graphs; sample mean ${mean.toFixed(2)} edges.`}>
      {samples.slice(0, 12).map((value, i) => <g key={i} className="ci-world-ticket" data-ci-arrive="" style={{ transform: `translate(${58 + i * 57}px, ${42 + (i % 2) * 9}px) rotate(${i % 2 ? 4 : -4}deg)` }}><rect width="45" height="58" rx="3" /><text x="22" y="23" textAnchor="middle" className="ci-micro">G{i + 1}</text><text x="22" y="44" textAnchor="middle" className="ci-small">{value}</text></g>)}
      {[0, .5, 1].map(f => <g key={f}><line x1="64" y1={327 - f * 176} x2="700" y2={327 - f * 176} className="ci-grid-line" /><text x="51" y={331 - f * 176} textAnchor="end" className="ci-micro">{(max * f).toFixed(0)}</text></g>)}
      {bins.map((count, i) => <rect key={i} x={68 + i * step} y={327 - count / max * 176} width={step * .75} height={count / max * 176} className="ci-bar ci-changing-bar" />)}
      <line x1="64" y1="327" x2="700" y2="327" className="ci-rule" />
      {Array.from({ length: finalBin / 5 + 1 }, (_, i) => i * 5).map(k => <text key={k} x={68 + (k + .375) * step} y="350" textAnchor="middle" className="ci-small">{k}</text>)}
      <line x1={68 + 7.375 * step} y1="125" x2={68 + 7.375 * step} y2="327" className="ci-observed-line" /><text x={68 + 7.375 * step} y="119" textAnchor="middle" className="ci-micro">TOY OBSERVATION: 7</text>
      <text x="380" y="385" textAnchor="middle" className="ci-micro">EDGE COUNT PER WORLD</text><text x="23" y="237" textAnchor="middle" transform="rotate(-90 23 237)" className="ci-micro">WORLDS</text>
    </Scene>
    <div className="ci-controls"><Action onClick={() => setSeed(seed + 96)}>Generate 96 more worlds</Action><Status>Sample mean {mean.toFixed(2)} · expected edges {(66 * .18).toFixed(2)} · seed {seed}</Status></div>
    <Note>Every edge is an independent Bernoulli draw with p = 0.18 among 12 nodes. The reference at 7 is a synthetic observation, not a significance claim. A new ensemble changes the sampled distribution.</Note>
  </>;
}

const transitPoints: Point[] = [{ x: 82, y: 210 }, { x: 216, y: 112 }, { x: 216, y: 308 }, { x: 370, y: 112 }, { x: 370, y: 210 }, { x: 370, y: 308 }, { x: 527, y: 112 }, { x: 527, y: 308 }, { x: 680, y: 210 }];
const transitEdges: Edge[] = [[0, 1], [0, 2], [1, 3], [2, 5], [3, 4], [4, 5], [3, 6], [5, 7], [6, 8], [7, 8]];
function shortestRoute(n: number, edges: Edge[], start: number, target: number): number[] {
  const adjacency = adjacencyList(n, edges);
  const queue = [start]; const previous = Array<number>(n).fill(-1); previous[start] = start;
  for (let i = 0; i < queue.length; i++) for (const next of adjacency[queue[i]]) if (previous[next] < 0) { previous[next] = queue[i]; queue.push(next); }
  if (previous[target] < 0) return [];
  const path = [target]; while (path[0] !== start) path.unshift(previous[path[0]]);
  return path;
}

function TransitRoutes({ reduced }: EpisodeProps) {
  const [express, setExpress] = useState(false);
  const edges: Edge[] = express ? [...transitEdges, [0, 8]] : transitEdges;
  const route = shortestRoute(9, edges, 0, 8);
  const path = route.map((node, i) => `${i ? 'L' : 'M'}${transitPoints[node].x},${transitPoints[node].y}`).join(' ');
  const distance = bfsDistances(9, edges, 0)[8];
  return <>
    <Scene reduced={reduced} change={Number(express)} label={`A transit-style graph. The shortest A-to-I path has ${distance} hop{distance === 1 ? '' : 's'} ${express ? 'with' : 'without'} the direct express connection.`}>
      <text x="50" y="45" className="ci-transit-brand">THE CONNECTION LINE</text><text x="710" y="45" textAnchor="end" className="ci-micro">A → I</text>
      {edges.map(([a, b]) => <line key={`${a}-${b}`} x1={transitPoints[a].x} y1={transitPoints[a].y} x2={transitPoints[b].x} y2={transitPoints[b].y} className="ci-transit-track" />)}
      <path d={path} className="ci-transit-route" pathLength={1} data-ci-stroke="" />
      {transitPoints.map((p, i) => <g key={i}><circle cx={p.x} cy={p.y} r="12" className={`ci-station ${route.includes(i) ? 'is-on-route' : ''}`} /><text x={p.x} y={p.y + (i % 3 ? -27 : 35)} textAnchor="middle" className="ci-node-label">{alphabet[i]}</text></g>)}
      {!reduced && <circle r="7" className="ci-packet" opacity="0" data-ci-flight={route.map(node => `${transitPoints[node].x},${transitPoints[node].y}`).join(';')} />}
      <text x="50" y="387" className="ci-small">{express ? 'EXPRESS SERVICE OPEN' : 'LOCAL SERVICE / TRANSFERS REQUIRED'}</text><text x="710" y="387" textAnchor="end" className="ci-small">{distance} {distance === 1 ? 'HOP' : 'HOPS'}</text>
    </Scene>
    <div className="ci-controls"><Action onClick={() => setExpress(!express)} pressed={express}>{express ? 'Close the express line' : 'Open an express line'}</Action><Status>Shortest route: {route.map(node => alphabet[node]).join(' → ')} · {distance} hop{distance === 1 ? '' : 's'}</Status></div>
    <Note>Exact breadth-first shortest path in an unweighted toy graph. One shortest path is highlighted when alternatives tie. Transit geometry is illustrative; geometric length does not determine hop count.</Note>
  </>;
}

function BrokenBridge({ reduced }: EpisodeProps) {
  const [cut, setCut] = useState(false);
  const left = [{ x: 115, y: 170 }, { x: 185, y: 110 }, { x: 235, y: 235 }, { x: 135, y: 285 }];
  const right = left.map(p => ({ x: 760 - p.x, y: p.y }));
  const points = [...left, ...right];
  const within: Edge[] = [[0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [4, 5], [5, 6], [6, 7], [7, 4], [4, 6]];
  const edges: Edge[] = cut ? within : [...within, [2, 6]];
  const components = connectedComponents(8, edges);
  const unreachable = Array.from({ length: 8 }, (_, i) => bfsDistances(8, edges, i).filter((d, j) => j > i && !Number.isFinite(d)).length).reduce((a, b) => a + b, 0);
  return <>
    <Scene reduced={reduced} change={Number(cut)} label={`The bridge is ${cut ? 'cut' : 'intact'}: ${components.length} connected components and ${unreachable} unreachable unordered node pairs.`}>
      <path d="M312 30C390 105 324 173 405 228S351 355 421 420" className="ci-river" />
      {[0, 1].map(island => <g key={island} className="ci-moving" style={{ transform: `translate(${cut ? (island ? 24 : -24) : 0}px,0)` }}>
        <path d={island ? 'M480 96Q610 39 700 150L680 304Q550 366 464 269Z' : 'M60 150Q150 39 280 96L296 269Q210 366 80 304Z'} className="ci-island" />
        {within.filter(([a]) => (a < 4 ? 0 : 1) === island).map(([a, b]) => <line key={`${a}-${b}`} x1={points[a].x} y1={points[a].y} x2={points[b].x} y2={points[b].y} className="ci-link" />)}
        {points.slice(island * 4, island * 4 + 4).map((p, i) => <g key={i}><circle cx={p.x} cy={p.y} r="13" className="ci-station is-on-route" /><text x={p.x} y={p.y - 24} textAnchor="middle" className="ci-small">{alphabet[island * 4 + i]}</text></g>)}
      </g>)}
      {!cut ? <path d="M235 235H525" className="ci-bridge" data-ci-stroke="" pathLength={1} /> : <g><path d="M211 235H323M437 235H549" className="ci-bridge ci-broken" /><path d="m348 215 28 40m-28 0 28-40" className="ci-cut-mark" /></g>}
      <text x="380" y="65" className="ci-large-caption" textAnchor="middle">{cut ? 'Two worlds.' : 'One fragile connection.'}</text><text x="380" y="386" className="ci-small" textAnchor="middle">{unreachable} UNREACHABLE PAIRS / {components.length} {components.length === 1 ? 'COMPONENT' : 'COMPONENTS'}</text>
    </Scene>
    <div className="ci-controls"><Action onClick={() => setCut(!cut)} pressed={cut}>{cut ? 'Repair the bridge' : 'Sever the bridge'}</Action><Status>{cut ? '4 × 4 = 16 pairs can no longer reach one another.' : 'All 28 unordered pairs can reach one another.'}</Status></div>
    <Note>Exact component and reachability calculations for eight nodes. The highlighted edge is a bridge: deleting it increases the number of connected components.</Note>
  </>;
}

const atlasPoints: Point[] = [{ x: 150, y: 118 }, { x: 90, y: 227 }, { x: 235, y: 250 }, { x: 365, y: 92 }, { x: 320, y: 223 }, { x: 458, y: 181 }, { x: 593, y: 130 }, { x: 548, y: 293 }, { x: 681, y: 251 }];
const atlasEdges: Edge[] = [[0, 1], [1, 2], [0, 2], [3, 4], [4, 5], [3, 5], [6, 7], [7, 8], [6, 8], [2, 4], [5, 6]];
function partitionContour(points: Point[], scale: number) {
  const cx = points.reduce((sum, p) => sum + p.x, 0) / points.length;
  const cy = points.reduce((sum, p) => sum + p.y, 0) / points.length;
  const ordered = [...points].sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx));
  return ordered.map((p, i) => `${i ? 'L' : 'M'}${Math.max(30, Math.min(730, cx + (p.x - cx) * scale))} ${Math.max(35, Math.min(335, cy + (p.y - cy) * scale))}`).join(' ') + 'Z';
}

function CommunityAtlas({ reduced }: EpisodeProps) {
  const [alternate, setAlternate] = useState(false);
  const partition = alternate ? [0, 0, 1, 1, 1, 2, 2, 2, 0] : [0, 0, 0, 1, 1, 1, 2, 2, 2];
  const q = modularity(9, atlasEdges, partition);
  return <>
    <Scene reduced={reduced} change={Number(alternate)} label={`Two proposed three-community partitions of the same graph. Current modularity is ${q.toFixed(3)}.`}>
      {[0, 1, 2].map(group => [1.16, 1.38, 1.6].map((scale, j) => <path key={`${group}-${j}`} d={partitionContour(atlasPoints.filter((_, i) => partition[i] === group), scale)} className="ci-contour" style={{ stroke: palette[group], fill: j === 0 ? palette[group] : 'none', fillOpacity: .08, opacity: 1 - j * .24 }} />))}
      {atlasEdges.map(([a, b]) => <line key={`${a}-${b}`} x1={atlasPoints[a].x} y1={atlasPoints[a].y} x2={atlasPoints[b].x} y2={atlasPoints[b].y} className={partition[a] === partition[b] ? 'ci-link' : 'ci-between-link'} />)}
      {atlasPoints.map((p, i) => <g key={i}><circle cx={p.x} cy={p.y} r="16" className="ci-map-node" style={{ fill: palette[partition[i]] }} /><text x={p.x} y={p.y + 5} className="ci-map-label" textAnchor="middle">{alphabet[i]}</text></g>)}
      <g transform="translate(49,348)"><path d="M0 30V0L-8 15M0 0 8 15" className="ci-rule" /><text x="0" y="-10" className="ci-micro" textAnchor="middle">N</text></g>
      <text x="710" y="367" textAnchor="end" className="ci-equation">Q = {q.toFixed(3)}</text><text x="710" y="393" textAnchor="end" className="ci-micro">SAME EDGES / DIFFERENT BORDERS</text>
    </Scene>
    <div className="ci-controls"><Action onClick={() => setAlternate(!alternate)} pressed={alternate}>{alternate ? 'Restore the local regions' : 'Redraw the borders'}</Action><Status>3 proposed communities · modularity {q.toFixed(3)} at γ = 1</Status></div>
    <Note>Exact Newman–Girvan modularity for two supplied partitions. Neither is presented as an algorithmic optimum. Contour polygons are illustrative envelopes; the graph itself never changes.</Note>
  </>;
}

function WeightedAtlas({ reduced }: EpisodeProps) {
  const [filtered, setFiltered] = useState(false);
  const [threshold, setThreshold] = useState(.3);
  const weights = [1, 2, 3, 8, 14];
  const strength = weights.reduce((a, b) => a + b, 0);
  const alphas = weights.map(w => disparityAlpha(w, strength, weights.length));
  const points = ring(5, 153, 380, 210);
  const kept = alphas.filter(alpha => alpha < threshold).length;
  return <>
    <Scene reduced={reduced} change={`${filtered}-${threshold}`} label={`A weighted star: strength 28, degree 5. Local disparity cutoff ${threshold} retains ${kept} of 5 ties.`}>
      {[75, 125, 180].map(r => <circle key={r} cx="380" cy="210" r={r} className="ci-atlas-ring" />)}
      {points.map((p, i) => <g key={i} className="ci-fading" style={{ opacity: filtered && alphas[i] >= threshold ? .14 : 1 }}>
        <line x1="380" y1="210" x2={p.x} y2={p.y} className="ci-weighted-link" strokeWidth={2 + weights[i]} />
        <circle cx={p.x} cy={p.y} r="20" className="ci-map-node" /><text x={p.x} y={p.y + 5} textAnchor="middle" className="ci-map-label">{weights[i]}</text>
        <text x={p.x + (p.x < 380 ? -27 : 27)} y={p.y + 5} textAnchor={p.x < 380 ? 'end' : 'start'} className="ci-small">α {alphas[i].toFixed(3)}</text>
      </g>)}
      <circle cx="380" cy="210" r="40" className="ci-weight-hub" /><text x="380" y="211" textAnchor="middle" className="ci-counter-small">28</text><text x="380" y="229" textAnchor="middle" className="ci-micro">STRENGTH</text>
      <text x="45" y="387" className="ci-small">{filtered ? `${kept} TIES PASS THE LOCAL TEST` : 'FIVE TIES. VERY DIFFERENT SHARES.'}</text>
    </Scene>
    <div className="ci-controls"><Action onClick={() => setFiltered(!filtered)} pressed={filtered}>{filtered ? 'Restore all weighted ties' : 'Apply the local filter'}</Action><label className="ci-select">Cutoff <select value={threshold} onChange={e => setThreshold(Number(e.target.value))}><option value={.1}>0.10</option><option value={.3}>0.30</option><option value={.5}>0.50</option></select></label><Status>{filtered ? kept : 5} visible ties · α &lt; {threshold.toFixed(2)}</Status></div>
    <Note>Exact central-endpoint disparity α = (1 − w/28)⁴. This is one local test, not a complete two-endpoint backbone algorithm; a larger retained weight need not mean greater importance in every network.</Note>
  </>;
}

function Letterpress({ reduced }: EpisodeProps) {
  const [cut, setCut] = useState(false);
  const sentence = 'The map is not the territory.';
  const original = sentence.split(' ');
  const tokens = tokenize(sentence);
  const beforeX = [51, 144, 245, 308, 391, 478];
  return <>
    <Scene reduced={reduced} change={Number(cut)} label={cut ? `The sentence tokenizes to ${tokens.join(', ')}; ${tokens.length} tokens.` : sentence}>
      <text x="45" y="48" className="ci-print-folio">PRINT / CUT / NORMALIZE</text>
      <path d="M45 95H715M45 315H715" className="ci-print-rule" />
      {tokens.map((token, i) => <g key={i} className="ci-moving" style={{ transform: `translate(${cut ? 75 + (i % 3) * 225 : beforeX[i]}px, ${cut ? 156 + Math.floor(i / 3) * 111 : 220}px) rotate(${cut ? [-5, 3, -2, 4, -3, 2][i] : 0}deg)` }}>
        <rect x="-15" y="-43" width={cut ? 185 : 0} height="69" className="ci-type-block" />
        <text y="0" className={cut ? 'ci-cut-word' : 'ci-sentence-word'}>{cut ? token : original[i]}</text>
        {cut && <text y="17" className="ci-micro">TOKEN {String(i + 1).padStart(2, '0')}</text>}
      </g>)}
      <g className="ci-moving" style={{ transform: `translate(${cut ? 690 : 42}px, 0)` }}><path d="M0 112V303" className="ci-cut-guide" /><path d="m-10 102 10 10 10-10" className="ci-cut-guide" /></g>
      <text x="45" y="359" className="ci-print-caption">{cut ? 'Punctuation drops. Case folds. Units remain.' : 'Language arrives as a continuous surface.'}</text>
      <text x="715" y="397" textAnchor="end" className="ci-micro">A RULE IS A CHOICE.</text>
    </Scene>
    <div className="ci-controls"><Action onClick={() => setCut(!cut)} pressed={cut}>{cut ? 'Reset the printing plate' : 'Cut the sentence into tokens'}</Action><Status>{cut ? `${tokens.length} tokens · ${new Set(tokens).size} unique types` : 'The map is not the territory.'}</Status></div>
    <Note>Exact output of this site’s Unicode tokenizer: lowercase on, punctuation removed, stopword removal off. Tokenization is a rule-based transformation, not an understanding of the sentence.</Note>
  </>;
}

function FrequencySkyline({ reduced }: EpisodeProps) {
  const [removeThe, setRemoveThe] = useState(false);
  const sentence = 'the map is the map the territory is the map';
  const tokens = tokenize(sentence).filter(token => !removeThe || token !== 'the');
  const entries = Object.entries(countTokens(tokens)).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return <>
    <Scene reduced={reduced} change={Number(removeThe)} label={`Exact word counts in the toy sentence: ${entries.map(([word, count]) => `${word} ${count}`).join(', ')}.`}>
      <text x="45" y="48" className="ci-print-folio">THE FREQUENCY PRESS</text>
      {[0, 1, 2, 3, 4].map(k => <g key={k}><line x1="65" y1={324 - k * 54} x2="706" y2={324 - k * 54} className="ci-grid-line" /><text x="48" y={329 - k * 54} textAnchor="end" className="ci-small">{k}</text></g>)}
      {['the', 'map', 'is', 'territory'].map((word, originalIndex) => {
        const index = entries.findIndex(([w]) => w === word);
        const count = index < 0 ? 0 : entries[index][1];
        return <g key={word} className="ci-moving ci-fading" style={{ transform: `translate(${index < 0 ? 690 : 140 + index * 165}px,0)`, opacity: index < 0 ? .15 : 1 }}>
          {Array.from({ length: [4, 3, 2, 1][originalIndex] }, (_, i) => <g key={i} className="ci-moving" style={{ transform: `translate(0, ${index < 0 ? 90 + i * 45 : 324 - i * 54}px) rotate(${index < 0 ? 18 : 0}deg)` }}><rect x="-57" y="-50" width="114" height="48" className="ci-letter-tile" /><text y="-20" textAnchor="middle" className="ci-skyline-word">{word}</text></g>)}
          {index >= 0 && <><text x="0" y={304 - count * 54} textAnchor="middle" className="ci-counter-small">{count}</text><text y="353" textAnchor="middle" className="ci-small">RANK {index + 1}</text></>}
        </g>;
      })}
      <text x="380" y="395" textAnchor="middle" className="ci-micro">ONE PRINTED BLOCK = ONE TOKEN</text><text x="23" y="216" transform="rotate(-90 23 216)" textAnchor="middle" className="ci-micro">COUNT</text>
    </Scene>
    <div className="ci-controls"><Action onClick={() => setRemoveThe(!removeThe)} pressed={removeThe}>{removeThe ? 'Return “the” to the press' : 'Remove every “the”'}</Action><Status>{tokens.length} tokens · {entries.length} types · {entries.map(([word, count]) => `${word}: ${count}`).join(' / ')}</Status></div>
    <Note>Synthetic text: “{sentence}”. Only “the” is optionally removed here. Counts are exact; ten words cannot establish a Zipf law.</Note>
  </>;
}

const documents = ['the stars shine', 'the ocean rises', 'the stars orbit'];
function DocumentVectors({ reduced }: EpisodeProps) {
  const [weighted, setWeighted] = useState(false);
  const result = useMemo(() => tfidf(documents), []);
  const max = Math.max(...result.vectors.flat());
  return <>
    <Scene reduced={reduced} change={Number(weighted)} label={weighted ? 'Three documents transformed into relative-frequency TF-IDF vectors. The word the occurs in all three documents and has weight zero.' : 'Three synthetic documents: the stars shine; the ocean rises; the stars orbit.'}>
      {[95, 150, 205].map((r, i) => <ellipse key={r} cx="380" cy="213" rx={r * 1.55} ry={r * .7} transform={`rotate(${i * 21 - 21} 380 213)`} className="ci-orbit" />)}
      {documents.map((document, d) => <g key={document} className="ci-moving" style={{ transform: `translate(${weighted ? 40 : 76 + d * 232}px, ${weighted ? 112 + d * 91 : 140 + (d === 1 ? -38 : 24)}px) rotate(${weighted ? 0 : [-7, 2, 8][d]}deg)` }}>
        <rect width={weighted ? 680 : 197} height={weighted ? 71 : 147} rx="9" className="ci-document" />
        <text x="15" y="24" className="ci-micro">DOCUMENT 0{d + 1}</text>
        {!weighted ? document.split(' ').map((word, i) => <text key={i} x="15" y={54 + i * 29} className={`ci-doc-word ${word === 'the' ? 'ci-common-word' : ''}`}>{word}</text>) : result.vocabulary.map((word, i) => <g key={word} transform={`translate(${134 + i * 88}, 0)`}><rect x="0" y={55 - result.vectors[d][i] / max * 28} width="44" height={result.vectors[d][i] / max * 28} className="ci-vector-bar" /><text x="22" y="67" textAnchor="middle" className="ci-micro">{result.vectors[d][i].toFixed(2)}</text></g>)}
      </g>)}
      {weighted && result.vocabulary.map((word, i) => <text key={word} x={196 + i * 88} y="95" textAnchor="middle" className="ci-small">{word}</text>)}
      <text x="380" y="386" textAnchor="middle" className="ci-small">{weighted ? '“THE” IS EVERYWHERE. ITS IDF IS ZERO.' : 'WORDS BECOME COORDINATES.'}</text>
    </Scene>
    <div className="ci-controls"><Action onClick={() => setWeighted(!weighted)} pressed={weighted}>{weighted ? 'Unfold the documents' : 'Collapse words into weights'}</Action><Status>TF = count / document length · IDF = ln(3 / document frequency)</Status></div>
    <Note>Exact TF-IDF with relative TF and no smoothing or L2 normalization. Every row is one document and every column one vocabulary term. Celestial orbits are decorative; bar heights share a {max.toFixed(3)} maximum.</Note>
  </>;
}

const contexts = {
  river: ['the river bank holds wet soil', 'birds on the river bank sing'],
  finance: ['the bank approved a loan', 'cash at the bank pays interest'],
};
function contextCounts(sentences: string[]) {
  const neighbors: string[] = [];
  for (const sentence of sentences) {
    const tokens = tokenize(sentence);
    tokens.forEach((word, i) => { if (word === 'bank') tokens.slice(Math.max(0, i - 2), i).concat(tokens.slice(i + 1, i + 3)).forEach(neighbor => neighbors.push(neighbor)); });
  }
  return countTokens(neighbors);
}
function ContextConstellation({ reduced }: EpisodeProps) {
  const [finance, setFinance] = useState(false);
  const allWords = [...new Set([...Object.keys(contextCounts(contexts.river)), ...Object.keys(contextCounts(contexts.finance))])];
  const current = contextCounts(finance ? contexts.finance : contexts.river);
  const activeWords = allWords.filter(word => current[word]);
  return <>
    <Scene reduced={reduced} change={Number(finance)} label={`A hand-placed context constellation for bank. ${finance ? 'Finance' : 'River'} sentences produce these window-two context counts: ${Object.entries(current).map(([word, count]) => `${word} ${count}`).join(', ')}.`}>
      <ellipse cx="380" cy="210" rx="259" ry="146" className="ci-orbit" /><ellipse cx="380" cy="210" rx="165" ry="115" className="ci-orbit" transform="rotate(-15 380 210)" />
      {allWords.map((word, i) => {
        const active = !!current[word];
        const order = active ? activeWords.indexOf(word) : i;
        const angle = order * Math.PI * 2 / (active ? activeWords.length : allWords.length) - Math.PI / 2;
        const x = 380 + Math.cos(angle) * (active ? 221 : 315);
        const y = 210 + Math.sin(angle) * (active ? 123 : 174);
        return <g key={word} className="ci-fading" style={{ opacity: active ? 1 : .16 }}>
          <line x1="380" y1="210" x2={x} y2={y} data-ci-context-edge={word} className="ci-context-line" style={{ opacity: active ? .6 : 0 }} />
          <g data-ci-context-node={word} data-ci-target-x={x} data-ci-target-y={y} transform={`translate(${x} ${y})`}><circle r={active ? 5 + current[word] * 3 : 4} className="ci-context-star" /><text y={y < 210 ? -18 : 28} textAnchor="middle" className="ci-context-word">{word}{active ? ` · ${current[word]}` : ''}</text></g>
        </g>;
      })}
      <circle cx="380" cy="210" r="54" className="ci-bank-halo" /><text x="380" y="217" textAnchor="middle" className="ci-bank-word">bank</text>
      <text x="38" y="36" className="ci-micro">CONTEXT CHANGES THE NEIGHBORHOOD</text><text x="722" y="391" textAnchor="end" className="ci-small">{finance ? 'FINANCE' : 'RIVER'} / WINDOW ±2</text>
    </Scene>
    <div className="ci-controls"><Action onClick={() => setFinance(!finance)} pressed={finance}>{finance ? 'Move back to the river' : 'Change to financial context'}</Action><Status>{Object.values(current).reduce((a, b) => a + b, 0)} context positions · {Object.keys(current).length} distinct neighbors</Status></div>
    <div className="ci-corpus">{(finance ? contexts.finance : contexts.river).map(sentence => <p key={sentence}>“{sentence}”</p>)}</div>
    <Note>Neighbor counts are exact for a symmetric two-token window in the two displayed sentences. Positions are hand-placed for explanation; this is not a trained embedding, projection, similarity score, or Word2Vec result.</Note>
  </>;
}

const episodes = [
  [{ kicker: 'A small social experiment', title: 'Every link counts twice.', body: 'Make one introduction. Watch two people’s degrees change at the same time.', Component: Handshake }, { kicker: 'Change the representation', title: 'A crowd becomes a distribution.', body: 'Keep the people. Keep their degrees. Let a new view reveal a different question.', Component: DegreeStacks }],
  [{ kicker: 'Inside the growth mechanism', title: 'The rich get more chances.', body: 'One new arrival. Two new links. Existing popularity changes the odds of being chosen.', Component: GrowthMachine }, { kicker: 'Build the counterfactual', title: 'One world is not a baseline.', body: 'Let the same random rule generate an ensemble. Variation is part of the model.', Component: RandomWorlds }],
  [{ kicker: 'The transit of influence', title: 'A shortcut rewrites the journey.', body: 'Follow the transfers, then open a connection that changes the shortest path.', Component: TransitRoutes }, { kicker: 'The cost of one missing edge', title: 'Cut once. Divide everything.', body: 'A bridge can carry the entire relationship between two otherwise dense groups.', Component: BrokenBridge }],
  [{ kicker: 'An atlas of possible communities', title: 'Borders are a hypothesis.', body: 'Redraw the partition while holding the network fixed. Does the evidence improve?', Component: CommunityAtlas }, { kicker: 'Read the strength of a tie', title: 'Weight needs a local scale.', body: 'Measure a tie against its share of the node’s strength before thinning the map.', Component: WeightedAtlas }],
  [{ kicker: 'At the language printing press', title: 'Cut a sentence into pieces.', body: 'Watch typography become discrete tokens—and notice which information the rules discard.', Component: Letterpress }, { kicker: 'Press repetition into shape', title: 'Repetition builds a skyline.', body: 'Stack identical words. Remove one frequent word. The entire ranking shifts.', Component: FrequencySkyline }],
  [{ kicker: 'A coordinate system for documents', title: 'Let common words lose gravity.', body: 'Collapse three little documents into TF-IDF weights. Ubiquity can make a word uninformative.', Component: DocumentVectors }, { kicker: 'Meaning lives in company', title: 'One word. Two constellations.', body: 'Move “bank” from a river to a financial context. Its surrounding words change the evidence.', Component: ContextConstellation }],
];

export default function ChapterInterlude({ week, reduced, variant }: ChapterInterludeProps) {
  const ref = useRef<HTMLElement>(null);
  const titleId = useId();
  const index = variant === 'before-study' ? 0 : 1;
  const episode = episodes[week - 1]?.[index];
  if (!episode) return null;
  const { Component } = episode;
  return <section id={`episode-${variant}`} ref={ref} className={`chapter-interlude ci-week-${week} ci-${index === 0 ? 'before' : 'after'}`} data-ci-reduced={reduced} aria-labelledby={titleId}>
    <div className="ci-inner">
      <header className="ci-header"><div className="ci-folio" aria-hidden="true">0{week}<span>{index === 0 ? 'A' : 'B'}</span></div><div><p className="ci-kicker">{episode.kicker}</p><h2 id={titleId}>{episode.title}</h2><p className="ci-intro">{episode.body}</p></div></header>
      <div className="ci-stage"><Component key={`${week}-${variant}-${reduced}`} reduced={reduced} /></div>
    </div>
  </section>;
}
