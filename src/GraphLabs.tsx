import { useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  adjacencyMatrix, averageClustering, barabasiAlbert, betweennessCentrality,
  bfsDistances, connectedComponents, degrees, density, disparityAlpha,
  erdosRenyi, harmonicCloseness, meanShortestPathLength, modularity, wattsStrogatz,
} from './math';
import type { Edge } from './math';

type Point = { x: number; y: number };
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const COLORS = ['#f7b955', '#75c9f1', '#e69dcc'];
const edgeKey = ([a, b]: Edge) => `${Math.min(a, b)}:${Math.max(a, b)}`;
const format = (value: number, digits = 3) => Number.isInteger(value) ? String(value) : value.toFixed(digits);
const ring = (n: number, radius = 145, cx = 300, cy = 190): Point[] => Array.from({ length: n }, (_, i) => ({ x: cx + radius * Math.cos(i * 2 * Math.PI / n - Math.PI / 2), y: cy + radius * Math.sin(i * 2 * Math.PI / n - Math.PI / 2) }));

function activate(event: KeyboardEvent<SVGGElement>, callback: () => void) {
  if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); callback(); }
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return <div className="metric"><strong>{value}</strong><span>{label}</span></div>;
}

function GraphDiagram({
  edges, points, selected = -1, onSelect, values, groups, distances, step = Infinity,
  selectedEdge, label = 'Synthetic undirected network', numericLabels = false,
}: {
  edges: Edge[]; points: Point[]; selected?: number; onSelect?: (node: number) => void;
  values?: number[]; groups?: number[]; distances?: number[]; step?: number;
  selectedEdge?: Edge | null; label?: string; numericLabels?: boolean;
}) {
  const max = Math.max(1e-10, ...(values ?? [1]));
  const name = (i: number) => numericLabels ? String(i) : (LETTERS[i] ?? String(i));
  return <svg className="graph-svg" viewBox="0 0 600 380" role="group" aria-label={label}>
    <title>{label}</title>
    <g aria-hidden="true">
      {edges.map(edge => {
        const [a, b] = edge;
        const highlighted = selectedEdge ? edgeKey(edge) === edgeKey(selectedEdge) : (a === selected || b === selected);
        const traversed = distances ? Math.max(distances[a], distances[b]) <= step : true;
        return <line key={edgeKey(edge)} x1={points[a].x} y1={points[a].y} x2={points[b].x} y2={points[b].y}
          stroke={highlighted ? 'var(--accent, #f7b955)' : 'currentColor'} strokeWidth={highlighted ? 3 : 1.2}
          opacity={traversed ? (highlighted ? 1 : 0.27) : 0.08} />;
      })}
    </g>
    {points.map((point, i) => {
      const seen = !distances || distances[i] <= step;
      const current = distances?.[i] === step;
      const radius = values ? Math.max(5, 25 * Math.sqrt(Math.max(0, values[i]) / max)) : (points.length > 20 ? 8 : 19);
      const color = groups ? COLORS[groups[i] % COLORS.length] : 'var(--accent, #f7b955)';
      const description = `Node ${name(i)}${values ? `, score ${format(values[i])}` : ''}${groups ? `, group ${groups[i] + 1}; activate to change group` : ''}${distances ? `, distance ${Number.isFinite(distances[i]) ? distances[i] : 'unreachable'}` : ''}`;
      return <g key={i} transform={`translate(${point.x} ${point.y})`} role={onSelect ? 'button' : undefined}
        tabIndex={onSelect ? 0 : undefined} aria-label={description} className="graph-node"
        onClick={() => onSelect?.(i)} onKeyDown={event => { if (onSelect) activate(event, () => onSelect(i)); }}>
        <title>{description}</title>
        <circle r={radius + 6} fill="none" stroke={color} strokeWidth={i === selected || current ? 2 : 0} opacity={seen ? 0.8 : 0.3} />
        <circle r={radius} fill={color} opacity={seen ? 1 : 0.18} stroke="var(--bg, #101417)" strokeWidth="2" />
        {(points.length <= 20 || selected === i) && <text textAnchor="middle" dominantBaseline="central" y={points.length > 20 ? -20 : 0}
          fill={points.length > 20 || !seen ? 'currentColor' : '#111719'} fontSize={points.length > 20 ? 12 : 11} fontWeight="700" aria-hidden="true">{name(i)}</text>}
      </g>;
    })}
  </svg>;
}

