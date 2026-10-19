import { useCallback, useId, useRef } from 'react';
import gsap from 'gsap';
import { tokenize } from './math';
import { useVisibleSequence } from './useVisibleSequence';
import './language-choreography.css';

type Props = { week: 4 | 5 | 6; reduced: boolean; variant: 'middle' | 'closing' };
type SceneName = 'map' | 'loom' | 'press' | 'wall' | 'lens' | 'book';

const studies = {
  map: { title: 'Fold the territory. Keep the evidence.', intro: 'A partition changes how we see a network. The relationships underneath deserve another look.', phases: ['A compact view', 'Unfold the territory', 'Question the border'], note: 'A paper-folding metaphor for community partitions. The invented map does not encode geographic observations, a calculated partition, or a modularity score.', source: 'https://tympanus.net/codrops/2022/12/13/how-to-code-an-on-scroll-folding-3d-cardboard-box-animation-with-three-js-and-gsap/', sourceTitle: 'Codrops · folding a three-dimensional paper form' },
  loom: { title: 'Belonging is woven from connections.', intro: 'Follow the strands as separate connections become an interdependent fabric.', phases: ['Separate strands', 'Pass the shuttle', 'Read the fabric'], note: 'An original weaving metaphor. Over-and-under crossings are a visual construction, not measurements of overlap, communities, or tie strength.', source: 'https://tympanus.net/codrops/2026/09/05/building-an-infinite-loom-unravelling-images-into-threads-with-three-js/', sourceTitle: 'Codrops · Unwoven, an infinite loom' },
  press: { title: 'Language leaves an impression.', intro: 'Set the type. Lower the press. See a sentence become a sequence of tokens.', phases: ['Set the type', 'Make an impression', 'Read the token strip'], note: 'The machine is illustrative. Its output is the exact lowercase tokenizer result for “Words become data.”: words, become, data. Punctuation is removed; stopwords are retained.', source: 'https://tympanus.net/codrops/2021/09/29/kinetic-typography-page-transition/', sourceTitle: 'Codrops · kinetic typography as a transition' },
  wall: { title: 'Break the surface. Find the structure.', intro: 'Letters can fracture and reassemble. A readable surface still depends on arrangement.', phases: ['Fragments in motion', 'Find the alignment', 'Read between lines'], note: 'An editorial typography study. The slices are decorative units, not language tokens, characters counted by an algorithm, or a syntactic analysis.', source: 'https://tympanus.net/codrops/2023/12/05/on-scroll-sliced-text-animation/', sourceTitle: 'Codrops · on-scroll sliced text' },
  lens: { title: 'The word stays. The view changes.', intro: 'Shift the context around “bank”. One spelling can point toward different meanings.', phases: ['Beside the river', 'Turn the context', 'Inside finance'], note: 'A lenticular visual analogy using two hand-authored contexts. Slat angles do not represent embedding coordinates, similarity scores, or a physical lens simulation.', source: 'https://text-effects.colorion.co/effects/holographic-card-text-effect/', sourceTitle: 'Colorion · a lenticular-inspired typography study' },
  book: { title: 'Open a corpus, layer by layer.', intro: 'A collection of documents becomes a collection of representations. Keep the source pages within reach.', phases: ['A closed collection', 'Open the document fan', 'Inspect the representation'], note: 'An original book-and-scanner metaphor. The five pages and feature marks are invented illustrations; the marks are not calculated TF-IDF weights. The numerical laboratory provides the actual calculation.', source: 'https://tympanus.net/codrops/2026/01/12/obys-design-books-turning-a-reading-list-into-a-tactile-web-library/', sourceTitle: 'Obys on Codrops · a tactile web library' },
} satisfies Record<SceneName, { title: string; intro: string; phases: string[]; note: string; source: string; sourceTitle: string }>;

/** All motion and artwork below are original. The linked studies inform material
 * behavior and sequencing; no demo code, textures, images, or fonts are copied. */
