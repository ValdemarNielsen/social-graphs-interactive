/** Pure, deterministic calculations for the learning labs. All graph helpers use
 * simple, unweighted, undirected graphs unless a function explicitly says otherwise.
 * Nodes are indexed 0..n-1. Duplicate edges, self-loops and invalid endpoints are ignored.
 */
export type Edge = [number, number];

function checkSize(n: number): void {
  if (!Number.isSafeInteger(n) || n < 0) throw new RangeError('Node count must be a non-negative integer.');
}

function checkProbability(p: number): void {
  if (!Number.isFinite(p) || p < 0 || p > 1) throw new RangeError('Probability must be between 0 and 1.');
}

export function simpleEdges(n: number, edges: readonly Edge[]): Edge[] {
  checkSize(n);
  const seen = new Set<string>();
  const result: Edge[] = [];
  for (const [a, b] of edges) {
    if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0 || a >= n || b >= n || a === b) continue;
    const edge: Edge = a < b ? [a, b] : [b, a];
    const key = `${edge[0]}:${edge[1]}`;
    if (!seen.has(key)) { seen.add(key); result.push(edge); }
  }
  return result;
}

export function adjacencyList(n: number, edges: readonly Edge[]): number[][] {
  const clean = simpleEdges(n, edges);
  const adjacency: number[][] = Array.from({ length: n }, () => []);
  for (const [a, b] of clean) { adjacency[a].push(b); adjacency[b].push(a); }
  return adjacency.map(neighbors => neighbors.sort((a, b) => a - b));
}

export function adjacencyMatrix(n: number, edges: readonly Edge[]): number[][] {
  const clean = simpleEdges(n, edges);
  const matrix = Array.from({ length: n }, () => Array<number>(n).fill(0));
  for (const [a, b] of clean) { matrix[a][b] = 1; matrix[b][a] = 1; }
  return matrix;
}

export function degrees(n: number, edges: readonly Edge[]): number[] {
  return adjacencyList(n, edges).map(neighbors => neighbors.length);
}

export function density(n: number, edges: readonly Edge[]): number {
  const clean = simpleEdges(n, edges);
  return n < 2 ? 0 : (2 * clean.length) / (n * (n - 1));
}

function distancesFrom(adjacency: readonly number[][], start: number): number[] {
  const distances = Array<number>(adjacency.length).fill(Infinity);
  const queue = [start];
  distances[start] = 0;
  for (let cursor = 0; cursor < queue.length; cursor++) {
    const node = queue[cursor];
    for (const next of adjacency[node]) {
      if (distances[next] === Infinity) {
        distances[next] = distances[node] + 1;
        queue.push(next);
      }
    }
  }
  return distances;
}

/** An unreachable node has distance Infinity. Distances count edges (hops). */
export function bfsDistances(n: number, edges: readonly Edge[], start: number): number[] {
  const adjacency = adjacencyList(n, edges);
  if (!Number.isInteger(start) || start < 0 || start >= n) throw new RangeError('Start node is outside the graph.');
  return distancesFrom(adjacency, start);
}

export function connectedComponents(n: number, edges: readonly Edge[]): number[][] {
  const adjacency = adjacencyList(n, edges);
  const visited = new Set<number>();
  const components: number[][] = [];
  for (let source = 0; source < n; source++) {
    if (visited.has(source)) continue;
    const component = [source];
    visited.add(source);
    for (let cursor = 0; cursor < component.length; cursor++) {
      for (const neighbor of adjacency[component[cursor]]) {
        if (!visited.has(neighbor)) { visited.add(neighbor); component.push(neighbor); }
      }
    }
    components.push(component.sort((a, b) => a - b));
  }
  return components;
}

/** Brandes' exact algorithm, excluding path endpoints. Raw scores count unordered
 * source-target pairs. Normalized scores divide by (n-1)(n-2)/2, including isolates.
 */