const INITIAL_EDGES: Edge[] = [[0, 1], [0, 2], [0, 3], [1, 2], [2, 3], [3, 4], [4, 5]];
const SIX_POINTS = [{ x: 145, y: 95 }, { x: 80, y: 220 }, { x: 245, y: 265 }, { x: 310, y: 115 }, { x: 435, y: 210 }, { x: 525, y: 95 }];

function GraphEditor() {
  const [edges, setEdges] = useState<Edge[]>(INITIAL_EDGES);
  const [selected, setSelected] = useState(0);
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null);
  const matrix = adjacencyMatrix(6, edges);
  const degree = degrees(6, edges);
  const components = connectedComponents(6, edges);
  const toggle = (a: number, b: number) => {
    const edge: Edge = a < b ? [a, b] : [b, a];
    setSelectedEdge(edge);
    setEdges(current => matrix[a][b] ? current.filter(value => edgeKey(value) !== edgeKey(edge)) : [...current, edge]);
  };
  return <div>
    <p className="lab-note">Synthetic teaching graph · 6 nodes. Switch a matrix cell and watch both representations change. One undirected edge fills two cells.</p>
    <div className="lab-grid">
      <div className="lab-visual">
        <GraphDiagram edges={edges} points={SIX_POINTS} selected={selected} selectedEdge={selectedEdge} onSelect={node => { setSelected(node); setSelectedEdge(null); }} label="Editable six-node synthetic network; select a node to inspect its degree" />
        <p className="selection-note" aria-live="polite">{selectedEdge ? `Edge ${LETTERS[selectedEdge[0]]}–${LETTERS[selectedEdge[1]]} is ${matrix[selectedEdge[0]][selectedEdge[1]] ? 'present' : 'absent'}. Both symmetric cells agree.` : `Node ${LETTERS[selected]} has degree ${degree[selected]}. Its ${degree[selected] === 1 ? 'edge is' : 'edges are'} highlighted.`}</p>
      </div>
      <div className="lab-controls">
        <h3>Every cell is a relationship.</h3>
        <p>The diagonal stays zero: this simple graph has no self-loops. Select any other cell with a pointer or keyboard.</p>
        <table className="matrix" aria-label="Editable adjacency matrix">
          <thead><tr><th scope="col" aria-label="From node" />{Array.from({ length: 6 }, (_, i) => <th scope="col" key={i}>{LETTERS[i]}</th>)}<th scope="col">k</th></tr></thead>
          <tbody>{matrix.map((row, a) => <tr key={a}><th scope="row">{LETTERS[a]}</th>{row.map((value, b) => <td key={b}>
            <button type="button" disabled={a === b} aria-label={a === b ? `Self-loop ${LETTERS[a]} excluded` : `Toggle edge ${LETTERS[a]}–${LETTERS[b]}`}
              aria-pressed={a === b ? undefined : Boolean(value)} onClick={() => toggle(a, b)}
              onFocus={() => { if (a !== b) setSelectedEdge([a, b]); }} onMouseEnter={() => { if (a !== b) setSelectedEdge([a, b]); }}>{value}</button>
          </td>)}<td><strong>{degree[a]}</strong></td></tr>)}</tbody>
        </table>
        <div className="lab-actions"><button type="button" onClick={() => { setEdges(INITIAL_EDGES); setSelectedEdge(null); }}>Reset graph</button><button type="button" onClick={() => setEdges([])}>Clear edges</button></div>
      </div>
    </div>
    <div className="metric-row" aria-live="polite"><Metric value={edges.length} label="edges m" /><Metric value={format(2 * edges.length / 6)} label="mean degree 2m/n" /><Metric value={format(density(6, edges))} label="density 2m/[n(n−1)]" /><Metric value={components.length} label="connected components" /></div>
    <p className="lab-note">The row sum is the node’s degree. Add every row sum and you obtain {degree.reduce((a, b) => a + b, 0)} = 2 × {edges.length}: each edge has two ends. Isolates still count as nodes and components.</p>
  </div>;
}