function buildSequence(root: HTMLElement, name: SceneName) {
  const q = (selector: string) => root.querySelectorAll(selector);
  const timeline = gsap.timeline({ paused: true, defaults: { ease: 'power3.inOut' } });
  if (name === 'map') {
    gsap.set(q('.lc-map-rig'), { rotationX: 35, rotationZ: -6, x: 180, y: -10, scale: .9 });
    // Nested hinges need double alternating angles after the first fold.
    // This keeps the panels in a concertina instead of accumulating depth.
    gsap.set(q('.lc-map-hinge'), { rotationY: i => i === 0 ? 78 : i % 2 ? -156 : 156, transformOrigin: '0% 50%' });
    gsap.set(q('.lc-map-border'), { strokeDasharray: '1 1', strokeDashoffset: 1 });
    gsap.set(q('.lc-map-pin'), { scale: .25, opacity: 0, transformOrigin: '50% 100%' });
    gsap.set(q('.lc-map-annotation'), { y: 25, opacity: 0 });
    timeline.to(q('.lc-map-hinge'), { rotationY: 0, duration: 2.4 }, .15)
      .to(q('.lc-map-rig'), { x: 0, y: 0, scale: 1, rotationX: 14, rotationZ: -3, duration: 2.5 }, .2)
      .to(q('.lc-map-border'), { strokeDashoffset: 0, duration: 1.3, stagger: .04 }, 2.4)
      .to(q('.lc-map-pin'), { scale: 1, opacity: 1, duration: .65, stagger: .12, ease: 'back.out(1.6)' }, 2.9)
      .to(q('.lc-map-rig'), { rotationX: 6, rotationZ: 2, duration: 1 }, 3.8)
      .to(q('.lc-map-annotation'), { y: 0, opacity: 1, duration: .7, stagger: .1 }, 3.9);
  } else if (name === 'loom') {
    gsap.set(q('.lc-warp'), { scaleY: .77, x: i => (i - 9.5) * 4, opacity: .6, transformOrigin: '50% 0%' });
    gsap.set(q('.lc-weft'), { scaleX: 0, transformOrigin: '0% 50%' });
    gsap.set(q('.lc-loom-shuttle'), { x: -310, y: -70 });
    gsap.set(q('.lc-tapestry-label'), { opacity: 0, y: 20 });
    timeline.to(q('.lc-warp'), { x: 0, scaleY: 1, opacity: 1, duration: 1.2, stagger: .02 }, .15)
      .to(q('.lc-weft'), { scaleX: 1, duration: .8, stagger: .105, ease: 'power2.inOut' }, .8)
      .to(q('.lc-loom-shuttle'), { x: 340, y: -10, rotation: 8, duration: 1 }, .75)
      .to(q('.lc-loom-shuttle'), { x: -320, y: 80, rotation: -8, duration: 1 }, 1.75)
      .to(q('.lc-loom-shuttle'), { x: 320, y: 150, rotation: 6, duration: 1 }, 2.75)
      .to(q('.lc-loom-shuttle'), { x: 420, opacity: 0, duration: .6 }, 3.75)
      .to(q('.lc-tapestry'), { rotation: -3, y: -12, scale: 1.035, transformOrigin: '50% 50%', duration: 1.1 }, 3.6)
      .to(q('.lc-tapestry-label'), { opacity: 1, y: 0, duration: .8 }, 3.9);
  } else if (name === 'press') {
    gsap.set(q('.lc-metal-type'), { y: i => -100 - i * 27, rotation: i => [12, -9, 7][i], opacity: .2, transformOrigin: '50% 50%' });
    gsap.set(q('.lc-press-head'), { y: -45 });
    gsap.set(q('.lc-print-ink'), { opacity: 0 });
    gsap.set(q('.lc-paper-window'), { attr: { width: 100 } });
    gsap.set(q('.lc-printed-sheet'), { x: -70 });
    gsap.set(q('.lc-token-result'), { y: 35, opacity: 0 });
    timeline.to(q('.lc-metal-type'), { y: 0, rotation: 0, opacity: 1, duration: 1.1, stagger: .16, ease: 'back.out(1.1)' }, .1)
      .to(q('.lc-roller-spokes'), { rotation: 245, transformOrigin: '50% 50%', duration: 3.7, ease: 'none' }, .5)
      .to(q('.lc-paper-window'), { attr: { width: 790 }, duration: 2.1, ease: 'power1.inOut' }, .7)
      .to(q('.lc-press-head'), { y: 98, duration: .65, ease: 'power2.in' }, 1.6)
      .to(q('.lc-metal-type'), { y: 95, duration: .65, ease: 'power2.in' }, 1.6)
      .to(q('.lc-print-ink'), { opacity: 1, duration: .12 }, 2.25)
      .to(q('.lc-press-head'), { y: -45, duration: .7 }, 2.65)
      .to(q('.lc-metal-type'), { y: 0, duration: .7 }, 2.65)
      .to(q('.lc-printed-sheet'), { x: 45, duration: 1.2 }, 3.1)
      .to(q('.lc-token-result'), { y: 0, opacity: 1, duration: .75, stagger: .13 }, 3.7);
  } else if (name === 'wall') {
    gsap.set(q('.lc-type-slice'), { y: i => (i % 2 ? 1 : -1) * (90 + (i % 6) * 24), x: i => ((i % 12) - 5.5) * 10, rotation: i => i % 2 ? 8 : -8, opacity: .7, transformOrigin: '50% 50%' });
    gsap.set(q('.lc-wall-rig'), { rotationX: 15, rotationY: -10, rotationZ: -3 });
    gsap.set(q('.lc-wall-rule'), { scaleX: 0, transformOrigin: '0% 50%' });
    timeline.to(q('.lc-type-slice'), { y: 0, x: 0, rotation: 0, opacity: 1, duration: 1.8, stagger: { each: .027, from: 'center' } }, .1)
      .to(q('.lc-wall-rig'), { rotationX: -8, rotationY: 5, rotationZ: 2, duration: 2 }, .5)
      .to(q('.lc-wall-row-0'), { x: -30, duration: 1 }, 2.55)
      .to(q('.lc-wall-row-2'), { x: 30, duration: 1 }, 2.55)
      .to(q('.lc-wall-rig'), { rotationX: 0, rotationY: 0, rotationZ: 0, duration: 1.1 }, 3.25)
      .to(q('.lc-wall-rule'), { scaleX: 1, duration: .8, stagger: .1 }, 3.65);
  } else if (name === 'lens') {
    gsap.set(q('.lc-lens-rig'), { rotationY: -9, rotationX: 4, rotationZ: -1 });
    gsap.set(q('.lc-lens-slat'), { rotationY: 0, transformOrigin: '50% 50%' });
    gsap.set(q('.lc-lens-shine'), { xPercent: -130, opacity: 0 });
    gsap.set(q('.lc-finance-label'), { opacity: 0, y: 12 });
    timeline.to(q('.lc-lens-rig'), { rotationY: 9, rotationX: -2, duration: 2 }, .05)
      .to(q('.lc-lens-slat'), { rotationY: 180, duration: 2.1, stagger: .055, ease: 'power2.inOut' }, .15)
      .to(q('.lc-river-label'), { opacity: 0, y: -8, duration: .5 }, 1.1)
      .to(q('.lc-lens-shine'), { xPercent: 130, opacity: .35, duration: 2.8, ease: 'none' }, .45)
      .to(q('.lc-lens-shine'), { opacity: 0, duration: .5 }, 3)
      .to(q('.lc-finance-label'), { opacity: 1, y: 0, duration: .7 }, 2.55)
      .to(q('.lc-lens-rig'), { rotationY: 0, rotationX: 0, rotationZ: 0, duration: 1.1 }, 3.65);
  } else {
    gsap.set(q('.lc-book-rig'), { rotationX: 15, rotationZ: -4, y: 8, scale: .88 });
    gsap.set(q('.lc-doc-leaf'), { rotation: i => (i - 2) * 1.5, x: i => i * 3, y: i => -i * 2, z: i => i * 2 });
    gsap.set(q('.lc-book-cover'), { rotationY: 0, transformOrigin: '0% 50%' });
    gsap.set(q('.lc-feature-strip'), { y: 18, opacity: 0 });
    gsap.set(q('.lc-optical-scan'), { y: -150, opacity: 0 });
    // Open the cover away from the viewer so perspective cannot throw it
    // into the heading. A shallower fan preserves almost the full page size.
    timeline.to(q('.lc-book-cover'), { rotationY: 158, duration: 1.4 }, .1)
      .to(q('.lc-book-rig'), { rotationX: 6, rotationZ: 0, y: 0, scale: .94, duration: 2 }, .35)
      .to(q('.lc-doc-leaf'), { rotation: i => (i - 2) * 12, x: i => (i - 2) * 145, y: i => Math.abs(i - 2) * 8, z: i => 20 + i * 7, duration: 1.9, stagger: .11 }, 1)
      .to(q('.lc-book-cover'), { opacity: 0, duration: .6 }, 1.5)
      .to(q('.lc-optical-scan'), { opacity: 1, duration: .25 }, 2.5)
      .to(q('.lc-optical-scan'), { y: 245, duration: 1.6, ease: 'none' }, 2.5)
      .to(q('.lc-feature-strip'), { y: 0, opacity: 1, duration: .8, stagger: .1 }, 3)
      .to(q('.lc-optical-scan'), { opacity: 0, duration: .5 }, 4.1);
  }
  timeline.to({ hold: 0 }, { hold: 1, duration: .2 }, 4.8);
  return timeline;
}