export function betweennessCentrality(n: number, edges: readonly Edge[], normalized = true): number[] {
  const adjacency = adjacencyList(n, edges);
  const centrality = Array<number>(n).fill(0);
  for (let source = 0; source < n; source++) {
    const predecessors: number[][] = Array.from({ length: n }, () => []);
    const paths = Array<number>(n).fill(0);
    const distance = Array<number>(n).fill(-1);
    const queue = [source];
    const stack: number[] = [];
    paths[source] = 1;
    distance[source] = 0;
    for (let cursor = 0; cursor < queue.length; cursor++) {
      const node = queue[cursor];
      stack.push(node);
      for (const next of adjacency[node]) {
        if (distance[next] < 0) { queue.push(next); distance[next] = distance[node] + 1; }
        if (distance[next] === distance[node] + 1) {
          paths[next] += paths[node];
          predecessors[next].push(node);
        }
      }
    }
    const dependency = Array<number>(n).fill(0);
    while (stack.length) {
      const node = stack.pop()!;
      for (const previous of predecessors[node]) {
        dependency[previous] += (paths[previous] / paths[node]) * (1 + dependency[node]);
      }
      if (node !== source) centrality[node] += dependency[node];
    }
  }
  const scale = normalized ? (n > 2 ? 1 / ((n - 1) * (n - 2)) : 0) : 0.5;
  return centrality.map(value => value * scale);
}

/** Sum of reciprocal distances; unreachable nodes contribute zero. The normalized
 * variant divides by n-1 and remains defined on disconnected graphs and isolates.
 */
export function harmonicCloseness(n: number, edges: readonly Edge[], normalized = true): number[] {
  const adjacency = adjacencyList(n, edges);
  return adjacency.map((_, source) => {
    const sum = distancesFrom(adjacency, source).reduce((value, d) => value + (d > 0 && Number.isFinite(d) ? 1 / d : 0), 0);
    return normalized ? (n > 1 ? sum / (n - 1) : 0) : sum;
  });
}

/** Local clustering = observed edges among neighbors / possible neighbor pairs. */
export function clusteringCoefficients(n: number, edges: readonly Edge[]): number[] {
  const adjacency = adjacencyList(n, edges);
  const sets = adjacency.map(neighbors => new Set(neighbors));
  return adjacency.map(neighbors => {
    if (neighbors.length < 2) return 0;
    let triangles = 0;
    for (let i = 0; i < neighbors.length; i++) {
      for (let j = i + 1; j < neighbors.length; j++) if (sets[neighbors[i]].has(neighbors[j])) triangles++;
    }
    return (2 * triangles) / (neighbors.length * (neighbors.length - 1));
  });
}

export function averageClustering(n: number, edges: readonly Edge[]): number {
  const values = clusteringCoefficients(n, edges);
  return n ? values.reduce((a, b) => a + b, 0) / n : 0;
}

/** Mean over all unordered pairs. Returns null for a disconnected graph; zero for
 * fewer than two nodes. This never silently drops unreachable pairs.
 */
export function meanShortestPathLength(n: number, edges: readonly Edge[]): number | null {
  const adjacency = adjacencyList(n, edges);
  if (n < 2) return 0;
  let sum = 0;
  for (let source = 0; source < n; source++) {
    const distances = distancesFrom(adjacency, source);
    for (let target = source + 1; target < n; target++) {
      if (!Number.isFinite(distances[target])) return null;
      sum += distances[target];
    }
  }
  return (2 * sum) / (n * (n - 1));
}

/** A small deterministic PRNG. Seeds are interpreted modulo 2^32. */
export function seededRandom(seed = 1): () => number {
  if (!Number.isFinite(seed)) throw new RangeError('Seed must be finite.');
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6D2B79F5) >>> 0;
    let value = Math.imul(state ^ (state >>> 15), state | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** G(n,p): each possible undirected edge receives one independent Bernoulli draw. */
export function erdosRenyi(n: number, p: number, seed = 1): Edge[] {
  checkSize(n); checkProbability(p);
  const random = seededRandom(seed);
  const edges: Edge[] = [];
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) if (random() < p) edges.push([a, b]);
  return edges;
}

/** Watts-Strogatz ring rewiring. k must be even and smaller than n. Each original
 * clockwise edge is considered once; rewiring preserves edge count, not degrees.
 */
