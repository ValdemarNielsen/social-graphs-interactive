import test from 'node:test';
import assert from 'node:assert/strict';
import { initialSentimentGame, sentimentGameTransition, firstTryCorrect } from '../src/sentimentGameState.ts';
import { SENTIMENT_ITEMS } from '../src/weekSevenMath.ts';

test('rapid duplicate routes cannot count a sentence twice or skip feedback', () => {
  const first = sentimentGameTransition(initialSentimentGame(), { type: 'route', label: 'positive' });
  assert.equal(first.phase, 'review-correct');
  assert.deepEqual(first.accepted, ['S1']);
  assert.equal(first.attempts[0], 1);
  assert.equal(sentimentGameTransition(first, { type: 'route', label: 'positive' }), first);
  assert.equal(sentimentGameTransition(first, { type: 'route', label: 'negative' }), first);
  assert.equal(first.round, 0);
});

test('wrong routes require explicit retry and never rewrite the first-try score', () => {
  let state = sentimentGameTransition(initialSentimentGame(), { type: 'route', label: 'negative' });
  assert.equal(state.phase, 'review-wrong');
  assert.equal(sentimentGameTransition(state, { type: 'next' }), state);
  state = sentimentGameTransition(state, { type: 'retry' });
  state = sentimentGameTransition(state, { type: 'route', label: 'positive' });
  assert.equal(state.phase, 'review-correct');
  assert.equal(state.attempts[0], 2);
  assert.equal(state.firstJudgments[0], 'negative');
  assert.equal(firstTryCorrect(state), 0);
  assert.deepEqual(state.accepted, ['S1']);
});

test('all six verified routes and an explicit final action are required to finish', () => {
  let state = initialSentimentGame();
  assert.equal(sentimentGameTransition(state, { type: 'next' }), state);
  for (const [round, item] of SENTIMENT_ITEMS.entries()) {
    assert.equal(state.round, round);
    state = sentimentGameTransition(state, { type: 'route', label: item.gold });
    assert.equal(state.phase, 'review-correct');
    state = sentimentGameTransition(state, { type: 'next' });
  }
  assert.equal(state.phase, 'finished');
  assert.equal(firstTryCorrect(state), 6);
  assert.equal(state.accepted.length, 6);
  assert.equal(sentimentGameTransition(state, { type: 'next' }), state);
  const restarted = sentimentGameTransition(state, { type: 'reset' });
  assert.deepEqual(restarted, initialSentimentGame(1));
});