function MapFace({ segment }: { segment: number }) {
  return <svg viewBox={`${segment * 140} 0 140 350`} className="lc-map-face" aria-hidden="true">
    <rect width="840" height="350" fill="#e8dfc4" />
    <path d="M0 0H318L345 65 270 121 285 213 208 261 239 350H0Z" fill="#a8b697" />
    <path d="M318 0H614L560 66 616 139 550 201 594 274 522 350H239L208 261 285 213 270 121 345 65Z" fill="#c1b88c" />
    <path d="M614 0H840V350H522L594 274 550 201 616 139 560 66Z" fill="#c9aa8d" />
    {Array.from({ length: 14 }, (_, i) => <path key={i} d={`M-20 ${i * 30}C145 ${i * 24 - 45} 175 ${i * 22 + 90} 345 ${i * 27}S615 ${i * 28 - 75} 870 ${i * 25 + 20}`} fill="none" stroke="#344b3426" strokeWidth="1" />)}
    <path d="M-20 282C128 248 111 112 257 149S428 311 538 225 650 49 860 80" fill="none" stroke="#819898" strokeWidth="19" />
    <path d="M-20 282C128 248 111 112 257 149S428 311 538 225 650 49 860 80" fill="none" stroke="#d1d5bd" strokeWidth="11" />
    <path className="lc-map-border" d="M318 0 345 65 270 121 285 213 208 261 239 350M614 0 560 66 616 139 550 201 594 274 522 350" pathLength="1" fill="none" stroke="#a24c35" strokeWidth="3" />
    <g fill="#344837"><text x="54" y="75" className="lc-map-place">THE NEAR</text><text x="336" y="182" className="lc-map-place">THE BETWEEN</text><text x="647" y="289" className="lc-map-place">THE FAR</text></g>
    {[{ x: 124, y: 169 }, { x: 424, y: 93 }, { x: 704, y: 173 }].map((p, i) => <g key={i} className="lc-map-pin"><path d={`M${p.x} ${p.y + 24}c-13-18-21-22-21-35a21 21 0 1 1 42 0c0 13-8 17-21 35Z`} fill="#a54834" /><circle cx={p.x} cy={p.y - 11} r="6" fill="#eee4cd" /></g>)}
    <path d="M35 309H122M35 305V313M122 305V313" stroke="#344837" /><text x="35" y="332" className="lc-tiny">AN INVENTED TERRITORY</text>
  </svg>;
}
function MapFold({ index = 0 }: { index?: number }) {
  return <div className={index ? 'lc-map-panel lc-map-hinge' : 'lc-map-panel lc-map-first'}><MapFace segment={index} /><span className="lc-map-fold-shadow" />{index < 5 && <MapFold index={index + 1} />}</div>;
}
function FoldingMap() {
  return <div className="lc-map-stage lc-mechanism"><div className="lc-map-ground" /><div className="lc-map-rig"><MapFold /></div><span className="lc-map-annotation lc-map-note-a">A line is a choice.</span><span className="lc-map-annotation lc-map-note-b">What crosses it?</span><svg viewBox="0 0 100 100" className="lc-map-compass"><path d="M50 5 61 40 95 50 61 60 50 95 39 60 5 50 39 40Z" fill="none" stroke="currentColor" /><path d="M50 5 50 50 39 40Z" fill="currentColor" /><text x="50" y="-2" textAnchor="middle">N</text></svg></div>;
}

