import test from 'node:test';
import assert from 'node:assert/strict';
import {
  SENTIMENT_ITEMS, scoreSentiment, binaryConfusion, ENTITY_MENTIONS, ENTITY_PAIRS,
  ENTITY_DOCUMENTS, resolveEntityMap, cooccurrenceGraph, SEARCH_QUERY, SEARCH_SNIPPETS,
  searchTerms, keywordCosine, rankKeywordDocuments, assessEvidence,
} from '../src/weekSevenMath.ts';
import type { SentimentLabel } from '../src/weekSevenMath.ts';

test('disclosed sentiment rule counts repeats, ignores case/punctuation, and abstains at zero', () => {
  assert.equal(scoreSentiment('GOOD, good! But terrible.').score, 0);
  assert.equal(scoreSentiment('good but terrible').score, -1);
  assert.equal(scoreSentiment('wonderful good bad terrible').label, null);
  assert.equal(scoreSentiment('No known words.').label, null);
  assert.equal(scoreSentiment('goodness').score, 0);
  assert.deepEqual(scoreSentiment('not good').matches, [{ word: 'good', value: 1 }]);
  assert.equal(scoreSentiment('not good').label, 'positive');
});

test('six authored references yield independently checked model confusion and denominators', () => {
  const predictions = SENTIMENT_ITEMS.map(item => scoreSentiment(item.text).label);
  assert.ok(predictions.every(label => label !== null));
  const result = binaryConfusion(predictions as SentimentLabel[], SENTIMENT_ITEMS.map(item => item.gold));
  assert.deepEqual(result, { tp: 1, fp: 2, tn: 2, fn: 1, total: 6, accuracy: .5, precision: 1 / 3, recall: .5, f1: .4 });
});

test('undefined precision/recall remain undefined rather than silently becoming zero', () => {
  const empty = binaryConfusion([], []);
  assert.equal(empty.accuracy, null); assert.equal(empty.precision, null); assert.equal(empty.recall, null);
  const negativeOnly = binaryConfusion(['negative'], ['negative']);
  assert.equal(negativeOnly.accuracy, 1); assert.equal(negativeOnly.precision, null); assert.equal(negativeOnly.recall, null);
  assert.equal(binaryConfusion(['negative'], ['positive']).recall, 0);
  assert.throws(() => binaryConfusion(['positive'], []), RangeError);
});

test('alias union is transitive, order independent, and rejects missing entities', () => {
  const links = [{ left: 'a', right: 'b', decision: 'merge' as const }, { left: 'c', right: 'b', decision: 'merge' as const }];
  assert.deepEqual(resolveEntityMap(['a', 'b', 'c', 'd'], links), { a: 'a', b: 'a', c: 'a', d: 'd' });
  assert.deepEqual(resolveEntityMap(['a', 'b', 'c', 'd'], [...links].reverse()), { a: 'a', b: 'a', c: 'a', d: 'd' });
  assert.throws(() => resolveEntityMap(['a'], [{ left: 'a', right: 'missing', decision: 'merge' }]), RangeError);
  assert.throws(() => resolveEntityMap(['a', 'a'], []), RangeError);
});

test('co-occurrence counts documents once, collapses aliases, and preserves isolated entities', () => {
  const graph = cooccurrenceGraph([
    { id: '1', text: '', mentions: ['a', 'alias', 'b', 'b'] },
    { id: '2', text: '', mentions: ['a', 'b'] },
    { id: '3', text: '', mentions: ['c'] },
  ], { a: 'a', alias: 'a', b: 'b', c: 'c' });
  assert.equal(graph.nodes.length, 3);
  assert.deepEqual(graph.edges, [{ a: 'a', b: 'b', count: 2, documents: ['1', '2'] }]);
  assert.equal(graph.totalWeight, 2);
  assert.deepEqual(cooccurrenceGraph([], {}), { nodes: [], edges: [], totalWeight: 0 });
  assert.throws(() => cooccurrenceGraph([{ id: 'x', text: '', mentions: ['a'] }], {}), RangeError);
  assert.throws(() => cooccurrenceGraph([{ id: 'x', text: '', mentions: [] }, { id: 'x', text: '', mentions: [] }], {}), RangeError);
});

test('the entity investigation reconstructs the exact five-node, six-edge reference graph', () => {
  const ids = ENTITY_MENTIONS.map(item => item.id);
  const baseline = cooccurrenceGraph(ENTITY_DOCUMENTS, resolveEntityMap(ids, []));
  assert.equal(baseline.nodes.length, 6); assert.equal(baseline.edges.length, 8); assert.equal(baseline.totalWeight, 9);
  const mapping = resolveEntityMap(ids, ENTITY_PAIRS.map(pair => ({ ...pair, decision: pair.correct })));
  const result = cooccurrenceGraph(ENTITY_DOCUMENTS, mapping);
  assert.equal(result.nodes.length, 5); assert.equal(result.edges.length, 6); assert.equal(result.totalWeight, 7);
  assert.deepEqual(result.edges.find(edge => edge.a === 'apple-brand' && edge.b === 'jordan-person'), { a: 'apple-brand', b: 'jordan-person', count: 2, documents: ['D1', 'D5'] });
  assert.ok(result.edges.every(edge => edge.a !== edge.b));
});

test('binary keyword cosine handles repeated words, empty vectors, and stable ties', () => {
  assert.deepEqual(searchTerms('The WORD, word and other!'), ['word', 'other']);
  assert.equal(keywordCosine('apple apple', 'apple').score, 1);
  assert.equal(keywordCosine('apple pear', 'apple banana').score, .5);
  assert.equal(keywordCosine('', 'apple').score, 0);
  assert.equal(keywordCosine('the and', 'apple').score, 0);
  assert.deepEqual(rankKeywordDocuments('x', [{ id: 'B', text: 'x' }, { id: 'A', text: 'x' }]).map(item => item.id), ['A', 'B']);
});

test('keyword retrieval misses the expiry evidence despite a related top result', () => {
  const ranked = rankKeywordDocuments(SEARCH_QUERY, SEARCH_SNIPPETS);
  assert.deepEqual(ranked.map(item => item.id), ['A', 'B', 'D', 'C']);
  assert.equal(ranked.find(item => item.id === 'C')!.score, 0);
  assert.equal(assessEvidence('grounded', ranked.slice(0, 2).map(item => item.id)).grounded, false);
  assert.deepEqual(assessEvidence('grounded', ['A', 'B']).missing, ['C']);
});

test('answer support requires evidence for every claim; duplicates cannot replace a missing source', () => {
  assert.equal(assessEvidence('grounded', ['B', 'C']).grounded, true);
  assert.equal(assessEvidence('grounded', ['B', 'B']).grounded, false);
  assert.equal(assessEvidence('grounded', []).grounded, false);
  assert.equal(assessEvidence('unsupported', ['B', 'C']).grounded, false);
  assert.equal(assessEvidence('contradicted', ['B', 'C']).grounded, false);
  assert.throws(() => assessEvidence('invented', []), RangeError);
  assert.throws(() => assessEvidence('grounded', ['Z']), RangeError);
});
