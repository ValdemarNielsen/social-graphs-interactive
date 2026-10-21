import { SENTIMENT_ITEMS, type SentimentLabel } from './weekSevenMath.ts';

export type SentimentGamePhase = 'ready' | 'review-wrong' | 'review-correct' | 'finished';
export type SentimentGameState = {
  round: number;
  phase: SentimentGamePhase;
  firstJudgments: (SentimentLabel | null)[];
  attempts: number[];
  accepted: string[];
  lastJudgment: SentimentLabel | null;
  run: number;
};
export type SentimentGameAction = { type: 'route'; label: SentimentLabel } | { type: 'retry' } | { type: 'next' } | { type: 'reset' };

export function initialSentimentGame(run = 0): SentimentGameState {
  return { round: 0, phase: 'ready', firstJudgments: SENTIMENT_ITEMS.map(() => null), attempts: SENTIMENT_ITEMS.map(() => 0), accepted: [], lastJudgment: null, run };
}

/** State is independent of visual completion: animations never unlock input. */
export function sentimentGameTransition(state: SentimentGameState, action: SentimentGameAction): SentimentGameState {
  if (action.type === 'reset') return initialSentimentGame(state.run + 1);
  if (action.type === 'route') {
    if (state.phase !== 'ready') return state;
    const item = SENTIMENT_ITEMS[state.round];
    const firstJudgments = [...state.firstJudgments], attempts = [...state.attempts];
    firstJudgments[state.round] ??= action.label;
    attempts[state.round]++;
    const correct = action.label === item.gold;
    return { ...state, firstJudgments, attempts, lastJudgment: action.label, phase: correct ? 'review-correct' : 'review-wrong', accepted: correct ? [...state.accepted, item.id] : state.accepted };
  }
  if (action.type === 'retry') return state.phase === 'review-wrong' ? { ...state, phase: 'ready', lastJudgment: null } : state;
  if (state.phase !== 'review-correct') return state;
  return state.round === SENTIMENT_ITEMS.length - 1
    ? { ...state, phase: 'finished' }
    : { ...state, round: state.round + 1, phase: 'ready', lastJudgment: null };
}

export function firstTryCorrect(state: SentimentGameState) {
  return SENTIMENT_ITEMS.filter((item, i) => state.firstJudgments[i] === item.gold).length;
}