function DegreeHistogram({ degree }: { degree: number[] }) {
  const maxDegree = Math.max(0, ...degree);
  const counts = Array.from({ length: maxDegree + 1 }, (_, k) => degree.filter(value => value === k).length);
  const maxCount = Math.max(1, ...counts);
  const width = 500 / counts.length;
  const tickStep = Math.max(1, Math.ceil(maxDegree / 10));
  return <svg className="chart" viewBox="0 0 600 275" role="img" aria-label={`Degree histogram. ${counts.map((count, k) => `Degree ${k}: ${count} nodes`).join('; ')}`}>
    <title>Degree histogram of the current synthetic graph</title>
    {[0, Math.ceil(maxCount / 2), maxCount].filter((value, index, values) => values.indexOf(value) === index).map(value => <g key={value} fill="currentColor" opacity="0.6">
      <line x1="58" x2="558" y1={218 - 172 * value / maxCount} y2={218 - 172 * value / maxCount} stroke="currentColor" opacity="0.2" />
      <text x="47" y={222 - 172 * value / maxCount} textAnchor="end" fontSize="11">{value}</text>
    </g>)}
    {counts.map((count, k) => <g key={k}><rect x={58 + k * width + 1} y={218 - 172 * count / maxCount} width={Math.max(1, width - 2)} height={172 * count / maxCount} fill="var(--accent, #f7b955)"><title>Degree {k}: {count} nodes</title></rect>
      {(k % tickStep === 0 || k === maxDegree) && <text x={58 + (k + 0.5) * width} y="238" textAnchor="middle" fill="currentColor" fontSize="11">{k}</text>}</g>)}
    <line x1="58" x2="558" y1="218" y2="218" stroke="currentColor" opacity="0.5" />
    <text x="308" y="266" textAnchor="middle" fill="currentColor" fontSize="12">Degree k · number of neighbors</text>
    <text x="58" y="25" fill="currentColor" fontSize="12">Number of nodes</text>
  </svg>;
}

