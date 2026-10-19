import { useCallback, useId, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import gsap from 'gsap';
import { useVisibleSequence } from './useVisibleSequence';
import './network-choreography.css';



type Props = { week: 1 | 2 | 3; reduced: boolean; variant: 'middle' | 'closing' };
type Scene = '1-middle' | '1-closing' | '2-middle' | '2-closing' | '3-middle' | '3-closing';
type Act = { title: string; detail: string };
type Script = { eyebrow: string; title: string; intro: string; action: string; note: string; acts: [Act, Act, Act] };

const scripts: Record<Scene, Script> = {
  '1-middle': {
    eyebrow: 'The relationship department / A paper experiment', title: 'Unfold a world.',
    intro: 'A cast of characters becomes a network when you keep the relationships. Change the drawing. Keep the evidence.',
    action: 'Unfold the evidence', note: 'One synthetic, simple undirected graph: six nodes, seven edges, fourteen edge ends. The portraits and paper folds are illustrations.',
    acts: [{ title: 'Meet the cast', detail: 'A, B, C, D, E and F are six distinct nodes.' }, { title: 'Follow the red thread', detail: 'Seven undirected edges connect this particular cast.' }, { title: 'Count both ends', detail: 'The degrees are 3 + 2 + 3 + 3 + 2 + 1 = 14 = 2 × 7.' }],
  },
  '1-closing': {
    eyebrow: 'Representation works / Instrument no. 01', title: 'Every edge. Two marks.',
    intro: 'Feed a relationship into the matrix press. An undirected connection leaves a mark on both sides of the diagonal.',
    action: 'Run the matrix press', note: 'This is the exact adjacency matrix of the six-node graph in “Unfold a world”: seven edges, fourteen ones, no self-loops.',
    acts: [{ title: 'Address the cells', detail: 'Rows and columns both name the same six nodes, A through F.' }, { title: 'Print the relationships', detail: 'A 1 in row A, column B means A is connected to B.' }, { title: 'Find the reflection', detail: 'The A,B and B,A cells match. Every edge is counted twice; the diagonal stays zero.' }],
  },
  '2-middle': {
    eyebrow: 'The possibility factory / Three fair decisions', title: 'Chance has a shape.',
    intro: 'Three independent yes-or-no trials make eight possible stories. Follow every story, then sort by the number of successes.',
    action: 'Release all eight possibilities', note: 'An enumeration of all eight equally likely sequences, not a random sample. Each trial has p = ½; each sequence has probability ⅛.',
    acts: [{ title: 'Split the possibilities', detail: 'At each of three independent trials, 0 and 1 each have probability ½.' }, { title: 'Keep every sequence', detail: '000 through 111 are eight distinct outcomes, each with probability ⅛.' }, { title: 'Collect by count', detail: 'The counts 0, 1, 2 and 3 occur in 1, 3, 3 and 1 sequences: Binomial(3, ½).' }],
  },
  '2-closing': {
    eyebrow: 'The attachment works / A degree-weighted lottery', title: 'Popularity prints tickets.',
    intro: 'In a degree-proportional choice, a node with more connections gets more chances. A chance is still not a promise.',
    action: 'Run the chance machine', note: 'Exact probabilities for one attachment choice among a four-node star with degrees (3, 1, 1, 1). This illustrates the choice rule, not a full network-growth simulation.',
    acts: [{ title: 'Read the degrees', detail: 'A has degree 3; B, C and D each have degree 1. The degree sum is 6.' }, { title: 'Print one ticket per edge end', detail: 'The ticket pool is A, A, A, B, C, D. Choose one ticket uniformly.' }, { title: 'Read the chances', detail: 'P(A) = 3/6 = ½. P(B) = P(C) = P(D) = 1/6. No winner is predetermined.' }],
  },
  '3-middle': {
    eyebrow: 'The distance station / Departing from A', title: 'Count stops. Not metres.',
    intro: 'A shortest path measures how many edges you need to cross. The arrival board reveals the graph one hop at a time.',
    action: 'Refresh the distance board', note: 'Exact shortest-hop distances from A in the illustrated unweighted graph. F is isolated, so its distance from A is infinite, not zero.',
    acts: [{ title: 'Start at the source', detail: 'A is zero hops away from itself.' }, { title: 'Expand by one hop', detail: 'B and C arrive at distance 1; D at distance 2; E at distance 3.' }, { title: 'Leave the unreachable visible', detail: 'F is a node in the graph, but no path connects it to A. Its distance is ∞.' }],
  },
  '3-closing': {
    eyebrow: 'The route loom / Nine ways, one crossing', title: 'Many routes. One bridge.',
    intro: 'Follow the nine shortest routes from A to Z. Their separate journeys all pass through the same narrow connection.',
    action: 'Weave the nine routes', note: 'A synthetic unweighted graph: ten nodes, thirteen edges. There are exactly nine shortest A–Z paths, each five hops long. Curves and crossings without labelled dots are drawing choices, not extra nodes.',
    acts: [{ title: 'Choose a branch', detail: 'From A, choose B, C or D. Each of these branches reaches X.' }, { title: 'Cross together', detail: 'All paths cross the bridge X–Y, then choose E, F or G before reaching Z.' }, { title: 'See the bottleneck', detail: '3 × 3 = 9 shortest A–Z paths; X–Y lies on all nine. This is one source–target pair, not a whole-graph centrality score.' }],
  },
};

const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
const edges: [number, number][] = [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [3, 4], [4, 5]];
const degrees = letters.map((_, i) => edges.filter(e => e.includes(i)).length);
const connected = (a: number, b: number) => edges.some(([x, y]) => x === a && y === b || x === b && y === a);
const paperPoints = [[75, 70], [215, 62], [145, 165], [48, 220], [220, 260], [142, 340]];

function Portrait({ index }: { index: number }) {
  return <svg viewBox="0 0 100 100" aria-hidden="true"><path d="M18 100Q15 65 50 63Q85 65 82 100" fill="currentColor" /><circle cx="50" cy="40" r="23" fill="currentColor" /><path d={index % 2 ? 'M25 39Q19 4 59 15L77 33L56 22L36 36' : 'M27 35Q21 5 58 15Q78 18 74 39L64 25L35 27'} fill="#262321" /><path d="M40 42h3m15 0h3M45 53q7 5 13-1" stroke="#f6ecd4" strokeWidth="3" fill="none" />{index % 3 === 0 && <path d="M28 39h44M33 38v11h14V38m7 0v11h14V38" fill="none" stroke="#262321" strokeWidth="3" />}</svg>;
}

function PaperWorld() {
  return <div className="nc-paper-stage nc-art" data-sequence-stage aria-hidden="true">
    <div className="nc-paper-grid" />
    <div className="nc-paper-running">THE SOCIAL GRAPH GAZETTE <span>RELATIONSHIPS, REVEALED.</span> ISSUE 01</div>
    <div className="nc-paper-strip">
      <div className="nc-paper-panel nc-paper-cast"><div className="nc-panel-no">01 / THE CAST</div><h3>EVERYBODY<br />IS SOMEBODY.</h3><div className="nc-portraits">{letters.map((l, i) => <div className="nc-portrait" key={l} style={{ '--i': i } as CSSProperties}><Portrait index={i} /><span>{l}</span></div>)}</div><span className="nc-paper-caption">Six nodes. A world waiting to happen.</span></div>
      <div className="nc-paper-panel nc-paper-graph"><div className="nc-panel-no">02 / THE CONNECTIONS</div><svg viewBox="0 0 280 400"><g className="nc-paper-threads">{edges.map(([a, b]) => <path className="nc-ink-line" key={`${a}-${b}`} pathLength="1" d={`M${paperPoints[a][0]} ${paperPoints[a][1]}L${paperPoints[b][0]} ${paperPoints[b][1]}`} />)}</g>{paperPoints.map(([x, y], i) => <g className="nc-cast-node" key={i} transform={`translate(${x} ${y})`}><rect x="-23" y="-26" width="46" height="52" rx="1" /><text y="9" textAnchor="middle">{letters[i]}</text></g>)}<text className="nc-graph-scribble" x="170" y="385" transform="rotate(-9 170 385)">7 red threads</text></svg><div className="nc-paper-burst">LINK!</div></div>
      <div className="nc-paper-panel nc-paper-count"><div className="nc-panel-no">03 / THE REVEAL</div><p>Each line.<br /><em>Two ends.</em></p><strong className="nc-end-count">14</strong><div className="nc-degree-tally">{degrees.map((n, i) => <span key={i}>{letters[i]}<b>{n}</b></span>)}</div><div className="nc-paper-stamp">7 LINKS × 2 ENDS</div></div>
    </div><div className="nc-paper-bottom"><span>THE HANDSHAKE IDENTITY</span><strong>Σ degree = 2 × edges</strong><span>SAME WORLD. DIFFERENT VIEW.</span></div>
  </div>;
}

function MatrixPress() {
  return <div className="nc-matrix-stage nc-art" data-sequence-stage aria-hidden="true"><div className="nc-machine-label">ADJACENCY / MODEL A–F <span>UNDIRECTED · UNWEIGHTED</span></div><div className="nc-matrix-copy"><span>THE</span><strong>MIRROR<br />RULE.</strong><p>A ↔ B<br /><b>A,B = B,A</b></p><div className="nc-press-dial"><i /><span>2×</span></div></div><div className="nc-matrix-assembly"><div className="nc-matrix-header"><span />{letters.map(l => <b key={l}>{l}</b>)}</div><div className="nc-matrix-grid">{letters.map((l, row) => <div className="nc-matrix-row" key={l}><b className="nc-row-label">{l}</b>{letters.map((_, col) => <div key={col} className={`nc-matrix-cell ${connected(row, col) ? 'is-one' : ''} ${row === col ? 'is-diagonal' : ''} ${row + col === 1 ? 'is-pair' : ''}`} data-row={row} data-col={col}><span>{connected(row, col) ? 1 : 0}</span><i /></div>)}</div>)}</div><div className="nc-matrix-scanner"><i /><span>READING RELATIONSHIPS</span></div><div className="nc-matrix-plaque"><b>07<small>EDGES</small></b><span>→</span><b>14<small>ONES</small></b><span>/</span><b>00<small>DIAGONAL</small></b></div></div><div className="nc-machine-screw nc-screw-a" /><div className="nc-machine-screw nc-screw-b" /></div>;
}

const cascadeLevels = [[600], [330, 870], [195, 465, 735, 1005], [127.5, 262.5, 397.5, 532.5, 667.5, 802.5, 937.5, 1072.5]];
const cascadeY = [35, 140, 245, 350];
const sequences = Array.from({ length: 8 }, (_, i) => i.toString(2).padStart(3, '0'));
const sums = sequences.map(s => [...s].filter(b => b === '1').length);
function chipEnd(index: number) { const bin = sums[index]; const rank = sums.slice(0, index).filter(n => n === bin).length; return { x: 300 + bin * 200, y: 478 - rank * 23 }; }

function ChanceCascade() {
  return <div className="nc-cascade-stage nc-art" data-sequence-stage aria-hidden="true"><div className="nc-cascade-sidebar"><b>½</b><span>AT EVERY<br />DECISION</span></div><svg viewBox="0 0 1200 550"><defs><linearGradient id="nc-track-metal" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#b9b2a1" /><stop offset=".5" stopColor="#585550" /><stop offset="1" stopColor="#242625" /></linearGradient></defs><g className="nc-cascade-tracks">{cascadeLevels.slice(0, 3).flatMap((level, depth) => level.flatMap((x, index) => [0, 1].map(bit => { const end = cascadeLevels[depth + 1][index * 2 + bit]; return <g key={`${depth}-${index}-${bit}`}><path className="nc-track-shadow" d={`M${x} ${cascadeY[depth]}C${x} ${cascadeY[depth] + 50} ${end} ${cascadeY[depth + 1] - 45} ${end} ${cascadeY[depth + 1]}`} /><path className="nc-cascade-line" pathLength="1" d={`M${x} ${cascadeY[depth]}C${x} ${cascadeY[depth] + 50} ${end} ${cascadeY[depth + 1] - 45} ${end} ${cascadeY[depth + 1]}`} /><text x={(x + end) / 2 + (bit ? 14 : -14)} y={(cascadeY[depth] + cascadeY[depth + 1]) / 2 - 5}>{bit}</text></g>; })))}</g>{cascadeLevels.slice(0, 3).flatMap((level, d) => level.map((x, i) => <g className="nc-decision-gate" key={`${d}-${i}`} transform={`translate(${x} ${cascadeY[d]})`}><circle r="14" /><path d="M-6-3L0 4L6-3" /></g>))}<g className="nc-sequence-labels">{sequences.map((s, i) => <g key={s} transform={`translate(${cascadeLevels[3][i]} 375)`}><rect x="-31" y="-17" width="62" height="28" rx="5" /><text textAnchor="middle" y="3">{s}</text><text className="nc-sequence-chance" textAnchor="middle" y="26">⅛</text></g>)}</g><g className="nc-collection-bins">{[1, 3, 3, 1].map((count, i) => <g key={i} transform={`translate(${300 + i * 200} 492)`}><path className="nc-bin" d="M-59-65L-53 0H53L59-65" /><path className="nc-bin-line" d="M-45 5H45" /><text textAnchor="middle" y="29">{i} {i === 1 ? 'success' : 'successes'}</text><text className="nc-bin-fraction" textAnchor="middle" y="52">{count}/8</text></g>)}</g>{sequences.map((s, i) => { const end = chipEnd(i); return <g className="nc-cascade-chip" data-chip={i} key={s} transform={`translate(${end.x} ${end.y})`}><rect x="-22" y="-10" width="44" height="20" rx="8" /><text textAnchor="middle" y="4">{s}</text><path d="M-14-6H13" /></g>; })}</svg><div className="nc-cascade-formula"><span>THE BINOMIAL SHAPE</span><strong>1 : 3 : 3 : 1</strong><small>8 possible sequences · 3 independent trials</small></div></div>;
}

function gearPath(teeth: number, radius: number) {
  return Array.from({ length: teeth * 4 }, (_, i) => { const a = i * Math.PI * 2 / (teeth * 4); const r = i % 4 < 2 ? radius : radius * .82; return `${i ? 'L' : 'M'}${Math.cos(a) * r},${Math.sin(a) * r}`; }).join(' ') + 'Z';
}

function TicketFactory() {
  return <div className="nc-ticket-stage nc-art" data-sequence-stage aria-hidden="true"><div className="nc-ticket-heading"><span>DEGREE IN → CHANCES OUT</span><b>THE ATTACHMENT WORKS</b><span>ONE DRAW / SIX TICKETS</span></div><div className="nc-ticket-machinery"><svg className="nc-gears" viewBox="0 0 1200 400">{[[160, 190, 120, 16], [1045, 190, 120, 16], [342, 252, 70, 12], [875, 81, 52, 10]].map(([x, y, r, teeth], i) => <g transform={`translate(${x} ${y})`} key={i}><g className="nc-gear" data-direction={i % 2 ? -1 : 1}><path d={gearPath(teeth, r)} /><circle r={r * .6} /><circle r={r * .2} />{[0, 60, 120].map(a => <path key={a} transform={`rotate(${a})`} d={`M${-r * .55} 0H${r * .55}`} />)}</g></g>)}</svg><div className="nc-ticket-input">{['A', 'B', 'C', 'D'].map((l, i) => <div key={l} className="nc-degree-input"><span>{l}</span><b>{i ? '01' : '03'}</b><small>DEGREE</small></div>)}</div><div className="nc-conveyor"><div className="nc-conveyor-belt" /><div className="nc-ticket-pool">{['A', 'A', 'A', 'B', 'C', 'D'].map((l, i) => <div className={`nc-lottery-ticket ${l === 'A' ? 'is-popular' : ''}`} key={i}><span>ADMIT ONE</span><strong>{l}</strong><i /><small>CHANCE {String(i + 1).padStart(2, '0')} / 06</small></div>)}</div><div className="nc-conveyor-rail" /></div><div className="nc-ticket-output"><div className="nc-ticket-odds"><span>P(A)</span><b>½</b><small>3 OF 6 TICKETS</small></div><div className="nc-ticket-odds"><span>P(B) = P(C) = P(D)</span><b>⅙</b><small>1 OF 6 TICKETS EACH</small></div></div><div className="nc-chance-stamp">CHANCE<br /><b>≠</b> CERTAINTY</div></div></div>;
}

const stationNodes = [[40, 120], [135, 45], [135, 195], [235, 120], [335, 120], [335, 235]];
const stationEdges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]];
const distances = ['00', '01', '01', '02', '03', '∞'];
function DistanceStation() {
  return <div className="nc-station-stage nc-art" data-sequence-stage aria-hidden="true"><div className="nc-station-bar"><span className="nc-station-symbol">↗</span><b>HOP DISTANCES</b><span>SOURCE <strong>A</strong></span><i>UNWEIGHTED SERVICE</i></div><div className="nc-station-layout"><div className="nc-departure-board"><div className="nc-departure-head"><span>DESTINATION</span><span>HOPS</span><span>STATUS</span></div>{letters.map((l, i) => <div className={`nc-departure-row ${i === 5 ? 'is-isolated' : ''}`} key={l}><div className="nc-station-destination"><span className="nc-station-node">{l}</span><span>NODE {l}</span></div><div className="nc-flap-number">{(i === 5 ? ['∞'] : distances[i].split('')).map((char, j) => <div className="nc-flap" key={j}><span className="nc-flap-base">{char}</span><span className="nc-flap-lid">–</span><i /></div>)}</div><span className="nc-station-status">{['SOURCE', 'ONE EDGE', 'ONE EDGE', 'TWO EDGES', 'THREE EDGES', 'UNREACHABLE'][i]}</span></div>)}</div><div className="nc-station-map"><span>THE ACTUAL CONNECTIONS</span><svg viewBox="0 0 390 290">{stationEdges.map(([a, b]) => <path className="nc-station-track" pathLength="1" key={`${a}-${b}`} d={`M${stationNodes[a][0]} ${stationNodes[a][1]}L${stationNodes[b][0]} ${stationNodes[b][1]}`} />)}{stationNodes.map(([x, y], i) => <g key={i} transform={`translate(${x} ${y})`}><circle r="17" /><text textAnchor="middle" y="6">{letters[i]}</text></g>)}<path className="nc-isolate-ring" d="M303 235a32 32 0 1 0 64 0a32 32 0 1 0-64 0" /><text className="nc-map-note" x="275" y="285">F: no route from A</text></svg><p>F is still<br /><em>part of the graph.</em></p><span className="nc-station-ticket">NO PATH ≠ NO NODE</span></div></div><div className="nc-station-ticker"><span>0 → 1 → 2 → 3</span><span>EXPAND ONE HOP AT A TIME</span><span>∞ = UNREACHABLE</span></div></div>;
}

