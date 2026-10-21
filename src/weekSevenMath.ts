export type SentimentLabel = 'positive' | 'negative';

export const SENTIMENT_LEXICON: Readonly<Record<string, number>> = {
  wonderful: 2, good: 1, bad: -1, terrible: -2,
};

/** A deliberately small, disclosed rule. Zero is no binary decision. */
export function scoreSentiment(text: string): { score: number; label: SentimentLabel | null; matches: { word: string; value: number }[] } {
  const matches = (text.toLowerCase().match(/[a-z]+/g) ?? [])
    .filter(word => Object.hasOwn(SENTIMENT_LEXICON, word))
    .map(word => ({ word, value: SENTIMENT_LEXICON[word] }));
  const score = matches.reduce((sum, match) => sum + match.value, 0);
  return { score, label: score > 0 ? 'positive' : score < 0 ? 'negative' : null, matches };
}

export const SENTIMENT_ITEMS: readonly {
  id: string; text: string; gold: SentimentLabel; reason: string; phenomenon: string;
}[] = [
  { id: 'S1', text: 'The workshop was wonderful.', gold: 'positive', phenomenon: 'Direct praise', reason: 'The praise is direct. The positive lexicon score agrees with this authored reference judgment.' },
  { id: 'S2', text: 'The ending was terrible.', gold: 'negative', phenomenon: 'Direct criticism', reason: 'The negative word describes the experience directly. Here, a word-level rule is enough.' },
  { id: 'S3', text: 'This was not good.', gold: 'negative', phenomenon: 'Negation', reason: '“Not” changes the meaning of “good”. The rule sees good = +1 but never reads the negation.' },
  { id: 'S4', text: 'Wonderful. Another three-hour delay.', gold: 'negative', phenomenon: 'Sarcasm in context', reason: 'For this exercise, the delay makes “Wonderful” sarcastic. That is an authored interpretation, not an objective property of the word; more context could change a real annotation.' },
  { id: 'S5', text: 'It was not bad at all.', gold: 'positive', phenomenon: 'Negation', reason: '“Not bad at all” expresses approval here. The rule counts bad = −1 and misses the scope of “not”.' },
  { id: 'S6', text: 'A good start, but the terrible ending ruined it.', gold: 'negative', phenomenon: 'Mixed evidence', reason: 'The reference judgment follows the overall negative evaluation. The sum +1 − 2 = −1 happens to agree; the rule still does not understand “but” or the ending.' },
];

export function binaryConfusion(predictions: readonly SentimentLabel[], gold: readonly SentimentLabel[]) {
  if (predictions.length !== gold.length) throw new RangeError('Predictions and reference labels must have equal lengths.');
  let tp = 0, fp = 0, tn = 0, fn = 0;
  for (let i = 0; i < gold.length; i++) {
    if (!['positive', 'negative'].includes(predictions[i]) || !['positive', 'negative'].includes(gold[i])) throw new RangeError('Only positive and negative labels are accepted.');
    if (predictions[i] === 'positive') { if (gold[i] === 'positive') tp++; else fp++; }
    else if (gold[i] === 'positive') fn++; else tn++;
  }
  const total = gold.length;
  return {
    tp, fp, tn, fn, total,
    accuracy: total ? (tp + tn) / total : null,
    precision: tp + fp ? tp / (tp + fp) : null,
    recall: tp + fn ? tp / (tp + fn) : null,
    f1: 2 * tp + fp + fn ? 2 * tp / (2 * tp + fp + fn) : null,
  };
}

export type EntityDecision = 'merge' | 'separate';
export type EntityDocument = { id: string; text: string; mentions: readonly string[] };
export const ENTITY_MENTIONS = [
  { id: 'apple-brand', label: 'Apple', kind: 'company', x: 102, y: 67 },
  { id: 'apple-inc', label: 'Apple Inc.', kind: 'company alias', x: 315, y: 67 },
  { id: 'jordan-person', label: 'Jordan Lee', kind: 'person', x: 62, y: 180 },
  { id: 'jordan-country', label: 'Jordan', kind: 'country', x: 357, y: 180 },
  { id: 'apple-fruit', label: 'apple', kind: 'fruit', x: 136, y: 288 },
  { id: 'greece', label: 'Greece', kind: 'country', x: 290, y: 288 },
] as const;

