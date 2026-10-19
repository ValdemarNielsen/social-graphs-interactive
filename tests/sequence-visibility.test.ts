import test from 'node:test';
import assert from 'node:assert/strict';
import { sequenceIsVisible } from '../src/sequenceVisibility.ts';

test('artwork waits until its final details fit below fixed chapter navigation', () => {
  assert.equal(sequenceIsVisible(650, 1080, 900, 150), false);
  assert.equal(sequenceIsVisible(300, 730, 900, 150), true);
  assert.equal(sequenceIsVisible(-100, 330, 900, 150), false);
  assert.equal(sequenceIsVisible(-430, 0, 900, 150), false);
});
test('short viewports and tall scenes can play without requiring impossible full intersection', () => {
  assert.equal(sequenceIsVisible(150, 900, 720, 150), true);
  assert.equal(sequenceIsVisible(600, 1350, 720, 150), false);
  assert.equal(sequenceIsVisible(100, 100, 720, 150), false);
});
test('a small scroll near the visibility boundary does not repeatedly stop and start a scene', () => {
  assert.equal(sequenceIsVisible(540, 970, 900, 150), false);
  assert.equal(sequenceIsVisible(540, 970, 900, 150, true), true);
  assert.equal(sequenceIsVisible(620, 1050, 900, 150, true), false);
});
