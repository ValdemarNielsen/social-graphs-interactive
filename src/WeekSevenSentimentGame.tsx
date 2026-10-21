import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { SENTIMENT_ITEMS, SENTIMENT_LEXICON, scoreSentiment, binaryConfusion, type SentimentLabel } from './weekSevenMath';
import { firstTryCorrect, initialSentimentGame, sentimentGameTransition, type SentimentGameAction } from './sentimentGameState';
import './week-seven-sentiment-game.css';

const modelLabels = SENTIMENT_ITEMS.map(item => scoreSentiment(item.text).label as SentimentLabel);
const modelResult = binaryConfusion(modelLabels, SENTIMENT_ITEMS.map(item => item.gold));
const percent = (value: number | null) => value === null ? '—' : `${Math.round(value * 100)}%`;
type GameProps = { reduced: boolean; onSolved?: (id: string) => void };
type Drag = { id: number; startX: number; startY: number; x: number; y: number };
type Pose = { transform: string; opacity: string };
type FlightOrigin = { pose: Pose; x: number; y: number; rotation: number };

function PressDrawing() {
  const hatch = useId();
  return <svg className="w7sg-machine" viewBox="0 0 1200 290" aria-hidden="true">
    <defs><pattern id={hatch} width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(25)"><path d="M0 0V12" stroke="#24332f" strokeWidth="2" opacity=".15"/></pattern></defs>
    <path className="w7sg-table-shadow" d="M142 245H1058l49 16H93Z"/>
    <path className="w7sg-conveyor-shadow" d="M190 215C300 215 340 176 408 176h384c68 0 108 39 218 39"/>
    <path className="w7sg-conveyor" d="M190 203C300 203 340 164 408 164h384c68 0 108 39 218 39"/>
    <path className="w7sg-track" d="M190 203C300 203 340 164 408 164h384c68 0 108 39 218 39"/>
    <path className="w7sg-machine-back" d="M390 24h420v145H390Z"/><path d="M400 33h400v125H400Z" fill={`url(#${hatch})`}/>
    <path className="w7sg-machine-rail" d="M380 25h440v12H380z M380 163h440v12H380z"/>
    <path className="w7sg-machine-feet" d="m416 175-9 28h48l-8-28 M753 175l-8 28h48l-9-28"/>
    {[390, 810].map(x => <g key={x} transform={`translate(${x} 100)`}><rect className="w7sg-cylinder" x="-10" y="-69" width="20" height="139" rx="8"/>{[-54, -36, -18, 0, 18, 36, 54].map(y => <path key={y} className="w7sg-roller-mark" d={`M-8 ${y}H8`}/>)}<circle cy="-59" r="3"/><circle cy="59" r="3"/></g>)}
    <path className="w7sg-track-arrow is-negative" d="m323 173-15 18 23 3"/><path className="w7sg-track-arrow is-positive" d="m877 173 15 18-23 3"/>
    <text x="266" y="139" textAnchor="middle">READ THE CONTEXT</text><text x="934" y="139" textAnchor="middle">ROUTE THE WHOLE SENTENCE</text>
    <path className="w7sg-measure-rule" d="M500 216h200"/>{Array.from({ length: 11 }, (_, i) => <path className="w7sg-measure-rule" key={i} d={`M${500 + i * 20} 213v${i % 5 ? 6 : 12}`}/>)}
    <text className="w7sg-machine-name" x="600" y="249" textAnchor="middle">CONTEXT SORTER / 01</text>
  </svg>;
}

