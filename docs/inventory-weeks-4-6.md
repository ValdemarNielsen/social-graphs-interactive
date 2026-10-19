# Content inventory: weeks 4–6

Research date: 19 October 2026. All three weekly HTML files were read in full, including numbered exercises, Essentials, and optional Goodies. This inventory precedes the companion content implementation. The educational copy is an original adaptation; the course is Sune Lehmann's DTU 02805 Social graphs and interactions, with source content licensed CC BY-SA 4.0.

## Availability and scope

| Week | Source | Availability | Companion laboratory |
|---|---|---|---|
| 4 | https://sunelehmann.com/socialgraphs2026-web/weeks/week4.html | Full source read | Communities: edit a partition and compute modularity |
| 5 | https://sunelehmann.com/socialgraphs2026-web/weeks/week5.html | Full source read | Language: editable tokens, counts, vocabulary, document-term matrix |
| 6 | https://sunelehmann.com/socialgraphs2026-web/weeks/week6.html | Full source read | Meaning: counts → TF-IDF and cosine |

**Important correction:** Week 6 is *From counts to meaning*, not supervised classification. It covers document weighting, group comparisons, LDA, word-context vectors, PPMI, Word2Vec, and GloVe. Contextual representations are a forward reference to week 7, not the central topic of week 6.

## Week 4: Communities and seeing networks

### Learning map

1. Communities are a useful middle scale between nodes and the whole graph. Their definitions depend on the question; dense groups need not be isolated when memberships overlap. A partition assigns each node to precisely one group; overlapping covers do not.
2. Edge betweenness counts shortest-path traffic; tied paths contribute fractions. Girvan–Newman repeatedly removes the current highest-betweenness edge and recomputes. Its dendrogram is a hierarchy, not a uniquely chosen partition. The basic full algorithm costs O(m²n).
3. Modularity measures within-group links above a degree-preserving expectation. Both adjacency and per-community formulations matter. All nodes in one group gives zero. A better score need not agree better with observed social labels: Zachary's karate club illustrates this gap.
4. Greedy merging creates an irreversible bottom-up hierarchy. Louvain alternates local node moves and aggregation; order and seed matter. Evaluate against optimized degree-preserving null graphs and compare repeated partitions with normalized mutual information (NMI). Similar Q does not imply similar membership. Metadata labels are another interpretation, not infallible ground truth.
5. k-clique percolation: adjacent k-cliques share k−1 nodes; connected components in this clique adjacency graph are communities. Nodes can overlap or remain uncovered. Larger k selects stricter dense groups.
6. Link clustering compares adjacent edges through their other endpoints' inclusive-neighborhood Jaccard similarity, uses single-linkage hierarchy, and chooses a cut by partition density. A node inherits the communities of its edges. Adaptive branch-specific cutting is optional extension material.
7. Weighted links introduce strength, weight-to-length conventions, and weighted modularity. For positive connection strengths, reciprocal lengths allow Dijkstra paths to favor strong routes. Weighted and unweighted Q cannot be compared as though they had the same reference.
8. Backbones: global weight thresholds can erase weaker nodes' meaningful ties. The disparity filter compares each edge's share of an endpoint's strength against a local random-allocation null. Show what a filter removes. Layout the backbone, compute communities on the full graph, label groups, size by a declared measure, label important nodes.

### Formula ledger

- Edge betweenness: b(e) = Σ(s<t) σ_st(e)/σ_st, considering reachable unordered pairs for an undirected graph.
- Q = (1/2m) Σ_ij [A_ij − k_i k_j/(2m)] δ(c_i,c_j).
- Q = Σ_c [ℓ_c/m − (d_c/2m)²]. Here ℓ_c counts internal edges once; d_c is the sum of original graph degrees in c; m counts all edges once. Q is undefined at m=0.
- I = Σ_xy (n_xy/n) ln[n n_xy/(n_x n_y)]; H = −Σ_x (n_x/n) ln(n_x/n); NMI = 2I/(H₁+H₂). Zero cells contribute zero. Degenerate labelings require an explicit convention.
- Null comparison: z = (Q_real − mean(Q_null))/sd(Q_null), undefined when null standard deviation is zero.
- Link similarity: |N⁺(i) ∩ N⁺(j)| / |N⁺(i) ∪ N⁺(j)| for edges ik and jk, where N⁺ includes the node itself.
- Link partition density: D = (2/M) Σ_c m_c[m_c−(n_c−1)]/[(n_c−2)(n_c−1)]. A single edge's contribution is taken as zero to avoid 0/0.
- Strength s_i = Σ_j w_ij. Reciprocal distance ℓ_ij = 1/w_ij requires positive weights.
- Disparity: p_ij = w_ij/s_i; significance (1−p_ij)^(k_i−1). Keep if significance < α at either endpoint. Degree-one nodes need a documented convention; the main formula alone does not settle that special case.