type Model = 'ER' | 'WS' | 'BA';
function ModelLab() {
  const [model, setModel] = useState<Model>('WS');
  const [p, setP] = useState(0.12);
  const [beta, setBeta] = useState(0.15);
  const [m, setM] = useState(2);
  const [seed, setSeed] = useState(17);
  const [selected, setSelected] = useState(0);
  const [nullResult, setNullResult] = useState<{ mean: number; exceed: number; probability: number } | null>(null);
  const edges = useMemo(() => model === 'ER' ? erdosRenyi(36, p, seed) : model === 'WS' ? wattsStrogatz(36, 4, beta, seed) : barabasiAlbert(36, m, seed), [model, p, beta, m, seed]);
  const degree = useMemo(() => degrees(36, edges), [edges]);
  const components = useMemo(() => connectedComponents(36, edges), [edges]);
  const clustering = useMemo(() => averageClustering(36, edges), [edges]);
  const meanDistance = useMemo(() => meanShortestPathLength(36, edges), [edges]);
  const compareNull = () => {
    const probability = 2 * edges.length / (36 * 35);
    const samples = Array.from({ length: 40 }, (_, i) => averageClustering(36, erdosRenyi(36, probability, seed * 1000 + i)));
    setNullResult({ mean: samples.reduce((a, b) => a + b, 0) / samples.length, exceed: samples.filter(value => value >= clustering).length, probability });
  };
  return <div>
    <p className="lab-note">Synthetic simulation · 36 nodes · fixed seed {seed}. The drawing uses a common circular layout so you can compare which connections each mechanism creates.</p>
    <div className="segmented" role="group" aria-label="Network model">{(['ER', 'WS', 'BA'] as Model[]).map(value => <button type="button" key={value} aria-pressed={model === value} onClick={() => { setModel(value); setNullResult(null); }}>{value === 'ER' ? 'Random' : value === 'WS' ? 'Small world' : 'Preferential'}</button>)}</div>
    <div className="lab-grid">
      <div className="lab-visual"><GraphDiagram edges={edges} points={ring(36)} selected={selected} onSelect={setSelected} numericLabels label={`${model} synthetic graph with 36 nodes`} />
        <p className="selection-note" aria-live="polite">Node {selected}: {degree[selected]} neighbors. Same seed and settings reproduce exactly the same graph.</p>
      </div>
      <div className="lab-controls">
        <h3>{model === 'ER' ? 'Give every pair the same chance.' : model === 'WS' ? 'Keep the neighborhood. Add shortcuts.' : 'Growth rewards existing connections.'}</h3>
        {model === 'ER' && <><p>Every unordered pair receives an independent edge with probability p. The expected mean degree is p(n−1); the realized mean degree can differ.</p><label className="control">Edge probability p <output>{p.toFixed(2)}</output><input type="range" aria-label="Edge probability p" min="0" max="1" step="0.01" value={p} onChange={event => { setP(Number(event.target.value)); setNullResult(null); }} /></label></>}
        {model === 'WS' && <><p>Start with a degree-4 ring. Rewire each original clockwise edge with probability β. Rewiring preserves the number of edges, while individual degrees may change.</p><label className="control">Rewiring probability β <output>{beta.toFixed(2)}</output><input type="range" aria-label="Rewiring probability beta" min="0" max="1" step="0.01" value={beta} onChange={event => { setBeta(Number(event.target.value)); setNullResult(null); }} /></label></>}
        {model === 'BA' && <><p>Each arriving node attaches to m distinct existing nodes, weighted by their degree. A complete graph of m+1 nodes is the starting seed.</p><label className="control">Edges per new node m <output>{m}</output><input type="range" aria-label="Edges per new node m" min="1" max="6" step="1" value={m} onChange={event => { setM(Number(event.target.value)); setNullResult(null); }} /></label></>}
        <button type="button" onClick={() => { setSeed(value => value + 1); setNullResult(null); }}>Generate another realization</button>
        <DegreeHistogram degree={degree} />
      </div>
    </div>
    <div className="metric-row" aria-live="polite"><Metric value={edges.length} label="edges" /><Metric value={format(2 * edges.length / 36)} label="mean degree" /><Metric value={format(clustering)} label="mean local clustering" /><Metric value={meanDistance === null ? '—' : format(meanDistance)} label="mean distance / hops" /><Metric value={components.length} label="components" /><Metric value={Math.max(...components.map(component => component.length))} label="largest component / 36" /></div>
    <p className="lab-note">Clustering averages Cᵢ over all 36 nodes; degree-zero and degree-one nodes contribute 0. Mean distance averages all 630 unordered node pairs. {meanDistance === null ? 'This graph is disconnected: some distances are infinite, so no finite whole-graph mean is shown. Unreachable pairs are not silently omitted.' : 'Every pair is reachable in this realization.'} A single small graph cannot establish a power law.</p>
    {model === 'WS' && <p className="lab-note">Try β=0, then a small positive value. Compare mean distance with clustering: the small-world mechanism shortens routes while many local triangles survive. A 36-node realization can fluctuate, so repeat with another seed.</p>}
    {model === 'ER' && <p className="lab-note">For these settings, the expected mean degree is p(n−1) = {format(p * 35)} and the expected edge count is p × 630 = {format(p * 630)}. The displayed graph shows the realized counts.</p>}
    <div className="sub-lab"><h3>Compared to what?</h3><p>Generate 40 G(n,p) graphs with the same node count and the same <em>expected</em> edge count as this realization. This null does not preserve the degree sequence.</p><button type="button" onClick={compareNull}>Compare clustering with 40 random graphs</button>
      {nullResult && <p className="selection-note" role="status">Null p = {format(nullResult.probability)}. Mean clustering: {format(nullResult.mean)}; observed: {format(clustering)}. {nullResult.exceed} of 40 null graphs reach or exceed the observed value. This is a small synthetic ensemble, not evidence about a real-world dataset.</p>}
    </div>
  </div>;
}

