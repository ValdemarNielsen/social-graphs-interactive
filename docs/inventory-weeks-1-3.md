# Verified content inventory: weeks 1–3

Reviewed 19 October 2026. These entries were completed before writing the companion content. Primary pages were read in full from the downloaded current 2026 HTML, including every exercise, Essentials, test scope and Goodies. Supporting resource accessibility is distinguished from having reviewed its entire contents.

## Shared provenance and dataset

- Course: https://sunelehmann.com/socialgraphs2026-web/index.html#weeks
- Primary material is credited to Sune Lehmann / DTU 02805. The weekly page footer specifies CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/ . Companion explanations are newly authored; retain attribution and original links.
- Data page: https://sunelehmann.com/socialgraphs2026-web/data/ . Fully read successfully through a direct public HTTPS request; the web extraction tool could not access it.
- Network data: https://sunelehmann.com/socialgraphs2026-web/data/week1_nodes.tsv and https://sunelehmann.com/socialgraphs2026-web/data/week1_edges.tsv . Both fetched successfully and headers/counts checked: 303 node records (304 non-comment lines including header), 1,784 directed edge records.
- Frozen 26 August 2026 Wikipedia Marvel Comics superheroes snapshot. Edges come from running article text, excluding navigation-template links; redirects resolved at both endpoints. Node fields: node_id, name, wikidata_id, url, description. IDs use Wikipedia titles with underscores. TSV comments begin with #; node blurbs may contain quotes, so use QUOTE_NONE. Add the node roster before the edges to retain 17 isolates.
- The primary pages report 1,434 undirected pairs, 350 mutual pairs, 277 nodes in the giant component, one nine-node island and 17 isolates. Directed mean in/out degree 1,784/303 ≈ 5.89; undirected mean 2×1,434/303 ≈ 9.47; undirected density 1,434/45,753 ≈ 0.0313. These additional statistics are attributed source results, not claimed new computations.
- Local interactive scenes should use explicit synthetic examples unless the actual snapshot is loaded. Moving decorative backgrounds are not quantitative claims.
- Course videos were identified from actual iframe/link URLs, but transcripts/video contents were not independently reviewed. No claim of having watched them.
- Network Atlas https://www.networkatlas.eu/ is reachable. Its linked PDF https://www.networkatlas.eu/files/sna_book.pdf is 27 MB and exceeded the web reader size limit; full textbook chapters were not reviewed. Link the assigned chapters without claiming otherwise.
- Barabási https://networksciencebook.com/ is reachable but exposes an application shell to the web reader. Full chapters were not reviewed. Current course pages remain the substantive source.

## Week 1 — Networks

Source: https://sunelehmann.com/socialgraphs2026-web/weeks/week1.html — available; fully read.

### Concepts, objectives and formulas

1. Scientific motivation: connections reveal flows, cascades and structural parallels. Model choice precedes measurement. Papers-as-citations and authors-as-collaborators answer different questions.
2. Nodes, edges, direction, weight, simple graphs (no loops or parallel edges), isolates, sparsity; n nodes, m edges. Undirected sum of degrees = 2m; mean degree = 2m/n; density = 2m/[n(n−1)]. Directed sum in = sum out = m; directed density m/[n(n−1)]. Handle n<2 explicitly.
3. Edge lists and adjacency matrices. Aᵢⱼ is i→j. Symmetry identifies an undirected network; diagonal zero identifies no loops. Binary row sums are out-degree and column sums in-degree; weighted sums are strengths, not counts of edges.
4. Python/Jupyter/NetworkX with agent assistance; manually audit generated analysis. Zachary Karate Club is available in NetworkX.
5. Degree distributions, P(k), exponential versus power-law shapes under linear-linear, log-linear, linear-log and log-log axes. Heavy tails are evidence to examine, not a fitted power law. In-/out-degree mechanisms differ. Source examples: Spider-Man in-degree 106; Betsy Braddock out-degree 28.
6. Mixed binning in u=k+1: integer width-one bins u=1…7; then [8,16), [16,32), [32,64), [64,128). Probability-density height = count/(N×number of integer degree values in bin); positions are geometric means of covered integer endpoints. Shift labels must explicitly say k+1. Do not fit exponents to shifted/binned plots; retain largest degree and isolates.
7. Paths, shortest distance, components and giant component; direction requires refined definitions in week 3.
8. Visualization versus topology. Force, alphabetical circle, degree circle, random and community layouts retain edges/degrees/distances while moving positions. Community colors here are an introduction to week 4, not a new week-1 algorithm.

