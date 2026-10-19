import ContextLab from './ContextLab';
import { useId, useMemo, useState } from 'react';
import { countTokens, cosine, DEFAULT_STOPWORDS, tfidf, tokenize } from './math';

const initialText = 'The city needs a hero. The hero needs a friend. A friend knows the city. Heroes protect the city, but who protects the heroes?';
const initialDocuments = [
  'The mutant superpower was wild and dangerous.',
  'The superpower felt wild and very dangerous.',
  'The Avengers assembled before the battle.',
];
const colors = ['#a6dfc2', '#f49f8e', '#a8b9ff'];

function TokenLab() {
  const id = useId();
  const [text, setText] = useState(initialText);
  const [lowercase, setLowercase] = useState(true);
  const [removeStopwords, setRemoveStopwords] = useState(false);
  const [logarithmic, setLogarithmic] = useState(false);
  const [selected, setSelected] = useState('the');
  const tokens = useMemo(() => tokenize(text, { lowercase, removeStopwords }), [text, lowercase, removeStopwords]);
  const ranked = useMemo(() => Object.entries(countTokens(tokens)).map(([term, count]) => ({ term, count }))
    .sort((a, b) => b.count - a.count || a.term.localeCompare(b.term)), [tokens]);
  const hapaxes = ranked.filter(item => item.count === 1).length;
  const selectedItem = ranked.find(item => item.term === selected);
  const maxCount = ranked[0]?.count ?? 1;
  const xMax = Math.max(2, ranked.length);
  const yMax = Math.max(2, maxCount);
  const xPosition = (rank: number) => 62 + (logarithmic ? Math.log(rank) / Math.log(xMax) : (rank - 1) / (xMax - 1)) * 500;
  const yPosition = (count: number) => 262 - (logarithmic ? Math.log(count) / Math.log(yMax) : count / yMax) * 218;
  const xTicks = [...new Set([1, Math.ceil(xMax / 2), xMax])];
  const yTicks = logarithmic ? [...new Set([1, Math.max(1, Math.round(Math.sqrt(yMax))), yMax])] : [...new Set([0, Math.ceil(yMax / 2), yMax])];

  return <div className="lab-grid">
    <div className="lab-controls">
      <p className="lab-note">SYNTHETIC TEXT · YOUR WORDS, EXACT COUNTS</p>
      <label className="control" htmlFor={`${id}-text`}>
        <span>Edit the corpus</span>
        <textarea id={`${id}-text`} aria-label="Edit the corpus" rows={6} maxLength={4000} value={text} onChange={event => setText(event.target.value)} spellCheck={false} />
      </label>
      <label className="control"><input type="checkbox" checked={lowercase} onChange={event => setLowercase(event.target.checked)} /> Lowercase before counting</label>
      <label className="control"><input type="checkbox" checked={removeStopwords} onChange={event => setRemoveStopwords(event.target.checked)} /> Remove the teaching stopword list</label>
      <div className="segmented" role="group" aria-label="Frequency chart axes">
        <button type="button" aria-pressed={!logarithmic} onClick={() => setLogarithmic(false)}>Linear axes</button>
        <button type="button" aria-pressed={logarithmic} onClick={() => setLogarithmic(true)}>Log–log axes</button>
      </div>
      <button type="button" onClick={() => { setText(initialText); setLowercase(true); setRemoveStopwords(false); setSelected('the'); }}>Reset example</button>
      <p className="lab-note">The rule: Unicode letters and numbers form tokens. Internal apostrophes stay; hyphens split; punctuation disappears. This is a simple teaching tokenizer, not spaCy or BPE.</p>
      <details>
        <summary>See the exact stopword list</summary>
        <p className="lab-note">{DEFAULT_STOPWORDS.join(', ')}. Matching is case-sensitive when lowercasing is off.</p>
      </details>
      <p className="lab-note">Try adding “The” and “the”, then turn lowercasing off. Predict which count changes before looking.</p>
    </div>
    <div className="lab-visual">
      <div className="metric-row" aria-live="polite" aria-atomic="true">
        <div className="metric"><strong>{tokens.length}</strong><span>tokens</span></div>
        <div className="metric"><strong>{ranked.length}</strong><span>types</span></div>
        <div className="metric"><strong>{hapaxes}</strong><span>hapax types</span></div>
      </div>
      <svg className="chart" viewBox="0 0 600 320" role="img" aria-labelledby={`${id}-chart-title ${id}-chart-desc`}>
        <title id={`${id}-chart-title`}>Observed rank-frequency curve of your text</title>
        <desc id={`${id}-chart-desc`}>{ranked.length} distinct types ranked by occurrence count, on {logarithmic ? 'logarithmic' : 'linear'} axes. Exact values are available in the frequency table below. This is not a fitted Zipf model.</desc>
        {yTicks.map(value => <g key={value}>
          <line x1="62" x2="562" y1={yPosition(value)} y2={yPosition(value)} stroke="currentColor" opacity=".12" />
          <text x="49" y={yPosition(value) + 4} textAnchor="end" fill="currentColor" fontSize="11">{value}</text>
        </g>)}
        {xTicks.map(value => <g key={value}>
          <line x1={xPosition(value)} x2={xPosition(value)} y1="262" y2="267" stroke="currentColor" opacity=".4" />
          <text x={xPosition(value)} y="283" textAnchor="middle" fill="currentColor" fontSize="11">{value}</text>
        </g>)}
        <text x="310" y="310" textAnchor="middle" fill="currentColor" fontSize="12">Frequency rank {logarithmic ? '(log scale)' : '(linear scale)'}</text>
        <text x="18" y="150" textAnchor="middle" transform="rotate(-90 18 150)" fill="currentColor" fontSize="12">Occurrences {logarithmic ? '(log scale)' : ''}</text>
        <line x1="62" x2="562" y1="262" y2="262" stroke="currentColor" opacity=".4" />
        {ranked.length > 0 && <path d={ranked.map((item, index) => `${index === 0 ? 'M' : 'L'}${xPosition(index + 1)},${yPosition(item.count)}`).join(' ')} stroke="var(--accent, #a6dfc2)" strokeWidth="2" fill="none" />}
        {ranked.map((item, index) => <circle key={item.term} cx={xPosition(index + 1)} cy={yPosition(item.count)} r={item.term === selected ? 6 : 3.5} fill="var(--accent, #a6dfc2)" opacity={item.term === selected ? 1 : .7}>
          <title>{item.term}: rank {index + 1}, {item.count} occurrences</title>
        </circle>)}
        {!ranked.length && <text x="312" y="150" fill="currentColor" textAnchor="middle" fontSize="16">Add some text to create a distribution.</text>}
        {ranked[0] && <text x="75" y="27" fill="currentColor" fontSize="13">Most frequent: “{ranked[0].term.slice(0, 28)}” × {ranked[0].count}</text>}
      </svg>
      <p className="lab-note">Every dot is counted from the text above. Equal counts receive consecutive ranks, ordered alphabetically. Switching axes changes the display, never the counts. A straight line would not prove Zipf’s law.</p>
      <div className="token-cloud" aria-label="Token occurrences in reading order">
        {tokens.slice(0, 90).map((token, index) => <button type="button" className="token" key={`${index}-${token}`} aria-pressed={token === selected} onClick={() => setSelected(token)}>{token}</button>)}
      </div>
      {tokens.length > 90 && <p className="lab-note">First 90 tokens shown; all {tokens.length} are counted.</p>}
      {selectedItem && <p className="lab-note" aria-live="polite">“{selectedItem.term}” occurs {selectedItem.count} times: {selectedItem.count}/{tokens.length} = {(selectedItem.count / tokens.length).toFixed(4)} of the retained tokens.</p>}
      <details>
        <summary>Inspect the complete frequency table ({ranked.length} types)</summary>
        <div className="data-table" tabIndex={0} role="region" aria-label="Scrollable frequency data">
          <table><caption>Exact counts after the selected preprocessing</caption><thead><tr><th scope="col">Rank</th><th scope="col">Type</th><th scope="col">Count</th><th scope="col">Relative frequency</th></tr></thead>
            <tbody>{ranked.map((item, index) => <tr key={item.term}><td>{index + 1}</td><th scope="row">{item.term}</th><td>{item.count}</td><td>{(item.count / tokens.length).toFixed(4)}</td></tr>)}</tbody>
          </table>
        </div>
      </details>
    </div>
  </div>;
}