function CommunityLoom({ id }: { id: string }) {
  return <svg viewBox="0 0 1200 520" className="lc-loom-stage lc-svg" aria-hidden="true">
    <defs>{Array.from({ length: 17 }, (_, row) => <mask key={row} id={`${id}-weave-${row}`} maskUnits="userSpaceOnUse" x="0" y="0" width="1200" height="520"><rect width="1200" height="520" fill="white" />{Array.from({ length: 20 }, (_, col) => (row + col) % 2 === 0 ? <rect key={col} x={244 + col * 35} y={126 + row * 15} width="15" height="17" fill="black" /> : null)}</mask>)}</defs>
    <path d="M177 59H1019V458H177ZM209 83H987V434H209Z" fill="#8c7557" fillRule="evenodd" /><path d="M177 59H1019M177 458H1019" stroke="#d8c7a0" strokeWidth="3" />
    <g className="lc-tapestry">
      {Array.from({ length: 20 }, (_, i) => <g key={i} className="lc-warp"><path d={`M${252 + i * 35} 70V462`} stroke={['#8daa82', '#d0b681', '#a26349'][Math.floor(i / 7)]} strokeWidth="13" /><path d={`M${248 + i * 35} 70V462`} stroke="#eee1c433" strokeWidth="2" /></g>)}
      {Array.from({ length: 17 }, (_, row) => <g className="lc-weft" key={row}><path d={`M208 ${135 + row * 15}H990`} mask={`url(#${id}-weave-${row})`} stroke={row % 6 < 3 ? '#4f765d' : '#c6aa7b'} strokeWidth="13" /><path d={`M208 ${131 + row * 15}H990`} mask={`url(#${id}-weave-${row})`} stroke="#f0e4c533" strokeWidth="2" /></g>)}
      <path d="M210 408C115 414 136 337 95 321M990 379C1107 351 1057 234 1126 225" stroke="#c6aa7b" strokeWidth="3" fill="none" />
    </g>
    <g className="lc-loom-shuttle" transform="translate(600 200)"><path d="M-89 0Q-40-31 47-22L90 0Q42 30-48 22Z" fill="#d6c29a" stroke="#2b3d32" strokeWidth="2" /><path d="M-57 0H57" stroke="#2b3d32" strokeWidth="8" strokeLinecap="round" /><path d="M-35-13V13M-28-15V15M-21-16V16M-14-17V17M-7-18V18M0-18V18M7-18V18M14-17V17M21-16V16M28-15V15M35-13V13" stroke="#a26143" strokeWidth="4" /></g>
    <text x="600" y="507" textAnchor="middle" className="lc-tapestry-label lc-small">THE FABRIC DEPENDS ON WHAT PASSES BETWEEN.</text>
    <text x="117" y="260" transform="rotate(-90 117 260)" textAnchor="middle" className="lc-tiny">CONNECTION / TENSION / BELONGING</text>
  </svg>;
}

