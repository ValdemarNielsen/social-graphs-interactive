import { useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  SENTIMENT_ITEMS, scoreSentiment, binaryConfusion, ENTITY_MENTIONS, ENTITY_PAIRS,
  ENTITY_DOCUMENTS, resolveEntityMap, cooccurrenceGraph, SEARCH_QUERY, SEARCH_SNIPPETS,
  SEARCH_STOPWORDS, rankKeywordDocuments, RETRIEVAL_ANSWERS, assessEvidence,
  type SentimentLabel, type EntityDecision,
} from './weekSevenMath';
import './week-seven-cases.css';

export type WeekSevenCaseProps = { reduced: boolean; onSolved?: (id: string) => void };
export const WEEK_SEVEN_CASE_IDS = {
  sentiment: 'week7-sentiment-audit', entity: 'week7-entity-resolution', retrieval: 'week7-evidence-retrieval',
} as const;

function useSolved(solved: boolean, id: string, onSolved?: (id: string) => void) {
  const notified = useRef(false);
  useEffect(() => {
    if (solved && !notified.current && onSolved) { notified.current = true; onSolved(id); }
  }, [solved, id, onSolved]);
}

function CaseFrame({ name, number, title, instruction, reduced, solved, progress, children }: {
  name: string; number: string; title: string; instruction: string; reduced: boolean;
  solved: boolean; progress: string; children: ReactNode;
}) {
  const titleId = useId();
  return <section className={`w7-case w7-case-${name}`} data-reduced={reduced} data-solved={solved} data-case={name} aria-labelledby={titleId}>
    <header className="w7-case-heading">
      <div className="w7-case-number" aria-hidden="true">{number}<span>CASE FILE</span></div>
      <div><span className="w7-case-kicker">The evidence room · synthetic teaching case</span><h3 id={titleId}>{title}</h3><p>{instruction}</p></div>
      <span className={`w7-case-stamp ${solved ? 'is-solved' : ''}`}>{solved ? 'CASE RESOLVED' : progress}</span>
    </header>
    {children}
  </section>;
}

const modelPredictions = SENTIMENT_ITEMS.map(item => scoreSentiment(item.text).label as SentimentLabel);
const modelConfusion = binaryConfusion(modelPredictions, SENTIMENT_ITEMS.map(item => item.gold));
const percent = (value: number | null) => value === null ? 'undefined' : `${Math.round(value * 100)}%`;

function HighlightedSentence({ text }: { text: string }) {
  return <>{text.split(/\b(wonderful|good|bad|terrible)\b/gi).map((part, i) =>
    /^(wonderful|good|bad|terrible)$/i.test(part)
      ? <mark className={/^(wonderful|good)$/i.test(part) ? 'w7-positive' : 'w7-negative'} key={i}>{part}</mark>
      : part)}</>;
}

