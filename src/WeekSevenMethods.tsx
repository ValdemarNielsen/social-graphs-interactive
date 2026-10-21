import { useState } from 'react';

const methods = [
  { title: 'LDA', label: 'A mixture for every document', body: 'A document can be partly about several topics. Each topic is a distribution over words; these invented proportions show the shape of that output.', question: 'Which vocabulary patterns tend to occur together?', result: 'Mixed membership', caption: 'The bars are authored topic proportions, not a trained model.' },
  { title: 'BERTopic', label: 'Clusters in a semantic space', body: 'Embed documents, reduce dimensions, cluster, then describe the clusters with weighted terms. A document may be left outside the clusters. The choices in that pipeline matter.', question: 'Which documents have similar embedding representations?', result: 'Clusters + possible outliers', caption: 'Illustrative cluster assignments; no BERTopic model is running.' },
  { title: 'Communities', label: 'Groups defined by edges', body: 'A graph groups nodes through their connections. A character’s links and the language on their page are different evidence: similar topics need not produce the same communities.', question: 'Which nodes are densely connected under the chosen graph definition?', result: 'A partition of a graph', caption: 'A chosen six-node graph and partition, not an optimization result.' },
];
const positions = [
  [[86, 92], [226, 92], [366, 92], [506, 92], [646, 92], [786, 92]],
  [[140, 70], [242, 138], [360, 70], [535, 115], [651, 64], [790, 178]],
  [[110, 65], [250, 65], [180, 170], [570, 65], [710, 65], [640, 170]],
];
const proportions = [[.7, .2, .1], [.5, .35, .15], [.15, .75, .1], [.25, .35, .4], [.1, .2, .7], [.33, .33, .34]];
const edges = [[0, 1], [0, 2], [1, 2], [2, 3], [3, 4], [3, 5], [4, 5]];
const fills = ['#3159b7', '#ba442d', '#698074'];

export default function WeekSevenMethods({ reduced }: { reduced: boolean }) {
  const [selected, setSelected] = useState(0);
  const method = methods[selected];
  const coords = positions[selected];
  return <section className="w7-methods" data-reduced={reduced} aria-labelledby="w7-method-title">
    <div className="wrap">
      <div className="w7-method-heading"><div><p className="w7-kicker">The instrument changes the question</p><h2 id="w7-method-title">Three kinds of <em>together.</em></h2></div><p>Same six document IDs.<br/>Three different kinds of output.</p></div>
      <div className="w7-method-switch" role="group" aria-label="Compare grouping methods">{methods.map((m, i) => <button key={m.title} aria-pressed={selected === i} onClick={() => setSelected(i)}><span>0{i + 1}</span>{m.title}<i aria-hidden="true">{selected === i ? '●' : '○'}</i></button>)}</div>
      <div className="w7-method-stage">
        <svg viewBox="0 0 900 260" role="img" aria-label={`${method.title}: ${method.result}. ${method.caption}`}>
          <g className="w7-method-regions" style={{ opacity: selected === 1 ? 1 : 0 }} fill="none" stroke="#b3b8ad" strokeDasharray="4 6"><ellipse cx="252" cy="105" rx="180" ry="100"/><ellipse cx="600" cy="100" rx="126" ry="92"/></g>
          <g className="w7-method-edges" style={{ opacity: selected === 2 ? 1 : 0 }} stroke="#24332f" strokeWidth="1.5">{edges.map(([a, b]) => <path key={`${a}-${b}`} d={`M${coords[a][0] + 25},${coords[a][1] + 28} L${coords[b][0] + 25},${coords[b][1] + 28}`}/>)}</g>
          {coords.map(([x, y], i) => <g className="w7-method-document" key={i} style={{ transform: `translate(${x}px, ${y}px)` }}>
            <rect x="3" y="4" width="62" height="76" fill="#24332f" opacity=".1"/><path d="M0 0H46L62 16V76H0Z" fill="#faf8f0" stroke={selected === 2 ? (i < 3 ? fills[0] : fills[1]) : '#777e75'}/><path d="M46 0V16H62" fill="none" stroke="#777e75"/>
            <text x="11" y="32" fill="#24332f">D{i + 1}</text>
            <g opacity={selected === 0 ? 1 : 0}>{proportions[i].map((p, j) => <rect key={j} x={10 + proportions[i].slice(0, j).reduce((a, b) => a + b, 0) * 42} y="50" width={p * 42} height="8" fill={fills[j]}/>)}</g>
            <path d="M11 45H42M11 52H33M11 59H39" stroke="#b3b8ad" opacity={selected !== 0 ? 1 : 0}/>
          </g>)}
        </svg>
        <p className="w7-method-caption">{method.caption}</p>
      </div>
      <div className="w7-method-explanation" aria-live="polite"><div><span>{method.result}</span><h3>{method.label}</h3></div><p>{method.body}</p><p><small>The question it asks</small>{method.question}</p></div>
    </div>
  </section>;
}
