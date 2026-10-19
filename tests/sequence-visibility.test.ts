import test from 'node:test';
import assert from 'node:assert/strict';
import { sequenceIsVisible } from '../src/sequenceVisibility.ts';

test('artwork starts at its leading edge without waiting for the full scene', () => {
  assert.equal(sequenceIsVisible(650, 1080, 900, 150), true);
  assert.equal(sequenceIsVisible(840, 1270, 900, 150), true);
  assert.equal(sequenceIsVisible(860, 1290, 900, 150), false);
  assert.equal(sequenceIsVisible(300, 730, 900, 150), true);
  assert.equal(sequenceIsVisible(-100, 330, 900, 150), true);
  assert.equal(sequenceIsVisible(-430, 0, 900, 150), false);
});
test('short viewports and tall scenes can play without requiring impossible full intersection', () => {
  assert.equal(sequenceIsVisible(150, 900, 720, 150), true);
  assert.equal(sequenceIsVisible(600, 1350, 720, 150), true);
  assert.equal(sequenceIsVisible(710, 1460, 720, 150), false);
  assert.equal(sequenceIsVisible(100, 100, 720, 150), false);
});
test('a small scroll near the visibility boundary does not repeatedly stop and start a scene', () => {
  assert.equal(sequenceIsVisible(860, 1290, 900, 150), false);
  assert.equal(sequenceIsVisible(860, 1290, 900, 150, true), true);
  assert.equal(sequenceIsVisible(880, 1310, 900, 150, true), false);
  assert.equal(sequenceIsVisible(-300, 158, 900, 150, true), true);
  assert.equal(sequenceIsVisible(-310, 148, 900, 150, true), false);
});