const printedTokens = tokenize('Words become data.');
function TypePress({ id }: { id: string }) {
  return <svg viewBox="0 0 1200 520" className="lc-press-stage lc-svg" aria-hidden="true">
    <defs><clipPath id={`${id}-paper`}><rect className="lc-paper-window" x="210" y="253" width="790" height="123" /></clipPath><linearGradient id={`${id}-metal`} x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#8799b0" /><stop offset=".4" stopColor="#283c59" /><stop offset=".65" stopColor="#657c97" /><stop offset="1" stopColor="#20324d" /></linearGradient></defs>
    <path d="M80 435H1120" stroke="#b6c5d7" strokeWidth="2" /><path d="M304 426V129H863V426M340 426V169H828V426" fill="none" stroke="#b4c3d3" strokeWidth="10" />
    <path d="M325 115H841V156H325Z" fill={`url(#${id}-metal)`} stroke="#aebdd0" /><path d="M571 113V48H609V113" fill="#b4c3d3" /><path d="M490 48H690" stroke="#d9e1e7" strokeWidth="12" strokeLinecap="round" />
    <path d="M175 250C248 224 234 314 292 314H1010" fill="none" stroke="#e8ddc3" strokeWidth="24" />
    {[{ x: 174, y: 247, r: 75 }, { x: 1012, y: 314, r: 50 }].map((p, i) => <g key={i}><circle cx={p.x} cy={p.y} r={p.r} fill={`url(#${id}-metal)`} stroke="#c5d0da" strokeWidth="3" /><g className="lc-roller-spokes">{Array.from({ length: 10 }, (_, k) => <path key={k} d={`M${p.x} ${p.y}l${Math.cos(k * Math.PI / 5) * (p.r - 9)} ${Math.sin(k * Math.PI / 5) * (p.r - 9)}`} stroke="#cbd1d788" strokeWidth="4" />)}<circle cx={p.x} cy={p.y} r="12" fill="#d9553d" /></g></g>)}
    <g clipPath={`url(#${id}-paper)`}><g className="lc-printed-sheet"><path d="M219 263H1000V364H219Z" fill="#f3e8cd" /><path d="M220 273H1000M220 354H1000" stroke="#c3b697" />{printedTokens.map((word, i) => <text key={word} className="lc-print-ink" x={310 + i * 217} y="329" fill="#2449a4" fontFamily="Instrument Serif,serif" fontSize="51">{word}</text>)}</g></g>
    <g className="lc-press-head"><path d="M369 171H796V207H369Z" fill={`url(#${id}-metal)`} stroke="#c5d0da" strokeWidth="2" /><path d="M399 168V134M764 168V134" stroke="#dce0dd" strokeWidth="8" /></g>
    {printedTokens.map((word, i) => <g key={word} className="lc-metal-type"><rect x={397 + i * 132} y="205" width="118" height="46" rx="2" fill="#17273d" stroke="#9fb1c4" /><text x={456 + i * 132} y="235" textAnchor="middle" fill="#cbd6e2" fontFamily="Space Grotesk,sans-serif" fontSize="20">{word.toUpperCase()}</text></g>)}
    <path d="M267 387H912V416H267Z" fill={`url(#${id}-metal)`} stroke="#aabdd1" />
    {printedTokens.map((word, i) => <g key={word} className="lc-token-result"><text x={310 + i * 252} y="489" className="lc-small">{String(i + 1).padStart(2, '0')} / {word}</text><path d={`M${310 + i * 252} 467V451`} stroke="#ee7757" /></g>)}
  </svg>;
}

