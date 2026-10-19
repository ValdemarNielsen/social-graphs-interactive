import test from 'node:test';
import assert from 'node:assert/strict';
import {
  adjacencyMatrix, averageClustering, barabasiAlbert, betweennessCentrality,
  bfsDistances, clusteringCoefficients, connectedComponents, cosine, countTokens,
  degrees, density, disparityAlpha, erdosRenyi, harmonicCloseness,
  meanShortestPathLength, modularity, seededRandom, simpleEdges, tfidf,
  tokenize, wattsStrogatz,
} from '../src/math.ts';
import type { Edge } from '../src/math.ts';

const close = (actual: number, expected: number, tolerance = 1e-12) => assert.ok(Math.abs(actual - expected) < tolerance, `${actual} ≠ ${expected}`);
const closeArray = (actual: number[], expected: number[]) => { assert.equal(actual.length, expected.length); actual.forEach((value, index) => close(value, expected[index])); };

test('simple graph, degree handshake, density, and adjacency matrix agree', () => {
  const edges: Edge[] = [[0, 1], [1, 0], [1, 2], [2, 2], [2, 4], [-1, 0]];
  assert.deepEqual(simpleEdges(4, edges), [[0, 1], [1, 2]]);
  assert.deepEqual(degrees(4, edges), [1, 2, 1, 0]);
  close(density(4, edges), 1 / 3);
  assert.deepEqual(adjacencyMatrix(4, edges), [[0, 1, 0, 0], [1, 0, 1, 0], [0, 1, 0, 0], [0, 0, 0, 0]]);
  assert.equal(degrees(4, edges).reduce((a, b) => a + b, 0), 2 * simpleEdges(4, edges).length);
  assert.equal(density(1, []), 0);
  assert.deepEqual(degrees(0, []), []);
});

test('BFS and components preserve isolates and unreachable distance', () => {
  const edges: Edge[] = [[0, 1], [1, 2], [3, 4]];
  assert.deepEqual(bfsDistances(6, edges, 0), [0, 1, 2, Infinity, Infinity, Infinity]);
  assert.deepEqual(connectedComponents(6, edges), [[0, 1, 2], [3, 4], [5]]);
  assert.equal(meanShortestPathLength(6, edges), null);
  close(meanShortestPathLength(3, [[0, 1], [1, 2]])!, 4 / 3);
  assert.throws(() => bfsDistances(3, [], 3), RangeError);
});

test('Brandes centrality on a path, star, cycle with tied shortest paths, and isolate', () => {
  const path: Edge[] = [[0, 1], [1, 2], [2, 3]];
  closeArray(betweennessCentrality(4, path, false), [0, 2, 2, 0]);
  closeArray(betweennessCentrality(4, path), [0, 2 / 3, 2 / 3, 0]);
  closeArray(betweennessCentrality(5, [[0, 1], [0, 2], [0, 3], [0, 4]]), [1, 0, 0, 0, 0]);
  closeArray(betweennessCentrality(4, [[0, 1], [1, 2], [2, 3], [3, 0]], false), [0.5, 0.5, 0.5, 0.5]);
  closeArray(betweennessCentrality(4, [[0, 1], [1, 2]]), [0, 1 / 3, 0, 0]);
  closeArray(betweennessCentrality(2, [[0, 1]]), [0, 0]);
});

test('harmonic closeness handles disconnected graphs and normalization explicitly', () => {
  closeArray(harmonicCloseness(4, [[0, 1], [1, 2]], false), [1.5, 2, 1.5, 0]);
  closeArray(harmonicCloseness(4, [[0, 1], [1, 2]]), [0.5, 2 / 3, 0.5, 0]);
  assert.deepEqual(harmonicCloseness(1, []), [0]);
});

test('clustering distinguishes a triangle, star, and regular ring', () => {
  assert.deepEqual(clusteringCoefficients(4, [[0, 1], [1, 2], [2, 0]]), [1, 1, 1, 0]);
  close(averageClustering(4, [[0, 1], [1, 2], [2, 0]]), 0.75);
  assert.equal(averageClustering(4, [[0, 1], [0, 2], [0, 3]]), 0);
  close(averageClustering(12, wattsStrogatz(12, 4, 0)), 0.5);
});

test('seeded random graphs are reproducible, simple, and respect boundary probabilities', () => {
  const rng = seededRandom(19), copy = seededRandom(19);
  for (let i = 0; i < 100; i++) { const value = rng(); assert.equal(value, copy()); assert.ok(value >= 0 && value < 1); }
  assert.deepEqual(erdosRenyi(8, 0, 5), []);
  assert.equal(erdosRenyi(8, 1, 5).length, 28);
  assert.deepEqual(erdosRenyi(20, 0.2, 29), erdosRenyi(20, 0.2, 29));
  assert.notDeepEqual(erdosRenyi(20, 0.2, 29), erdosRenyi(20, 0.2, 30));
  assert.throws(() => erdosRenyi(10, -0.1), RangeError);
});