const loomColors = ['#a5daef', '#8eabf5', '#b9a5e5', '#e6add5', '#f3a7b5', '#edb69c', '#dfce92', '#bdd2a0', '#9ed9c2'];
const branchY = [100, 245, 390];
function routeD(index: number) {
  const a = Math.floor(index / 3), b = index % 3;
  const y1 = branchY[a], y2 = branchY[b];
  // Every ribbon passes through the same labelled topology. Its separate curves are only drawing offsets.
  const bend = (index - 4) * 4;
  return `M75 245C145 ${245 + bend} 180 ${y1 + bend} 270 ${y1}C350 ${y1 - bend} 410 ${245 + bend} 515 245C565 ${245 + bend} 635 ${245 + bend} 685 245C785 ${245 + bend} 835 ${y2 - bend} 930 ${y2}C1020 ${y2 + bend} 1055 ${245 + bend} 1125 245`;
}
const loomNodes: [string, number, number][] = [['A', 75, 245], ['B', 270, 100], ['C', 270, 245], ['D', 270, 390], ['X', 515, 245], ['Y', 685, 245], ['E', 930, 100], ['F', 930, 245], ['G', 930, 390], ['Z', 1125, 245]];

function RouteLoom() {
  return <div className="nc-loom-stage nc-art" data-sequence-stage aria-hidden="true"><div className="nc-loom-ghost">ONE</div><div className="nc-loom-labels"><span>THREE CHOICES</span><span>SHARED BRIDGE</span><span>THREE CHOICES</span></div><svg viewBox="0 0 1200 490"><g className="nc-loom-guides">{[100, 245, 390].map(y => <path key={y} d={`M0 ${y}H1200`} />)}{[75, 270, 515, 685, 930, 1125].map(x => <path key={x} d={`M${x} 45V440`} />)}</g><g className="nc-loom-ribbons">{loomColors.map((color, i) => <g className="nc-route-ribbon" key={color}><path className="nc-ribbon-shadow" d={routeD(i)} /><path className="nc-ribbon-path" pathLength="1" d={routeD(i)} stroke={color} /><path className="nc-ribbon-shine" pathLength="1" d={routeD(i)} /></g>)}</g><g className="nc-bridge-focus"><rect x="486" y="205" width="228" height="80" rx="40" /><path d="M530 190V170H670V190M530 300V320H670V300" /><text x="600" y="151" textAnchor="middle">ALL 9 CROSS HERE</text><text x="600" y="350" textAnchor="middle">X — Y</text></g>{loomNodes.map(([l, x, y]) => <g className={`nc-loom-node ${l === 'A' || l === 'Z' ? 'is-terminal' : ''}`} key={l} transform={`translate(${x} ${y})`}><circle r={l === 'A' || l === 'Z' ? 24 : 15} /><text textAnchor="middle" y="6">{l}</text></g>)}{loomColors.map((color, i) => <circle className="nc-route-courier" data-route={i} key={color} cx="75" cy="245" r="5.5" fill={color} />)}</svg><div className="nc-loom-equation"><div><strong>3 × 3</strong><span>BRANCH COMBINATIONS</span></div><b>=</b><div><strong>9</strong><span>SHORTEST A–Z PATHS</span></div><b>→</b><div><strong>1</strong><span>BRIDGE THEY ALL NEED</span></div></div></div>;
}