### All numbered exercises

| ID | Mode | Required work preserved |
|---|---|---|
| 4.1 | Learn | Seven-node graph A–B,A–C,B–C,C–D,D–E,D–F,E–F,F–G; compute all edge betweennesses, two removals, recomputation, two dendrogram levels |
| 4.2 | Learn | Define community; explain modularity's null; distinguish Q from truth; ask for null and stability |
| 4.3 | Learn | Compare two partitions by hand; score dendrogram levels and all-in-one; show why leaf G joins F |
| 4.4 | Builder, optional | OpenAlex modularity literature counts using three query scopes, inspect 20 sampled titles, citation-based alternative and annual counts; disclose query contamination |
| 4.5 | Tool | Philosopher Louvain, group interpretation and metadata NMI, five-seed comparison, greedy baseline, hand-coded phase 1 validated on karate |
| 4.6 | Learn + Tool | Explain phases/randomness; 20 degree-preserving and 20 G(n,m) nulls; Q and NMI across random-network density/size; weighted karate warning; repair overclaim |
| 4.7 | Learn | Shared-node triangles plus leaf; compare Q partitions; clique overlap/uncovered node; add B–D and observe clique percolation; vary k |
| 4.8 | Learn | Link groups in the same toy; overlap and singleton edge; compare clique cover; neighborhood-density bias and personal overlapping memberships |
| 4.9 | Tool | Implement link clustering or run Infomap; compare Louvain; inspect five disputed/overlapping philosophers in raw Wikipedia pages |
| 4.10 | Learn | Assigned weights 3,1,4,1,2,5,2,1; strengths, hops versus reciprocal-weight paths, weighted modularity, critique score comparison |
| 4.11 | Tool | Weighted philosopher strengths; implement disparity; reproduce α and threshold table; draw full-data communities on backbone; sensitivity at 0.1,0.2,0.3 |
| 4.12 | Builder, optional | Build an explorable about an uncovered claim, with real calculation and defensible presentation |
| 4.13 | Builder | Independent community/overlap/weight/backbone investigation; one figure, validation and limitation; original course sharing/review workflow linked |

### Data, examples, and extensions

- Verified public data-page GET and HTTP 200 for `week4_philosophers_nodes.tsv` and `week4_philosophers_edges.tsv`. Full snapshot: 1,444 nodes and 11,135 directed weighted edges. Summing both directions gives 9,140 undirected links; the giant component has 1,374 nodes and 9,139 links. Weight counts repeated links in article prose. The node metadata contains era and subfields; it is not guaranteed social ground truth.
- The course's reported Q/null/NMI/backbone results are reference results, not computations newly performed for this companion. Synthetic browser examples must be labeled separately.
- Required Atlas reading: Ch.35 introduction; 37.1 splitting and merging; 36.1 modularity, 36.4 NMI, skim 36.2; 38.3 clique percolation, 38.5 links, 38.7 overlap; Ch.7 weights; Ch.27 introduction, 27.1,27.5, skim 27.3,27.6. The Atlas landing page was accessible; the complete textbook has not been reread for this inventory.
- Optional Goodies retained as linked extension topics: resolution parameter and limit; Leiden refinement; Infomap/map equation; stochastic block models and Bayesian model selection; Peixoto's critique of modularity; adaptive cuts with simulated annealing; salience/noise-corrected/doubly stochastic backbones; original method papers.
- Opportunities: edge-cut walkthrough; editable partition and live Q; seed/null comparison; triangle-percolation switch; edge communities that give one node two colors; strength/path comparison; backbone slider.

## Week 5: From language to numbers

### Learning map and formulas