test('Watts-Strogatz preserves edge count and starts from an exact ring lattice', () => {
  assert.deepEqual(degrees(18, wattsStrogatz(18, 4, 0)), Array(18).fill(4));
  for (const beta of [0, 0.25, 1]) {
    const edges = wattsStrogatz(18, 4, beta, 22);
    assert.equal(edges.length, 36);
    assert.deepEqual(edges, simpleEdges(18, edges));
    assert.deepEqual(edges, wattsStrogatz(18, 4, beta, 22));
  }
  assert.equal(wattsStrogatz(5, 4, 1).length, 10);
  assert.throws(() => wattsStrogatz(10, 3, 0.2), RangeError);
});

test('preferential attachment uses the disclosed complete seed and stays connected', () => {
  const n = 30, m = 3;
  const edges = barabasiAlbert(n, m, 77);
  assert.equal(edges.length, (m * (m + 1)) / 2 + (n - m - 1) * m);
  assert.deepEqual(edges, simpleEdges(n, edges));
  assert.equal(connectedComponents(n, edges).length, 1);
  assert.deepEqual(edges, barabasiAlbert(n, m, 77));
  assert.equal(barabasiAlbert(20, 1, 4).length, 19);
  assert.throws(() => barabasiAlbert(2, 2), RangeError);
});

test('modularity has independently calculable community baselines', () => {
  const edges: Edge[] = [[0, 1], [1, 2], [2, 0], [3, 4], [4, 5], [5, 3], [2, 3]];
  close(modularity(6, edges, [0, 0, 0, 1, 1, 1]), 5 / 14);
  close(modularity(6, edges, [0, 0, 0, 0, 0, 0]), 0);
  close(modularity(4, [[0, 1], [2, 3]], ['a', 'a', 'b', 'b']), 0.5);
  assert.equal(modularity(2, [], [0, 1]), 0);
  assert.throws(() => modularity(2, [[0, 1]], [0]), RangeError);
});

test('disparity probability follows the local strength fraction and degree-one convention', () => {
  close(disparityAlpha(2, 11, 10), (9 / 11) ** 9);
  assert.ok(disparityAlpha(2, 11, 10) < 0.2);
  close(disparityAlpha(2, 10, 3), 0.64);
  assert.equal(disparityAlpha(4, 4, 1), 1);
  assert.equal(disparityAlpha(4, 4, 2), 0);
  assert.throws(() => disparityAlpha(5, 4, 2), RangeError);
});

test('Unicode tokenization keeps accents, normalizes apostrophes, and makes preprocessing explicit', () => {
  assert.deepEqual(tokenize("Café, cafe\u0301 — isn't Jean-Luc’s 42nd! 中文 ÆØÅ"), ['café', 'café', "isn't", 'jean', "luc's", '42nd', '中文', 'æøå']);
  assert.deepEqual(tokenize('The hero and THE villain', { removeStopwords: true }), ['hero', 'villain']);
  assert.deepEqual(tokenize('Hero HERO', { lowercase: false }), ['Hero', 'HERO']);
  assert.deepEqual(countTokens(['hero', 'hero', 'villain']), { hero: 2, villain: 1 });
  assert.equal(countTokens(['__proto__'])['__proto__'], 1);
});

test('TF-IDF defaults to course relative frequency times natural-log IDF without smoothing', () => {
  const result = tfidf(['the hero hero mutant', 'the hero power', 'the villain power']);
  assert.deepEqual(result.vocabulary, ['hero', 'mutant', 'power', 'the', 'villain']);
  assert.deepEqual(result.documentFrequencies, [2, 1, 2, 3, 1]);
  closeArray(result.idf, [Math.log(3 / 2), Math.log(3), Math.log(3 / 2), 0, Math.log(3)]);
  closeArray(result.termFrequencies[0], [0.5, 0.25, 0, 0.25, 0]);
  close(result.vectors[0][0], 0.5 * Math.log(3 / 2));
  close(result.vectors[0][1], 0.25 * Math.log(3));
  assert.equal(result.vectors[0][3], 0);
  close(tfidf(['the hero hero mutant', 'the hero power', 'the villain power'], { tf: 'raw' }).vectors[0][0], 2 * Math.log(3 / 2));
  assert.deepEqual(tfidf([]).vectors, []);
  assert.deepEqual(tfidf(['', '']).vectors, [[], []]);
});

test('cosine is scale invariant and handles zero, orthogonal, signed, and large vectors', () => {
  close(cosine([1, 1], [2, 2]), 1);
  close(cosine([1, 1], [1, 0]), 1 / Math.sqrt(2));
  close(cosine([10, 10], [2, 2]), 1);
  close(cosine([1, 0], [0, 1]), 0);
  close(cosine([1, 0], [-1, 0]), -1);
  close(cosine([1e300, 1e300], [2e300, 2e300]), 1);
  assert.equal(cosine([0, 0], [1, 0]), 0);
  assert.equal(cosine([], []), 0);
  assert.throws(() => cosine([1], [1, 2]), RangeError);
});