export function SentimentCase({ reduced, onSolved }: WeekSevenCaseProps) {
  const [selected, setSelected] = useState(0);
  const [labels, setLabels] = useState<Record<string, SentimentLabel>>({});
  const item = SENTIMENT_ITEMS[selected];
  const model = scoreSentiment(item.text);
  const label = labels[item.id];
  const correct = SENTIMENT_ITEMS.filter(sentence => labels[sentence.id] === sentence.gold).length;
  const solved = correct === SENTIMENT_ITEMS.length;
  useSolved(solved, WEEK_SEVEN_CASE_IDS.sentiment, onSolved);
  const choose = (value: SentimentLabel) => setLabels(previous => ({ ...previous, [item.id]: value }));
  const signedSum = model.matches.map((match, i) => `${match.value < 0 ? '− ' : i ? '+ ' : ''}${Math.abs(match.value)}`).join(' ');

  return <CaseFrame name="sentiment" number="01" title="The word is not the verdict." instruction="Read each sentence in context. Stamp your judgment, then compare it with the authored reference." reduced={reduced} solved={solved} progress={`${correct} / 6 VERIFIED`}>
    <div className="w7-sentiment-layout">
      <nav className="w7-file-index" aria-label="Sentences to audit">
        {SENTIMENT_ITEMS.map((sentence, i) => <button key={sentence.id} type="button" aria-pressed={i === selected} onClick={() => setSelected(i)}>
          <span className="w7-file-id">{sentence.id}</span><span>{sentence.text}</span>
          <span className={`w7-review-mark ${labels[sentence.id] ? labels[sentence.id] === sentence.gold ? 'is-correct' : 'is-incorrect' : ''}`} aria-label={labels[sentence.id] ? labels[sentence.id] === sentence.gold ? 'Reference matched' : 'Review needed' : 'Not reviewed'}>{labels[sentence.id] ? labels[sentence.id] === sentence.gold ? '✓' : '↺' : '·'}</span>
        </button>)}
      </nav>
      <div className="w7-audit-desk">
        <div key={item.id} className="w7-evidence-slip w7-arrive" data-selected-sentence={item.id}>
          <div className="w7-slip-meta"><span>EXHIBIT {item.id}</span><span>MODEL → {model.label}</span></div>
          <blockquote><HighlightedSentence text={item.text}/></blockquote>
          <div className="w7-score-tape"><span>Word sum</span><strong>{signedSum} = {model.score < 0 ? '−' : ''}{Math.abs(model.score)}</strong></div>
        </div>
        <div className="w7-verdict-row"><span>Your contextual judgment</span><div>
          <button type="button" className="w7-verdict" aria-pressed={label === 'positive'} onClick={() => choose('positive')}>+ Positive</button>
          <button type="button" className="w7-verdict" aria-pressed={label === 'negative'} onClick={() => choose('negative')}>− Negative</button>
        </div></div>
        <div className={`w7-feedback ${label ? label === item.gold ? 'is-correct' : 'is-incorrect' : ''}`} aria-live="polite" aria-atomic="true">
          {label ? <><strong>{label === item.gold ? 'Reference matched.' : `Reference judgment: ${item.gold}.`} <span>{item.phenomenon}.</span></strong><p>{item.reason}</p></> : <><strong>Look beyond the highlighted words.</strong><p>The model only adds four word scores. Your judgment can use negation, contrast and context.</p></>}
        </div>
        <div className="w7-desk-actions"><span>{Object.keys(labels).length} of 6 reviewed</span><button type="button" onClick={() => setSelected((selected + 1) % SENTIMENT_ITEMS.length)}>Next exhibit <span aria-hidden="true">↗</span></button></div>
      </div>
      <aside className="w7-audit-ledger" aria-label="Fixed toy-model evaluation">
        <span className="w7-small-label">THE MODEL, HELD FIXED</span>
        <table className="w7-confusion"><caption>Positive is the target class.</caption><thead><tr><td></td><th scope="col">Ref. +</th><th scope="col">Ref. −</th></tr></thead><tbody>
          <tr><th scope="row">Model +</th><td><strong>{modelConfusion.tp}</strong><span>TRUE +</span></td><td className="w7-error-cell"><strong>{modelConfusion.fp}</strong><span>FALSE +</span></td></tr>
          <tr><th scope="row">Model −</th><td className="w7-error-cell"><strong>{modelConfusion.fn}</strong><span>FALSE −</span></td><td><strong>{modelConfusion.tn}</strong><span>TRUE −</span></td></tr>
        </tbody></table>
        <dl className="w7-metrics"><div><dt>Precision</dt><dd>{percent(modelConfusion.precision)}<small>1 / (1 + 2)</small></dd></div><div><dt>Recall</dt><dd>{percent(modelConfusion.recall)}<small>1 / (1 + 1)</small></dd></div></dl>
        <p className="w7-ledger-note">Accuracy: <strong>3 / 6 = 50%.</strong> Your audit changes the review record, not the frozen model’s performance.</p>
      </aside>
    </div>
    <footer className="w7-case-foot"><p><strong>Disclosed rule:</strong> wonderful +2 · good +1 · bad −1 · terrible −2. Sum &gt; 0: positive; sum &lt; 0: negative; zero: abstain. These six have no ties. This small synthetic set is not a general performance estimate.</p><button type="button" onClick={() => { setLabels({}); setSelected(0); }}>Reset audit</button></footer>
  </CaseFrame>;
}