function makeTimeline(root: HTMLElement, scene: Scene) {
  const q = (selector: string) => Array.from(root.querySelectorAll<HTMLElement | SVGElement>(selector));
  const timeline = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
  const draw = (selector: string, at: number, duration = 1.5, stagger = .05) => { const targets = q(selector); if (targets.length) timeline.fromTo(targets, { strokeDasharray: 1, strokeDashoffset: 1 }, { strokeDashoffset: 0, duration, stagger }, at); };
  if (scene === '1-middle') {
    timeline.fromTo(q('.nc-paper-panel'), { rotationY: i => i % 2 ? 76 : -76, y: 80, z: -100 }, { rotationY: 0, y: 0, z: 0, duration: 2.5, stagger: .35 }, 0);
    timeline.fromTo(q('.nc-portrait'), { scale: .2, rotation: i => i % 2 ? 20 : -20, y: 30 }, { scale: 1, rotation: 0, y: 0, duration: 1.1, stagger: .12, ease: 'back.out(1.5)' }, .45);
    draw('.nc-ink-line', 1.65, 1.5, .12);
    timeline.fromTo(q('.nc-cast-node'), { scale: .65, transformOrigin: '50% 50%' }, { scale: 1, duration: .8, stagger: .12, ease: 'back.out(1.6)' }, 1.65);
    timeline.fromTo(q('.nc-paper-burst'), { scale: .05, rotation: -45 }, { scale: 1, rotation: -12, duration: .6, ease: 'back.out(2)' }, 3.1);
    timeline.fromTo(q('.nc-end-count'), { rotationX: 90, y: 60, opacity: 0 }, { rotationX: 0, y: 0, opacity: 1, duration: 1.1 }, 3.35);
    timeline.fromTo(q('.nc-degree-tally span'), { y: 25, opacity: 0 }, { y: 0, opacity: 1, duration: .6, stagger: .1 }, 3.7);
    timeline.fromTo(q('.nc-paper-stamp'), { scale: 2.4, rotation: -24, opacity: 0 }, { scale: 1, rotation: -5, opacity: 1, duration: .6, ease: 'back.out(1.5)' }, 4.65);
    timeline.fromTo(q('.nc-paper-bottom'), { y: 20, opacity: .2 }, { y: 0, opacity: 1, duration: .7 }, 5.3);
  } else if (scene === '1-closing') {
    timeline.fromTo(q('.nc-matrix-assembly'), { rotationY: -22, rotationX: 16, x: 60 }, { rotationY: 0, rotationX: 0, x: 0, duration: 2 }, 0);
    timeline.fromTo(q('.nc-matrix-cell'), { rotationX: -115, opacity: .2 }, { rotationX: 0, opacity: 1, duration: .6, stagger: { each: .045, from: 'start' }, ease: 'back.out(.7)' }, .7);
    timeline.fromTo(q('.nc-matrix-scanner'), { left: '7%', opacity: 0 }, { left: '98%', opacity: 1, duration: 3.5, ease: 'none' }, 1.1);
    timeline.to(q('.nc-matrix-scanner'), { opacity: 0, duration: .25 }, 4.6);
    timeline.fromTo(q('.nc-press-dial i'), { rotation: -90 }, { rotation: 90, duration: 4.5 }, .6);
    timeline.fromTo(q('.nc-matrix-cell.is-pair'), { scale: 1 }, { scale: 1.13, boxShadow: '0 0 28px #ff885566', duration: .55, repeat: 1, yoyo: true }, 4.2);
    timeline.fromTo(q('.nc-matrix-plaque'), { y: 22, opacity: .1 }, { y: 0, opacity: 1, duration: .7 }, 5.3);
  } else if (scene === '2-middle') {
    draw('.nc-cascade-line', 0, 1.3, .055);
    q('.nc-cascade-chip').forEach((chip, i) => {
      const start = .35 + i * .055;
      timeline.fromTo(chip, { attr: { transform: 'translate(600 35)' }, opacity: .15 }, { opacity: 1, duration: .2 }, start);
      for (let depth = 1; depth <= 3; depth++) {
        const branch = Math.floor(i / 2 ** (3 - depth));
        timeline.to(chip, { attr: { transform: `translate(${cascadeLevels[depth][branch]} ${cascadeY[depth]})` }, duration: .75, ease: 'power1.inOut' }, start + (depth - 1) * .8);
      }
      const end = chipEnd(i);
      timeline.to(chip, { attr: { transform: `translate(${end.x} ${end.y})` }, duration: 1.05, ease: 'bounce.out' }, 3.5 + i * .12);
    });
    timeline.fromTo(q('.nc-sequence-labels'), { opacity: .2 }, { opacity: 1, duration: .5 }, 2.9);
    timeline.fromTo(q('.nc-collection-bins'), { y: 45, opacity: .2 }, { y: 0, opacity: 1, duration: .8 }, 3);
    timeline.fromTo(q('.nc-cascade-formula strong'), { letterSpacing: '.4em', opacity: 0 }, { letterSpacing: '.02em', opacity: 1, duration: .8 }, 5.2);
  } else if (scene === '2-closing') {
    timeline.fromTo(q('.nc-degree-input'), { rotationX: -75, y: -35 }, { rotationX: 0, y: 0, duration: .85, stagger: .15 }, 0);
    q('.nc-gear').forEach((gear, i) => timeline.fromTo(gear, { rotation: 0, transformOrigin: '50% 50%' }, { rotation: i % 2 ? -280 : 280, duration: 5.5, ease: 'power1.inOut' }, .1));
    timeline.fromTo(q('.nc-conveyor-belt'), { backgroundPositionX: '0px' }, { backgroundPositionX: '240px', duration: 5.5 }, .1);
    timeline.fromTo(q('.nc-lottery-ticket'), { x: -360, rotationY: 85, rotationZ: -12, opacity: 0 }, { x: 0, rotationY: 0, rotationZ: 0, opacity: 1, duration: 1.3, stagger: .28, ease: 'back.out(.8)' }, .75);
    timeline.fromTo(q('.nc-lottery-ticket.is-popular'), { y: 0 }, { y: -18, duration: .45, stagger: .1, repeat: 1, yoyo: true }, 3.5);
    timeline.fromTo(q('.nc-ticket-odds'), { y: 35, opacity: .1, rotationX: 70 }, { y: 0, opacity: 1, rotationX: 0, duration: .8, stagger: .2 }, 4.35);
    timeline.fromTo(q('.nc-chance-stamp'), { scale: 1.7, rotation: 15, opacity: 0 }, { scale: 1, rotation: -8, opacity: 1, duration: .65, ease: 'back.out(1.6)' }, 5.3);
  } else if (scene === '3-middle') {
    timeline.fromTo(q('.nc-departure-board'), { rotationX: 10, y: 30 }, { rotationX: 0, y: 0, duration: 1.1 }, 0);
    const rows = q('.nc-departure-row');
    rows.forEach((row, i) => {
      timeline.fromTo(row.querySelectorAll('.nc-flap-lid'), { rotationX: 0, opacity: 1 }, { rotationX: -180, opacity: 0, duration: .65, stagger: .07, ease: 'power3.in' }, .5 + i * .58);
      timeline.fromTo(row.querySelectorAll('.nc-flap-base,.nc-station-status'), { opacity: .15 }, { opacity: 1, duration: .4 }, .9 + i * .58);
    });
    draw('.nc-station-track', 1, 1.4, .24);
    draw('.nc-isolate-ring', 4, 1, 0);
    timeline.fromTo(q('.nc-station-ticket'), { rotation: 12, scale: 1.6, opacity: 0 }, { rotation: -5, scale: 1, opacity: 1, duration: .7, ease: 'back.out(1.3)' }, 4.7);
    timeline.fromTo(q('.nc-station-ticker'), { x: 65, opacity: .1 }, { x: 0, opacity: 1, duration: .7 }, 5.3);
  } else {
    timeline.fromTo(q('.nc-loom-ghost'), { scaleX: 1.4, opacity: .015 }, { scaleX: 1, opacity: .12, duration: 4.7 }, 0);
    draw('.nc-ribbon-path,.nc-ribbon-shine', .25, 2.4, .055);
    timeline.fromTo(q('.nc-ribbon-shadow'), { opacity: 0 }, { opacity: .65, duration: 1.5, stagger: .04 }, 1.2);
    const paths = root.querySelectorAll<SVGPathElement>('.nc-ribbon-path');
    q('.nc-route-courier').forEach((courier, i) => {
      const path = paths[i]; const length = path.getTotalLength(); const position = { p: 0 };
      timeline.fromTo(courier, { opacity: 0 }, { opacity: 1, duration: .15 }, 1 + i * .11);
      timeline.to(position, { p: 1, duration: 3.1, ease: 'none', onUpdate: () => { const point = path.getPointAtLength(length * position.p); courier.setAttribute('cx', String(point.x)); courier.setAttribute('cy', String(point.y)); } }, 1 + i * .11);
      timeline.to(courier, { opacity: 0, duration: .2 }, 4.1 + i * .11);
    });
    timeline.fromTo(q('.nc-bridge-focus'), { opacity: 0, scale: .7, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: .9, ease: 'back.out(1.4)' }, 3.6);
    timeline.fromTo(q('.nc-loom-equation'), { y: 25, opacity: .1 }, { y: 0, opacity: 1, duration: .9 }, 5.1);
  }
  return timeline;
}