const CENTRAL_EDGES: Edge[] = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [4, 5], [4, 6], [6, 7]];
const CENTRAL_POINTS = [{ x: 55, y: 190 }, { x: 165, y: 90 }, { x: 165, y: 290 }, { x: 280, y: 190 }, { x: 395, y: 190 }, { x: 490, y: 75 }, { x: 490, y: 290 }, { x: 565, y: 190 }];
type Measure = 'degree' | 'betweenness' | 'harmonic';

function CentralityLab() {
  const [start, setStart] = useState(0);
  const [step, setStep] = useState(0);
  const [measure, setMeasure] = useState<Measure>('betweenness');
  const [bridge, setBridge] = useState(true);
  const edges = useMemo(() => bridge ? CENTRAL_EDGES : CENTRAL_EDGES.filter(([a, b]) => a !== 3 || b !== 4), [bridge]);
  const distances = useMemo(() => bfsDistances(8, edges, start), [edges, start]);
  const maxStep = Math.max(0, ...distances.filter(Number.isFinite));
  const degree = useMemo(() => degrees(8, edges), [edges]);
  const betweenness = useMemo(() => betweennessCentrality(8, edges), [edges]);
  const harmonic = useMemo(() => harmonicCloseness(8, edges), [edges]);
  const scores = measure === 'degree' ? degree : measure === 'betweenness' ? betweenness : harmonic;
  const ranked = scores.map((score, node) => ({ score, node })).sort((a, b) => b.score - a.score || a.node - b.node);
  const reached = distances.filter(value => value <= step).length;
  return <div>
    <p className="lab-note">Synthetic eight-node graph · an exact breadth-first search, one distance layer at a time. The central bridge separates two regions.</p>
    <div className="lab-grid">
      <div className="lab-visual"><GraphDiagram edges={edges} points={CENTRAL_POINTS} numericLabels values={scores} distances={distances} step={step} selected={start}
        onSelect={node => { setStart(node); setStep(0); }} label="Centrality graph; activate a node to make it the BFS source" />
        <p className="selection-note" aria-live="polite">Layer {step}: {distances.map((distance, node) => distance === step ? node : null).filter(node => node !== null).join(', ') || 'no nodes'}. Reached {reached} of 8 nodes. {distances.filter(value => !Number.isFinite(value)).length} unreachable.</p>
      </div>
      <div className="lab-controls"><h3>Important in which sense?</h3><p>Degree counts direct contacts. Betweenness counts brokerage on shortest paths. Harmonic closeness rewards short distances to many nodes.</p>
        <label className="control">BFS source<select aria-label="BFS source" value={start} onChange={event => { setStart(Number(event.target.value)); setStep(0); }}>{Array.from({ length: 8 }, (_, i) => <option key={i} value={i}>Node {i}</option>)}</select></label>
        <label className="control">Distance layer <output>{step} hops</output><input type="range" aria-label="Distance layer" min="0" max={maxStep} step="1" value={step} onChange={event => setStep(Number(event.target.value))} /></label>
        <div className="lab-actions"><button type="button" disabled={step === 0} onClick={() => setStep(value => Math.max(0, value - 1))}>Previous layer</button><button type="button" disabled={step === maxStep} onClick={() => setStep(value => Math.min(maxStep, value + 1))}>Next layer</button></div>
        <label className="control">Measure<select aria-label="Measure" value={measure} onChange={event => setMeasure(event.target.value as Measure)}><option value="degree">Degree</option><option value="betweenness">Betweenness</option><option value="harmonic">Harmonic closeness</option></select></label>
        <button type="button" aria-pressed={!bridge} onClick={() => { setBridge(value => !value); setStep(0); }}>{bridge ? 'Remove the 3–4 bridge' : 'Restore the 3–4 bridge'}</button>
      </div>
    </div>
    <div className="lab-grid"><div><h3>The ranking changes with the question.</h3><p>{measure === 'degree' ? 'Degree is the number of neighbors, without normalization. It cannot see whether those neighbors lead to the rest of the graph.' : measure === 'betweenness' ? 'We count all shortest paths, splitting credit between tied routes. Endpoints receive no credit. Scores are divided by (n−1)(n−2)/2 = 21 possible endpoint pairs.' : 'Each reachable node contributes 1/d; unreachable nodes contribute zero. We divide the sum by n−1 = 7. This convention remains meaningful when the bridge is removed.'}</p>
      <p className="lab-note">Circle area follows the selected score, with a small visible minimum at zero. The dimming shows BFS progress; it does not change scores. Distances are in hops, and ∞ means unreachable.</p></div>
      <table className="data-table"><caption>Exact scores and distances from node {start}</caption><thead><tr><th scope="col">Node</th><th scope="col">{measure === 'harmonic' ? 'Harmonic' : measure === 'betweenness' ? 'Betweenness' : 'Degree'}</th><th scope="col">Distance</th></tr></thead><tbody>{ranked.map(({ node, score }) => <tr key={node}><th scope="row">{node}</th><td>{format(score)}</td><td>{Number.isFinite(distances[node]) ? distances[node] : '∞'}</td></tr>)}</tbody></table>
    </div>
  </div>;
}