type CaseGraph = ReturnType<typeof cooccurrenceGraph>;
function EntityGraph({ graph, change }: { graph: CaseGraph; change: string }) {
  const points = graph.nodes.map(node => {
    const members = node.mentions.map(id => ENTITY_MENTIONS.find(mention => mention.id === id)!);
    const isCompany = members.every(member => member.id === 'apple-brand' || member.id === 'apple-inc');
    return { ...node, x: members.reduce((sum, member) => sum + member.x, 0) / members.length, y: members.reduce((sum, member) => sum + member.y, 0) / members.length,
      label: isCompany && members.length > 1 ? 'Apple' : members[0].label,
      kind: members.length === 1 ? members[0].kind : isCompany ? 'company · 2 forms' : `${members.length} forms merged`,
    };
  });
  const point = (id: string) => points.find(node => node.id === id)!;
  return <svg className="w7-entity-graph" viewBox="0 0 420 345" role="img" aria-label={`Current candidate-mention co-occurrence graph: ${graph.nodes.length} nodes, ${graph.edges.length} edges, total weight ${graph.totalWeight}. The fruit is included as a candidate mention, not a named entity. Exact edges are available below.`}>
    <g key={change} className="w7-drawn-edges">{graph.edges.map(edge => {
      const a = point(edge.a), b = point(edge.b), x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
      return <g key={`${edge.a}:${edge.b}`}><title>{a.label} — {b.label}: {edge.count} document{edge.count === 1 ? '' : 's'} ({edge.documents.join(', ')})</title><line x1={a.x} y1={a.y} x2={b.x} y2={b.y} pathLength="1" strokeWidth={1 + edge.count * 1.4}/><rect x={x - 8} y={y - 8} width="16" height="16"/><text x={x} y={y + 4}>{edge.count}</text></g>;
    })}</g>
    {points.map(node => <g className="w7-entity-node" key={node.id} style={{ transform: `translate(${node.x}px, ${node.y}px)` }}>
      <circle r={node.mentions.length > 1 ? 15 : 11} className={node.mentions.length > 1 ? 'is-merged' : ''}/><circle r="3"/>
      <text y="31">{node.label}</text><text y="45" className="w7-node-kind">{node.kind}</text>
    </g>)}
  </svg>;
}

export function EntityCase({ reduced, onSolved }: WeekSevenCaseProps) {
  const [selected, setSelected] = useState(0);
  const [decisions, setDecisions] = useState<Record<string, EntityDecision>>({});
  const pair = ENTITY_PAIRS[selected];
  const decision = decisions[pair.id];
  const correct = ENTITY_PAIRS.filter(item => decisions[item.id] === item.correct).length;
  const solved = correct === ENTITY_PAIRS.length;
  useSolved(solved, WEEK_SEVEN_CASE_IDS.entity, onSolved);
  const graph = useMemo(() => cooccurrenceGraph(ENTITY_DOCUMENTS, resolveEntityMap(
    ENTITY_MENTIONS.map(mention => mention.id),
    ENTITY_PAIRS.filter(item => decisions[item.id]).map(item => ({ left: item.left, right: item.right, decision: decisions[item.id] })),
  )), [decisions]);
  const choose = (value: EntityDecision) => setDecisions(previous => ({ ...previous, [pair.id]: value }));
  const name = (id: string) => ENTITY_MENTIONS.find(mention => mention.id === id)!.label;

  return <CaseFrame name="entity" number="02" title="One identity or two?" instruction="Resolve three pairs from context. Your decisions immediately reconstruct the document network, including mistakes." reduced={reduced} solved={solved} progress={`${correct} / 3 VERIFIED`}>
    <div className="w7-entity-layout">
      <div className="w7-resolution-desk">
        <nav className="w7-pair-tabs" aria-label="Entity pairs">{ENTITY_PAIRS.map((item, i) => <button type="button" key={item.id} onClick={() => setSelected(i)} aria-pressed={selected === i}><span>0{i + 1}</span>{i === 0 ? 'Apple / apple' : i === 1 ? 'Two Jordans' : 'The alias'}<span className={decisions[item.id] === item.correct ? 'w7-good-ink' : ''}>{decisions[item.id] ? decisions[item.id] === item.correct ? '✓' : '↺' : '·'}</span></button>)}</nav>
        <div className="w7-identity-pair w7-arrive" key={pair.id} data-selected-pair={pair.id}>
          <div className="w7-identity-slip"><span>MENTION A</span><strong>{name(pair.left)}</strong><p>“{pair.leftContext}”</p></div>
          <span className="w7-identity-question" aria-hidden="true">?</span>
          <div className="w7-identity-slip"><span>MENTION B</span><strong>{name(pair.right)}</strong><p>“{pair.rightContext}”</p></div>
        </div>
        <div className="w7-resolution-actions"><button className="w7-verdict" type="button" aria-pressed={decision === 'merge'} onClick={() => choose('merge')}><span aria-hidden="true">↔</span> Merge identities</button><button className="w7-verdict" type="button" aria-pressed={decision === 'separate'} onClick={() => choose('separate')}><span aria-hidden="true">↤ ↦</span> Keep separate</button></div>
        <div className={`w7-feedback ${decision ? decision === pair.correct ? 'is-correct' : 'is-incorrect' : ''}`} aria-live="polite" aria-atomic="true">
          {decision ? <><strong>{decision === pair.correct ? 'Identity decision supported.' : `Reconsider: ${pair.correct === 'merge' ? 'merge these aliases' : 'keep these identities separate'}.`}</strong><p>{pair.reason}</p></> : <><strong>A matching string is only a clue.</strong><p>Use the surrounding words and the explicit alias evidence. Unreviewed pairs remain separate in the drawing.</p></>}
        </div>
      </div>
      <div className="w7-network-sheet">
        <div className="w7-sheet-heading"><span className="w7-small-label">CANDIDATE-MENTION CO-OCCURRENCE</span><span>{Object.keys(decisions).length} / 3 decisions</span></div>
        <EntityGraph graph={graph} change={JSON.stringify(decisions)}/>
        <dl className="w7-network-counts"><div><dt>Nodes</dt><dd>{graph.nodes.length}</dd></div><div><dt>Distinct edges</dt><dd>{graph.edges.length}</dd></div><div><dt>Σ edge weights</dt><dd>{graph.totalWeight}</dd></div></dl>
      </div>
    </div>
    <footer className="w7-case-foot"><p><strong>Counting rule:</strong> one unordered pair per document, after alias resolution. Edge weight counts documents, not interactions. The fruit is a deliberately included candidate mention, not a named organization.</p><button type="button" onClick={() => { setDecisions({}); setSelected(0); }}>Reset identities</button></footer>
    <details className="w7-method"><summary>Inspect all five documents and the current edge ledger <span aria-hidden="true">+</span></summary><div className="w7-method-columns"><ol>{ENTITY_DOCUMENTS.map(doc => <li key={doc.id}><strong>{doc.id}</strong> {doc.text}</li>)}</ol><ul>{graph.edges.map(edge => <li key={`${edge.a}:${edge.b}`}><strong>{name(edge.a)} — {name(edge.b)}: {edge.count}</strong><span> {edge.documents.join(' · ')}</span></li>)}</ul></div></details>
  </CaseFrame>;
}