- Language is evidence about people. NLP combines a representation with a task. Next-token prediction repeatedly samples from a conditional distribution; a toy with hand-set probabilities must not be presented as a trained model.
- Characters → tokenizer → pieces → token IDs → model. Distinguish occurrences (tokens), distinct forms (types), vocabulary, and chosen document boundaries. Word-like and subword tokenizers serve different tasks. BPE learns frequent adjacent-pair merges from initial small units until a vocabulary budget; the exercise's greedy toy segmenter is not BPE training.
- Lowercasing, lemmatization, punctuation and stopword filtering change information and denominators. Preserve raw text, state choices, inspect examples, and distinguish normalization from tokenization.
- Count first: total tokens, vocabulary, hapax types, and relative frequency count(t)/N. Heaps' law is vocabulary growth with corpus size; the textbook gives |V| = kN^β with 0<β<1.
- Zipf rank-frequency pattern f(r) ∝ r^(−s), often s≈1. Same values on linear and log-log axes. Approximate straightness alone does not establish a fitted power law. Rank is related to a frequency CCDF with axes exchanged; ties matter.
- Concordance/KWIC shows actual usages. NLTK similar() finds shared immediate contexts, not guaranteed synonyms. Bigrams/trigrams keep local order but become sparse. P(w_t|w_(t−1)) and P(w_t|w_(t−2),w_(t−1)) describe tiny count-based next-token models. Collocation scores compare co-occurrence against separate frequencies; frequent pairs need not be distinctive.
- Bag of Words: X_dt=count(term t in document d). Rows are documents, columns a common ordered vocabulary. Sparse matrices contain mostly zeros. The representation loses word order; one-hot word identity contains no semantic similarity.
- Cosine = (x·y)/(||x|| ||y||), undefined for zero vectors; invariant to positive scaling. Raw-count cosine can be dominated by shared function words. Context vectors will change what a word's coordinates represent in week 6.

### All numbered exercises

| ID | Mode | Required work preserved |
|---|---|---|
| 5.1 | Learn | Tokenizer/model division; tokens/types/vocabulary; pipeline order; information loss; BPE start/repeat/stop logic |
| 5.2 | Learn | Hand-tokenize Spider-Man sentence under declared rules; normalization count predictions; entities versus boundaries; greedy subword segmentation of five names/words; defend research choices and denominator |
| 5.3 | Tool | Compare manual, spaCy and o200k_base; token attribute table; one-page before/after; consequential decision; Heaps curve and subword splitting |
| 5.4 | Learn + Tool | Predict short/full corpus Zipf difference; count tokens/types/hapaxes; linear/log-log plots; critique proof claim; compare other corpora |
| 5.5 | Learn + Tool | Concordance versus similar; bigrams/trigrams and source passages; frequency versus association; same-unigram/different-order examples; verify raw text; repair overclaim |
| 5.6 | Learn | Three Thor/X-Men/Loki documents, lowercase/drop punctuation/keep X-Men; hand matrix, rows/columns; edit count and vocabulary; acceptable and unacceptable order loss |
| 5.7 | Tool | Reproduce with CountVectorizer and inspect default discrepancy; full corpus matrix/lengths/sparsity; trace column to pages; one preprocessing change; limitations |
| 5.8 | Builder, optional | Tokenizer comparison, vocabulary growth, collocation ranking, n-gram generator or Bag-of-Words collision explorable |
| 5.9 | Builder | Independent text/network question; suggested typed edges, copying network, search, community autocomplete, vocabulary growth, fame/page-length or unusual page; inspect raw text and report limitation |

### Data and supporting resources

- `marvel_pages.zip` is reachable (HTTP 200), 303 UTF-8 plain-text articles from the frozen 26 August 2026 snapshot. The data page reports 1.8 MB zipped and 4.4 million characters; page lengths range 1,244–87,256. These are source reports, not newly derived data statistics.
- URL-decode filenames to recover exact `node_id`; exclude README. Text keeps headings and some Wikipedia boilerplate but removes templates, infoboxes, reference markers and navigation. Short descriptions in `week1_nodes.tsv` and full article text are distinct corpora.
- Direct supporting reads verified: Jurafsky–Martin Ch.1 and Ch.2 PDFs, NLTK book Ch.1, spaCy tokenization docs. Course videos are linked, not transcribed or watched in this audit. Optional Gaby/Lestrade readings and tokenizer comparisons remain linked via the original week.
- Opportunities: editable tokenizer pipeline; vocabulary growth; true counted rank-frequency plot; sliding n-gram windows; KWIC; interactive document-term matrix and collisions.

## Week 6: From counts to meaning

### Learning map and formulas