function TypeWall({ id }: { id: string }) {
  return <div className="lc-wall-rig lc-mechanism"><svg viewBox="0 0 1200 520" className="lc-svg" aria-hidden="true"><defs>{[0, 1, 2].flatMap(row => Array.from({ length: 12 }, (_, col) => <clipPath key={`${row}-${col}`} id={`${id}-slice-${row}-${col}`}><rect x={100 + col * 83.334} y={row * 155 + 5} width="83.5" height="157" /></clipPath>))}</defs>
    {['READ', 'BETWEEN', 'LINES'].map((word, row) => <g key={word} className={`lc-wall-row-${row}`}><text x="100" y={row * 155 + 145} textLength="1000" lengthAdjust="spacingAndGlyphs" className="lc-wall-ghost">{word}</text>{Array.from({ length: 12 }, (_, col) => <g key={col} className="lc-type-slice"><g clipPath={`url(#${id}-slice-${row}-${col})`}><text x="100" y={row * 155 + 145} textLength="1000" lengthAdjust="spacingAndGlyphs" className={`lc-wall-word lc-wall-word-${row}`}>{word}</text></g></g>)}</g>)}
    <path d="M85 167H1115" className="lc-wall-rule" /><path d="M85 320H1115" className="lc-wall-rule" /><text x="600" y="513" className="lc-tiny" textAnchor="middle">ORDER IS PART OF THE MESSAGE.</text>
  </svg></div>;
}

