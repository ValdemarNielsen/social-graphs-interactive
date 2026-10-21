import test from 'node:test';
import assert from 'node:assert/strict';
import { atlasDistance, atlasDocuments, atlasPoint, nearestDocument } from '../src/measurementAtlas.ts';

const near = (a: number, b: number) => assert.ok(Math.abs(a - b) < 1e-12, `${a} ≠ ${b}`);

test('the dropped feature gives A a false nearest neighbor with exact disclosed distances', () => {
  const full = nearestDocument(0, [0, 1, 2]);
  const flat = nearestDocument(0, [0, 1]);
  const other = nearestDocument(0, [0, 2]);
  assert.equal(full.id, 'B'); near(full.distance, .9);
  assert.equal(flat.id, 'C'); near(flat.distance, Math.sqrt(.0325));
  assert.equal(other.id, 'B'); near(other.distance, Math.sqrt(.65));
  near(atlasDistance(atlasDocuments[0], atlasDocuments[2], [0, 1, 2]), Math.sqrt(9.0325));
});

test('all six selections exclude the query and expose the known neighbor changes', () => {
  assert.deepEqual(atlasDocuments.map((_, i) => nearestDocument(i, [0, 1, 2]).id), ['B', 'A', 'B', 'E', 'D', 'D']);
  assert.deepEqual(atlasDocuments.map((_, i) => nearestDocument(i, [0, 1]).id), ['C', 'C', 'A', 'F', 'F', 'D']);
  assert.deepEqual(atlasDocuments.map((_, i) => nearestDocument(i, [0, 2]).id), ['B', 'A', 'B', 'E', 'D', 'D']);
});

test('both plot views retain equal coordinate scales and reflect Euclidean distance', () => {
  for (const vertical of [1, 2] as const) {
    for (const a of atlasDocuments) for (const b of atlasDocuments) {
      const p = atlasPoint(a, vertical), q = atlasPoint(b, vertical);
      near(Math.hypot(p.x - q.x, p.y - q.y) / 95, atlasDistance(a, b, [0, vertical]));
    }
  }
});

test('zero, symmetry and projection contraction hold for this Euclidean example', () => {
  for (const a of atlasDocuments) for (const b of atlasDocuments) {
    const full = atlasDistance(a, b, [0, 1, 2]);
    near(full, atlasDistance(b, a, [0, 1, 2]));
    assert.ok(atlasDistance(a, b, [0, 1]) <= full + 1e-12);
    assert.ok(atlasDistance(a, b, [0, 2]) <= full + 1e-12);
    if (a === b) assert.equal(full, 0);
    assert.ok(Number.isFinite(full));
  }
});