const COMMUNITY_EDGES: Edge[] = [0, 5].flatMap(offset => Array.from({ length: 5 }, (_, i) => Array.from({ length: 5 - i - 1 }, (_, j) => [offset + i, offset + i + j + 1] as Edge)).flat()).concat([[4, 5]]);
const COMMUNITY_POINTS: Point[] = Array.from({ length: 10 }, (_, i) => {
  const angle = i < 5 ? (i - 4) * 2 * Math.PI / 5 : (i - 5) * 2 * Math.PI / 5 + Math.PI;
  return { x: (i < 5 ? 165 : 435) + 88 * Math.cos(angle), y: 190 + 88 * Math.sin(angle) };
});
const INITIAL_PARTITION = [0, 0, 0, 0, 0, 1, 1, 1, 1, 1];

function DisparityLab() {
  const [weight, setWeight] = useState(6);
  const [degree, setDegree] = useState(4);
  const otherWeights = Array.from({ length: degree - 1 }, (_, i) => degree - 1 - i);
  const strength = weight + otherWeights.reduce((a, b) => a + b, 0);
  const alpha = disparityAlpha(weight, strength, degree);
  const significant = alpha < 0.05;
  return <div className="sub-lab"><h3>A strong tie is relative to its node.</h3><p>For this separate synthetic weighted star, the highlighted edge has weight w. The other weights are {otherWeights.length ? otherWeights.join(', ') : 'absent'}. Strength s is the sum of all incident weights.</p>
    <div className="lab-grid"><div className="lab-controls"><label className="control">Highlighted weight w <output>{weight}</output><input type="range" aria-label="Highlighted weight w" min="1" max="24" step="1" value={weight} onChange={event => setWeight(Number(event.target.value))} /></label>
      <label className="control">Number of incident ties k <output>{degree}</output><input type="range" aria-label="Number of incident ties k" min="1" max="6" step="1" value={degree} onChange={event => setDegree(Number(event.target.value))} /></label>
      <div className="metric-row"><Metric value={strength} label="strength s" /><Metric value={format(weight / strength)} label="share w/s" /><Metric value={format(alpha, 4)} label="tail probability" /></div>
    </div><div className="lab-visual"><svg className="chart" viewBox="0 0 600 260" role="img" aria-label={`Weighted star with incident edge weights ${[weight, ...otherWeights].join(', ')}; highlighted edge ${significant ? 'passes' : 'does not pass'} the significance threshold`}>
      {[weight, ...otherWeights].map((value, i, all) => { const y = all.length === 1 ? 130 : 35 + i * 190 / (all.length - 1); return <g key={i}><line x1="100" y1="130" x2="450" y2={y} stroke={i === 0 ? 'var(--accent, #f7b955)' : 'currentColor'} strokeWidth={value} opacity={i === 0 ? 0.9 : 0.25} /><circle cx="450" cy={y} r="12" fill={i === 0 ? 'var(--accent, #f7b955)' : '#8c9ba3'} /><text x="480" y={y + 4} fill="currentColor" fontSize="13">w = {value}</text></g>; })}
      <circle cx="100" cy="130" r="30" fill="var(--accent, #f7b955)" /><text x="100" y="134" textAnchor="middle" fill="#111719" fontSize="13">s={strength}</text>
    </svg></div></div>
    <p className="selection-note" aria-live="polite">{degree === 1 ? 'With one tie, the whole strength belongs to that edge. The local null is degenerate: this lab assigns probability 1, so this endpoint alone supplies no evidence of significance.' : `(1 − ${weight}/${strength})^${degree - 1} = ${alpha.toFixed(4)}. The edge ${significant ? 'passes' : 'does not pass'} the strict probability < 0.05 test at this endpoint.`}</p>
    <p className="lab-note">This is one endpoint’s disparity test, not a full backbone. In an undirected network, keep an edge if the test passes at either endpoint. Line widths encode the displayed weights; preserving degree-one leaves would be an additional convention.</p>
  </div>;
}