### Complete exercise mapping

- 1.1 Learn: three network representations; a personally relevant fourth with size/data/time/flow; two node choices for one system and their distinct questions.
- 1.2 Tool: ten factual LLM questions; verify every answer, score and classify errors; define acceptable unsupervised use for later AI_METHODS.md.
- 1.3 Builder: install tools; Karate Club graph, counts and top five degrees; manual audit; own adjacency matrix → directed graph, row/column validation, symmetrization, weighted edge/isolate/loop probes.
- 1.4 Learn: in/out tail mechanisms; what binning reveals; integer/normalization/position/end-bin failures; why combining directions obscures mechanisms.
- 1.5 Learn: A–B,A–C,A–D,B–C,C–D,D–E,E–F; draw, degrees/mean/density, matrix, triangles/removal, directed conversion, degree histogram, distances A–F and B–E.
- 1.6 Tool: load full directed snapshot; reconcile undirected count; four in/out plots with k+1 and top-five check; exact mixed-bin overlay; 10,000 exponential and 10,000 power-law samples on four axis combinations.
- 1.7 Learn: distinguish invariant data from layout; circle ordering; proximity ambiguity; random baseline; community colors; three-sentence visualization critique.
- 1.8 Builder: public group GitHub Pages site, first free-form Marvel post with question/method/figure/surprise; optional Wikipedia API reconstruction; source course asks link in Teams and constructive peer critique. This companion does not perform those communications.

### Interactive opportunities and resources

Synchronized editable graph/matrix, live count/density, directed toggle and isolate; degree bars; layout changes with preserved topology. The source has adjacency-matrix.html, two-distributions.html, real-degrees.html, layouts.html under https://sunelehmann.com/socialgraphs2026-web/explorables/ . These are actual source links, not newly verified browser sessions.

Required reading: Atlas chapters 6 Basic Graphs and 9 Degree; optional 7, 1. Historical lectures: https://www.youtube.com/watch?v=qjM9yMarl70 ; notation https://www.youtube.com/watch?v=MMziC5xktHs ; NetworkX https://www.youtube.com/watch?v=iDlb9On_TDQ ; older API tutorial https://www.youtube.com/watch?v=9l5zOfh0CRo (Python 2 syntax; conceptual only).

Optional source links include Easley/Kleinberg https://www.cs.cornell.edu/home/kleinber/networks-book/ , Nicky Case https://ncase.me/crowds/ , six degrees https://www.youtube.com/watch?v=TcxZSmzPw8k , Christakis https://www.ted.com/talks/nicholas_christakis_the_hidden_influence_of_social_networks , https://oracleofbacon.org/ . These have not all been independently read.

## Week 2 — Models & null models

Source: https://sunelehmann.com/socialgraphs2026-web/weeks/week2.html — available; fully read.

### Concepts, objectives and formulas

