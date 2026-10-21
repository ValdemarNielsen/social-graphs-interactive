import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type PointerEvent } from 'react';
import { ENTITY_DOCUMENTS, ENTITY_MENTIONS } from './weekSevenMath';
import { ALIAS_WIRE, INITIAL_IDENTITY_WIRES, MAX_IDENTITY_WIRES, identityWire, inspectIdentityWires, type IdentityWire } from './weekSevenEntityGameMath';
import './week-seven-entity-game.css';

type Props = { reduced: boolean; onSolved?: (id: string) => void };
type Phase = 'editing' | 'testing' | 'fault' | 'verified';
type Point = { x: number; y: number };
type Drag = { from: string; pointer: number; startX: number; startY: number; moved: boolean; capture: HTMLButtonElement };
const WIDTH = 840, HEIGHT = 360;
const placement: Record<string, Point & { side: number; source: string; shortKind: string }> = {
  'apple-brand': { x: 178, y: 76, side: 1, source: 'D1', shortKind: 'COMPANY' },
  'apple-inc': { x: 662, y: 76, side: -1, source: 'D5', shortKind: 'COMPANY NAME' },
  'jordan-person': { x: 178, y: 184, side: 1, source: 'D1', shortKind: 'PERSON' },
  'jordan-country': { x: 662, y: 184, side: -1, source: 'D3', shortKind: 'COUNTRY' },
  'apple-fruit': { x: 178, y: 292, side: 1, source: 'D2', shortKind: 'FRUIT CANDIDATE' },
  greece: { x: 662, y: 292, side: -1, source: 'D4', shortKind: 'COUNTRY' },
};
const mention = (id: string) => ENTITY_MENTIONS.find(item => item.id === id)!;
const wireName = (wire: IdentityWire) => `${mention(wire.left).label} (${placement[wire.left].shortKind.toLowerCase()}) ↔ ${mention(wire.right).label} (${placement[wire.right].shortKind.toLowerCase()})`;
const clamp = (value: number, limit: number) => Math.max(-limit, Math.min(limit, value));
function cable(a: Point, b: Point) {
  if (Math.abs(a.x - b.x) < 95) {
    const bend = a.x < WIDTH / 2 ? 142 : -142;
    return `M ${a.x} ${a.y} C ${a.x + bend} ${a.y}, ${b.x + bend} ${b.y}, ${b.x} ${b.y}`;
  }
  const dx = b.x - a.x;
  return `M ${a.x} ${a.y} C ${a.x + dx * .38} ${a.y + 23}, ${b.x - dx * .38} ${b.y + 23}, ${b.x} ${b.y}`;
}