function CommunityLab() {
  const [partition, setPartition] = useState(INITIAL_PARTITION);
  const [selected, setSelected] = useState(4);
  const q = modularity(10, COMMUNITY_EDGES, partition);
  const cycleGroup = (node: number) => { setSelected(node); setPartition(current => current.map((group, i) => i === node ? (group + 1) % 3 : group)); };
  const groups = new Set(partition).size;
  return <div>
    <p className="lab-note">Synthetic graph · two 5-node cliques joined by one bridge · 10 nodes and 21 edges. The graph stays fixed; you propose the community assignments.</p>
    <div className="lab-grid"><div className="lab-visual"><GraphDiagram edges={COMMUNITY_EDGES} points={COMMUNITY_POINTS} groups={partition} selected={selected} onSelect={cycleGroup} label="Community assignment graph; activate any node to cycle its group" />
      <p className="selection-note" aria-live="polite">Node {LETTERS[selected]} belongs to group {partition[selected] + 1}. Activate a node to cycle groups 1 → 2 → 3.</p>
    </div><div className="lab-controls"><h3>A partition is a claim about structure.</h3><p>Try moving a boundary node. Modularity compares the number of within-group edges with a degree-based null model. Positive Q means more internal connectivity than this null expects.</p>
      <div className="metric-row" aria-live="polite"><Metric value={format(q, 4)} label="modularity Q" /><Metric value={groups} label="nonempty groups" /></div>
      <p>Q = Σᶜ [Lᶜ/m − (Kᶜ/2m)²]</p><p className="lab-note">Lᶜ counts internal edges once; Kᶜ is the sum of all node degrees in group c; m=21. Resolution γ=1.</p>
      <div className="lab-actions"><button type="button" onClick={() => setPartition(INITIAL_PARTITION)}>Reset two groups</button><button type="button" onClick={() => setPartition(Array(10).fill(0))}>Put everyone together</button></div>
      <table className="data-table"><caption>Current group membership</caption><thead><tr><th scope="col">Group</th><th scope="col">Nodes</th></tr></thead><tbody>{[0, 1, 2].map(group => <tr key={group}><th scope="row">{group + 1}</th><td>{partition.map((value, node) => value === group ? LETTERS[node] : '').filter(Boolean).join(', ') || 'Empty'}</td></tr>)}</tbody></table>
    </div></div>
    <p className="lab-note">This lab scores your partition; it does not run Louvain or guarantee an optimum. All nodes in one group give Q=0. The original two-clique partition gives Q=19/42 ≈ 0.4524.</p>
    <DisparityLab />
  </div>;
}

export default function GraphLabs({ kind }: { kind: string }) {
  if (kind === 'graph') return <GraphEditor />;
  if (kind === 'models') return <ModelLab />;
  if (kind === 'centrality') return <CentralityLab />;
  if (kind === 'community') return <CommunityLab />;
  return null;
}
