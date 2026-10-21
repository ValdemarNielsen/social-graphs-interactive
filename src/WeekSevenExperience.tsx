import { useCallback, useState } from 'react';
import type { Week } from './types';
import WeekSevenCover, { MeasurementAtlas } from './WeekSevenCover';
import { SentimentCase, EntityCase, RetrievalCase } from './WeekSevenCases';
import WeekSevenMethods from './WeekSevenMethods';
import ExperimentBoundary from './ExperimentBoundary';
import './week-seven.css';

const cases = [
  { id: 'week7-sentiment-audit', anchor: 'w7-sentiment', title: 'The sentiment sorter', number: '01' },
  { id: 'week7-entity-resolution', anchor: 'w7-entities', title: 'Repair the network', number: '02' },
  { id: 'week7-evidence-retrieval', anchor: 'w7-retrieval', title: 'Wire the evidence', number: '03' },
];
function jump(id: string, reduced: boolean) {
  document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth', block: 'start' });
}
function readRecord(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem('sg-week7-minigames') ?? '[]');
    return Array.isArray(saved) ? cases.filter(c => saved.includes(c.id)).map(c => c.id) : [];
  } catch { return []; }
}

/** Topic selection is explicit. Text never waits for an animation or a scroll threshold. */
function ReadingDesk({ notes, number, title }: { notes: Week['sections']; number: string; title: string }) {
  const [selected, setSelected] = useState(0);
  const note = notes[selected];
  if (!note) return null;
  return <section className="w7-reading wrap" aria-label={title}>
    <aside>
      <p className="w7-kicker">Reading desk / {number}</p>
      <h2>{title}</h2>
      <nav aria-label={`${title} topics`}>
        {notes.map((item, index) => <button key={item.id} aria-current={index === selected ? 'true' : undefined} onClick={() => setSelected(index)}><span>{String(index + 1).padStart(2, '0')}</span>{item.title}<i aria-hidden="true">↗</i></button>)}
      </nav>
    </aside>
    <article className="w7-reading-page" key={note.id} id={`topic-${note.id}`}>
      <div className="w7-page-running"><span>Notes on measurement</span><span>{selected + 1} / {notes.length}</span></div>
      <h3>{note.title}</h3>
      {note.body.slice(0, 2).map((paragraph, i) => <p key={i}>{paragraph}</p>)}
      {note.formula && <div className="w7-equation"><p>{note.formula}</p>{note.terms && <small>{note.terms}</small>}</div>}
      {note.terms && !note.formula && <p className="w7-definition">{note.terms}</p>}
      {note.body.length > 2 && <details className="w7-detail"><summary>Read the rest of this note <span>+</span></summary>{note.body.slice(2).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</details>}
      {note.example && <div className="w7-example"><span>For example</span><p>{note.example}</p></div>}
      {note.pitfall && <p className="w7-caution"><strong>Check the assumption.</strong> {note.pitfall}</p>}
      <div className="w7-page-turn"><button disabled={selected === 0} onClick={() => setSelected(v => v - 1)}>← Previous note</button><button disabled={selected === notes.length - 1} onClick={() => setSelected(v => v + 1)}>Next note →</button></div>
    </article>
  </section>;
}

export default function WeekSevenExperience({ week, reduced }: { week: Week; reduced: boolean }) {
  const [solved, setSolved] = useState(readRecord);
  const onSolved = useCallback((id: string) => {
    if (!cases.some(c => c.id === id)) return;
    setSolved(previous => {
      const next = previous.includes(id) ? previous : [...previous, id];
      try { localStorage.setItem('sg-week7-minigames', JSON.stringify(next)); } catch { /* The game remains playable without storage. */ }
      return next;
    });
  }, []);
  const section = (ids: string[]) => ids.flatMap(id => week.sections.filter(note => note.id === id));
  return <div className="w7-experience" data-reduced={reduced}>
    <div id="chapter-opening"><WeekSevenCover reduced={reduced}/></div>
    <nav className="w7-itinerary wrap" aria-label="Week 7 minigames">
      <div><span className="w7-kicker">Your casebook</span><p>{solved.length} of 3 games solved</p><small>Saved in this browser</small></div>
      <button onClick={() => jump('w7-atlas', reduced)}><span>Start here</span>The document atlas<i aria-hidden="true">↘</i></button>
      {cases.map(c => <button key={c.id} onClick={() => jump(c.anchor, reduced)}><span>{solved.includes(c.id) ? '✓ Solved' : `Play ${c.number}`}</span>{c.title}<i aria-hidden="true">↘</i></button>)}
    </nav>
    <section className="w7-introduction wrap" id="study">
      <p className="w7-kicker">The brief / Week 07</p>
      <h2>A model gives you an answer.<br/><em>You decide what it proves.</em></h2>
      <div><p>Last week, words became vectors. This week, those vectors become instruments: maps, labels, entities, and search results. Every instrument makes choices. Your job is to make those choices visible.</p><p>Sort a sentence. Repair a network. Wire an answer to its evidence. Play the three games in any order, at your own pace; the machinery responds to your moves. Read the notes between games, then try the original course exercises. All game texts and model outputs are small, authored teaching examples.</p></div>
    </section>
    <div id="w7-atlas" className="w7-anchor"><ExperimentBoundary><MeasurementAtlas reduced={reduced}/></ExperimentBoundary></div>
    <ReadingDesk number="01" title="Before a vector becomes a claim." notes={section(['contextual-meaning', 'document-embeddings', 'corpus-atlas', 'semantic-groups'])}/>
    <WeekSevenMethods reduced={reduced}/>
    <div id="w7-sentiment" className="w7-anchor"><ExperimentBoundary><SentimentCase reduced={reduced} onSolved={onSolved}/></ExperimentBoundary></div>
    <ReadingDesk number="02" title="A score is a hypothesis." notes={section(['sentiment', 'validation-and-arcs'])}/>
    <div id="w7-entities" className="w7-anchor"><ExperimentBoundary><EntityCase reduced={reduced} onSolved={onSolved}/></ExperimentBoundary></div>
    <ReadingDesk number="03" title="Names become network nodes." notes={section(['entities', 'entity-networks'])}/>
    <div id="w7-retrieval" className="w7-anchor"><ExperimentBoundary><RetrievalCase reduced={reduced} onSolved={onSolved}/></ExperimentBoundary></div>
    <ReadingDesk number="04" title="Make the answer traceable." notes={section(['semantic-search', 'rag'])}/>
    <section className="w7-closing wrap" aria-label="Investigation record">
      <div className="w7-closing-heading"><p className="w7-kicker">The evidence you keep</p><h2>Three habits.<br/><em>Better questions.</em></h2><p>The useful reward is knowing where to look when a result seems too convincing.</p></div>
      <div className="w7-receipt"><p className="w7-page-running"><span>Game record</span><span>07 / 2026</span></p>{cases.map((c, i) => <div className="w7-receipt-line" key={c.id}><span>{c.number}</span><p>{['Test a label against the actual sentence.', 'Resolve a name before making an edge.', 'Check a claim against its retrieved source.'][i]}</p><strong>{solved.includes(c.id) ? 'VERIFIED' : 'TO PLAY'}</strong></div>)}<p className="w7-receipt-foot" role="status">{solved.length === 3 ? 'All three games solved. Now test these habits on real course data.' : `${solved.length} of 3 games solved. Every game can be replayed.`}</p></div>
    </section>
    <ReadingDesk number="05" title="The choices before the chart." notes={section(['bias-and-project'])}/>
    <section className="w7-objectives wrap"><p className="w7-kicker">Take these tools with you</p><div>{week.objectives.map((objective, i) => <p key={objective}><span>{String(i + 1).padStart(2, '0')}</span>{objective}</p>)}</div><button onClick={() => jump('practice', reduced)}>Open the 13 course exercises <span aria-hidden="true">↓</span></button></section>
  </div>;
}