function Episode({ week, reduced, variant }: Props) {
  const scene = `${week}-${variant}` as Scene;
  const script = scripts[scene];
  const root = useRef<HTMLElement>(null);
  const reading = useRef<HTMLOutputElement>(null);
  const lastAct = useRef(-1);
  const [staticAct, setStaticAct] = useState(2);
  const titleId = useId();
  const build = useCallback((el: HTMLElement) => makeTimeline(el, scene), [scene]);
  const onProgress = useCallback((p: number) => {
    const el = root.current;
    if (!el) return;
    const act = Math.min(2, Math.floor(p * 3));
    el.dataset.ncProgress = p.toFixed(3);
    el.dataset.ncPhase = String(act + 1);
    el.style.setProperty('--nc-progress', String(p));
    if (lastAct.current !== act) {
      lastAct.current = act;
      if (reading.current) reading.current.textContent = `${script.acts[act].title} — ${script.acts[act].detail}`;
      el.querySelectorAll<HTMLElement>('.nc-act').forEach((node, i) => { node.dataset.active = String(i === act); });
    }
  }, [script]);
  const { paused, togglePause, restart } = useVisibleSequence({ root, reduced, build, onProgress });

  const Components = { '1-middle': PaperWorld, '1-closing': MatrixPress, '2-middle': ChanceCascade, '2-closing': TicketFactory, '3-middle': DistanceStation, '3-closing': RouteLoom };
  const Art = Components[scene];
  const act = reduced ? staticAct : 0;
  return <section ref={root} className={`network-choreography nc-${scene} ${reduced ? 'nc-reduced' : ''}`} aria-labelledby={titleId} data-nc-scene={scene} data-nc-progress={reduced ? '1.000' : '0.000'} data-nc-phase={act + 1} data-nc-mode={reduced ? 'static' : 'autoplay'}>
    <header className="nc-heading"><div><span className="nc-eyebrow">{script.eyebrow}</span><h2 id={titleId}>{script.title}</h2></div><div className="nc-heading-aside"><p>{script.intro}</p>{!reduced && <div className="sequence-playback"><span>Plays while in view</span><button type="button" onClick={togglePause} aria-pressed={paused}>{paused ? 'Resume' : 'Pause'}</button><button type="button" onClick={restart}>Restart</button></div>}</div></header>
    <Art />
    <div className="nc-reading-rail"><div className="nc-acts">{script.acts.map((item, i) => <div className="nc-act" data-active={i === act} key={item.title}><span>0{i + 1}</span><b>{item.title}</b></div>)}</div><div className="nc-progress-track"><i /></div></div>
    <div className="nc-controls"><div className="nc-buttons"><button type="button" onClick={() => reduced ? setStaticAct(n => (n + 1) % 3) : restart()}><span aria-hidden="true">{reduced ? '↗' : '↻'}</span>{reduced ? 'Read next step' : script.action}</button></div><output ref={reading} aria-live={reduced ? 'polite' : 'off'}>{script.acts[act].title} — {script.acts[act].detail}</output></div>
    <p className="nc-evidence"><span>{reduced ? 'Static view' : 'Plays while in view · Pause anytime'}</span>{script.note}</p>
  </section>;
}

export default function NetworkChoreography(props: Props) {
  // Remount the animation-owned attributes when motion preferences change.
  return <Episode key={`${props.week}-${props.variant}-${props.reduced}`} {...props} />;
}