1. Models isolate mechanisms; null models define a comparison. Matching one summary does not identify a generating process.
2. ER G(n,p): independent possible edges; E[m]=p n(n−1)/2; E[k]=p(n−1); Binomial(n−1,p), sparse Poisson λ and large-λ normal approximations. P(k)=e^(−λ)λᵏ/k!, variance≈λ. Exact isolation probability (1−p)^(n−1), expected isolates n(1−p)^(n−1), approximated by n e^(−λ).
3. Giant-component threshold λ≈1, connectivity around λ≈ln n. Large-network S solves S=1−exp(−λS); finite realizations fluctuate. Optional regimes subcritical, critical largest-component order n^(2/3), supercritical, connected. Short-distance branching argument λᵈ≈n → d≈ln n/ln λ requires λ>1 and a suitable sparse random regime.
4. Clustering Cᵢ=2eᵢ/[kᵢ(kᵢ−1)] (zero for k<2); mean C=(1/n)ΣCᵢ; transitivity 3×triangles/connected triples. Their weighting differs. ER neighbor-pair closure probability p; finite mean with zero low-degree convention need not equal p exactly.
5. Ring lattice; Watts–Strogatz rewiring q; small q preserves local triangles while collapsing paths. q=1 is randomised but not exactly ER under standard rewiring. Source Monte Carlo exercise includes q=0 on a log axis: it must be displayed separately or with an explicitly labelled alternative scale.
6. Growth + preferential attachment; Π(i)=kᵢ/Σk; degree endpoint-list sampling; BA asymptotic P(k)∝k^(−3); uniform growth has age effects but no BA tail. Sampling two distinct targets is not just twice the one-target probability.
7. Heavy-tail inference; CCDF S(k)=P(K≥k)≈k^(1−γ) for power-law tails; MLE, cutoff choice, goodness-of-fit and comparison with alternatives. Optional universality/scale-invariance discussion and current scholarly debate. 303 nodes cannot justify precise tail-exponent claims by eye.
8. Degree-preserving double-edge swaps versus stub configuration model; simplifying loops/parallel edges changes degrees and baseline. Shuffle statistics, z=(observed−mean null)/sd null; corrected empirical one-sided p=(1+b)/(1+R); inspect distributions, mixing, null constraints, selection/multiple tests. No causal proof from null rejection.
9. Friendship paradox; random edge endpoints have q(k)=kP(k)/⟨k⟩ and mean ⟨k²⟩/⟨k⟩=⟨k⟩+Var(k)/⟨k⟩. IMPORTANT precision correction: choosing a uniformly random person and then one friend is a different sampling design on a correlated graph, not generally exactly that formula. Compare these explicitly and keep isolates defined.

### Complete exercise mapping

- 2.1 Learn: why ER; thresholds; degree plots; Marvel isolates; G(6,.2) and G(300,.03) expectations/isolation.
- 2.2 Tool: n=5,000 λ=10/100 Poisson/normal checks; n=1,000 sweep λ=.2…4 with 20 replicates; n=200 λ=1.5 giant/two-hop picture; Marvel versus ER table.
- 2.3 Learn: local triangles; all Cᵢ on week-1 graph; k=12 C=.5; average versus transitivity; extend baseline table.
- 2.4 Learn+Tool: q=0,.01,1 predictions; n=500 k=4, q=0,.01,.03,.05,.1,.2, 50 replicates with standard-deviation error bars; caption and mechanism; q=1 versus ER caveat.
- 2.5a Learn: endpoint list of AB,BC,BD,CD; subsequent probability changes; uniform rule; uniform growth versus same-n,m random graph.
- 2.5b Tool: custom preferential attachment from one edge to 100 then 5,000 nodes; max/min and plots; validate actual sampler and compare NetworkX BA; uniform attachment comparison; compare component counts with ER. Visual slope alone is a diagnostic, not proof the sampler is correct.
- 2.6 Learn+Tool: Marvel CCDF versus binned distribution, slope/exponent; BA and ER overlay, finite-size limits; audit LLM scale-free claim; robust conclusion paragraph.
- 2.7 Learn: degree vector 5,3,1,1 and one/two distinct targets; feedback; identify models; parameter effects; model×clustering/distances/hubs table.
- 2.8 Learn+Tool: critique three baseline claims; 100 configuration samples and removed-edge counts; 100 G(n,m) graphs; degree-preserving swaps (~10m) and invariant check; compare transitivity/isolates; correct conclusion paragraph. On the giant component isolate count is fixed at zero under exact degree preservation; state the universe.
- 2.9 Learn+Tool: precise sampling statement; 1,000 sampled pairs on BA/Marvel/ER; degree-preserving null; mixing effects; audit LLM explanation. Retain sampling caveat above.
- 2.10 Builder optional: new explorable for model regimes, stub pairing, nonlinear preference or friendship paradox.
- 2.11 Builder: weekly public data story (distribution, paradox, shuffle statistic or generative comparison); optional own Wikipedia category; standing source peer feedback.