- TF=count(t,d)/|d|, DF=number of documents containing t, IDF=ln(N/DF), TF-IDF=TF×IDF. The course uses natural log and no smoothing. Terms found in every document receive zero weight. df=0 is outside the observed vocabulary and needs deliberate handling.
- Cosine compares direction, not total length. The course's three documents give D1–D2≈0.214 and D1–D3=0; those are exact-definition reference checks. sklearn uses raw TF, smoothed IDF ln[(1+N)/(1+df)]+1 and L2 normalization. Turning off smoothing does not remove the +1. Name collisions and shared boilerplate remain possible after TF-IDF.
- Scattertext compares two labeled corpora term-by-term; rates must use comparable denominators. The teaching plot uses Republican/Democratic uses per 10,000 words with log-scaled axes. Diagonal=similar rate. Return from points to supporting passages.
- Topic modeling is a family. LDA topics are distributions over words; documents are distributions over topics. Generative intuition: sample topic from document mixture, then word from that topic. Fit to counts, inspect both levels, choose topic count and preprocessing, rerun seeds. Names and boilerplate can dominate; labels are human interpretations. NMF and embedding-based topic approaches are alternatives, not synonyms for LDA.
- Distributional hypothesis: shared contexts can reveal shared usage. Word-context rows represent target words, columns contexts, cells counted windows. Small windows emphasize local behavior; wide windows can emphasize topics. Preserve sentence boundaries.
- PMI=log₂[P(w,c)/(P(w)P(c))]. From a matrix C with grand total T, joint=C_wc/T, row marginal=Σ_c C_wc/T, column marginal=Σ_w C_wc/T. PPMI=max(PMI,0). Zero joint count maps to zero PPMI; empty rows/columns need explicit treatment. These vectors remain count-based static embeddings.
- Word2Vec Skip-gram predicts contexts from a center word; CBOW predicts center from contexts. Negative sampling contrasts observed pairs with a small sampled set. GloVe learns dense static vectors from global co-occurrence. A fixed vector conflates senses and reflects training data biases; high cosine is not a synonym certificate.
- Vector arithmetic and axes are corpus-dependent. Character fingerprints can be TF-IDF-weighted embedding means; subtract pole means to define an axis and project. Names, pronouns and analyst-selected poles can create misleading narratives. Shifted-PMI interpretation, dialectograms, Embedding Projector and Stochastic Parrots are optional extension links.

### All numbered exercises

| ID | Mode | Required work preserved |
|---|---|---|
| 6.1 | Learn | Hand TF/DF/IDF and cosine; scale invariance; explain weighting versus geometry |
| 6.2 | Tool | Implement exact definitions; compare sklearn variants and cosine; full Marvel nearest pairs; inspect text; compare counts, TF-IDF and network neighbors; find name artifact |
| 6.3 | Tool | Explain Scattertext axes; predict community terms; build two-community plot; diagonal/distinctive/misleading terms; change one setting; interpretation limits |
| 6.4 | Learn | Interpret word-topic versus document-topic probabilities; concentrated versus mixed document; human labels; number-of-topics choice |
| 6.5 | Tool | LDA with/without name filtering; inspect top words and three pages per topic; two distributions; sensitivity; network-community contrast; 20 Newsgroups comparison |
| 6.6 | Learn | Window 1/2 around chased; tiny matrix; derive one PMI/PPMI cell; neighbor changes |
| 6.7 | Tool | Marvel context matrix; independent PPMI cell check; five raw/PPMI neighbor lists; concordance validation; vary window |
| 6.8 | Learn | Skip-gram/CBOW examples; negative sampling; dense dimensions; repair topic/embedding overclaims |
| 6.9 | Tool | Record Word2Vec settings; inspect five words; compare PPMI; alter setting; compare pretrained GloVe; recreate a semantic map axis and inspect movement |
| 6.10 | Builder, optional | TF-IDF, angle, term contrast, topics, contexts or training-pair explorable |
| 6.11 | Builder | Text versus graph proximity, community language, mixed topics, neighbors, representation disagreement, name artifacts or custom semantic axes; inspected evidence and limitation |

### Supporting resources and gaps

- Required reading Ch.11 §§11.1.1–11.1.3 accessible and parsed. Ch.5 §§5.1–5.6 is HTTP 200 but the web parser returned an internal error; the course's detailed explanation plus accessible Voita embedding notes support the verified concepts. The chapter link is preserved rather than called unavailable.
- Blei (2012) topic-model PDF, scikit-learn TF-IDF/LDA documentation, Scattertext repository and gensim Word2Vec tutorial all accessible. Full external libraries and model training were not run for this content audit.
- Same Marvel ZIP as week 5. Additional exercises use Scattertext's packaged 2012 convention speeches, sklearn's 20 Newsgroups training set, and gensim's 128 MB `glove-wiki-gigaword-100`. Their primary documentation was inspected; those datasets/weights were not downloaded or bundled.
- Video embeds and every optional paper were not individually watched/read. The companion should retain direct source links for exact course notebooks, full prompts, and extensions, and should never present original reported results as freshly replicated measurements.
