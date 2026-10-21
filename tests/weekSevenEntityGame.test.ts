import test from 'node:test';
import assert from 'node:assert/strict';
import { identityWire, identityFault, inspectIdentityWires, ALIAS_WIRE, INITIAL_IDENTITY_WIRES } from '../src/weekSevenEntityGameMath.ts';

test('the corrupted patchboard starts with two false merges and exact reconstructed counts', () => {
  const state = inspectIdentityWires(INITIAL_IDENTITY_WIRES);
  assert.equal(state.repairs, 0);
  assert.equal(state.faults.length, 2);
  assert.equal(state.solved, false);
  assert.equal(state.graph.nodes.length, 4);
  assert.equal(state.graph.edges.length, 5);
  assert.equal(state.graph.totalWeight, 9);
});

test('only the supported alias gives a verified repair and the known reference network', () => {
  const state = inspectIdentityWires([ALIAS_WIRE]);
  assert.equal(state.solved, true);
  assert.deepEqual(state.objectives, [true, true, true]);
  assert.equal(state.faults.length, 0);
  assert.equal(state.graph.nodes.length, 5);
  assert.equal(state.graph.edges.length, 6);
  assert.equal(state.graph.totalWeight, 7);
  assert.equal(inspectIdentityWires([]).solved, false);
  assert.equal(inspectIdentityWires([]).repairs, 2);
});

test('extra false links cannot pass even when all three listed repair objectives are met', () => {
  const state = inspectIdentityWires([ALIAS_WIRE, identityWire('jordan-country', 'greece')]);
  assert.equal(state.repairs, 3);
  assert.equal(state.solved, false);
  assert.equal(state.faults.length, 1);
  assert.match(state.faults[0].reason, /two countries/);
});

test('indirect false merges still fail the separation objective', () => {
  const state = inspectIdentityWires([ALIAS_WIRE, identityWire('apple-inc', 'apple-fruit')]);
  assert.equal(state.objectives[0], false);
  assert.equal(state.solved, false);
  assert.match(state.faults[0].reason, /fruit/);
});

test('wire identity is direction-independent; self-links, unknown mentions, and duplicates are rejected', () => {
  assert.deepEqual(identityWire('apple-inc', 'apple-brand'), ALIAS_WIRE);
  assert.equal(identityFault(ALIAS_WIRE), null);
  assert.throws(() => identityWire('greece', 'greece'), RangeError);
  assert.throws(() => identityWire('missing', 'greece'), RangeError);
  assert.throws(() => inspectIdentityWires([ALIAS_WIRE, identityWire('apple-inc', 'apple-brand')]), RangeError);
});