### Resources and illustrative source results

Marvel whole-network C≈.31, transitivity≈.18, mean giant-component distance≈2.67; ER C≈.03 and distance≈2.8; matched WS q≈.2 C≈.31 and distance≈3.1 are source examples, not guarantees for one random seed. Giant-component real C≈.32, swap null mean≈.155 sd≈.009; simplified configuration null≈.11. Be consistent about the node universe.

Read Atlas chapters 16; 12.1–12.2; 17.1–17.3; 18.1; 19.1. Barabási chapters 4.1–4.4 and 5.1–5.5. Actual lectures: https://www.youtube.com/watch?v=c_SbQCzgqb0 , https://www.youtube.com/watch?v=tMLJ2NYI1FU , https://www.youtube.com/watch?v=myLgzbXxhOQ . Source explorables: poisson-vs-marvel, er-phase-transition, clustering-counter, ring-lattice, lattice-to-random, ws-rewiring, ba-growth, ccdf-live, shuffle-test, friendship-paradox (all .html under the course explorables directory).

Clauset/Shalizi/Newman abstract and metadata reviewed: https://arxiv.org/abs/0706.1062 . Full paper not reviewed here. Other verified source hyperlinks: https://arxiv.org/abs/cond-mat/0402322 , https://arxiv.org/abs/cond-mat/0412004 , https://github.com/jeffalstott/powerlaw , https://www.nature.com/articles/s41467-019-08746-5 , https://journals.aps.org/prresearch/abstract/10.1103/PhysRevResearch.1.033034 , https://www.nature.com/articles/s41467-019-09038-8 , https://www.science.org/doi/10.1126/science.1065103 . They are optional extensions, not independently reviewed full texts.

## Week 3 — Measures & centrality

Source: https://sunelehmann.com/socialgraphs2026-web/weeks/week3.html — available; fully read.

### Concepts, objectives and formulas

1. Walk versus simple path; distance; BFS rings guarantee shortest unweighted distances; unreachable=∞. Eccentricity=max distance; diameter=max eccentricity, radius=min, center=argmin. Weak/strong connectivity and incoming/outgoing reach.
2. Degree; closeness (n−1)/Σd on connected graphs; normalized harmonic Σ(1/d)/(n−1) with 1/∞=0. Do not interpret closeness as proportion reached. Note NetworkX uses incoming directed closeness and a reachable-fraction correction by default; documented conventions must match code.
3. Betweenness Σσₛₜ(i)/σₛₜ with endpoints excluded. Undirected normalization choose(n−1,2); directed normalization (n−1)(n−2). Count fractions when routes tie. Medici marriage network and Krackhardt kite illustrate popularity versus brokerage.
4. Eigenvector centrality Ax=λx on undirected A. If Aᵢⱼ means i→j, incoming directed prestige uses Aᵀx; do not silently transpose conventions. Power iteration needs connectedness/nonnegative matrices and periodicity/convergence handling.
5. PageRank: uniform teleportation plus split votes; α=.85 conventional. Full update includes redistributed dangling mass D: PRᵢ′=(1−α)/n+α[Σⱼ→ᵢ PRⱼ/kⱼ,out + D/n]. For 0≤α<1 with uniform teleportation, unique positive stationary distribution. α=1 can trap/oscillate. The ordinary undirected random walk has stationary probability kᵢ/(2m); damped uniform-teleport PageRank is generally NOT exactly proportional to degree (source wording is too broad).
6. Compare centralities to degree-preserving nulls; report meaning/assumptions and z, not automatic causal importance. Source: Spider-Man b≈.23 matches null; Hercules b≈.037 versus .018 is unusual; Black Cat has low brokerage for degree.
7. Degree assortativity is Pearson correlation across edge endpoints; positive/negative, average neighbor degree k_nn(k), structural constraints. Uniform-degree ring has zero variance so Pearson r is undefined (not r=0). Source Marvel r≈−.105 versus shuffle −.118±.009; negative raw r alone does not establish preference. Attribute homophily: fixed topology, permuted labels; degree-stratified label shuffle if degree confounds association.
8. Clique has every pair; clique size k needs k(k−1)/2 edges. Maximal is unextendable, maximum is globally largest. C=0 means no triangles with stated convention. C=1 gives clique components of size at least 3 when zero is assigned to degree<2; isolates/single edges affect the average. Largest-clique problem hard in general.
9. Optional extensions: Brandes BFS + dependency accumulation O(nm), sampled approximation; Katz x=βAx+1 with β<1/λmax; HITS hub/authority pair; hitting/commute times and electrical resistance; rich-club density normalized by degree-preserving null; empirical assortativity bounds versus proved bounds.