export function wattsStrogatz(n: number, k: number, beta: number, seed = 1): Edge[] {
  checkSize(n); checkProbability(beta);
  if (!Number.isInteger(k) || k < 0 || k % 2 !== 0 || (n > 0 ? k >= n : k !== 0)) {
    throw new RangeError('Ring degree k must be an even non-negative integer smaller than n.');
  }
  const random = seededRandom(seed);
  const adjacency = Array.from({ length: n }, () => new Set<number>());
  const original: Edge[] = [];
  for (let offset = 1; offset <= k / 2; offset++) for (let a = 0; a < n; a++) {
    const b = (a + offset) % n;
    adjacency[a].add(b); adjacency[b].add(a); original.push([a, b]);
  }
  for (const [a, b] of original) {
    if (random() >= beta) continue;
    const available = Array.from({ length: n }, (_, node) => node).filter(node => node !== a && !adjacency[a].has(node));
    if (!available.length) continue;
    const replacement = available[Math.floor(random() * available.length)];
    adjacency[a].delete(b); adjacency[b].delete(a);
    adjacency[a].add(replacement); adjacency[replacement].add(a);
  }
  const edges: Edge[] = [];
  for (let a = 0; a < n; a++) for (const b of adjacency[a]) if (a < b) edges.push([a, b]);
  return edges.sort(([a, b], [c, d]) => a - c || b - d);
}

/** Preferential attachment from a complete seed of m+1 nodes. Every new node
 * chooses m distinct existing nodes with probability proportional to degree.
 * This seed convention is explicit: realizations need not match NetworkX's seed.
 */
export function barabasiAlbert(n: number, m: number, seed = 1): Edge[] {
  checkSize(n);
  if (!Number.isInteger(m) || m < 1 || m >= n) throw new RangeError('Attachment count m must satisfy 1 <= m < n.');
  const random = seededRandom(seed);
  const edges: Edge[] = [];
  const degree = Array<number>(n).fill(0);
  for (let a = 0; a <= m; a++) for (let b = a + 1; b <= m; b++) {
    edges.push([a, b]); degree[a]++; degree[b]++;
  }
  for (let node = m + 1; node < n; node++) {
    const targets = new Set<number>();
    while (targets.size < m) {
      const total = degree.slice(0, node).reduce((sum, value, candidate) => sum + (targets.has(candidate) ? 0 : value), 0);
      let draw = random() * total;
      let chosen = -1;
      for (let candidate = 0; candidate < node; candidate++) {
        if (targets.has(candidate)) continue;
        draw -= degree[candidate];
        if (draw < 0) { chosen = candidate; break; }
      }
      if (chosen < 0) throw new Error('Preferential attachment could not select a target.');
      targets.add(chosen);
    }
    for (const target of targets) { edges.push([target, node]); degree[target]++; degree[node]++; }
  }
  return edges;
}

/** Newman-Girvan modularity for a supplied partition at resolution gamma=1:
 * Q = sum_c [L_c/m - (K_c/(2m))^2]. Edgeless graphs return zero by convention.
 */
export function modularity(n: number, edges: readonly Edge[], partition: readonly (string | number)[]): number {
  const clean = simpleEdges(n, edges);
  if (partition.length !== n || partition.some(label => label === undefined || label === null)) {
    throw new RangeError('The partition must assign exactly one community label to every node.');
  }
  if (!clean.length) return 0;
  const communities = new Map<string | number, { internal: number; degree: number }>();
  for (const label of partition) if (!communities.has(label)) communities.set(label, { internal: 0, degree: 0 });
  for (const [a, b] of clean) {
    communities.get(partition[a])!.degree++;
    communities.get(partition[b])!.degree++;
    if (partition[a] === partition[b]) communities.get(partition[a])!.internal++;
  }
  return [...communities.values()].reduce((q, c) => q + c.internal / clean.length - (c.degree / (2 * clean.length)) ** 2, 0);
}

/** Local disparity-tail probability. For degree 1 the strength split is degenerate;
 * return 1 (no evidence of an unusually large share from this endpoint). A UI that
 * preserves leaves must explicitly state that additional convention.
 */
export function disparityAlpha(weight: number, strength: number, degree: number): number {
  if (!Number.isFinite(weight) || !Number.isFinite(strength) || weight < 0 || strength <= 0 || weight > strength || !Number.isInteger(degree) || degree < 1) {
    throw new RangeError('Require 0 <= weight <= strength, positive strength, and integer degree >= 1.');
  }
  if (degree === 1) return 1;
  return (1 - weight / strength) ** (degree - 1);
}

