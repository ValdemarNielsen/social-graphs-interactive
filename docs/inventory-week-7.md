# Week 7 inventory — From meaning to measurement

Verified on 21 October 2026 against the full published [Week 7 page](https://sunelehmann.com/socialgraphs2026-web/weeks/week7.html), including its examples, all thirteen exercises, Essentials, Test 2 scope and optional Goodies. The [course index](https://sunelehmann.com/socialgraphs2026-web/index.html#weeks) marks **Week 7 / NLP III live**, dated 21 October, and **Week 8 / Networks × language coming**, dated 28 October. No unpublished Week 8 material is inferred. Week 7 says the following week prepares the project question and dataset rather than introducing another method.

The companion's original teaching prose is in `src/content-week7.ts`, exported as `weekSeven: Week`, with `theme: evidence` and `lab: measurement`. Its eleven sections support the chapter's evidence-room design. Adapted course content remains subject to the course's CC BY-SA 4.0 attribution/share-alike terms; original diagrams and interactive examples must remain distinguishable from course results. No course figure, model weight, fan-fiction text or external interactive asset was copied in this task.

## Coverage and section order

| Companion section ID | Source coverage | Main distinction to preserve |
|---|---|---|
| `contextual-meaning` | §1, 7.1 | A static word type, contextual token occurrence and whole-document vector are different objects. Training predates inference on Marvel. |
| `document-embeddings` | §2, 7.2 | Input limits and passage aggregation are modeling choices. Words are not word pieces. |
| `corpus-atlas` | §2, 7.2 | Original vectors determine cosine neighbors; PCA/t-SNE are drawings of those vectors. |
| `semantic-groups` | §3, 7.3–7.4 | LDA word distributions/document mixtures, embedding clusters and hyperlink communities use different evidence. |
| `sentiment` | §4, 7.5 | Lexicon lookup, TF-IDF logistic regression and contextual classification use different information. Confidence is not validity. |
| `validation-and-arcs` | §4, 7.6; sentiment/DeepMoji Goodies | Held-out evaluation, controlled stress tests and inspected disagreements precede scaling. Smoothing and emotion labels change the measurement. |
| `entities` | §5, 7.7–7.8 | BIO boundaries and entity types; ideal annotations differ from actual model predictions; span precision/recall. |
| `entity-networks` | §5, 7.7–7.8 | Extraction, identity resolution, entity inclusion and co-occurrence units are separate decisions. |
| `semantic-search` | §6, 7.9–7.10 | Sparse vocabulary match, dense similarity and chunk granularity; evaluate relevance before claiming a winner. |
| `rag` | §6, 7.9–7.10 | Retrieval error versus generation error; expose evidence and absent-answer cases. |
| `bias-and-project` | Optional §7, 7.11–7.13, §8 | Trace upstream selection/measurement bias; one question, one defensible result and a stated limitation. |

## Formulas and hand checks

- Cosine: `cos(x,y) = (x·y)/(||x||₂ ||y||₂)`. For two nonzero unit vectors it equals the dot product. A zero vector makes cosine undefined.
- Page aggregation used in the course atlas: encode passages with unit-normalized embeddings, take their unweighted mean `m`, then normalize `m/||m||₂`. Empty documents and a zero mean need explicit handling. This is a chosen aggregation, not an exact lossless summary of every passage.
- PCA centers the vector columns before finding directions of variation. The supplied t-SNE example uses perplexity 30, PCA initialization, automatic learning rate and seed 42; changing a map does not change the original embedding matrix.
- The source's toy sentiment list is wonderful `+2`, good `+1`, bad `−1`, terrible `−2`. It asks for the score of “good but terrible” without defining normalization. The companion explicitly chooses a **sum**, giving `−1`; a mean over two matched occurrences would be `−0.5`. An unmatched word contributes zero to this sum. Zero can mean no matching evidence or cancellation, not proven neutrality or negativity.
- Logistic regression: `z = b + Σⱼ wⱼxⱼ`, `P(positive|x) = 1/(1+exp(−z))`. With other features fixed, positive/negative coefficients increase/decrease the positive class log-odds. Coefficients are not causal effects.
- Moving-average arc: `aₜ = (1/|Wₜ|) Σᵢ∈Wₜ sᵢ`, with window, boundaries and score conversion declared. Sentiment and emotion distributions are different objects.
- Exact typed-span evaluation: precision `TP/(TP+FP)`, recall `TP/(TP+FN)`; declare exact boundary/type matching and undefined denominators. Partial overlaps are not exact matches.
- Resolved, undirected co-occurrence count: `w(a,b) = Σᵤ 1[a and b both occur in unit u]`, after deduplicating identities within each unit and excluding self-pairs. Sentence, paragraph and page units imply different evidence.
- Passage retrieval can score a page by `max` of its passage-query similarities. That rule and mean-document embeddings produce different rankings. Any precision@k/top-k success denominator must describe the relevance judgments and query set.

## All source exercises

The `Week` schema permits only one mode label. For mixed-mode exercises the primary `Tool` or `Learn` label is stored, while title/task/hint explicitly retains the additional source mode. Optional work is marked optional rather than silently promoted to test material.

| ID | Source mode | Required work preserved in companion brief |
|---|---|---|
| 7.1 | Learn | Static/contextual bank distinction; own ambiguous-word pair and context clues; meaning of a row in a 384-column document matrix and high cosine; pretrained weights versus newly computed representations. |
| 7.2 | Tool | All 303 raw pages; exact encoder/input length/truncation or chunking; three characters and five original-space neighbors each; inspect pages; PCA plus t-SNE or UMAP; hover names/click five neighbors; three projection comparisons including a misleading case; community recoloring without moving coordinates. |
| 7.3 | Learn | Evidence used by LDA, embedding clusters and network communities; topic mixture versus hard assignment; interpret agreement without claiming true topics; projected intertopic distance caveat. |
| 7.4 | Tool | Keep LDA full mixtures and highest-weight topic; record BERTopic encoder/settings; inspect words and pages before labeling; compact three-way comparison; one agreement and disagreement with text/link evidence; change one BERTopic setting and assess stability. |
| 7.5 | Learn | Toy lexicon calculation/negation; signed logistic feature coefficients; two reasons confidence is not valid measurement; concrete review-to-Marvel domain shift and a test. |
| 7.6 | Tool + Builder | Labeled data/held-out split shared across three methods; record settings; inspect random examples and error patterns; at least three controlled stress tests; sentence-level narrative arcs and moving average; inspect three strongest disagreements; only then small Marvel sample and community-comparison caveat. |
| 7.7 | Learn | BIO-tag the complete Iron Man/Tony Stark/Black Widow/New York sentence with an annotation-policy choice; extraction versus resolution; sentence/paragraph graphs for three characters; unsupported co-mention inference; why unit choice changes the model; rewrite flawed AI report in three honest sentences. Source anchor: `#bio-by-hand`. |
| 7.8 | Tool + Builder | Hand-label random reference sample before model run; exact span precision/recall and errors; defensible alias table while preserving raw output; at least two co-occurrence units, counts/degrees/communities and concrete edges; one convincing and one questionable edge; combine entity network with sentiment or topic analysis. |
| 7.9 | Learn | Vocabulary mismatch; normalized cosine/dot-product equivalence; predict one query favoring each method before running; one retrieval failure and one generation failure with inspectable evidence. |
| 7.10 | Tool | Reuse week 6 TF-IDF and 7.2 encoder; at least six advance-written lexical/paraphrase queries; top five from each method; read and judge relevance; success and failure for both; interface exposes query/score/text; alter one setting and rerun two queries; optional generation keeps passages and separate failure reports. |
| 7.11 | Learn + Tool, optional | Social process and present/absent populations; world-to-data distortion; preprocessing/label/representation/model amplification; one runnable check. Optional bias section is explicitly not on Test 2. |
| 7.12 | Builder, optional stretch | Original explorable about neighbors/projections, grouping comparison, sentiment stress tests, BIO/network construction or retrieval, with explanation and limitations. |
| 7.13 | Builder, recurring | One question using Marvel text/network, one convincing figure/table, inspected source evidence, surprising result and limitation. Source suggestions include semantic versus structural proximity, grouping disagreement, sentiment failure, narrative arcs, entity networks and retrieval. Group post, Teams link by Monday evening and constructive feedback to another group remain course submission requirements, not app actions. Source anchor: `#go-nuts`; standing rules in week 1 exercise 1.8. |

## Verified source data and reported results

These are **course-reported observations**, not fresh model runs performed by this companion:

- The [data page](https://sunelehmann.com/socialgraphs2026-web/data/#loading) identifies 303 Marvel Wikipedia pages from the frozen 26 August 2026 crawl; `marvel_pages.zip` is listed as 1.8 MB with 4.4 million characters. URL-decoded filenames join to `node_id`. Keep all 303 graph nodes, including the 17 isolates absent from an edge-only construction. The prose retains headings and some Wikipedia house language; raw articles and one-line node blurbs are distinct corpora.
- MiniLM gives 384 dimensions and a default 256-wordpiece input limit. The course reports 302/303 pages exceed it; the median is roughly six times the limit. Its atlas uses 4,473 passages, a target of 180 words at sentence boundaries, unit passage vectors, an unweighted mean and renormalization. **Audit caveat:** the provided chunker does not split a single overlong sentence, and word counts do not guarantee a tokenizer-token limit. Check actual encoded lengths; do not promise that every chunk avoids truncation.
- Atlas PCA's two axes explain about 10% of variance in this run. Network-overlap among ten textual neighbors averages 4.0 for TF-IDF, 2.8 after stopword removal, 1.9 raw counts, 0.3 random, 2.5 passage-averaged MiniLM and 2.1 truncated MiniLM. That particular score rewards hyperlink/name evidence; it is not universal semantic quality.
- Seeded BERTopic example: four topics and 110 outliers (`−1`); optional nearest-topic reassignment yields sizes 166/62/44/31. The c-TF-IDF words are inspected summaries, not truth. Name/stopword filtering affects summaries; outlier reassignment does not establish confident membership.
- BERT token bank examples are reported at cosine 0.48 (money/river) and 0.81 (money/loan), versus sentence-encoder 0.75/0.82. These model/version/input-specific examples are not constants.
- DistilBERT SST-2 example handles negation but calls the traffic sarcasm positive at 0.998. The source reports 179/303 truncated Marvel pages negative. None of these results establishes valid sentiment labels for Wikipedia or measures character morality.
- Source narrative demonstrations use mysterycyclone's *Dark Matter*: 46 chapters, roughly 240,000 words, 21,748 sentences; VADER and the contextual classifier agree on sign on only 36% of sentences in the reported run. DeepMoji predicts a distribution over 64 emoji from distant supervision; combining emoji probabilities into emotion tracks adds another analyst choice. Narrative text and predictions are not bundled here.
- The source's ideal NER table is **not** the actual small spaCy model's output. Reported `en_core_web_sm` omits Iron Man, finds Tony Stark as PERSON, calls Black Widow ORG, and finds New York as GPE. On Spider-Man prose it reports 635 PERSON spans, 179 distinct surfaces, and an edge-built graph of 146 nodes/293 edges. Aliases and creator names make these different from counts of fictional characters.
- For a Russian-spy query, source page-mean dense retrieval puts Black Widow at rank 20; short-passage retrieval restores rank 2. A source query suite reports top-three success 33% for page means, 72% for 180-word passages, 89% for 60-word passages and 67% for TF-IDF. The query suite and relevance judgments bound this result. Thor is absent from this corpus despite an apparently answerable query.

## Resources checked and access limits

Directly fetched/read in this audit:

- Full [week page](https://sunelehmann.com/socialgraphs2026-web/weeks/week7.html), [index](https://sunelehmann.com/socialgraphs2026-web/index.html), and [data page](https://sunelehmann.com/socialgraphs2026-web/data/).
- [Official MiniLM model card](https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2): 384 dimensions, short-sentence/paragraph use, default 256-wordpiece truncation, normalization/pooling example, training-data provenance.
- [Official DistilBERT SST-2 model card](https://huggingface.co/distilbert/distilbert-base-uncased-finetuned-sst-2-english): SST-2 fine-tuning and domain/bias cautions. Its documented development accuracy is around 91%, not the 96% in the source's deliberately flawed AI report. Do not present that report as factual model documentation.
- [BERTopic documentation](https://maartengr.github.io/BERTopic/), read through its [official source](https://raw.githubusercontent.com/MaartenGr/BERTopic/master/docs/index.md): modular embedding → reduction → clustering → representation pipeline, default UMAP/HDBSCAN/c-TF-IDF, outlier label `−1` and representative documents.
- [Wattenberg, Viégas and Johnson, How to Use t-SNE Effectively](https://distill.pub/2016/misread-tsne/): perplexity/run sensitivity, density/cluster-size distortion and unreliable intercluster distances. Read the explanation; interactive controls were not operated in a browser.

Assigned primary readings are linked exactly from the course; their complete PDFs were not independently reread in this audit: Jurafsky–Martin [chapter 9 §§9.1–9.2 and §9.5](https://web.stanford.edu/~jurafsky/slp3/9.pdf), [chapter 4 sentiment/logistic regression](https://web.stanford.edu/~jurafsky/slp3/4.pdf), [chapter 23 opening](https://web.stanford.edu/~jurafsky/slp3/23.pdf), [chapter 18 §§18.3 and 18.6](https://web.stanford.edu/~jurafsky/slp3/18.pdf), and [chapter 11 §§11.3–11.4](https://web.stanford.edu/~jurafsky/slp3/11.pdf). Additional exact links are retained in the content resource list or the source Goodies: [CheckList](https://aclanthology.org/2020.acl-main.442/), [DeepMoji](https://aclanthology.org/D17-1169/), [story arcs](https://epjdatascience.springeropen.com/articles/10.1140/epjds/s13688-016-0093-1), [entity networks](https://doi.org/10.1093/llc/fqac047), [RAG](https://arxiv.org/abs/2005.11401), [upstream fairness](https://www.nature.com/articles/s42256-021-00373-4), [labMT](https://hedonometer.org/words/labMT-en-v2/), and [torchMoji](https://github.com/huggingface/torchMoji). No claim of reading full optional papers or watching videos is made.

The course describes initial model downloads of roughly 90–440 MB each. This task downloaded no weights, installed no Python NLP packages and ran no model training/inference. Full exercise notebooks require Python/Jupyter and the named dependencies. The course's older torchMoji extension documents compatibility patches for modern Python/PyTorch; it is optional and was not tested here.

The page links eight original explorables: `corpus-atlas.html`, `sentiment-lab.html`, `story-sentiment.html`, `story-emotion.html`, `ner-bio.html`, `entity-network.html`, `semantic-search.html`, and `bias-flow.html`. They are linked as external study resources, not copied or claimed to be locally reproduced. Dense-search presets are offline full-corpus outputs; arbitrary typed text in the course explorable only drives sparse search over one-line descriptions. Its lack of an in-page encoder is an implementation limitation, not a general claim that browsers cannot run encoders.

## Local interaction guardrails

Label authored reference judgments, toy vectors and synthetic relevance scores explicitly. A small lexicon, a BIO exercise and keyword cosine can be computed exactly in the browser; they do not become DistilBERT, spaCy, MiniLM or a validated evaluation just because they are interactive. Distinguish an earned lesson checkpoint from a claim that a real model passed a scientific validation. Keep source evidence visible, offer explanatory feedback, and preserve manual still-view controls and reduced motion.

## Test scope

The closed-book core covers contextual versus static representations; original-space neighbors versus projections; the three grouping objects; lexicon calculation and logistic coefficient signs; confidence/domain validity; BIO and entity resolution; co-occurrence units; sparse/dense retrieval; RAG stages; concrete validation checks; and repair of overclaims. Required formulas are supplied on the course test, not demanded from memory. The optional bias section, optional explorable and Goodies are not silently added to that assessed core.