### Complete exercise mapping

- 3.1 Learn: definitions, length-four walk on triangle, BFS rationale, asymmetric directed distance, weak/strong, short distance versus null.
- 3.2 Learn: graph 1–2,1–3,2–4,3–4,4–5,5–6,5–7,7–8; BFS from 1/5; radius/center/diameter; directed 4→5,5→6; count two shortest paths 1→5.
- 3.3 Tool: all giant-component distances/radius/center; distance distributions against ER and degree-preserving null; directed SCC/reachability/mean finite distance/asymmetric pair; implement BFS and validate at 20 random starts.
- 3.4 Learn: kite closeness D/F/J; betweenness H/I/C or equivalent graph; exercise-3.2 broker; construct discordant centralities; select measure for vaccination, retirement, friendship and airport closure with process caveats.
- 3.5 Tool: four top-ten rankings/intersection; log scatter b versus degree and outliers Hercules/Black Widow/Rockman; directed changes; audit LLM best-measure claim.
- 3.6 Learn: four-node A→B,A→C,B→C,C→A,D→C, two synchronous PageRank steps from .25 at α=.85; α=1; compare eigenvector and PageRank; ordinary undirected stationary distribution.
- 3.7 Tool: directed PageRank versus in-degree top ten; independent implementation with dangling treatment; validate six decimals for three α values.
- 3.8 Learn+Tool: low-degree broker/high-degree b=0 examples; 200 degree-preserving shuffles per-node b z-score; same for closeness; careful Hercules result paragraph.
- 3.9 Learn+Tool: star r; six-node positive/negative examples; ring degeneracy; Marvel r and k_nn, 200 shuffles; directed in/out choices; scrape attribute and permute labels.
- 3.10 Learn: all maximal cliques in 3.2; six-clique edges/min degree, rule out degree<7 from eight-clique; C=0/1 interpretation with low-degree convention.
- 3.11 Builder optional: build path-count, harmonic/closeness, power iteration, link-farm, k_nn or clique-search explorable.
- 3.12 Builder: weekly story using unexpected centrality, removal attack, direction, six-degrees tool, cliques/homophily; own category option.

### Resources and source results

Read Atlas 10.1/10.4, 13.1–13.3, 14 introduction/14.1/14.2/14.4/14.6, 11.1, 31.1, 30.2, 12.3. Optional matrices ch8; Katz/HITS 14.5; walks 11.3/11.4; core/periphery ch32. Video actual link: https://www.youtube.com/watch?v=IOWXZFOyk9Y . Explorables: bfs-wavefront, centrality-anatomy, random-walker, centrality-scatter, mixing-dial, clique-hunt (all .html).

Primary text reports giant-component mean distance 2.67, diameter 6, radius 3, Spider-Man center; largest strongly connected component 229; source counts 1,835 triangles, 477 five-cliques, maximum clique 8 (X-Men). These are reported baseline facts; the synthetic lab must not imply it calculates them.

Supporting official NetworkX references were read to resolve implementation conventions:
- https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.link_analysis.pagerank_alg.pagerank.html
- https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.centrality.closeness_centrality.html
- https://networkx.org/documentation/stable/reference/algorithms/generated/networkx.algorithms.assortativity.degree_assortativity_coefficient.html

Source Stanford paper http://infolab.stanford.edu/~backrub/google.html timed out in the web tool. Its contents are not claimed read. Other optional citations (Padgett/Ansell; Freeman; Newman) are named by the source, but no invented URLs/full-text access claims are supplied.