export interface TokenizeOptions {
  lowercase?: boolean;
  removeStopwords?: boolean;
  stopwords?: readonly string[];
}

/** An intentionally small, disclosed teaching list rather than a linguistic standard. */
export const DEFAULT_STOPWORDS = ['a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'in', 'is', 'it', 'of', 'on', 'or', 'that', 'the', 'this', 'to', 'was', 'were', 'with'] as const;

/** Unicode letters/numbers and internal apostrophes form tokens. Hyphens split;
 * punctuation is dropped; accents are kept; NFC combines decomposed characters.
 */
export function tokenize(text: string, options: TokenizeOptions = {}): string[] {
  const normalized = text.normalize('NFC').replaceAll('\u2019', "'");
  const prepared = options.lowercase === false ? normalized : normalized.toLowerCase();
  const tokens = prepared.match(/[\p{L}\p{N}][\p{L}\p{M}\p{N}]*(?:'[\p{L}\p{N}][\p{L}\p{M}\p{N}]*)*/gu) ?? [];
  if (!options.removeStopwords) return tokens;
  const stopwords = new Set((options.stopwords ?? DEFAULT_STOPWORDS).map(word => options.lowercase === false ? word : word.toLowerCase()));
  return tokens.filter(token => !stopwords.has(token));
}

export function countTokens(tokens: readonly string[]): Record<string, number> {
  const counts = new Map<string, number>();
  for (const token of tokens) counts.set(token, (counts.get(token) ?? 0) + 1);
  return Object.fromEntries(counts);
}

export interface TfidfResult {
  vocabulary: string[];
  tokens: string[][];
  counts: number[][];
  termFrequencies: number[][];
  documentFrequencies: number[];
  idf: number[];
  vectors: number[][];
}

export interface TfidfOptions extends TokenizeOptions {
  tf?: 'relative' | 'raw';
}

/** Course-default relative TF times unsmoothed natural-log IDF:
 * [count(t,d) / tokenized document length] * ln(N/df(t)). Empty documents have
 * all-zero TF. Raw TF is an explicit alternative. There is no L2 normalization.
 */
export function tfidf(documents: readonly string[], options: TfidfOptions = {}): TfidfResult {
  const tokens = documents.map(document => tokenize(document, options));
  const vocabulary = [...new Set(tokens.flat())].sort();
  const tokenCounts = tokens.map(countTokens);
  const counts = tokenCounts.map(count => vocabulary.map(word => Object.hasOwn(count, word) ? count[word] : 0));
  const termFrequencies = counts.map((document, index) => document.map(count => options.tf === 'raw' ? count : (tokens[index].length ? count / tokens[index].length : 0)));
  const documentFrequencies = vocabulary.map((_, index) => counts.reduce((sum, document) => sum + (document[index] > 0 ? 1 : 0), 0));
  const idf = documentFrequencies.map(df => Math.log(documents.length / df));
  const vectors = termFrequencies.map(document => document.map((tf, index) => tf * idf[index]));
  return { vocabulary, tokens, counts, termFrequencies, documentFrequencies, idf, vectors };
}

/** Cosine between equal-dimensional finite vectors. A zero vector returns zero
 * by explicit UI convention; mathematically its cosine is undefined.
 */
export function cosine(a: readonly number[], b: readonly number[]): number {
  if (a.length !== b.length || [...a, ...b].some(value => !Number.isFinite(value))) throw new RangeError('Vectors must have equal length and finite entries.');
  // Scale each vector first to avoid overflow for otherwise valid large inputs.
  const scaleA = a.reduce((max, value) => Math.max(max, Math.abs(value)), 0);
  const scaleB = b.reduce((max, value) => Math.max(max, Math.abs(value)), 0);
  if (scaleA === 0 || scaleB === 0) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    const x = a[i] / scaleA, y = b[i] / scaleB;
    dot += x * y; normA += x * x; normB += y * y;
  }
  return Math.max(-1, Math.min(1, dot / Math.sqrt(normA * normB)));
}