export default function WeekSevenSentimentGame({ reduced, onSolved }: GameProps) {
  const [game, setGame] = useState(initialSentimentGame);
  const gameRef = useRef(game);
  const [motionPaused, setMotionPaused] = useState(false), [visible, setVisible] = useState(false), [hidden, setHidden] = useState(() => typeof document !== 'undefined' && document.hidden);
  const [dragTarget, setDragTarget] = useState<SentimentLabel | null>(null), [layoutVersion, setLayoutVersion] = useState(0);
  const root = useRef<HTMLElement>(null), stage = useRef<HTMLDivElement>(null), paper = useRef<HTMLDivElement>(null), stamp = useRef<HTMLDivElement>(null);
  const negativeBin = useRef<HTMLButtonElement>(null), positiveBin = useRef<HTMLButtonElement>(null), feedbackAction = useRef<HTMLButtonElement>(null);
  const animations = useRef<Animation[]>([]), drag = useRef<Drag | null>(null), lastMotion = useRef(''), notified = useRef(false);
  const flightOrigin = useRef<FlightOrigin | null>(null);
  const id = useId(), item = SENTIMENT_ITEMS[game.round], model = scoreSentiment(item.text), ready = game.phase === 'ready', finished = game.phase === 'finished';
  const motion = !reduced && !motionPaused && visible && !hidden;
  const score = firstTryCorrect(game);
  const rejected = game.phase === 'review-wrong';
  const counts = { positive: SENTIMENT_ITEMS.filter(sentence => game.accepted.includes(sentence.id) && sentence.gold === 'positive').length, negative: SENTIMENT_ITEMS.filter(sentence => game.accepted.includes(sentence.id) && sentence.gold === 'negative').length };

  const cancelAnimations = useCallback(() => { animations.current.forEach(animation => animation.cancel()); animations.current = []; }, []);
  const send = useCallback((action: SentimentGameAction) => {
    const next = sentimentGameTransition(gameRef.current, action);
    if (next === gameRef.current) return false;
    gameRef.current = next;
    setGame(next);
    return true;
  }, []);

  useEffect(() => {
    const element = stage.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: .01 });
    observer.observe(element);
    const resize = new ResizeObserver(() => setLayoutVersion(version => version + 1));
    resize.observe(element);
    const visibility = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', visibility);
    return () => { observer.disconnect(); resize.disconnect(); document.removeEventListener('visibilitychange', visibility); cancelAnimations(); };
  }, [cancelAnimations]);

  useEffect(() => {
    if (finished && !notified.current && onSolved) { notified.current = true; onSolved('week7-sentiment-audit'); }
  }, [finished, onSolved]);

  useEffect(() => {
    if (game.phase === 'review-correct' || game.phase === 'review-wrong') feedbackAction.current?.focus({ preventScroll: true });
    else if (game.phase === 'ready' && (game.round > 0 || game.attempts[0] > 0 || game.run > 0)) paper.current?.focus({ preventScroll: true });
  }, [game.phase, game.round, game.run]);

  useLayoutEffect(() => {
    const slip = paper.current, mark = stamp.current, surface = stage.current;
    cancelAnimations();
    if (!slip || !mark || !surface) return;
    // A resize or playback change ends any active gesture before re-laying out.
    const activeDrag = drag.current;
    if (activeDrag) {
      drag.current = null;
      setDragTarget(null);
      try { if (slip.hasPointerCapture(activeDrag.id)) slip.releasePointerCapture(activeDrag.id); } catch { /* Capture may already be lost. */ }
    }
    const bin = game.lastJudgment === 'negative' ? negativeBin.current : positiveBin.current;
    const surfaceBox = surface.getBoundingClientRect(), binBox = bin?.getBoundingClientRect();
    const cx = surfaceBox.width / 2, cy = slip.offsetTop + slip.offsetHeight / 2;
    const dx = binBox ? binBox.left + binBox.width / 2 - surfaceBox.left - cx : 0;
    const dy = binBox ? binBox.top + binBox.height * .36 - surfaceBox.top - cy : 0;
    const sign = game.lastJudgment === 'negative' ? -1 : 1;
    const center: Pose = { transform: 'translate(0px, 0px) rotate(0deg) scale(1)', opacity: '1' };
    const origin = flightOrigin.current ?? { pose: center, x: 0, y: 0, rotation: 0 };
    flightOrigin.current = null;
    const deposited: Pose = { transform: `translate(${dx}px, ${dy}px) rotate(${sign * 9}deg) scale(.2)`, opacity: '0' };
    const reviewMark: Pose = { transform: `translate(${slip.offsetWidth * .33}px, ${-slip.offsetHeight * .42}px) rotate(9deg) scale(1)`, opacity: '1' };
    const depositMark: Pose = { transform: `translate(${dx}px, ${dy - 12}px) rotate(${sign * -7}deg) scale(1)`, opacity: '1' };
    Object.assign(slip.style, game.phase === 'review-correct' || finished ? deposited : center);
    Object.assign(mark.style, game.phase === 'review-correct' ? depositMark : rejected ? reviewMark : { transform: 'none', opacity: '0' });
    const key = `${game.run}:${game.round}:${game.phase}:${game.attempts[game.round]}`;
    if (!motion) { if (!ready) lastMotion.current = key; return; }
    if (lastMotion.current === key) return;
    lastMotion.current = key;
    const animate = (element: Element, frames: Keyframe[], options: KeyframeAnimationOptions) => {
      if (typeof element.animate === 'function') animations.current.push(element.animate(frames, options));
    };
    if (ready) {
      animate(slip, [{ transform: 'translate(0px, -25px) rotate(-3deg)', opacity: 1 }, center], { duration: 390, easing: 'cubic-bezier(.2,.7,.25,1)' });
    } else if (rejected) {
      animate(slip, [origin.pose, { transform: `translate(${origin.x + (dx - origin.x) * .35}px, ${origin.y + (dy - origin.y) * .2 - 12}px) rotate(${origin.rotation + (sign * 9 - origin.rotation) * .35}deg)`, offset: .36 }, { transform: `translate(${-sign * 17}px, -7px) rotate(${-sign * 2}deg)`, offset: .73 }, center], { duration: 660, easing: 'cubic-bezier(.2,.65,.25,1)' });
      animate(mark, [{ ...reviewMark, opacity: 0, transform: `translate(${slip.offsetWidth * .33}px, ${-slip.offsetHeight * .42 - 30}px) rotate(9deg) scale(1.3)` }, reviewMark], { duration: 230, delay: 460, easing: 'cubic-bezier(.2,.7,.25,1)', fill: 'backwards' });
    } else if (game.phase === 'review-correct') {
      animate(slip, [origin.pose, { transform: `translate(${(origin.x + dx) * .5}px, ${origin.y + (dy - origin.y) * .35 - 25}px) rotate(${(origin.rotation + sign * 9) * .5}deg) scale(.88)`, opacity: 1, offset: .5 }, deposited], { duration: 620, easing: 'cubic-bezier(.3,.1,.3,1)' });
      animate(mark, [{ ...depositMark, transform: `translate(${dx}px, ${dy - 54}px) rotate(${sign * -7}deg) scale(1.4)`, opacity: 0 }, depositMark], { duration: 250, delay: 420, easing: 'cubic-bezier(.2,.7,.25,1)', fill: 'backwards' });
      if (bin) animate(bin, [{ transform: 'translateY(0)' }, { transform: 'translateY(4px)', offset: .45 }, { transform: 'translateY(0)' }], { duration: 300, delay: 460 });
    }
  }, [game, motion, layoutVersion, cancelAnimations, finished, ready, rejected]);

  function currentPaperPose(): FlightOrigin {
    const style = paper.current ? getComputedStyle(paper.current) : null;
    const transform = style?.transform ?? 'none';
    const matrix = new DOMMatrixReadOnly(transform === 'none' ? undefined : transform);
    return { pose: { transform, opacity: style?.opacity ?? '1' }, x: matrix.m41, y: matrix.m42, rotation: Math.atan2(matrix.b, matrix.a) * 180 / Math.PI };
  }
  function route(label: SentimentLabel) {
    if (gameRef.current.phase !== 'ready') return;
    flightOrigin.current = currentPaperPose();
    drag.current = null; setDragTarget(null);
    send({ type: 'route', label });
  }
  function pointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (drag.current || gameRef.current.phase !== 'ready' || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    const origin = currentPaperPose();
    cancelAnimations();
    Object.assign(event.currentTarget.style, origin.pose);
    drag.current = { id: event.pointerId, startX: event.clientX - origin.x, startY: event.clientY - origin.y, x: origin.x, y: origin.y };
    try { event.currentTarget.setPointerCapture(event.pointerId); } catch { /* Buttons remain available if capture is unsupported. */ }
    event.currentTarget.focus({ preventScroll: true });
  }
  function pointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId || !paper.current || !stage.current) return;
    const limit = stage.current.clientWidth * .38;
    current.x = Math.max(-limit, Math.min(limit, event.clientX - current.startX));
    current.y = Math.max(-35, Math.min(95, event.clientY - current.startY));
    paper.current.style.transform = `translate(${current.x}px, ${current.y}px) rotate(${current.x * .025}deg)`;
    const threshold = Math.min(65, stage.current.clientWidth * .13);
    setDragTarget(current.x < -threshold ? 'negative' : current.x > threshold ? 'positive' : null);
  }
  function releasePointer(event: ReactPointerEvent<HTMLDivElement>, cancelled = false) {
    const current = drag.current;
    if (!current || current.id !== event.pointerId) return;
    drag.current = null; setDragTarget(null);
    try { if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId); } catch { /* Capture may already be lost. */ }
    const threshold = Math.min(65, (stage.current?.clientWidth ?? 500) * .13);
    if (!cancelled && Math.abs(current.x) > threshold) route(current.x < 0 ? 'negative' : 'positive');
    else if (paper.current) {
      const origin = currentPaperPose().pose;
      cancelAnimations();
      const center: Pose = { transform: 'translate(0px, 0px) rotate(0deg) scale(1)', opacity: '1' };
      Object.assign(paper.current.style, center);
      if (motion && typeof paper.current.animate === 'function') animations.current.push(paper.current.animate([origin, center], { duration: 220, easing: 'cubic-bezier(.2,.7,.25,1)' }));
    }
  }

  const playerLabels = game.firstJudgments.filter((label): label is SentimentLabel => label !== null);
  const playerResult = finished ? binaryConfusion(playerLabels, SENTIMENT_ITEMS.map(sentence => sentence.gold)) : null;
  const feedbackTitle = rejected ? 'The press sends this one back.' : game.phase === 'review-correct' ? 'Filed. Your judgment matches the reference.' : finished ? 'Six specimens. A better reason for every judgment.' : 'Read the whole sentence. Then give it a direction.';
  return <section className="w7sg" ref={root} data-case="sentiment" data-game="sentiment" data-phase={game.phase} data-round={game.round + 1} data-solved={finished} data-motion={motion ? 'running' : 'still'} aria-labelledby={`${id}-title`}>
    <header className="w7sg-heading"><div><p className="w7sg-kicker">01 / Sentiment sorting press</p><h3 id={`${id}-title`}>The word is not the verdict.</h3></div><div className="w7sg-score"><strong>{score}<span>/6</span></strong><span>first-try matches</span></div><button type="button" className="w7sg-motion" onClick={() => setMotionPaused(value => !value)} disabled={reduced} aria-pressed={motionPaused || reduced}>{reduced ? 'Motion reduced' : motionPaused ? 'Resume motion' : 'Pause motion'}</button></header>
    <div className="w7sg-status"><p id={`${id}-instructions`}>{finished ? 'Audit complete. Every specimen has been checked.' : 'Drag the paper left or right, or use the bins. On the paper: ← negative · positive →'}</p><div className="w7sg-rounds" aria-label={`${game.accepted.length} of 6 specimens verified`}>{SENTIMENT_ITEMS.map((sentence, i) => <span key={sentence.id} className={game.accepted.includes(sentence.id) ? 'is-verified' : i === game.round && !finished ? 'is-current' : ''}>{game.accepted.includes(sentence.id) ? '✓' : i + 1}</span>)}</div></div>
    <div className="w7sg-stage" ref={stage}>
      <PressDrawing/>
      {(['negative', 'positive'] as const).map(label => <button key={label} type="button" ref={label === 'negative' ? negativeBin : positiveBin} className={`w7sg-bin w7sg-bin-${label} ${dragTarget === label ? 'is-target' : ''}`} disabled={!ready} onClick={() => route(label)} aria-label={`Route sentence as ${label}`} aria-keyshortcuts={label === 'negative' ? 'ArrowLeft' : 'ArrowRight'}>
        <span className="w7sg-bin-stack" aria-hidden="true">{Array.from({ length: counts[label] }, (_, i) => <i key={i} style={{ transform: `translate(${i % 2 ? 5 : -4}px, ${-i * 4}px) rotate(${i % 2 ? 4 : -5}deg)` }}/>)}</span>
        <span className="w7sg-bin-front"><b aria-hidden="true">{label === 'negative' ? '−' : '+'}</b><span>{label === 'negative' ? 'Negative' : 'Positive'}<small>{label === 'negative' ? '← route left' : 'route right →'}</small></span><strong>{counts[label]}</strong></span>
      </button>)}
      <div ref={paper} className={`w7sg-paper ${dragTarget ? 'is-dragging' : ''}`} role="group" tabIndex={ready ? 0 : -1} aria-label={`Sentence ${game.round + 1}: ${item.text}`} aria-describedby={`${id}-instructions`} aria-hidden={finished} onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={event => releasePointer(event)} onPointerCancel={event => releasePointer(event, true)} onLostPointerCapture={event => { if (drag.current?.id === event.pointerId) releasePointer(event, true); }} onKeyDown={event => { if (!event.repeat && (event.key === 'ArrowLeft' || event.key === 'ArrowRight')) { event.preventDefault(); route(event.key === 'ArrowLeft' ? 'negative' : 'positive'); } }}>
        <div className="w7sg-paper-meta"><span>SPECIMEN {item.id}</span><span>{String(game.round + 1).padStart(2, '0')} / 06</span></div><blockquote>{item.text}</blockquote><div className="w7sg-paper-foot"><span>Read before routing</span><span aria-hidden="true">↔</span><span>Context counts</span></div>
      </div>
      <div ref={stamp} className={`w7sg-impact-stamp ${rejected ? 'is-review' : ''}`} aria-hidden="true">{rejected ? 'READ AGAIN' : 'VERIFIED'}<small>{rejected ? 'CONTEXT REQUIRED' : game.lastJudgment}</small></div>
      {finished && <div className="w7sg-finish"><p className="w7sg-kicker">CASE RESOLVED</p><h4>Context makes<br/><em>the difference.</em></h4><div><span>Your first routes <strong>{percent(playerResult?.accuracy ?? null)}</strong></span><span>Frozen word rule <strong>{percent(modelResult.accuracy)}</strong></span></div></div>}
    </div>
    <div className={`w7sg-feedback ${rejected ? 'is-review' : game.phase === 'review-correct' || finished ? 'is-verified' : ''}`} aria-live="polite" aria-atomic="true"><div><h4>{feedbackTitle}</h4><p>{rejected || game.phase === 'review-correct' ? <>{item.reason} <span className="w7sg-model-result">Four-word model: {model.label} ({model.score > 0 ? '+' : ''}{model.score}).</span></> : finished ? 'The six references are authored teaching judgments. Your first-route score records the audit; retries help you learn. Neither changes the model’s fixed 3/6 result.' : 'No countdown. No points for speed. Judge the attitude in context, and the machine will stamp a supported route or return the paper for another look.'}</p></div>{game.phase !== 'ready' && <button ref={feedbackAction} type="button" onClick={() => send({ type: rejected ? 'retry' : finished ? 'reset' : 'next' })}>{rejected ? 'Read & retry' : finished ? 'Play again' : game.round === 5 ? 'Finish audit' : 'Next specimen'} <span aria-hidden="true">{rejected ? '↺' : finished ? '↻' : '→'}</span></button>}</div>
    <details className="w7sg-method"><summary>Open the machine <span>4-word rule · frozen 50% accuracy</span><b aria-hidden="true">+</b></summary><div className="w7sg-method-content"><div><p><strong>Disclosed rule.</strong> {Object.entries(SENTIMENT_LEXICON).map(([word, value]) => `${word} ${value > 0 ? '+' : '−'}${Math.abs(value)}`).join(' · ')}. The model sums matched words: positive total → positive; negative → negative; zero → no decision. None of these six sentences ties.</p><p><strong>Scope.</strong> Six invented sentences with authored reference labels. Sarcasm can be ambiguous in real text. This tiny set is not a general estimate of model quality.</p></div><div><table><caption>Frozen model · positive is the target class</caption><thead><tr><th></th><th>Reference +</th><th>Reference −</th></tr></thead><tbody><tr><th>Model +</th><td>{modelResult.tp} true positive</td><td>{modelResult.fp} false positive</td></tr><tr><th>Model −</th><td>{modelResult.fn} false negative</td><td>{modelResult.tn} true negative</td></tr></tbody></table><p>Accuracy {percent(modelResult.accuracy)} · precision {percent(modelResult.precision)} · recall {percent(modelResult.recall)}. The game does not retrain this rule.</p></div></div></details>
  </section>;
}
