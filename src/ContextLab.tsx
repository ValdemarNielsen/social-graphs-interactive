import { useMemo, useState } from 'react';
import { cosine } from './math';

const WORDS = ['cat', 'dog', 'car'];
const CONTEXTS = ['purr', 'bark', 'road'];
const INITIAL_COUNTS = [[8, 1, 0], [1, 8, 1], [0, 1, 9]];
const decimal = (value: number, places = 4) => value.toFixed(places);

export default function ContextLab() {
  const [counts, setCounts] = useState(INITIAL_COUNTS);
  const [mode, setMode] = useState<'counts' | 'ppmi'>('ppmi');
  const [selected, setSelected] = useState<[number, number]>([0, 0]);
  const [firstWord, setFirstWord] = useState(0);
  const [secondWord, setSecondWord] = useState(1);

  const calculation = useMemo(() => {
    const rowTotals = counts.map(row => row.reduce((a, b) => a + b, 0));
    const columnTotals = CONTEXTS.map((_, column) => counts.reduce((sum, row) => sum + row[column], 0));
    const total = rowTotals.reduce((a, b) => a + b, 0);
    const pmi = counts.map((row, word) => row.map((count, context) => count > 0 && total > 0
      ? Math.log2(count * total / (rowTotals[word] * columnTotals[context]))
      : null));
    const ppmi = pmi.map(row => row.map(value => value === null ? 0 : Math.max(0, value)));
    return { rowTotals, columnTotals, total, pmi, ppmi };
  }, [counts]);

  const { rowTotals, columnTotals, total, pmi, ppmi } = calculation;
  const [word, context] = selected;
  const count = counts[word][context];
  const selectedPmi = pmi[word][context];
  const displayed = mode === 'counts' ? counts : ppmi;
  const first = displayed[firstWord];
  const second = displayed[secondWord];
  const zeroRow = first.every(value => value === 0) || second.every(value => value === 0);
  const similarity = zeroRow ? null : cosine(first, second);

  const updateCount = (row: number, column: number, raw: string) => {
    const parsed = raw === '' ? 0 : Number(raw);
    if (!Number.isFinite(parsed)) return;
    const value = Math.max(0, Math.min(99, Math.floor(parsed)));
    setCounts(current => current.map((values, i) => i === row ? values.map((existing, j) => j === column ? value : existing) : values));
    setSelected([row, column]);
  };

  return <div className="sub-lab">
    <p className="eyebrow">Context laboratory</p>
    <h3>Common together, or surprisingly common together?</h3>
    <p>Raw counts mix association with popularity. PMI compares an observed word–context pair with the frequency expected if words and contexts were independent. PPMI keeps only the positive part.</p>
    <p className="lab-note">Synthetic 3 × 3 count matrix · one count represents one observed word–context event. These are illustrative context labels, not measurements from a corpus. PMI uses logarithms to base 2, so its unit is bits.</p>

    <div className="lab-grid">
      <div className="lab-controls">
        <h3>Write the evidence.</h3>
        <p>Edit any count from 0 to 99. Row and column totals define the empirical marginal probabilities.</p>
        <table className="data-table">
          <caption>Observed word × context counts</caption>
          <thead><tr><th scope="col">Word</th>{CONTEXTS.map(label => <th key={label} scope="col">{label}</th>)}<th scope="col">Total</th></tr></thead>
          <tbody>{counts.map((row, i) => <tr key={WORDS[i]}><th scope="row">{WORDS[i]}</th>{row.map((value, j) => <td key={CONTEXTS[j]}>
            <input className="context-count" type="number" min="0" max="99" step="1" inputMode="numeric" value={value} style={{ width: '6ch', maxWidth: '100%' }}
              aria-label={`Count for ${WORDS[i]} with ${CONTEXTS[j]}`} onFocus={() => setSelected([i, j])}
              onChange={event => updateCount(i, j, event.target.value)} />
          </td>)}<td>{rowTotals[i]}</td></tr>)}</tbody>
          <tfoot><tr><th scope="row">Total</th>{columnTotals.map((value, i) => <td key={i}>{value}</td>)}<td><strong>{total}</strong></td></tr></tfoot>
        </table>
        <div className="lab-actions"><button type="button" onClick={() => setCounts(INITIAL_COUNTS)}>Reset counts</button><button type="button" onClick={() => setCounts(WORDS.map(() => CONTEXTS.map(() => 0)))}>Clear counts</button></div>
      </div>

      <div className="lab-visual">
        <h3>Read the representation.</h3>
        <div className="segmented" role="group" aria-label="Word-context representation">
          <button type="button" aria-pressed={mode === 'counts'} onClick={() => setMode('counts')}>Raw counts</button>
          <button type="button" aria-pressed={mode === 'ppmi'} onClick={() => setMode('ppmi')}>PPMI weights</button>
        </div>
        <table className="data-table">
          <caption>{mode === 'counts' ? 'Raw event counts' : 'Positive PMI in bits, rounded to 3 decimals'} · select a pair</caption>
          <thead><tr><th scope="col">Word</th>{CONTEXTS.map(label => <th key={label} scope="col">{label}</th>)}</tr></thead>
          <tbody>{displayed.map((row, i) => <tr key={WORDS[i]}><th scope="row">{WORDS[i]}</th>{row.map((value, j) => <td key={CONTEXTS[j]}>
            <button type="button" aria-pressed={word === i && context === j} aria-label={`Inspect ${WORDS[i]} with ${CONTEXTS[j]}: ${mode === 'counts' ? value + ' counts' : decimal(value, 3) + ' bits'}`}
              onClick={() => setSelected([i, j])}>{mode === 'counts' ? value : decimal(value, 3)}</button>
          </td>)}</tr>)}</tbody>
        </table>
        <p className="lab-note">PPMI(w,c) = max[0, log₂(P(w,c) / (P(w)P(c)))]. A zero weight can mean no observation or an association no stronger than independence.</p>
      </div>
    </div>

    <div className="selection-note" aria-live="polite">
      <strong>{WORDS[word]} × {CONTEXTS[context]}</strong>
      {total === 0 ? <p>The matrix is empty. There is no empirical probability distribution: P(w,c), P(w), P(c), and PMI are undefined. The displayed PPMI entries remain zero by convention.</p> : <>
        <p>P(w,c) = {count}/{total} = {decimal(count / total)}; P(w) = {rowTotals[word]}/{total} = {decimal(rowTotals[word] / total)}; P(c) = {columnTotals[context]}/{total} = {decimal(columnTotals[context] / total)}.</p>
        {selectedPmi === null ? <p>No co-occurrence was observed in this cell. Its logarithm has no finite value{rowTotals[word] === 0 || columnTotals[context] === 0 ? ', and a zero marginal also makes the probability ratio undefined' : ''}. This lab assigns PPMI = 0.</p> : <p>PMI = log₂[({count} × {total}) / ({rowTotals[word]} × {columnTotals[context]})] = {decimal(selectedPmi)} bits. PPMI = max(0, {decimal(selectedPmi)}) = {decimal(ppmi[word][context])} bits. {selectedPmi > 0 ? 'The pair occurs more often than independence predicts.' : selectedPmi < 0 ? 'The pair occurs less often than independence predicts, so PPMI clips its negative score to zero.' : 'The observed frequency equals the independence expectation.'}</p>}
      </>}
    </div>

    <div className="lab-grid">
      <div className="lab-controls"><h3>A word is now a row vector.</h3><p>Compare two words by the direction of their context profiles. Switch between counts and PPMI above to see how reweighting changes their similarity.</p>
        <label className="control">First word<select aria-label="First word" value={firstWord} onChange={event => setFirstWord(Number(event.target.value))}>{WORDS.map((label, i) => <option key={label} value={i}>{label}</option>)}</select></label>
        <label className="control">Second word<select aria-label="Second word" value={secondWord} onChange={event => setSecondWord(Number(event.target.value))}>{WORDS.map((label, i) => <option key={label} value={i}>{label}</option>)}</select></label>
      </div>
      <div className="lab-visual"><div className="metric-row" aria-live="polite"><div className="metric"><strong>{similarity === null ? 'Undefined' : decimal(similarity)}</strong><span>cosine of {mode === 'counts' ? 'count' : 'PPMI'} rows</span></div></div>
        <p>{WORDS[firstWord]} = [{first.map(value => formatVector(value, mode)).join(', ')}]<br />{WORDS[secondWord]} = [{second.map(value => formatVector(value, mode)).join(', ')}]</p>
        <p className="lab-note">{zeroRow ? 'At least one selected row is a zero vector. Its direction, and therefore cosine similarity, is undefined.' : 'Cosine = (a · b) / (‖a‖ ‖b‖). Calculations use full precision; displayed entries are rounded.'}</p>
      </div>
    </div>
    <p className="lab-note">These explicit count and PPMI vectors demonstrate distributional context. They are not learned Word2Vec embeddings: no prediction objective, optimization, negative sampling, or dense representation is trained here.</p>
  </div>;
}

function formatVector(value: number, mode: 'counts' | 'ppmi'): string {
  return mode === 'counts' ? String(value) : value.toFixed(3);
}
