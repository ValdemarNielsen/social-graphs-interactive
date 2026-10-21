import { useEffect, useId, useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { SEARCH_QUERY, SEARCH_SNIPPETS, SEARCH_STOPWORDS, rankKeywordDocuments } from './weekSevenMath';
import './week-seven-retrieval-game.css';

type SourceId = typeof SEARCH_SNIPPETS[number]['id'];
type Mode = 'keyword' | 'semantic';
type Phase = 'idle' | 'running' | 'review' | 'passed';
type Point = { x: number; y: number };
type Result = { source?: SourceId; status: 'supported' | 'unsupported' | 'missing' };
const CLAIMS: { title: string; source: SourceId; quote: string; missing: string }[] = [
  { title: 'Choose Forgot password', source: 'B', quote: 'Choose Forgot password on the sign-in screen.', missing: 'Find the source that gives the recovery action.' },
  { title: 'Link arrives at registered email', source: 'B', quote: 'We send a reset link to the email address on file.', missing: 'Find the source that specifies where the link is sent.' },
  { title: 'Expires in thirty minutes', source: 'C', quote: 'A reset link expires after thirty minutes.', missing: 'Find the source that states this exact time limit.' },
];
const KEYWORD = rankKeywordDocuments(SEARCH_QUERY, SEARCH_SNIPPETS);
const KEYWORD_ORDER = KEYWORD.map(item => item.id);
const SEMANTIC_ORDER = [...SEARCH_SNIPPETS].sort((a, b) => a.semanticRank - b.semanticRank).map(item => item.id);
const sourceName = (id: SourceId) => SEARCH_SNIPPETS.find(source => source.id === id)!.title;
const wire = (a: Point, b: Point, bridge = (a.y + b.y) / 2) => {
  if (b.x < a.x) return `M ${a.x} ${a.y} C ${a.x + 12} ${a.y}, ${a.x + 12} ${bridge}, ${a.x} ${bridge} L ${b.x} ${bridge} C ${b.x - 12} ${bridge}, ${b.x - 12} ${b.y}, ${b.x} ${b.y}`;
  const bend = Math.max(35, Math.abs(b.x - a.x) * .48);
  return `M ${a.x} ${a.y} C ${a.x + bend} ${a.y}, ${b.x - bend} ${b.y}, ${b.x} ${b.y}`;
};

export default function WeekSevenRetrievalGame({ reduced, onSolved }: { reduced: boolean; onSolved?: (id: string) => void }) {
  const titleId = useId();
  const hintId = useId();
  const [mode, setMode] = useState<Mode>('keyword');
  const [selected, setSelected] = useState<SourceId | null>(null);
  const [connections, setConnections] = useState<(SourceId | undefined)[]>([undefined, undefined, undefined]);
  const [phase, setPhase] = useState<Phase>('idle');
  const [results, setResults] = useState<Result[] | null>(null);
  const [run, setRun] = useState(0);
  const [sorting, setSorting] = useState(false);
  const [notice, setNotice] = useState('Select a source, then a claim socket. One source can support more than one claim.');
  const [drag, setDrag] = useState<{ source: SourceId; point: Point } | null>(null);
  const [geometry, setGeometry] = useState<{ width: number; height: number; sources: Partial<Record<SourceId, Point>>; claims: Point[] }>({ width: 1, height: 1, sources: {}, claims: [] });
  const stage = useRef<HTMLDivElement>(null);
  const sourcePorts = useRef<Partial<Record<SourceId, HTMLSpanElement | null>>>({});
  const claimPorts = useRef<(HTMLSpanElement | null)[]>([]);
  const pending = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completion = useRef<(() => void) | null>(null);
  const notified = useRef(false);
  const dragStart = useRef<{ id: number; source: SourceId; x: number; y: number; moved: boolean } | null>(null);
  const suppressClickUntil = useRef(0);
  const order = mode === 'keyword' ? KEYWORD_ORDER : SEMANTIC_ORDER;
  const grounded = results?.filter(result => result.status === 'supported').length ?? 0;
  const wired = connections.filter(Boolean).length;

  const cancelTest = () => {
    if (pending.current !== null) clearTimeout(pending.current);
    pending.current = null;
    completion.current = null;
    setPhase('idle');
    setResults(null);
  };
  useEffect(() => () => {
    if (pending.current !== null) clearTimeout(pending.current);
    completion.current = null;
  }, []);
  useEffect(() => {
    if (reduced && completion.current) {
      if (pending.current !== null) clearTimeout(pending.current);
      pending.current = null;
      const finish = completion.current;
      completion.current = null;
      finish();
    }
  }, [reduced]);
  useEffect(() => {
    if (phase === 'passed' && !notified.current && onSolved) {
      notified.current = true;
      onSolved('week7-evidence-retrieval');
    }
  }, [phase, onSolved]);

  // Re-measure the real ports during a short rack reorder: wires remain attached
  // to source identities, including at responsive sizes. No continuous idle RAF.
  useLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    let frame = 0;
    let disposed = false;
    const started = performance.now();
    const measure = () => {
      const bounds = el.getBoundingClientRect();
      const point = (port: HTMLElement): Point => {
        const rect = port.getBoundingClientRect();
        return { x: rect.left + rect.width / 2 - bounds.left, y: rect.top + rect.height / 2 - bounds.top };
      };
      const sources: Partial<Record<SourceId, Point>> = {};
      for (const source of SEARCH_SNIPPETS) {
        const port = sourcePorts.current[source.id];
        if (port) sources[source.id] = point(port);
      }
      const claims = claimPorts.current.map(port => port ? point(port) : { x: 0, y: 0 });
      setGeometry(previous => {
        const next = { width: bounds.width, height: bounds.height, sources, claims };
        return JSON.stringify(previous) === JSON.stringify(next) ? previous : next;
      });
    };
    setSorting(!reduced);
    const tick = () => {
      if (disposed) return;
      measure();
      if (!reduced && performance.now() - started < 460) frame = requestAnimationFrame(tick);
      else setSorting(false);
    };
    tick();
    const resize = new ResizeObserver(measure);
    resize.observe(el);
    return () => { disposed = true; cancelAnimationFrame(frame); resize.disconnect(); };
  }, [mode, reduced]);

  const connect = (claim: number, source: SourceId) => {
    cancelTest();
    setConnections(previous => previous.map((value, index) => index === claim ? source : value));
    setNotice(`Source ${source} connected to claim ${claim + 1}. Run the answer to test its support.`);
  };
  const connectSelected = (claim: number) => {
    if (selected) connect(claim, selected);
    else setNotice(`Select a source first, then connect it to claim ${claim + 1}.`);
  };
  const pointFromPointer = (event: PointerEvent): Point => {
    const rect = stage.current!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const startDrag = (event: PointerEvent<HTMLButtonElement>, source: SourceId) => {
    if (event.button !== 0 || !(event.target as HTMLElement).closest('.w7rg-source-port')) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { id: event.pointerId, source, x: event.clientX, y: event.clientY, moved: false };
    setSelected(source);
  };
  const moveDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const gesture = dragStart.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    if (Math.hypot(event.clientX - gesture.x, event.clientY - gesture.y) > 5) gesture.moved = true;
    if (gesture.moved) setDrag({ source: gesture.source, point: pointFromPointer(event) });
  };
  const endDrag = (event: PointerEvent<HTMLButtonElement>, cancelled = false) => {
    const gesture = dragStart.current;
    if (!gesture || gesture.id !== event.pointerId) return;
    dragStart.current = null;
    setDrag(null);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!gesture.moved) return;
    if (cancelled) return;
    suppressClickUntil.current = performance.now() + 80;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-w7rg-claim]');
    if (target && stage.current?.contains(target)) connect(Number(target.dataset.w7rgClaim), gesture.source);
    else setNotice('Wire released outside a socket. The existing connections are unchanged.');
  };
  const test = () => {
    if (sorting) return;
    cancelTest();
    const checked: Result[] = CLAIMS.map((claim, index) => ({ source: connections[index], status: !connections[index] ? 'missing' : connections[index] === claim.source ? 'supported' : 'unsupported' }));
    const finish = () => {
      pending.current = null;
      completion.current = null;
      setResults(checked);
      const count = checked.filter(result => result.status === 'supported').length;
      setPhase(count === 3 ? 'passed' : 'review');
      setNotice(count === 3 ? 'All three claims passed. The answer receipt cites source B twice and source C once.' : `Test complete: ${count} of 3 claims supported. Inspect the marked gates, change a wire, and run again.`);
    };
    setRun(value => value + 1);
    if (reduced) finish();
    else {
      setPhase('running');
      setNotice('Testing the selected evidence through all three claim gates…');
      completion.current = finish;
      pending.current = setTimeout(finish, 850);
    }
  };
  const reset = () => {
    cancelTest();
    setConnections([undefined, undefined, undefined]);
    setSelected(null);
    setDrag(null);
    dragStart.current = null;
    setNotice('Circuit cleared. Select a source, then a claim socket.');
  };

  return <section className="w7rg" data-case="retrieval" data-phase={phase} data-solved={phase === 'passed'} data-reduced={reduced} data-connected={wired} data-grounded={grounded} aria-labelledby={titleId}>
    <header className="w7rg-heading"><div><p className="w7rg-eyebrow">Case 03 / Evidence circuit</p><h3 id={titleId}>Make every claim connect.</h3></div><div className="w7rg-question"><span>THE QUESTION</span><p>{SEARCH_QUERY}</p></div><div className="w7rg-counter"><strong>{grounded}<span>/ 3</span></strong><span>{results ? 'claims supported' : 'claims verified · untested'}</span></div></header>
    <div className="w7rg-rack-bar"><div role="group" aria-label="Source rack ranking"><button type="button" aria-pressed={mode === 'keyword'} onClick={() => { if (mode !== 'keyword') { cancelTest(); setMode('keyword'); setNotice('Rack ordered by computed keyword cosine. Your source connections remain attached.'); } }}>Keyword cosine <small>computed</small></button><button type="button" aria-pressed={mode === 'semantic'} onClick={() => { if (mode !== 'semantic') { cancelTest(); setMode('semantic'); setNotice('Rack ordered by authored semantic relevance. This order is an illustration, not a model result.'); } }}>Semantic order <small>authored</small></button></div><span className="w7rg-rack-legend">SOURCE RACK <i aria-hidden="true">→</i> CLAIM GATES</span></div>
    <p id={hintId} className="w7rg-instruction">Click a source, then a claim. Or drag from a source’s round port. Use the same source more than once.</p>
    <div className="w7rg-stage" ref={stage} data-sequence-stage data-dragging={Boolean(drag)}>
      <div className="w7rg-channel-label" aria-hidden="true"><span>EVIDENCE</span><i>→</i><span>SUPPORT?</span></div>
      <svg className="w7rg-wires" viewBox={`0 0 ${geometry.width} ${geometry.height}`} aria-hidden="true">
        {connections.map((source, index) => {
          const a = source && geometry.sources[source], b = geometry.claims[index];
          if (!a || !b) return null;
          const path = wire(a, b, geometry.height * .51 + index * 4);
          const valid = source === CLAIMS[index].source;
          return <g key={`${index}:${source}`} data-wire-status={results?.[index].status ?? 'untested'}>
            <path className="w7rg-wire-under" d={path}/><path className="w7rg-wire" d={path}/>
            {phase === 'running' && !reduced && <g key={run} className={`w7rg-packet ${valid ? '' : 'is-rejected'}`}>
              <circle r="7" className="w7rg-packet-aura"/><circle r="3.5"/>
              <animateMotion dur=".8s" path={path} keyPoints={valid ? '0;1;1' : '0;.88;.88;0'} keyTimes={valid ? '0;.78;1' : '0;.52;.68;1'} calcMode="linear" fill="freeze"/>
            </g>}
          </g>;
        })}
        {drag && geometry.sources[drag.source] && <path className="w7rg-drag-wire" d={wire(geometry.sources[drag.source]!, drag.point)}/>}
      </svg>
      <div className="w7rg-sources" aria-label="Source documents">
        {SEARCH_SNIPPETS.map(source => {
          const rank = order.indexOf(source.id);
          const score = KEYWORD.find(item => item.id === source.id)!;
          return <button className="w7rg-source" type="button" key={source.id} style={{ '--source-rank': rank, top: `${rank * 25}%` } as CSSProperties} aria-pressed={selected === source.id} aria-describedby={hintId} onClick={() => { if (performance.now() < suppressClickUntil.current) return; setSelected(source.id); setNotice(`Source ${source.id} selected. Click any claim socket to connect it.`); }} onPointerDown={event => startDrag(event, source.id)} onPointerMove={moveDrag} onPointerUp={event => endDrag(event)} onPointerCancel={event => endDrag(event, true)}>
            <span className="w7rg-source-head"><b>{source.id}</b><strong>{source.title}</strong><small>#{rank + 1}</small></span>
            <span className="w7rg-source-text">{source.text}</span>
            <span className="w7rg-source-score">{mode === 'keyword' ? `cos ${score.score.toFixed(3)} · ${score.overlap.length ? score.overlap.join(', ') : 'no shared word'}` : source.relevance}</span>
            <span className="w7rg-source-port" ref={port => { sourcePorts.current[source.id] = port; }} aria-hidden="true"><i/></span>
          </button>;
        })}
      </div>
      <div className="w7rg-claims" aria-label="Answer claims">
        {CLAIMS.map((claim, index) => {
          const source = connections[index], result = results?.[index];
          return <div className="w7rg-gate" key={claim.title} data-gate-status={result?.status ?? (phase === 'running' ? 'testing' : 'untested')} data-w7rg-claim={index}>
            <button type="button" className="w7rg-socket" onClick={() => connectSelected(index)} aria-label={`Claim ${index + 1}: ${claim.title}. ${source ? `Connected to source ${source}.` : 'No source connected.'} ${selected ? `Connect selected source ${selected}.` : 'Select a source first.'}`}>
              <span className="w7rg-claim-port" ref={port => { claimPorts.current[index] = port; }} aria-hidden="true"><i>{source ?? '+'}</i></span>
              <span className="w7rg-gate-top"><span>CLAIM 0{index + 1}</span><b>{result ? result.status === 'supported' ? '✓ SUPPORTED' : result.status === 'missing' ? '○ MISSING' : '× NO SUPPORT' : phase === 'running' ? 'TESTING…' : source ? `SOURCE ${source}` : 'OPEN SOCKET'}</b></span>
              <strong>{claim.title}</strong>
              <span className="w7rg-gate-evidence">{result?.status === 'supported' ? `${result.source}: “${claim.quote}”` : result?.status === 'unsupported' ? `${result.source} describes ${sourceName(result.source!).toLowerCase()}, but does not support this claim.` : result?.status === 'missing' ? claim.missing : source ? 'Wire installed. Run the answer to check its support.' : 'A source must support this exact statement.'}</span>
            </button>
            {source && <button className="w7rg-unplug" type="button" onClick={() => { cancelTest(); setConnections(previous => previous.map((value, slot) => index === slot ? undefined : value)); setNotice(`Claim ${index + 1} disconnected.`); }} aria-label={`Disconnect source ${source} from claim ${index + 1}`}>×</button>}
          </div>;
        })}
      </div>
    </div>
    <div className="w7rg-control-rail"><div><span className="w7rg-selected-light" data-active={Boolean(selected)} aria-hidden="true"/><p>{selected ? <>Source <b>{selected}</b> ready to connect</> : 'Select a source to start'}<small>{wired} / 3 wires installed</small></p></div><button className="w7rg-reset" type="button" onClick={reset}>Clear wires</button><button className="w7rg-run" type="button" disabled={phase === 'running' || sorting} onClick={test}><span aria-hidden="true">{phase === 'running' ? '◌' : '↗'}</span>{phase === 'running' ? 'Testing the circuit' : results ? 'Run again' : 'Run the answer'}</button></div>
    <div className={`w7rg-output ${phase === 'passed' ? 'is-verified' : ''}`}>
      {phase === 'passed' ? <div className="w7rg-receipt" key={run}><span className="w7rg-eyebrow">ANSWER RECEIPT / ALL THREE GATES PASSED</span><p>Choose Forgot password <sup>[B]</sup>. Use the link sent to your registered email <sup>[B]</sup> within thirty minutes <sup>[C]</sup>.</p><strong className="w7rg-stamp">EVIDENCE<br/>VERIFIED</strong></div> : <div className="w7rg-output-note"><span className="w7rg-eyebrow">{phase === 'running' ? 'SIGNAL IN TRANSIT' : phase === 'review' ? 'CIRCUIT NEEDS ATTENTION' : 'RANK FINDS CANDIDATES. EVIDENCE SUPPORTS CLAIMS.'}</span><p>{notice}</p></div>}
    </div>
    <p className="w7rg-status" role="status" aria-live="polite" aria-atomic="true">{notice}</p>
    <footer className="w7rg-foot"><p><strong>Synthetic sources.</strong> Computed keyword cosine · authored semantic ranking · no embedding model.</p><details><summary>Method & limits</summary><p>Each lowercase word is a binary coordinate: present = 1, absent = 0. Cosine = shared unique words / √(query word count × document word count). No stemming, TF–IDF or synonym expansion. Equal scores use source ID order. The gate checks each selected document against the displayed claim’s supporting text; this is an authored support judgment, not an automated entailment model. Dense retrieval is not always better. Source A ranks highly because of shared vocabulary but supplies no recovery instructions.</p><p><strong>Stop list:</strong> {[...SEARCH_STOPWORDS].join(', ')}.</p></details></footer>
  </section>;
}
