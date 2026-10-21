import { useCallback, useId, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { useVisibleSequence } from './useVisibleSequence';
import { atlasDocuments, atlasPoint, nearestDocument } from './measurementAtlas';
import './week-seven-cover.css';

type MotionProps = { reduced: boolean };
const specimens = [
  { name: 'The loan', lines: ['The bank', 'approved', 'my loan.'], sentence: 'The bank approved my loan.', context: 'finance', tone: 'not stated', check: 'An event is not a feeling.', explanation: '“Loan” supports a financial reading of “bank”. Approval describes an event; the writer has not explicitly stated how they feel.' },
  { name: 'The river', lines: ['The bank', 'was covered', 'in wildflowers.'], sentence: 'The bank was covered in wildflowers.', context: 'landscape', tone: 'not stated', check: 'Read the surrounding words.', explanation: 'The surrounding words support a riverbank interpretation. A subject matter label and a sentiment label answer different questions.' },
  { name: 'The complaint', lines: ['Great. Another', 'fee from', 'the bank.'], sentence: 'Great. Another fee from the bank.', context: 'finance', tone: 'likely ironic', check: 'Literal praise can mislead.', explanation: '“Great” looks positive in isolation. “Another fee” makes an ironic complaint plausible. A human-labelled sample is needed to validate that interpretation.' },
] as const;

function Playback({ reduced, paused, togglePause, restart, label }: MotionProps & { paused: boolean; togglePause: () => void; restart: () => void; label: string }) {
  return <div className="w7i-playback">
    <span><i aria-hidden="true"/>{reduced ? 'Still view · motion reduced' : label}</span>
    {!reduced && <div><button type="button" onClick={togglePause} aria-pressed={paused}>{paused ? 'Resume' : 'Pause'}</button><button type="button" onClick={restart}>Run again <span aria-hidden="true">↻</span></button></div>}
  </div>;
}

function ReadingSlip({ index, title, value, detail, reduced }: { index: number; title: string; value: string; detail: string; reduced: boolean }) {
  const y = 80 + index * 130;
  const receipt = 'M616 0H900V103' + Array.from({ length: 28 }, (_, i) => `L${890 - i * 10} ${i % 2 ? 103 : 98}`).join('') + 'L616 101Z';
  return <g className="w7i-reading-slip" transform={`translate(0 ${y})`} opacity={reduced ? 1 : .15}>
    <path className="w7i-slip-shadow" d={receipt} transform="translate(7 5)"/>
    <path className="w7i-slip-paper" d={receipt}/>
    <text className="w7i-slip-index" x="636" y="24">0{index + 1} / {title}</text>
    <text className={`w7i-slip-value ${index === 2 ? 'w7i-slip-verdict' : ''}`} x="636" y="61">{value}</text>
    <text className="w7i-slip-detail" x="636" y="85">{detail}</text>
  </g>;
}

function InspectionPress({ specimen, reduced }: MotionProps & { specimen: number }) {
  const item = specimens[specimen], id = useId().replace(/:/g, '');
  return <svg className="w7i-press" viewBox="0 0 960 560" role="img" aria-labelledby={`${id}-press-title ${id}-press-description`}>
    <title id={`${id}-press-title`}>A paper instrument reads the same sentence in three ways.</title>
    <desc id={`${id}-press-description`}>{item.sentence} Suggested context: {item.context}. Tone: {item.tone}. {item.check} These are illustrated annotations, not live model predictions.</desc>
    <defs>
      <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f2f0e5"/><stop offset=".45" stopColor="#b8c0b2"/><stop offset=".52" stopColor="#e5e6d8"/><stop offset="1" stopColor="#919e91"/></linearGradient>
      <pattern id={`${id}-hatch`} width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(28)"><path d="M0 0V7" stroke="#24332f" strokeWidth="1" opacity=".17"/></pattern>
      <clipPath id={`${id}-feed-clip`}><path d="M10 85H477V440H10Z"/></clipPath>
    </defs>
    <path className="w7i-desk-line" d="M20 483H928"/>
    <ellipse className="w7i-ground-shadow" cx="482" cy="482" rx="342" ry="13"/>
    <text className="w7i-machine-annotation" x="30" y="73">ONE SENTENCE IN</text>
    <path className="w7i-leader" d="M178 69h30v41"/>
    <g clipPath={`url(#${id}-feed-clip)`}>
      <g className="w7i-feed-sheet" transform={reduced ? 'translate(50 3)' : 'translate(0 0)'}>
        <path className="w7i-feed-shadow" d="m46 145 270-22 19 290-270 22Z"/>
        <path className="w7i-feed-paper" d="m35 135 270-22 19 290-270 22Z"/>
        <g transform="rotate(-4.65 180 270)">
          <text className="w7i-page-label" x="72" y="162">SPECIMEN / 0{specimen + 1}</text>
          <path className="w7i-page-rule" d="M72 177H276"/>
          {item.lines.map((line, i) => <text key={line} className="w7i-source-line" x="72" y={226 + i * 43}>{line}</text>)}
          <path className="w7i-page-rule" d="M72 346H276 M72 355H246"/>
          <text className="w7i-page-foot" x="72" y="384">READ IN CONTEXT</text>
        </g>
      </g>
    </g>
    <path className="w7i-feed-table" d="M225 393 377 377 396 395 252 421Z"/>
    <path className="w7i-machine-side" d="m349 163 45-28h177l35 31v263l-35 35H394l-45-29Z"/>
    <path className="w7i-machine-body" d="M330 178q0-22 22-22h198q25 0 25 25v254q0 23-23 23H352q-22 0-22-22Z"/>
    <path d="M341 179h224v256H341Z" fill={`url(#${id}-hatch)`}/>
    <path className="w7i-machine-top" d="m330 178 31-32h199l15 32Z"/>
    <path className="w7i-machine-foot" d="m352 458-13 25h69l-6-25M509 458l-6 25h69l-13-25"/>
    <rect className="w7i-feed-mouth" x="313" y="216" width="31" height="160" rx="12"/>
    <rect className="w7i-exit-mouth" x="566" y="211" width="30" height="165" rx="10"/>
    {[0, 1].map(i => <g key={i} transform={`translate(${i ? 574 : 328} 290)`}>
      <rect className="w7i-roller-shell" x="-12" y="-77" width="24" height="154" rx="11" fill={`url(#${id}-metal)`}/>
      <g className="w7i-roller-ink">{Array.from({ length: 9 }, (_, n) => <path key={n} d={`M-9 ${-63 + n * 15}H9`}/>)}</g>
      <circle className="w7i-roller-screw" cy="-67" r="3"/><circle className="w7i-roller-screw" cy="67" r="3"/>
    </g>)}
    <circle className="w7i-lens-shadow" cx="454" cy="291" r="101"/>
    <circle className="w7i-lens-rim" cx="450" cy="280" r="102" fill={`url(#${id}-metal)`}/>
    <circle className="w7i-lens-inner" cx="450" cy="280" r="86"/>
    <circle className="w7i-lens-rule" cx="450" cy="280" r="72"/>
    <g className="w7i-aperture" transform="rotate(0 450 280)">
      {Array.from({ length: 12 }, (_, i) => <path key={i} d="M450 186v10" transform={`rotate(${i * 30} 450 280)`}/>)}
      <path className="w7i-aperture-arrow" d="m450 199-5 12h10Z"/>
    </g>
    <path className="w7i-lens-crosshair" d="M378 280h16 M506 280h16 M450 208v16 M450 336v16"/>
    <text className="w7i-lens-word" x="450" y="292" textAnchor="middle">bank</text>
    <text className="w7i-lens-caption" x="450" y="320" textAnchor="middle">CONTEXT REQUIRED</text>
    <path className="w7i-lens-scan" d="M397 252H503"/>
    <g className="w7i-handwheel" transform="rotate(0 448 414)"><circle cx="448" cy="414" r="23"/><path d="M448 392v44 M426 414h44"/><circle className="w7i-wheel-knob" cx="448" cy="395" r="5"/></g>
    <text className="w7i-machine-number" x="365" y="427">07</text><text className="w7i-machine-small" x="502" y="426">READ</text>
    <g className="w7i-result-lines" fill="none"><path d="M596 235c34 0 14-103 45-103"/><path d="M596 284h45"/><path d="M596 330c34 0 14 79 45 79"/></g>
    <ReadingSlip index={0} title="CONTEXT" value={item.context} detail="What might these words concern?" reduced={reduced}/>
    <ReadingSlip index={1} title="TONE" value={item.tone} detail="What attitude is actually expressed?" reduced={reduced}/>
    <ReadingSlip index={2} title="VALIDATION" value="inspect the evidence" detail={item.check} reduced={reduced}/>
    <g className="w7i-provisional-stamp" opacity={reduced ? 1 : 0} transform="rotate(-6 724 492)"><rect x="608" y="472" width="236" height="39"/><text x="726" y="498" textAnchor="middle">READINGS ≠ GROUND TRUTH</text></g>
    <text className="w7i-machine-annotation" x="32" y="526">ILLUSTRATED READINGS · NO MODEL IS RUN HERE</text>
  </svg>;
}

export default function WeekSevenCover({ reduced }: MotionProps) {
  const root = useRef<HTMLElement>(null);
  const [specimen, setSpecimen] = useState(0);
  const build = useCallback((element: HTMLElement) => {
    const q = (selector: string) => element.querySelectorAll(selector);
    const timeline = gsap.timeline({ paused: true });
    timeline.fromTo(q('.w7i-feed-sheet'), { attr: { transform: 'translate(0 0)' } }, { attr: { transform: 'translate(50 3)' }, duration: 1.6, ease: 'power1.out' }, 0)
      .fromTo(q('.w7i-aperture'), { attr: { transform: 'rotate(0 450 280)' } }, { attr: { transform: 'rotate(210 450 280)' }, duration: 2.4, ease: 'power1.inOut' }, 0)
      .fromTo(q('.w7i-handwheel'), { attr: { transform: 'rotate(0 448 414)' } }, { attr: { transform: 'rotate(285 448 414)' }, duration: 2.4, ease: 'none' }, 0)
      .fromTo(q('.w7i-roller-ink'), { y: -6 }, { y: 6, duration: .3, repeat: 7, ease: 'none' }, 0)
      .fromTo(q('.w7i-lens-scan'), { attr: { d: 'M397 252H503' }, opacity: .9 }, { attr: { d: 'M397 308H503' }, opacity: 0, duration: 1.3, ease: 'power1.out' }, 0)
      .fromTo(q('.w7i-reading-slip'), { x: -50, opacity: .15 }, { x: 0, opacity: 1, duration: .7, stagger: .22, ease: 'power2.out' }, .18)
      .fromTo(q('.w7i-provisional-stamp'), { opacity: 0, scale: 1.1, transformOrigin: 'center' }, { opacity: 1, scale: 1, duration: .25, ease: 'power2.out' }, 1.5);
    return gsap.timeline({ paused: true }).add(timeline.paused(false).timeScale(timeline.duration() / 4.6));
  }, [specimen]);
  const playback = useVisibleSequence({ root, reduced, build });
  return <section ref={root} className="w7i-cover" aria-labelledby="w7i-opening-title">
    <div className="w7i-cover-copy"><p className="w7i-kicker">Week 07 <span/> From meaning to measurement</p>
      <h1 id="w7i-opening-title">Don’t take<br/> a model<br/><em>at its word.</em></h1>
      <p className="w7i-cover-deck">Turn language into measurements.<br/>Then ask what those measurements miss.</p>
      <button type="button" className="w7i-enter" onClick={() => document.getElementById('w7-sentiment')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' })}>Play the minigames <span aria-hidden="true">↘</span></button>
      <p className="w7i-edition">THE EVIDENCE ROOM <span>NO. 007</span></p>
    </div>
    <div className="w7i-cover-instrument">
      <Playback {...playback} reduced={reduced} label="An instrument, not an oracle"/>
      <div data-sequence-stage="" className="w7i-press-stage"><InspectionPress specimen={specimen} reduced={reduced}/></div>
      <div className="w7i-specimens" aria-label="Choose a text specimen"><span>Feed a specimen</span>{specimens.map((item, i) => <button type="button" key={item.name} aria-pressed={specimen === i} onClick={() => setSpecimen(i)}><small>0{i + 1}</small>{item.name}</button>)}</div>
      <p className="w7i-specimen-reading" aria-live="polite"><strong>{specimens[specimen].sentence}</strong> {specimens[specimen].explanation}</p>
    </div>
  </section>;
}

export function MeasurementAtlas({ reduced }: MotionProps) {
  const root = useRef<HTMLElement>(null), title = useId();
  const [selected, setSelected] = useState(0), [vertical, setVertical] = useState<1 | 2>(1);
  const truth = useMemo(() => nearestDocument(selected, [0, 1, 2]), [selected]);
  const projected = useMemo(() => nearestDocument(selected, [0, vertical]), [selected, vertical]);
  const sameNeighbor = truth.id === projected.id;
  const build = useCallback((element: HTMLElement) => {
    const timeline = gsap.timeline({ paused: true });
    const ghosts = element.querySelectorAll<SVGGElement>('.w7i-atlas-ghost');
    ghosts.forEach((ghost, i) => {
      const start = atlasPoint(atlasDocuments[i], vertical === 1 ? 2 : 1), end = atlasPoint(atlasDocuments[i], vertical);
      timeline.fromTo(ghost, { attr: { transform: `translate(${start.x} ${start.y})` }, opacity: .4 }, { attr: { transform: `translate(${end.x} ${end.y})` }, opacity: 0, duration: 1.25, ease: 'power2.out' }, 0);
    });
    timeline.fromTo(element.querySelectorAll('.w7i-atlas-edge'), { attr: { 'stroke-dashoffset': 1 } }, { attr: { 'stroke-dashoffset': 0 }, duration: 1.4, ease: 'power1.out' }, 0)
      .fromTo(element.querySelectorAll('.w7i-atlas-selection'), { attr: { r: 27 }, opacity: .2 }, { attr: { r: 20 }, opacity: 1, duration: 1, ease: 'power2.out' }, 0)
      .to({ hold: 0 }, { hold: 1, duration: .6 }, 1.4);
    return gsap.timeline({ paused: true }).add(timeline.paused(false).timeScale(timeline.duration() / 4.2));
  }, [selected, vertical]);
  const playback = useVisibleSequence({ root, reduced, build });
  const active = atlasDocuments[selected], origin = atlasPoint(active, vertical), truePoint = atlasPoint(atlasDocuments[truth.index], vertical), chartPoint = atlasPoint(atlasDocuments[projected.index], vertical);
  return <section className="w7i-atlas" ref={root} aria-labelledby={title}>
    <header className="w7i-atlas-heading"><div><p className="w7i-kicker">Instrument 01 / The missing dimension</p><h2 id={title}>Close on the page.<br/><em>Close in meaning?</em></h2></div><p>A map discards information. Inspect what happens when a third coordinate disappears.</p></header>
    <Playback {...playback} reduced={reduced} label="Six synthetic vectors · exact distances"/>
    <div className="w7i-atlas-layout">
      <div className="w7i-atlas-plot">
        <div className="w7i-atlas-view" aria-label="Displayed coordinates"><button type="button" aria-pressed={vertical === 1} onClick={() => setVertical(1)}>Features 1 + 2 <span>hide 3</span></button><button type="button" aria-pressed={vertical === 2} onClick={() => setVertical(2)}>Features 1 + 3 <span>hide 2</span></button></div>
        <div data-sequence-stage="" className="w7i-atlas-stage"><svg viewBox="0 0 600 405" role="img" aria-label={`Synthetic coordinate projection. Document ${active.id} is selected. Closest in this projection: ${projected.id}. Closest using all three features: ${truth.id}.`}>
          <text x="37" y="27" className="w7i-atlas-axis-title">FEATURE {vertical + 1}</text>
          {[0, 1, 2, 3, 4].map(n => <g key={n} className="w7i-atlas-grid"><path d={`M${84 + n * 95} 45V338`}/><text x={84 + n * 95} y="365" textAnchor="middle">{n}</text></g>)}
          {[0, 1, 2, 3].map(n => <g key={n} className="w7i-atlas-grid"><path d={`M84 ${338 - n * 95}H503`}/><text x="64" y={344 - n * 95} textAnchor="end">{n}</text></g>)}
          <path className="w7i-atlas-axis" d="M84 45V338H503"/><text x="504" y="394" textAnchor="end" className="w7i-atlas-axis-title">FEATURE 1</text>
          {!reduced && atlasDocuments.map((document, i) => { const p = atlasPoint(document, vertical === 1 ? 2 : 1); return <g key={document.id} className="w7i-atlas-ghost" transform={`translate(${p.x} ${p.y})`} opacity=".4"><circle r="11"/><text y="-19" textAnchor="middle">{i === selected ? 'other view' : ''}</text></g>; })}
          <path className="w7i-atlas-edge w7i-atlas-true-edge" d={`M${origin.x} ${origin.y}L${truePoint.x} ${truePoint.y}`} pathLength="1" strokeDasharray="1" strokeDashoffset={reduced ? 0 : 1}/>
          {!sameNeighbor && <path className="w7i-atlas-edge w7i-atlas-chart-edge" d={`M${origin.x} ${origin.y}L${chartPoint.x} ${chartPoint.y}`} pathLength="1" strokeDasharray="1" strokeDashoffset={reduced ? 0 : 1}/>}
          {atlasDocuments.map((document, i) => { const p = atlasPoint(document, vertical); return <g key={document.id} className={`w7i-atlas-node ${i === selected ? 'is-selected' : ''} ${document.id === truth.id ? 'is-true-neighbor' : ''}`} transform={`translate(${p.x} ${p.y})`}>
            {i === selected && <circle className="w7i-atlas-selection" r="20"/>}<circle className="w7i-atlas-node-dot" r="9"/><text x={i === 2 || i === 5 ? 16 : -16} y={i === 2 || i === 5 ? -17 : 22} textAnchor={i === 2 || i === 5 ? 'start' : 'end'}>{document.id}</text>
          </g>; })}
        </svg></div>
        <div className="w7i-atlas-select"><span>Inspect document</span>{atlasDocuments.map((document, i) => <button type="button" key={document.id} aria-pressed={selected === i} onClick={() => setSelected(i)} aria-label={`Inspect document ${document.id}`}>{document.id}</button>)}</div>
      </div>
      <div className="w7i-atlas-evidence" aria-live="polite">
        <p className="w7i-kicker">Document {active.id} <span/> [{active.vector.join(', ')}]</p>
        <div className="w7i-neighbor-reading"><span>Nearest in this drawing</span><strong>{projected.id}<small>d = {projected.distance.toFixed(3)}</small></strong></div>
        <div className="w7i-neighbor-reading w7i-neighbor-truth"><span>Nearest in all 3 features</span><strong>{truth.id}<small>d = {truth.distance.toFixed(3)}</small></strong></div>
        <p className={`w7i-atlas-verdict ${sameNeighbor ? 'is-agreement' : ''}`}><b>{sameNeighbor ? 'This neighbor survives.' : 'The nearest neighbor changes.'}</b> {sameNeighbor ? 'Agreement for one document does not prove that every relationship is preserved.' : `The drawing hides feature ${vertical === 1 ? 3 : 2}. A small visible gap can conceal a large difference.`}</p>
        <p className="w7i-atlas-distance-note">Euclidean distance, equal axis units. The cobalt line identifies the nearest neighbor in the full vector; vermilion marks a different projected neighbor.</p>
      </div>
    </div>
    <footer className="w7i-atlas-foot"><p><strong>Read this as a counterexample.</strong> These are six invented feature vectors, not language embeddings. The view selects two coordinates; it does not run PCA or t-SNE. Real corpus maps also need inspection in the original representation.</p><details><summary>Inspect all six vectors <span>+</span></summary><table><caption>Synthetic coordinates used for every distance</caption><thead><tr><th>Document</th><th>Feature 1</th><th>Feature 2</th><th>Feature 3</th></tr></thead><tbody>{atlasDocuments.map(document => <tr key={document.id}><th scope="row">{document.id}</th>{document.vector.map((value, i) => <td key={i}>{value}</td>)}</tr>)}</tbody></table></details></footer>
  </section>;
}
