import { lazy, Suspense } from 'react';
import type { Week } from './types';
import ExperimentBoundary from './ExperimentBoundary';
import './chapter-journey.css';

const NetworkChoreography = lazy(() => import('./NetworkChoreography'));
const LanguageChoreography = lazy(() => import('./LanguageChoreography'));

const sceneNames = [
  ['Living filaments', 'From people to patterns', 'Every link counts twice', 'A comic in three dimensions', 'A crowd becomes a distribution', 'Turn the matrix'],
  ['The probability engine', 'Order meets chance', 'The rich get more chances', 'Eight possible worlds', 'One world is not a baseline', 'The popularity conveyor'],
  ['Through the network', 'Three kinds of influence', 'A shortcut rewrites the journey', 'The departure board', 'Cut once. Divide everything', 'The bridge carries everyone'],
  ['Liquid communities', 'The partition problem', 'Borders are a hypothesis', 'Unfold the territory', 'Weight needs a local scale', 'Weave the connections'],
  ['Words become matter', 'From text to counts', 'Cut a sentence into pieces', 'Inside the printing press', 'Repetition builds a skyline', 'Break the sentence open'],
  ['Meaning through glass', 'Documents find coordinates', 'Let common words lose gravity', 'A change of perspective', 'One word. Two constellations', 'The document scanner'],
];
const anchors = ['chapter-opening', 'chapter-story', 'episode-before-study', 'chapter-middle', 'episode-after-study', 'chapter-closing'];
function jump(id: string) {
  const section = document.getElementById(id);
  const target = section?.querySelector('.sequence-playback') ?? section;
  target?.scrollIntoView({ behavior: document.documentElement.dataset.reduced === 'true' ? 'instant' : 'smooth', block: 'start' });
}

export function SceneIndex({ week }: { week: number }) {
  return <nav className="scene-index wrap" aria-label="Scenes throughout this chapter">
    <p className="eyebrow">Six scenes.<br/><span>One chapter to explore.</span></p>
    <div>{sceneNames[week - 1].map((name, index) => <button key={name} onClick={() => jump(anchors[index])}><span>{String(index + 1).padStart(2, '0')}</span>{name}<i aria-hidden="true">↘</i></button>)}</div>
  </nav>;
}

export function ChapterSequence({ week, reduced, variant }: { week: number; reduced: boolean; variant: 'middle' | 'closing' }) {
  const name = sceneNames[week - 1][variant === 'middle' ? 3 : 5];
  const fallback = <div className="sequence-fallback wrap"><p className="eyebrow">A different way to see it</p><h2>{name}</h2><p>{variant === 'middle' ? 'The study notes and exercises continue below.' : 'Your self-check and chapter sources continue below.'}</p></div>;
  return <div id={`chapter-${variant}`} className="chapter-sequence">
    <ExperimentBoundary fallback={fallback}><Suspense fallback={<div className="sequence-loading" role="status">Preparing {name.toLowerCase()}…</div>}>
      {week < 4
        ? <NetworkChoreography week={week as 1 | 2 | 3} reduced={reduced} variant={variant}/>
        : <LanguageChoreography week={week as 4 | 5 | 6} reduced={reduced} variant={variant}/>}
    </Suspense></ExperimentBoundary>
  </div>;
}

function Topic({ topic: s, index }: { topic: Week['sections'][number]; index: number }) {
  return <section className="topic" id={`topic-${s.id}`}>
    <p className="eyebrow">FIELD NOTE / {String(index + 1).padStart(2, '0')}</p><h3>{s.title}</h3>
    {s.body.slice(0, 2).map((p, j) => <p key={j}>{p}</p>)}
    {s.formula && <div className="formula"><span className="eyebrow">The relationship</span><p>{s.formula}</p>{s.terms && <small>{s.terms}</small>}</div>}
    {s.terms && !s.formula && <p className="definition">{s.terms}</p>}
    {s.body.length > 2 && <details className="deeper"><summary>Follow the reasoning <span>+</span></summary>{s.body.slice(2).map((p, j) => <p key={j}>{p}</p>)}</details>}
    {s.example && <div className="worked-example"><span className="eyebrow">Make it concrete</span><p>{s.example}</p></div>}
    {s.pitfall && <aside className="pitfall"><span>↳</span><p><strong>Watch the assumption.</strong> {s.pitfall}</p></aside>}
  </section>;
}

export function StudyNotes({ week, reduced }: { week: Week; reduced: boolean }) {
  const split = Math.ceil(week.sections.length / 2);
  return <section id="study" className="study study-sequenced">
    <div className="section-heading wrap"><div><p className="eyebrow">The ideas, carefully unpacked</p><h2>Stay with<br/><em>the details.</em></h2></div><p>Read, pause, and connect the pieces.<br/><span className="muted">Definitions → methods → interpretation.</span></p></div>
    <div className="study-layout wrap">
      <nav className="study-toc" aria-label="Study topics">{week.sections.map((s, i) => <button key={s.id} onClick={() => jump(`topic-${s.id}`)}><span>{String(i + 1).padStart(2, '0')}</span>{s.title}</button>)}<a href={week.source} target="_blank" rel="noreferrer">Original week ↗</a></nav>
      <div className="study-content">{week.sections.slice(0, split).map((s, i) => <Topic key={s.id} topic={s} index={i}/>)}</div>
    </div>
    <ChapterSequence week={week.id} reduced={reduced} variant="middle"/>
    <div className="study-layout study-continuation wrap">
      <aside className="study-return"><span className="study-return-mark" aria-hidden="true">↳</span><p className="eyebrow">The next connection</p><p>Bring what you just saw<br/>back to the details.</p><button onClick={() => jump('study')}>All study topics ↑</button></aside>
      <div className="study-content">{week.sections.slice(split).map((s, i) => <Topic key={s.id} topic={s} index={i + split}/>)}</div>
    </div>
  </section>;
}