function LensPicture({ finance }: { finance: boolean }) {
  const ink = finance ? '#e9e3d3' : '#24434a';
  return <svg viewBox="0 0 1080 380" preserveAspectRatio="none" aria-hidden="true">
    <rect width="1080" height="380" fill={finance ? '#263d4c' : '#e7e5da'} />
    {finance ? <g fill="none" stroke="#c7b895" strokeWidth="1.2" opacity=".2">
      <path d="M163 320H917M186 315V106L540 52 894 106V315M211 125H869" />
      {[260, 410, 560, 710].map(x => <path key={x} d={`M${x} 142V299M${x + 87} 142V299M${x - 8} 299H${x + 95}M${x - 8} 142H${x + 95}`} />)}
    </g> : <g fill="none" stroke="#5f8991">
      <path d="M-70 245C170 70 245 385 532 204S860 100 1155 250" strokeWidth="48" opacity=".055" />
      {[0, 1, 2, 3].map(i => <path key={i} d={`M-70 ${218 + i * 15}C170 ${43 + i * 15} 245 ${358 + i * 15} 532 ${177 + i * 15}S860 ${73 + i * 15} 1155 ${223 + i * 15}`} strokeWidth="1.2" opacity=".2" />)}
    </g>}
    <path d="M50 49H1030M50 338H1030" stroke={ink} strokeWidth=".7" opacity=".2" />
    <text x="54" y="32" fill={ink} opacity=".65" fontFamily="Space Grotesk,sans-serif" fontSize="10" letterSpacing="3">A STUDY IN CONTEXT</text>
    <text x="1026" y="32" textAnchor="end" fill={ink} opacity=".65" fontFamily="Space Grotesk,sans-serif" fontSize="10" letterSpacing="3">{finance ? 'II / FINANCE' : 'I / LANDSCAPE'}</text>
    <text x="533" y="263" textAnchor="middle" fill={ink} fontFamily="Instrument Serif,serif" fontSize="268" letterSpacing="-12">bank</text>
    <text x="540" y="316" textAnchor="middle" fill={ink} opacity=".75" fontFamily="Space Grotesk,sans-serif" fontSize="12" letterSpacing="4">{finance ? 'CREDIT  ·  LOANS  ·  DEPOSITS' : 'RIVER  ·  SHORE  ·  CURRENT'}</text>
  </svg>;
}
function LenticularMeaning() {
  return <div className="lc-lens-stage lc-mechanism"><div className="lc-optical-ground" /><div className="lc-lens-rig"><div className="lc-lens-frame" /><div className="lc-lens-slats">{Array.from({ length: 18 }, (_, i) => <div key={i} className="lc-lens-slat"><div className="lc-lens-face lc-lens-front"><div className="lc-lens-image" style={{ left: `${-i * 100}%` }}><LensPicture finance={false} /></div></div><div className="lc-lens-face lc-lens-back"><div className="lc-lens-image" style={{ left: `${-i * 100}%` }}><LensPicture finance /></div></div></div>)}</div><div className="lc-lens-shine" /></div><p className="lc-lens-caption lc-river-label">“They sat on the river bank.”</p><p className="lc-lens-caption lc-finance-label">“The bank approved the loan.”</p><div className="lc-lens-axis"><span>ONE SPELLING</span><i /><span>DIFFERENT CONTEXTS</span></div></div>;
}

const pages = [
  { title: 'Water', words: ['the river turns', 'a shore appears', 'rain meets the sea'] },
  { title: 'Credit', words: ['the bank lends', 'a loan matures', 'trust has a price'] },
  { title: 'Flight', words: ['birds cross borders', 'wings trace a route', 'the wind carries'] },
  { title: 'Markets', words: ['the market moves', 'prices tell stories', 'buyers meet sellers'] },
  { title: 'Context', words: ['words keep company', 'meaning takes shape', 'read what surrounds'] },
];
function DocumentBook() {
  return <div className="lc-book-stage lc-mechanism">
    <div className="lc-book-shadow" />
    <div className="lc-book-rig">
      <div className="lc-book-spine" />
      {pages.map((page, i) => <div key={page.title} className={`lc-doc-leaf lc-doc-${i}`}>
        <span className="lc-document-id">FIELD NOTE / {String(i + 1).padStart(2, '0')}</span>
        <span className="lc-document-running">LANGUAGE & MEANING</span>
        <h4>{page.title}</h4>
        <div className="lc-document-lines">{page.words.map(line => <p key={line}>{line}</p>)}</div>
        <div className="lc-document-rules">{[100, 100, 62].map((width, line) => <i key={line} style={{ width: `${width}%` }} />)}</div>
        <div className="lc-feature-strip"><span>A REPRESENTATION</span><div>{Array.from({ length: 12 }, (_, bar) => <i key={bar} style={{ height: `${12 + ((bar * 23 + i * 19) % 30)}px` }} />)}</div></div>
        <span className="lc-page-number">{String(i + 1).padStart(2, '0')}</span>
      </div>)}
      <div className="lc-book-cover"><span>THE FIELD LIBRARY</span><span className="lc-cover-edition">VOLUME VI</span><strong>A corpus.<br />Many views.</strong><i>Notes on language<br />and representation.</i><div className="lc-cover-mark"><span>VI</span></div></div>
      <div className="lc-optical-scan"><span /></div>
    </div>
    <div className="lc-book-colophon"><span>KEEP THE DOCUMENT.</span><span>QUESTION THE REPRESENTATION.</span></div>
  </div>;
}