/** All documents and identities are synthetic. Fruit is a candidate mention,
 * deliberately included to show why matching a string is not NER. */
export const ENTITY_DOCUMENTS: readonly EntityDocument[] = [
  { id: 'D1', text: 'Apple hired Jordan Lee to lead the design team.', mentions: ['apple-brand', 'jordan-person'] },
  { id: 'D2', text: 'Jordan Lee ate an apple beside the river.', mentions: ['jordan-person', 'apple-fruit'] },
  { id: 'D3', text: 'Apple Inc. opened a research lab in Jordan.', mentions: ['apple-inc', 'jordan-country'] },
  { id: 'D4', text: 'Jordan imported apples from Greece.', mentions: ['jordan-country', 'apple-fruit', 'greece'] },
  { id: 'D5', text: 'Apple, also called Apple Inc., sponsored Jordan Lee.', mentions: ['apple-brand', 'apple-inc', 'jordan-person'] },
];

export const ENTITY_PAIRS: readonly {
  id: string; left: string; right: string; leftContext: string; rightContext: string;
  correct: EntityDecision; reason: string;
}[] = [
  { id: 'apple-senses', left: 'apple-brand', right: 'apple-fruit', leftContext: 'Apple hired Jordan Lee.', rightContext: 'Jordan Lee ate an apple.', correct: 'separate', reason: 'The company and the fruit have the same surface form but different referents. The fruit is not a named organization. Merging them invents a single actor.' },
  { id: 'jordan-senses', left: 'jordan-person', right: 'jordan-country', leftContext: 'Jordan Lee led the design team.', rightContext: 'A research lab opened in Jordan.', correct: 'separate', reason: 'Jordan Lee is a person; Jordan is a country here. Context and entity type prevent a false merge. A shared name is insufficient evidence of identity.' },
  { id: 'apple-alias', left: 'apple-brand', right: 'apple-inc', leftContext: 'Apple sponsored Jordan Lee.', rightContext: 'D5 explicitly says: “Apple, also called Apple Inc.”', correct: 'merge', reason: 'D5 explicitly identifies the alias. After merging, D5 contributes one Apple–Jordan Lee co-occurrence, not two. Repeated aliases within one document are deduplicated.' },
];

export function resolveEntityMap(ids: readonly string[], links: readonly { left: string; right: string; decision: EntityDecision }[]): Record<string, string> {
  if (new Set(ids).size !== ids.length || ids.some(id => !id)) throw new RangeError('Entity IDs must be nonempty and unique.');
  const parent = new Map(ids.map(id => [id, id]));
  const find = (id: string): string => {
    const next = parent.get(id);
    if (next === undefined) throw new RangeError(`Unknown entity: ${id}`);
    if (next === id) return id;
    const root = find(next); parent.set(id, root); return root;
  };
  for (const link of links) {
    const left = find(link.left), right = find(link.right);
    if (link.decision !== 'merge' && link.decision !== 'separate') throw new RangeError('A resolution decision must be merge or separate.');
    if (link.decision === 'merge' && left !== right) {
      // Canonical IDs are stable regardless of the order of the merge links.
      parent.set(left < right ? right : left, left < right ? left : right);
    }
  }
  return Object.fromEntries(ids.map(id => [id, find(id)]));
}

export function cooccurrenceGraph(documents: readonly EntityDocument[], resolution: Readonly<Record<string, string>>) {
  const nodes = new Map<string, Set<string>>();
  const edges = new Map<string, { a: string; b: string; count: number; documents: string[] }>();
  const documentIds = new Set<string>();
  for (const doc of documents) {
    if (!doc.id || documentIds.has(doc.id)) throw new RangeError('Document IDs must be nonempty and unique.');
    documentIds.add(doc.id);
    const present = new Set<string>();
    for (const mention of doc.mentions) {
      const entity = Object.hasOwn(resolution, mention) ? resolution[mention] : undefined;
      if (!entity) throw new RangeError(`Unresolved mention: ${mention}`);
      present.add(entity);
      if (!nodes.has(entity)) nodes.set(entity, new Set());
      nodes.get(entity)!.add(mention);
    }
    const ids = [...present].sort();
    for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) {
      const key = JSON.stringify([ids[i], ids[j]]);
      const edge = edges.get(key) ?? { a: ids[i], b: ids[j], count: 0, documents: [] };
      edge.count++; edge.documents.push(doc.id); edges.set(key, edge);
    }
  }
  const sortedEdges = [...edges.values()].sort((a, b) => a.a.localeCompare(b.a) || a.b.localeCompare(b.b));
  return {
    nodes: [...nodes].map(([id, mentions]) => ({ id, mentions: [...mentions].sort() })).sort((a, b) => a.id.localeCompare(b.id)),
    edges: sortedEdges,
    totalWeight: sortedEdges.reduce((sum, edge) => sum + edge.count, 0),
  };
}