type SearchMode = 'keyword' | 'semantic';
const keywordRanking = rankKeywordDocuments(SEARCH_QUERY, SEARCH_SNIPPETS);
const semanticRanking = [...SEARCH_SNIPPETS].sort((a, b) => a.semanticRank - b.semanticRank);

export function RetrievalCase({ reduced, onSolved }: WeekSevenCaseProps) {
  const [mode, setMode] = useState<SearchMode>('keyword');
  const [evidence, setEvidence] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const ranked = mode === 'keyword' ? keywordRanking.map(result => SEARCH_SNIPPETS.find(source => source.id === result.id)!) : semanticRanking;
  const assessment = answer ? assessEvidence(answer, evidence) : null;
  const solved = assessment?.grounded === true;
  useSolved(solved, WEEK_SEVEN_CASE_IDS.retrieval, onSolved);
  const chooseEvidence = (id: string) => {
    if (evidence.includes(id)) { setEvidence(previous => previous.filter(source => source !== id)); setNotice(''); }
    else if (evidence.length < 2) { setEvidence(previous => [...previous, id]); setNotice(''); }
    else setNotice('The evidence tray holds two sources. Remove one before adding another.');
  };
  const feedback = answer === 'unsupported'
    ? 'None of these sources says to send a password to support or promises an immediate unlock. Fluent wording cannot supply missing evidence.'
    : answer === 'contradicted'
      ? 'The twenty-four-hour claim conflicts with source C, which says thirty minutes. A citation does not repair a contradictory claim.'
      : assessment?.grounded
        ? 'The chain is complete: B supports the recovery action and email delivery; C supports the thirty-minute limit. Every claim is supported by your selected evidence.'
        : assessment
          ? `The wording can be grounded, but your tray is missing ${assessment.missing.map(id => `source ${id}`).join(' and ')}. Retrieve evidence for every claim, including the time limit.`
          : 'Choose up to two source documents, then select the answer their words can actually support.';

  return <CaseFrame name="retrieval" number="03" title="Retrieve. Then justify." instruction="Build a two-source evidence chain. A highly ranked document is useful only if it supports the answer." reduced={reduced} solved={solved} progress={`${evidence.length} / 2 SOURCES`}>
    <div className="w7-query-strip"><span>READER’S QUESTION</span><p>{SEARCH_QUERY}</p></div>
    <div className="w7-retrieval-toolbar"><div className="w7-ranking-switch" role="group" aria-label="Ranking method"><button type="button" aria-pressed={mode === 'keyword'} onClick={() => setMode('keyword')}>Keyword cosine <span>computed</span></button><button type="button" aria-pressed={mode === 'semantic'} onClick={() => setMode('semantic')}>Semantic order <span>authored illustration</span></button></div><button className="w7-retrieve-button" type="button" onClick={() => { setEvidence(ranked.slice(0, 2).map(source => source.id)); setNotice(''); }}>Retrieve top two <span aria-hidden="true">↓</span></button></div>
    <div className="w7-retrieval-layout">
      <div className="w7-source-stack" key={mode} aria-label={`${mode === 'keyword' ? 'Computed keyword' : 'Authored semantic'} ranking`}>
        {ranked.map((source, index) => {
          const keyword = keywordRanking.find(result => result.id === source.id)!;
          return <button type="button" className="w7-source-slip" key={source.id} aria-pressed={evidence.includes(source.id)} onClick={() => chooseEvidence(source.id)} style={{ animationDelay: reduced ? '0ms' : `${index * 45}ms` }}>
            <span className="w7-source-letter">{source.id}</span><span className="w7-source-content"><span className="w7-source-title"><strong>{source.title}</strong><span>#{index + 1} · {mode === 'keyword' ? `cos ${keyword.score.toFixed(3)}` : 'authored order'}</span></span><span className="w7-source-text">{source.text}</span></span><span className="w7-source-check" aria-hidden="true">{evidence.includes(source.id) ? '✓' : '+'}</span>
          </button>;
        })}
      </div>
      <div className="w7-answer-desk">
        <div className="w7-evidence-tray"><span className="w7-small-label">YOUR RETRIEVED EVIDENCE</span><div>{[0, 1].map(index => {
          const id = evidence[index];
          return id ? <button type="button" className="w7-source-ticket" key={`${index}:${id}`} onClick={() => chooseEvidence(id)} aria-label={`Remove source ${id}`}><b>{id}</b><span>{SEARCH_SNIPPETS.find(source => source.id === id)!.title}</span><span aria-hidden="true">×</span></button> : <span className="w7-empty-ticket" key={index}>Source {index + 1}</span>;
        })}</div></div>
        <fieldset className="w7-answer-choices"><legend>Which answer does the evidence support?</legend>{RETRIEVAL_ANSWERS.map((candidate, index) => <button type="button" className="w7-answer-option" key={candidate.id} aria-pressed={answer === candidate.id} onClick={() => { setAnswer(candidate.id); setNotice(''); }}><span>{String(index + 1).padStart(2, '0')}</span><span>{candidate.text}</span></button>)}</fieldset>
        <div className={`w7-feedback ${assessment ? solved ? 'is-correct' : 'is-incorrect' : ''}`} aria-live="polite" aria-atomic="true"><strong>{notice || (solved ? 'Evidence chain verified.' : assessment ? 'Check the chain.' : 'An answer needs more than a relevant topic.')}</strong><p>{feedback}</p></div>
      </div>
    </div>
    <footer className="w7-case-foot"><p><strong>Scope:</strong> four invented help documents, not real account advice. Keyword scores are exact binary-vector cosine. The semantic order is hand-authored to illustrate meaning; no embedding model was run, and dense retrieval is not always better.</p><button type="button" onClick={() => { setMode('keyword'); setEvidence([]); setAnswer(null); setNotice(''); }}>Reset retrieval</button></footer>
    <details className="w7-method"><summary>Inspect the ranking calculation and its limits <span aria-hidden="true">+</span></summary><div className="w7-method-columns"><div><p>Each retained word is a binary vector coordinate: present = 1, absent = 0. Cosine = shared unique words / √(query word count × document word count). Repetition gives no extra weight. Equal scores are ordered by source ID.</p><p><strong>Query coordinates:</strong> {keywordRanking[0].queryTerms.join(' · ')}. There is no stemming, synonym expansion, TF–IDF weighting or trained model.</p><p><strong>Stop list:</strong> {[...SEARCH_STOPWORDS].join(', ')}.</p></div><div><ul>{SEARCH_SNIPPETS.map(source => <li key={source.id}><strong>{source.id}: </strong>{source.relevance}. <span>Shared query words: {keywordRanking.find(result => result.id === source.id)!.overlap.join(', ') || 'none'}.</span></li>)}</ul><p>Changing the semantic order here illustrates a retrieval hypothesis, not a measured improvement. In a real system, evaluate the model and evidence on representative queries before trusting it.</p></div></div></details>
  </CaseFrame>;
}