export default function LanguageChoreography({ week, variant, reduced }: Props) {
  const name: SceneName = week === 4 ? variant === 'middle' ? 'map' : 'loom' : week === 5 ? variant === 'middle' ? 'press' : 'wall' : variant === 'middle' ? 'lens' : 'book';
  const study = studies[name];
  const rootRef = useRef<HTMLElement>(null);
  const lastFrame = useRef({ percent: -1, phase: -1 });
  const uid = `lc-${useId().replaceAll(':', '')}`;

  const build = useCallback((root: HTMLElement) => {
    lastFrame.current = { percent: -1, phase: -1 };
    return buildSequence(root, name);
  }, [name]);
  const onProgress = useCallback((progress: number) => {
    const root = rootRef.current;
    if (!root) return;
    const p = Math.max(0, Math.min(1, progress));
    const percent = Math.round(p * 100), phase = Math.min(2, Math.floor(p * 3));
    if (percent !== lastFrame.current.percent) {
      lastFrame.current.percent = percent;
      root.dataset.progress = (percent / 100).toFixed(2);
      const bar = root.querySelector<HTMLElement>('.lc-motion-meter > span');
      if (bar) bar.style.transform = `scaleX(${p})`;
    }
    if (phase !== lastFrame.current.phase) {
      lastFrame.current.phase = phase;
      root.dataset.phase = String(phase + 1);
      root.querySelectorAll<HTMLButtonElement>('.lc-phase-button').forEach((button, i) => button.setAttribute('aria-pressed', String(i === phase)));
      const output = root.querySelector<HTMLOutputElement>('.lc-phase-output');
      if (output) output.textContent = `${String(phase + 1).padStart(2, '0')} / ${study.phases[phase]}`;
    }
  }, [study]);
  const { paused, togglePause, restart, select } = useVisibleSequence({ root: rootRef, reduced, build, onProgress });
  const selectPhase = (phase: number) => select([.04, .55, 1][phase]);

  return <section ref={rootRef} className={`language-choreography lc-${name}`} data-scene={`${week}-${variant}-${name}`} data-phase={reduced ? '3' : '1'} data-progress={reduced ? '1.00' : '0.00'} data-replay={reduced ? 'still' : paused ? 'paused' : 'automatic'} data-reduced={reduced} aria-labelledby={`${uid}-title`}>
    <header className="lc-heading"><div><p className="lc-eyebrow">A change of perspective / 0{week}</p><h3 id={`${uid}-title`}>{study.title}</h3></div><p>{study.intro}</p></header>
    <div className="sequence-playback lc-playback">
      {!reduced && <button type="button" className="lc-pause" onClick={togglePause} aria-pressed={paused}>{paused ? 'Resume animation' : 'Pause animation'}</button>}
      <button type="button" className="lc-replay" onClick={reduced ? () => selectPhase((lastFrame.current.phase + 1) % 3) : restart}>{reduced ? 'Next still view' : 'Replay the sequence'}<span aria-hidden="true">↻</span></button>
      <span className="sequence-playback-label">{reduced ? 'Still views · reduced motion' : 'Plays while in view'}</span>
    </div>
    <div className="lc-stage" data-sequence-stage aria-hidden="true">{name === 'map' ? <FoldingMap /> : name === 'loom' ? <CommunityLoom id={uid} /> : name === 'press' ? <TypePress id={uid} /> : name === 'wall' ? <TypeWall id={uid} /> : name === 'lens' ? <LenticularMeaning /> : <DocumentBook />}</div>
    <div className="lc-controls lc-phase-controls"><ol>{study.phases.map((label, i) => <li key={label}><button type="button" className="lc-phase-button" aria-pressed={reduced ? i === 2 : i === 0} onClick={() => selectPhase(i)}><span>{String(i + 1).padStart(2, '0')}</span>{label}</button></li>)}</ol><output className="lc-phase-output" aria-live={reduced ? 'polite' : 'off'}>{reduced ? '03' : '01'} / {study.phases[reduced ? 2 : 0]}</output><div className="lc-motion-meter" aria-hidden="true"><span /></div></div>
    <details className="lc-reference-notes"><summary>About this motion study</summary><p>{study.note}</p><p>Original graphics and animation. Inspiration: <a href={study.source} target="_blank" rel="noreferrer">{study.sourceTitle} ↗</a>. No reference assets or demo code are included.</p>{name === 'book' && <p>Additional material reference: <a href="https://tympanus.net/Development/AnimatedBooks/" target="_blank" rel="noreferrer">Codrops · animated books with CSS 3D transforms ↗</a>.</p>}</details>
  </section>;
}