export const SEARCH_QUERY = 'How do I regain access after forgetting my password?';
export const SEARCH_STOPWORDS = new Set('a an and are as at be by do for from how i if in is it my of on or our the this to we when with you your after can cannot'.split(' '));
export const SEARCH_SNIPPETS = [
  { id: 'A', title: 'Password policy', text: 'Account password policy: every account password needs twelve characters. Update your account password annually.', semanticRank: 4, relevance: 'Related words; different question' },
  { id: 'B', title: 'Recover access', text: 'Choose Forgot password on the sign-in screen. We send a reset link to the email address on file.', semanticRank: 1, relevance: 'Directly supports the recovery steps' },
  { id: 'C', title: 'Reset-link expiry', text: 'A reset link expires after thirty minutes. If it expires, request another link.', semanticRank: 2, relevance: 'Supports the time limit' },
  { id: 'D', title: 'Service maintenance', text: 'Account access is suspended during scheduled maintenance. Check the service status page for updates.', semanticRank: 3, relevance: 'Another cause of lost access' },
] as const;

/** Binary term vectors, disclosed stop list, no stemming or learned weights. */
export function searchTerms(text: string): string[] {
  return [...new Set((text.toLowerCase().match(/[a-z]+/g) ?? []).filter(word => !SEARCH_STOPWORDS.has(word)))];
}

export function keywordCosine(query: string, document: string): { score: number; overlap: string[]; queryTerms: string[]; documentTerms: string[] } {
  const queryTerms = searchTerms(query), documentTerms = searchTerms(document);
  const documentSet = new Set(documentTerms);
  const overlap = queryTerms.filter(term => documentSet.has(term));
  return { score: queryTerms.length && documentTerms.length ? overlap.length / Math.sqrt(queryTerms.length * documentTerms.length) : 0, overlap, queryTerms, documentTerms };
}

export function rankKeywordDocuments(query: string, documents: readonly { id: string; text: string }[]) {
  if (new Set(documents.map(doc => doc.id)).size !== documents.length) throw new RangeError('Search document IDs must be unique.');
  return documents.map(doc => ({ ...doc, ...keywordCosine(query, doc.text) }))
    .sort((a, b) => b.score - a.score || a.id.localeCompare(b.id));
}

export const RETRIEVAL_ANSWERS = [
  { id: 'grounded', text: 'Choose Forgot password. Use the link sent to your registered email within thirty minutes.', supported: true, requiredSources: ['B', 'C'] },
  { id: 'unsupported', text: 'Send your old password to support. They will unlock the account immediately.', supported: false, requiredSources: [] },
  { id: 'contradicted', text: 'Choose Forgot password. Your reset link remains valid for twenty-four hours.', supported: false, requiredSources: [] },
] as const;

export function assessEvidence(answerId: string, evidenceIds: readonly string[]) {
  const answer = RETRIEVAL_ANSWERS.find(item => item.id === answerId);
  if (!answer) throw new RangeError('Unknown answer.');
  const selected = new Set(evidenceIds);
  if ([...selected].some(id => !SEARCH_SNIPPETS.some(source => source.id === id))) throw new RangeError('Unknown evidence source.');
  const required: readonly string[] = answer.requiredSources;
  const missing = required.filter(id => !selected.has(id));
  return {
    supportedAnswer: answer.supported,
    grounded: answer.supported && missing.length === 0,
    missing,
    relevantSelected: required.filter(id => selected.has(id)),
    irrelevantSelected: [...selected].filter(id => !required.includes(id)),
  };
}