export default function WeekSevenEntityGame({ reduced, onSolved }: Props) {
  const titleId = useId(), instructionsId = useId();
  const [wires, setWires] = useState<IdentityWire[]>(() => [...INITIAL_IDENTITY_WIRES]);
  const [phase, setPhase] = useState<Phase>('editing');
  const [selected, setSelected] = useState<string | null>(null);
  const [clue, setClue] = useState('D5');
  const [notice, setNotice] = useState('Two identity wires are wrong. Cut them, then connect the alias supported by D5.');
  const [draft, setDraft] = useState<{ from: string; point: Point } | null>(null);
  const [cutGhost, setCutGhost] = useState<{ id: string; path: string } | null>(null);
  const [compact, setCompact] = useState(false);
  const [testNumber, setTestNumber] = useState(0);
  const board = useRef<HTMLDivElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const drag = useRef<Drag | null>(null);
  const ignorePointerClick = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const busy = useRef(false);
  const notified = useRef(false);
  const inspection = useMemo(() => inspectIdentityWires(wires), [wires]);
  const locked = phase === 'testing' || phase === 'verified';
  const document = ENTITY_DOCUMENTS.find(item => item.id === clue)!;
  const cardWidth = compact ? 36 : 22;
  const socketOffset = WIDTH * cardWidth / 200;
  const faultMembers = new Set(inspection.faults.flatMap(wire => [wire.left, wire.right]));
  const points: Record<string, Point> = {};
  for (const item of ENTITY_MENTIONS) {
    const base = placement[item.id];
    const group = ENTITY_MENTIONS.filter(other => inspection.resolution[other.id] === inspection.resolution[item.id]);
    const center = { x: group.reduce((sum, other) => sum + placement[other.id].x, 0) / group.length, y: group.reduce((sum, other) => sum + placement[other.id].y, 0) / group.length };
    const pull = phase === 'testing' ? .085 : phase === 'fault' && faultMembers.has(item.id) ? -.07 : .035;
    points[item.id] = { x: base.x + clamp((center.x - base.x) * pull, 17), y: base.y + clamp((center.y - base.y) * pull, 13) };
    if (phase === 'verified' && (item.id === 'apple-brand' || item.id === 'apple-inc')) {
      points[item.id] = { x: item.id === 'apple-brand' ? compact ? 264 : 300 : compact ? 576 : 540, y: base.y };
    }
  }
  const socket = (id: string): Point => ({ x: points[id].x + placement[id].side * socketOffset, y: points[id].y });

  useEffect(() => {
    if (!board.current) return;
    const element = board.current;
    const measure = () => setCompact(element.clientWidth < 650);
    measure();
    const observer = new ResizeObserver(measure); observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => () => {
    if (timer.current !== null) clearTimeout(timer.current);
    if (drag.current) {
      try { drag.current.capture.releasePointerCapture(drag.current.pointer); } catch { /* Capture may have ended already. */ }
    }
    drag.current = null; busy.current = false;
  }, []);

  useEffect(() => { if (reduced) setCutGhost(null); }, [reduced]);

  const clearDrag = () => {
    const current = drag.current; drag.current = null; setDraft(null);
    if (current) { try { current.capture.releasePointerCapture(current.pointer); } catch { /* Pointer cancellation also releases capture. */ } }
  };
  const reset = () => {
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null; busy.current = false; clearDrag();
    setWires([...INITIAL_IDENTITY_WIRES]); setSelected(null); setPhase('editing'); setCutGhost(null);
    setNotice('Two identity wires are wrong. Cut them, then connect the alias supported by D5.');
  };
  const connect = (left: string, right: string) => {
    if (busy.current || phase === 'verified') return;
    if (left === right) { setSelected(null); setNotice('Endpoint released. Choose two different candidate cards to patch a wire.'); return; }
    const wire = identityWire(left, right);
    if (wires.some(item => item.id === wire.id)) { setSelected(null); setNotice('Those sockets are already connected. Click the wire or its Cut button to remove it.'); return; }
    if (wires.length >= MAX_IDENTITY_WIRES) { setSelected(null); setNotice('All four patch leads are in use. Cut a wire before adding another.'); return; }
    setWires([...wires, wire]); setSelected(null); setPhase('editing');
    setNotice(`Patched ${mention(left).label} to ${mention(right).label}. Run the test to check whether the documents support that identity.`);
  };
  const selectSocket = (id: string) => {
    if (busy.current || phase === 'verified') return;
    if (selected) connect(selected, id);
    else { setSelected(id); setClue(placement[id].source); setNotice(`${mention(id).label} selected. Choose a second socket to connect it, or press Escape to cancel.`); }
  };
  const cut = (wire: IdentityWire) => {
    if (busy.current || phase === 'verified') return;
    if (!reduced) setCutGhost({ id: wire.id, path: cable(socket(wire.left), socket(wire.right)) });
    setWires(previous => previous.filter(item => item.id !== wire.id)); setPhase('editing'); setSelected(null);
    setNotice(`Cut ${mention(wire.left).label} ↔ ${mention(wire.right).label}. The document-network counts have been rebuilt from the remaining identity wires.`);
  };
  const localPoint = (event: { clientX: number; clientY: number }): Point | null => {
    const element = svg.current, matrix = element?.getScreenCTM();
    if (!element || !matrix) return null;
    const point = element.createSVGPoint(); point.x = event.clientX; point.y = event.clientY;
    const local = point.matrixTransform(matrix.inverse()); return { x: local.x, y: local.y };
  };
  const startDrag = (event: PointerEvent<HTMLButtonElement>, id: string) => {
    if (locked || event.button !== 0) return;
    ignorePointerClick.current = false;
    drag.current = { from: id, pointer: event.pointerId, startX: event.clientX, startY: event.clientY, moved: false, capture: event.currentTarget };
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const moveDrag = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointer !== event.pointerId) return;
    if (Math.hypot(event.clientX - current.startX, event.clientY - current.startY) > 5) current.moved = true;
    if (!current.moved) return;
    const point = localPoint(event);
    if (point) { setSelected(current.from); setDraft({ from: current.from, point }); }
  };
  const endDrag = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointer !== event.pointerId) return;
    const point = localPoint(event), moved = current.moved;
    ignorePointerClick.current = moved;
    clearDrag();
    if (!moved) return;
    if (point) {
      // Hit distance is measured in screen pixels, so touch targets keep the
      // same useful radius when the board is narrow or stretched vertically.
      const bounds = svg.current!.getBoundingClientRect();
      const target = ENTITY_MENTIONS.filter(item => item.id !== current.from).find(item => {
        const endpoint = socket(item.id);
        return Math.hypot((point.x - endpoint.x) * bounds.width / WIDTH, (point.y - endpoint.y) * bounds.height / HEIGHT) < 30;
      });
      if (target) { connect(current.from, target.id); return; }
    }
    setSelected(null); setNotice('Wire released without a connection. Drag onto another socket, or click two sockets in turn.');
  };
  const finishTest = (result: ReturnType<typeof inspectIdentityWires>) => {
    timer.current = null; busy.current = false;
    if (result.solved) {
      setPhase('verified'); setNotice('Network repaired. D5 supports one company with two names. The reconstructed candidate network has 5 nodes, 6 edges and total edge weight 7.');
      if (!notified.current && onSolved) { notified.current = true; onSolved('week7-entity-resolution'); }
    } else {
      setPhase('fault');
      setNotice(result.faults.length
        ? `${result.faults.length} unsupported identity wire${result.faults.length === 1 ? '' : 's'}. ${result.faults[0].reason}${!result.hasAlias ? ' The D5 alias is also missing.' : ''}`
        : 'The false wires are gone. One repair remains: D5 explicitly names Apple and Apple Inc. as the same company. Connect their sockets.');
    }
  };
  const testNetwork = () => {
    if (busy.current || phase === 'verified') return;
    clearDrag(); setSelected(null); setCutGhost(null); busy.current = true;
    setTestNumber(previous => previous + 1); setPhase('testing');
    setNotice('Tracing identity wires against the five documents…');
    if (reduced) finishTest(inspection);
    else timer.current = setTimeout(() => finishTest(inspection), 700);
  };

  useEffect(() => {
    if (!reduced || phase !== 'testing' || !busy.current) return;
    if (timer.current !== null) clearTimeout(timer.current);
    timer.current = null;
    finishTest(inspection);
  }, [reduced, phase, inspection]);

  return <section className="w7-entity-game" data-phase={phase} data-reduced={reduced} data-repairs={inspection.repairs} data-wire-count={wires.length} data-solved={phase === 'verified'} aria-labelledby={titleId}
    onKeyDown={event => { if (event.key === 'Escape') { clearDrag(); setSelected(null); if (!locked) setNotice('Selection cancelled. The current wiring is unchanged.'); } }}>
    <header className="eg-heading"><div className="eg-case-number">02<span>REPAIR GAME</span></div><div><span className="eg-eyebrow">The evidence room / identity desk</span><h3 id={titleId}>Repair the identity network.</h3><p id={instructionsId}>Cut false wires. Connect the supported alias. Test what the documents can prove.</p></div><div className={`eg-score ${phase === 'verified' ? 'is-verified' : ''}`}><strong>{phase === 'verified' ? '✓' : `${inspection.repairs}/3`}</strong><span>{phase === 'verified' ? 'VERIFIED' : 'REPAIR OBJECTIVES'}</span></div></header>

    <div className="eg-workbench">
      <div ref={board} className="eg-board" style={{ '--eg-card-width': `${cardWidth}%` } as CSSProperties} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={() => { clearDrag(); setSelected(null); }}>
        <div className="eg-board-running"><span>IDENTITY PATCHBOARD</span><span>{phase === 'testing' ? 'SIGNAL TEST IN PROGRESS' : phase === 'verified' ? 'ONE COMPANY · TWO NAMES' : 'A wire means “the same identity”'}</span></div>
        <svg ref={svg} className="eg-wires" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none" role="group" aria-label="Identity wires. Activate a wire to cut it; the connection list provides the same controls.">
          <path className="eg-center-guide" d="M420 45V330" aria-hidden="true"/>
          {wires.map((wire, index) => {
            const path = cable(socket(wire.left), socket(wire.right));
            const motion = { d: `path("${path}")` } as CSSProperties;
            const invalid = wire.id !== ALIAS_WIRE.id;
            return <g className="eg-wire-group" key={wire.id} data-invalid={invalid}>
              <path d={path} style={motion} className="eg-wire-shadow" fill="none" aria-hidden="true"/>
              <path d={path} style={motion} className="eg-wire-ink" fill="none" pathLength="1" aria-hidden="true"/>
              <path d={path} style={motion} className="eg-wire-hit" fill="none" role="button" tabIndex={locked ? -1 : 0} aria-disabled={locked} aria-label={`Cut identity wire: ${wireName(wire)}`} onClick={() => cut(wire)} onKeyDown={event => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); cut(wire); } }}/>
              {phase === 'testing' && !reduced && <path key={`${testNumber}:${wire.id}`} d={path} style={{ ...motion, animationDelay: `${index * 50}ms` }} className="eg-wire-signal" fill="none" pathLength="1" aria-hidden="true"/>}
            </g>;
          })}
          {draft && <path className="eg-draft-wire" d={cable(socket(draft.from), draft.point)} fill="none" aria-hidden="true"/>}
          {cutGhost && <path className="eg-cut-ghost" key={cutGhost.id} d={cutGhost.path} pathLength="1" fill="none" onAnimationEnd={() => setCutGhost(null)} aria-hidden="true"/>}
        </svg>
        {ENTITY_MENTIONS.map((item, index) => {
          const node = placement[item.id], point = points[item.id];
          const connected = wires.some(wire => wire.left === item.id || wire.right === item.id);
          return <div key={item.id} className={`eg-candidate ${node.side === 1 ? 'is-left' : 'is-right'} ${connected ? 'is-connected' : ''} ${selected === item.id ? 'is-selected' : ''} ${phase === 'fault' && faultMembers.has(item.id) ? 'has-fault' : ''}`} data-entity-card={item.id} style={{ left: `${point.x / WIDTH * 100}%`, top: `${point.y / HEIGHT * 100}%` }}>
            <span className="eg-card-index">{String(index + 1).padStart(2, '0')}<span>{node.shortKind}</span></span><strong>{item.label}</strong>
            <button className="eg-card-clue" type="button" onClick={() => setClue(node.source)} aria-label={`Read ${node.source} context for ${item.label}`}>Read {node.source} <span aria-hidden="true">↗</span></button>
            <button className="eg-socket" data-entity-socket={item.id} type="button" disabled={locked} aria-pressed={selected === item.id} aria-describedby={instructionsId} aria-label={`Socket: ${item.label}, ${node.shortKind.toLowerCase()}`} onPointerDown={event => startDrag(event, item.id)} onLostPointerCapture={() => { if (drag.current?.from === item.id) clearDrag(); }} onClick={event => {
              if (event.detail > 0 && ignorePointerClick.current) { ignorePointerClick.current = false; return; }
              ignorePointerClick.current = false; selectSocket(item.id);
            }}><span aria-hidden="true"/></button>
          </div>;
        })}
        {phase === 'verified' && <div className="eg-merge-seal" aria-label="Alias verified"><span>ONE ID</span><strong>✓</strong></div>}
        <div className="eg-board-caption">{phase === 'verified' ? 'The alias pair is joined. Different referents remain separate.' : selected ? `${mention(selected).label} selected — choose another socket` : 'Drag socket → socket, or click two sockets. Click a wire to cut it.'}</div>
      </div>

      <aside className="eg-inspector" aria-label="Document clues and identity connections">
        <div className="eg-clue-file"><div className="eg-clue-tabs" role="group" aria-label="Read a document clue">{ENTITY_DOCUMENTS.map(doc => <button key={doc.id} type="button" aria-pressed={clue === doc.id} onClick={() => setClue(doc.id)}>{doc.id}</button>)}</div><div key={clue} className="eg-clue-paper"><span>SYNTHETIC DOCUMENT {document.id}</span><p>“{document.text}”</p></div></div>
        <div className="eg-connection-ledger"><div><span>PATCH LEADS</span><span>{wires.length} / {MAX_IDENTITY_WIRES} in use</span></div><ul aria-label="Identity connections">{wires.map(wire => <li key={wire.id}><button type="button" disabled={locked} data-invalid={phase === 'fault' && wire.id !== ALIAS_WIRE.id} onClick={() => cut(wire)} aria-label={`Cut ${wireName(wire)}`}><span>{mention(wire.left).label} <i aria-hidden="true">↔</i> {mention(wire.right).label}</span><span>{phase === 'verified' ? '✓' : 'Cut ×'}</span></button></li>)}</ul>{!wires.length && <p className="eg-empty-leads">No identity wires. Different forms remain separate.</p>}</div>
        <div className={`eg-feedback ${phase === 'fault' ? 'is-fault' : phase === 'verified' ? 'is-success' : ''}`} aria-live="polite" aria-atomic="true"><strong>{phase === 'testing' ? 'Tracing the record…' : phase === 'verified' ? 'Three repairs. One defensible network.' : phase === 'fault' ? 'The test found a fault.' : 'Your next move'}</strong><p>{notice}</p></div>
      </aside>
    </div>

    <div className="eg-action-bar"><ul className="eg-objectives" aria-label="Repair objectives">{['Separate company / fruit', 'Separate person / country', 'Join the documented alias'].map((label, index) => <li key={label} data-complete={inspection.objectives[index]}><span aria-hidden="true">{inspection.objectives[index] ? '✓' : String(index + 1)}</span>{label}<span className="eg-sr-only">{inspection.objectives[index] ? ': complete' : ': incomplete'}</span></li>)}</ul><div className="eg-run-controls"><button type="button" className="eg-reset" disabled={phase === 'testing'} onClick={reset}>{phase === 'verified' ? 'Play again' : 'Reset'}</button><button type="button" className="eg-run" disabled={locked} onClick={testNetwork}><span aria-hidden="true">{phase === 'verified' ? '✓' : '↯'}</span>{phase === 'testing' ? 'Testing…' : phase === 'verified' ? 'Network verified' : 'Test network'}</button></div></div>
    <div className="eg-network-tally"><span>REBUILT CANDIDATE CO-OCCURRENCE</span><span><strong>{inspection.graph.nodes.length}</strong> nodes</span><span><strong>{inspection.graph.edges.length}</strong> edges</span><span><strong>{inspection.graph.totalWeight}</strong> total weight</span><p>Identity wires above determine these counts; they are not co-occurrence edges.</p></div>
    <details className="eg-details"><summary>Inspect the counting rule, documents and current edge ledger <span aria-hidden="true">+</span></summary><div className="eg-details-grid"><div><p>All five documents are invented. Each distinct pair of resolved candidates contributes once per document; repeated aliases are deduplicated. Edge weights count documents, not personal interactions. The fruit is deliberately included as a candidate mention, not a named entity.</p><p>The three objectives do not excuse additional unsupported wires: verification requires exactly the documented Apple–Apple Inc. identity link. There is no time penalty.</p><ol>{ENTITY_DOCUMENTS.map(doc => <li key={doc.id}><strong>{doc.id}</strong> {doc.text}</li>)}</ol></div><ul>{inspection.graph.edges.map(edge => <li key={`${edge.a}:${edge.b}`}><strong>{mention(edge.a).label} — {mention(edge.b).label}: {edge.count}</strong><span> {edge.documents.join(' · ')}</span></li>)}</ul></div></details>
  </section>;
}