function MeaningLab() {
  const id = useId();
  const [documents, setDocuments] = useState(initialDocuments);
  const [weighted, setWeighted] = useState(true);
  const [removeStopwords, setRemoveStopwords] = useState(false);
  const [selected, setSelected] = useState('superpower');
  const result = useMemo(() => tfidf(documents, { lowercase: true, removeStopwords }), [documents, removeStopwords]);
  const matrix = weighted ? result.vectors : result.counts;
  const selectedIndex = Math.max(0, result.vocabulary.indexOf(selected));
  const selectedTerm = result.vocabulary[selectedIndex];
  const visibleTerms = result.vocabulary.map((term, index) => ({ term, index, total: matrix.reduce((sum, row) => sum + row[index], 0) }))
    .sort((a, b) => b.total - a.total || a.term.localeCompare(b.term)).slice(0, 7);
  const largest = Math.max(0, ...visibleTerms.flatMap(term => matrix.map(row => row[term.index])));
  const scaleMax = largest > 0 ? largest : 1;
  const hasDirection = matrix.map(row => row.some(value => value !== 0));
  const scores = matrix.map((row, a) => matrix.map((other, b) => hasDirection[a] && hasDirection[b] ? cosine(row, other) : null));

  return <div className="lab-grid">
    <div className="lab-controls">
      <p className="lab-note">SYNTHETIC TEACHING CORPUS · N = 3</p>
      {documents.map((document, index) => <label className="control" htmlFor={`${id}-document-${index}`} key={index}>
        <span>Document {index + 1}</span>
        <textarea id={`${id}-document-${index}`} aria-label={`Document ${index + 1}`} rows={3} maxLength={1200} value={document} onChange={event => setDocuments(current => current.map((text, position) => position === index ? event.target.value : text))} spellCheck={false} />
      </label>)}
      <div className="segmented" role="group" aria-label="Document representation">
        <button type="button" aria-pressed={!weighted} onClick={() => setWeighted(false)}>Raw counts</button>
        <button type="button" aria-pressed={weighted} onClick={() => setWeighted(true)}>TF-IDF</button>
      </div>
      <label className="control"><input type="checkbox" checked={removeStopwords} onChange={event => setRemoveStopwords(event.target.checked)} /> Remove teaching stopwords</label>
      <button type="button" onClick={() => { setDocuments(initialDocuments); setWeighted(true); setRemoveStopwords(false); setSelected('superpower'); }}>Reset teaching example</button>
      <p className="lab-note">Try adding “mutant” to D3. Its document frequency rises, so its IDF falls everywhere. Then put the same text in all three boxes: every TF-IDF vector becomes zero.</p>
      <p className="lab-note">Lowercased Unicode words/numbers; internal apostrophes stay, hyphens split, punctuation is discarded. No stemming or lemmatization. Empty documents still count toward N=3.</p>
    </div>
    <div className="lab-visual">
      <div className="metric-row" aria-live="polite" aria-atomic="true">
        <div className="metric"><strong>{result.vocabulary.length}</strong><span>shared dimensions</span></div>
        <div className="metric"><strong>{result.tokens.reduce((sum, tokens) => sum + tokens.length, 0)}</strong><span>retained tokens</span></div>
        <div className="metric"><strong>{scores[0][1] === null ? '—' : scores[0][1].toFixed(3)}</strong><span>D1 ↔ D2 cosine</span></div>
      </div>
      <svg className="chart" viewBox="0 0 600 320" role="img" aria-labelledby={`${id}-chart-title ${id}-chart-desc`}>
        <title id={`${id}-chart-title`}>Three document vectors, compared term by term</title>
        <desc id={`${id}-chart-desc`}>Grouped horizontal bars show {weighted ? 'TF-IDF weight' : 'raw count'} for up to seven terms with the highest total value. Full values are in the table below. D1 mint, D2 coral, D3 blue; each bar is also labeled with the document number.</desc>
        {[0, .5, 1].map(fraction => <g key={fraction}>
          <line x1={140 + fraction * 365} x2={140 + fraction * 365} y1="40" y2="276" stroke="currentColor" opacity=".12" />
          <text x={140 + fraction * 365} y="294" textAnchor="middle" fill="currentColor" fontSize="11">{weighted ? (scaleMax * fraction).toFixed(3) : (scaleMax * fraction).toFixed(1)}</text>
        </g>)}
        <text x="320" y="315" textAnchor="middle" fill="currentColor" fontSize="12">{weighted ? 'TF-IDF weight (relative TF × natural-log IDF)' : 'Token occurrences'}</text>
        {visibleTerms.map((term, rank) => {
          const y = 46 + rank * 33;
          return <g key={term.term}>
            <text x="105" y={y + 15} textAnchor="end" fill="currentColor" fontSize="11">{term.term.length > 13 ? `${term.term.slice(0, 12)}…` : term.term}<title>{term.term}</title></text>
            {matrix.map((row, document) => <g key={document}>
              <text x="130" y={y + document * 8 + 6} fill={colors[document]} textAnchor="end" fontSize="7">{document + 1}</text>
              <rect x="140" y={y + document * 8} width={row[term.index] / scaleMax * 365} height="6" rx="2" fill={colors[document]}>
                <title>{term.term}, D{document + 1}: {row[term.index].toFixed(weighted ? 6 : 0)}</title>
              </rect>
            </g>)}
          </g>;
        })}
        {documents.map((_, document) => <g key={document}><rect x={140 + document * 110} y="15" width="12" height="7" rx="2" fill={colors[document]} /><text x={158 + document * 110} y="23" fill="currentColor" fontSize="11">Document {document + 1}</text></g>)}
        {!visibleTerms.length && <text x="310" y="158" fill="currentColor" textAnchor="middle" fontSize="16">Enter text to create vocabulary dimensions.</text>}
      </svg>
      <p className="lab-note">Top {visibleTerms.length} terms by total {weighted ? 'TF-IDF weight' : 'count'} shown. Bars share an exact scale; all {result.vocabulary.length} dimensions are used for cosine. Chart scale adjusts when values change.</p>
      <div className="data-table" tabIndex={0} role="region" aria-label="Cosine similarities">
        <table><caption>Cosine between complete {weighted ? 'TF-IDF' : 'count'} vectors</caption><thead><tr><th scope="col">Compare</th>{documents.map((_, index) => <th key={index} scope="col">D{index + 1}</th>)}</tr></thead>
          <tbody>{scores.map((row, index) => <tr key={index}><th scope="row">D{index + 1}</th>{row.map((score, column) => <td key={column}>{score === null ? <abbr title="A zero vector has no direction; cosine is undefined.">undefined</abbr> : score.toFixed(3)}</td>)}</tr>)}</tbody>
        </table>
      </div>
      {!hasDirection.every(Boolean) && <p className="lab-note" role="status">At least one vector is zero. Its cosine is mathematically undefined, so those cells have no numerical score.</p>}
      <label className="control" htmlFor={`${id}-term`}><span>Follow one term through the calculation</span>
        <select id={`${id}-term`} aria-label="Follow one term through the calculation" value={selectedTerm ?? ''} onChange={event => setSelected(event.target.value)} disabled={!result.vocabulary.length}>
          {!result.vocabulary.length && <option value="">No vocabulary yet</option>}
          {result.vocabulary.map(term => <option key={term} value={term}>{term}</option>)}
        </select>
      </label>
      {selectedTerm && <div className="lab-note" aria-live="polite">
        <p><strong>{selectedTerm}</strong> occurs in {result.documentFrequencies[selectedIndex]} of 3 documents. IDF = ln(3/{result.documentFrequencies[selectedIndex]}) = {result.idf[selectedIndex].toFixed(4)}.</p>
        {documents.map((_, index) => <p key={index}>D{index + 1}: {result.tokens[index].length ? `${result.counts[index][selectedIndex]}/${result.tokens[index].length}` : '0 (empty document)'} × {result.idf[selectedIndex].toFixed(4)} = <strong>{result.vectors[index][selectedIndex].toFixed(4)}</strong> TF-IDF.</p>)}
      </div>}
      <details>
        <summary>Inspect every dimension ({result.vocabulary.length} terms)</summary>
        <div className="data-table" tabIndex={0} role="region" aria-label="Complete document-term values">
          <table><caption>{weighted ? 'TF-IDF weights' : 'Raw counts'} · lowercase, unsmoothed IDF; no added constant</caption><thead><tr><th scope="col">Term</th><th scope="col">DF</th><th scope="col">IDF</th><th scope="col">D1</th><th scope="col">D2</th><th scope="col">D3</th></tr></thead>
            <tbody>{result.vocabulary.map((term, index) => <tr key={term}><th scope="row">{term}</th><td>{result.documentFrequencies[index]}</td><td>{result.idf[index].toFixed(3)}</td>{matrix.map((row, document) => <td key={document}>{row[index].toFixed(weighted ? 3 : 0)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </details>
      <p className="lab-note">TF = count / retained document length. IDF = ln(3/DF). This follows the course definition; scikit-learn’s default adds smoothing and +1. The teaching stopword list is a, an, and, are, as, at, be, by, for, from, in, is, it, of, on, or, that, the, this, to, was, were, with.</p>
    </div>
  </div>;
}

export default function LanguageLabs({ kind }: { kind: string }) {
  return kind === 'meaning' ? <><MeaningLab /><ContextLab /></> : <TokenLab />;
}
