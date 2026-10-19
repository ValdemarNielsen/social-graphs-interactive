# Design studies and chapter storyboards

## Three directions, inspected before commitment

The lightweight [prototype page](../public/concepts.html) contains three switchable opening scenes and a working six-node graph/matrix interaction. Each direction was inspected in the browser at **1440 × 960**, including a full-page view, graph/matrix switching and changing edge counts. The interaction recalculates density and average degree from the same graph. This records the observed prototype review; it is not a performance benchmark or a claim about every final page.

| Direction | Composition and narrative | Learning interaction | Review outcome |
|---|---|---|---|
| **Signal** | A dark observatory: oversized restrained typography against a luminous network, with generous quiet space around the opening question | A precise instrument below the atmospheric opening; the user changes representation while structure stays fixed | Strongest balance between typography and graph. Selected as the overall visual direction |
| **Field Notes** | A warm paper-like page, serif headline, fine framing and an angled diagram; an editorial notebook rather than an observatory | A calm graph/matrix explanation with visible values, suited to reading and comparing small examples | Clear and inviting for dense explanations. Its visual character informs the lighter language chapter, especially week 5 |
| **System** | A yellow/black instrument-panel treatment, compressed uppercase headline and abrupt spatial divisions | A forceful demonstration with exposed controls and numerical readouts | The desktop title and graphic overlapped in the inspected prototype. Its visual force outweighed reading clarity, so it was not selected as the main layout |

The initial selection established the educational instruments and reading rhythm. The later creative refinement makes the opening a physical comic encounter and gives every chapter a different visual world, rather than applying one arrangement in different colors. Navigation, keyboard controls, mathematical conventions and source disclosure stay recognizable. The prototype review above describes the earlier studies, not a claim that these later compositions were already inspected.

## Design system and pacing

Space Grotesk supplies architectural headings and instrument labels. Inter supports body text and controls. Instrument Serif introduces a softer, human voice in selected phrases and the language chapter. These font files are locally bundled under their original OFL licenses; runtime font loading does not require Google Fonts.

The overview offers immediate chapter choice. Each chapter now has its own illustrated cover, a three-act scroll scene, a live laboratory, two additional interactive visual episodes around the study material, and quieter exercises and self-checks. The added motion has different jobs: establish a world, demonstrate a relationship, invite an intervention, then give the reader room to reason. The source trail remains visible at the end of every chapter.

The comic opening, chapter cover artwork, decorative miniatures and glass sculpture are visual metaphors. They are not observations of the course datasets. Exact synthetic examples are identified separately in the scroll scenes and interactive episodes. Quantitative laboratory graphics derive from the displayed data or seeded synthetic models. The distinction is visible in the interface.

## Storyboard: opening

1. **Anticipation:** enormous “Everything / is connected.” typography sits on pale paper. An original red-and-blue Spider-Man illustration hangs from a web at the right. Mask lenses, drawn suit webbing, muscle panels and bent limbs provide a recognizable comic silhouette. A glass field note reads “Change one link. Move the whole.”
2. **Approach:** the character swings across a broad arc. The body rotates around the upper torso; the overhead thread stays attached to the raised hand.
3. **Contact:** a web shoots from the forward hand to the word. Secondary strands connect other letters, and a brief drawn impact mark identifies the moment of contact.
4. **Tension:** the reaching arm rotates at its shoulder, the mask counter-tilts, and the whole body recoils. Individual glyphs move off their baseline according to their distance from the attachment. Web coordinates follow both the articulated hand and the translated, rotated glyph anchors.
5. **Release:** different glyph masses are suggested by different spring stiffnesses. During replay, damped springs overshoot and settle into a hanging word; the middle letters sag between their neighbors. This is illustrative physics, not a claim about a measured network.
6. **Exit:** the reader can immediately enter week 1 or jump to the chapter index. The scroll scene uses about 190 viewport heights on desktop, but no destination requires sitting through it.

The visible **Pull the thread** button runs a finite 5.8-second encounter without requiring scrolling and works with the keyboard. Native scrolling samples the same choreography reversibly; full-pull and final poses are deterministic at a given scroll position. Desktop typography is lifted toward a hand above it. On narrow screens the character is placed lower, so the web pulls letters downward toward that hand before they settle.

`HeroExperience.tsx` owns this scene. GSAP advances only the replay playhead. A separate animation-frame loop integrates the letter springs in stable 120 Hz substeps and writes actor, letter and thread geometry; neither system competes for the same transform. Real elapsed time is retained so sparse browser frame delivery does not leave physics far behind the playhead. Intersection and document-visibility observers pause hidden work, cleanup cancels frames and replay, and font/viewport changes refresh the attachment geometry. Sticky offsets match the site header: 78 px desktop, 66 px mobile. Reduced motion bypasses the long scroll and shows a still composition; the button switches still states directly.

## Six different chapter covers

| Week | Visual world | Composition and moving material | Deliberate intervention |
|---|---|---|---|
| 1 | Comic relationship atlas | Paper, halftone marks, a large mask-like central character node and named Marvel relationships | Rewire the scene; the illustrated relationships are explicitly not the course dataset |
| 2 | A model-making machine | A dark axonometric field of blocks, changing depths, orange selected elements and exposed seed notation | Turn the machine |
| 3 | An influence transit system | Layered colored transit lines, transfer stations, route labels and traveling signals | Send a signal |
| 4 | A territorial atlas | Contour fields, network settlements, a compass and a movable dashed partition boundary | Move the boundary |
| 5 | A language printing press | Large serif words on irregular type blocks, repeated “THE” tiles and a red editorial stamp | Set the type |
| 6 | A meaning observatory | A custom implicit-surface WebGL sculpture with reflected light, chromatic refraction and a dark spatial setting | Rotate the constellation |

The cover drawings are original Canvas compositions. The sixth cover uses the separately owned `GlassSculpture` shader and its fallback. These covers establish metaphors; their layouts and optical effects are not statistical plots, learned embeddings, or physical measurements. The chapter question and immediate laboratory/study/exercise/source jumps remain outside the artwork.

## Twelve additional visual episodes

`ChapterInterlude({week, reduced, variant})` places one episode before study and another after study. Each has its own intervention, with scoped SVG/CSS motion and a finite event rather than an endless decorative loop. Reduced motion shows a useful static state.

| Week | Before study | After study |
|---|---|---|
| 1 | **Every link counts twice:** make an introduction; exact degree counts update on a six-node graph | **A crowd becomes a distribution:** nodes stack into their exact degree histogram bins |
| 2 | **The rich get more chances:** add a node to a seeded preferential-attachment example, with m=2 and a complete three-node seed | **One world is not a baseline:** generate 96 G(12, 0.18) realizations and inspect their actual edge-count distribution |
| 3 | **A shortcut rewrites the journey:** open an express connection; an explicit A→I shortest route changes from four hops to one | **Cut once. Divide everything:** sever a bridge; an eight-node graph changes from one component to two, creating 16 unreachable unordered pairs |
| 4 | **Borders are a hypothesis:** redraw a partition and recalculate modularity on a fixed nine-node, eleven-edge graph | **Weight needs a local scale:** apply the disparity test at the center of a weighted star with weights 1, 2, 3, 8 and 14; compare disclosed thresholds |
| 5 | **Cut a sentence into pieces:** “The map is not the territory.” becomes six tokens and five lowercased types | **Repetition builds a skyline:** remove “the” and watch the count profile change from 4,3,2,1 to 3,2,1 |
| 6 | **Let common words lose gravity:** three documents become relative-TF × IDF rows; ubiquitous “the” receives zero IDF | **One word. Two constellations:** compare finance and river contexts of “bank” using exact ±2-window counts; placement is hand arranged, not a trained embedding |

These entries describe implemented episode behavior, not the outcome of a completed browser review. Integrated composition, transition and boundary checks are recorded separately in the QA report.

## Week 1 — Relationships become a representation

- **Beginning:** six labeled nodes A–F and seven undirected edges form a small graph.
- **During scroll:** the edges recede; the same node labels align as rows, and the adjacency grid appears.
- **Relationship communicated:** one undirected edge becomes two mirrored matrix entries; the diagonal stays zero.
- **Reveal:** seven edges produce fourteen ones. Node identity and the exact edge set are preserved.
- **Next scene:** the interactive graph editor lets the reader change the relationships and inspect the recalculated matrix and statistics.

This scene is exact for its explicitly synthetic six-node example. It is not a projection of the Marvel data.

## Week 2 — Small changes to a mechanism

- **Beginning:** a degree-four, twenty-node ring shows the exact five-hop route 0→2→4→6→8→10.
- **During scroll:** a new edge is drawn from 0 to 10 and a packet follows it; the old route loses emphasis.
- **Relationship communicated:** graph distance counts edges rather than their drawn geometric length.
- **Reveal:** the specific route changes from five hops to one.
- **Next scene:** model controls generate actual seeded random, small-world and preferential-attachment examples with calculated values.

The path counts are exact for this synthetic edge-addition example. The scene is explicitly not Watts–Strogatz rewiring and makes no claim about the graph’s mean distance. The laboratory demonstrates the actual model.

## Week 3 — A position has several meanings

- **Beginning:** source A appears at distance zero in an explicit eight-node graph.
- **During scroll:** the BFS frontier reveals exact layers {B,C}, D, E, {F,G}, H.
- **Relationship communicated:** all nodes at one hop distance are discovered before the next layer.
- **Reveal:** all eight nodes are reached; H is five hops from A.
- **Next scene:** the centrality laboratory computes the actual measures on an explicit graph.

The expanding wave is a visual cue; the displayed hop columns and node distance values are exact for the stated graph. Its layout is not a geometric distance measurement.

## Week 4 — A grouping is a hypothesis

- **Beginning:** ten nodes and twenty-one edges appear in a circular layout.
- **During scroll:** two five-node cliques move apart and every edge follows its endpoints; the bridge remains.
- **Relationship communicated:** partitioning makes a group-level interpretation visible.
- **Reveal:** the displayed two-group partition has exact modularity Q=19/42≈0.4524.
- **Next scene:** the reader changes community labels and sees modularity calculated on the actual synthetic graph.

The layout transition does not run Louvain or prove a social truth. The graph, partition and score are explicit synthetic inputs; the study section explains null models, instability and overlapping memberships.

## Week 5 — Text becomes countable units

- **Beginning:** a punctuation-free twelve-word sentence is arranged as flowing language.
- **During scroll:** its occurrences move into individually indexed tiles and repeated “the” tokens receive matching marks.
- **Relationship communicated:** segmentation creates the units that later counts depend on.
- **Reveal:** twelve tokens contain ten distinct types; “the” occurs three times.
- **Next scene:** an editable corpus exposes the exact teaching tokenizer, lowercase/stopword choices, token occurrences and an observed rank-frequency curve.

The scene’s simple whitespace segmentation is explicit. The editable laboratory then exposes its separate Unicode/apostrophe/hyphen rules; neither claims to emulate spaCy or BPE.

## Week 6 — A representation creates a geometry

- **Beginning:** three documents contain only the words “star” and “light”.
- **During scroll:** each document’s words collapse into an exact two-dimensional count coordinate.
- **Relationship communicated:** representing language numerically creates coordinates in which comparison becomes possible.
- **Reveal:** A=(2,1), B=(1,2), C=(0,3), and cos(A,B)=0.800 in the displayed count space.
- **Next scene:** the three-document laboratory computes raw counts, course-defined TF-IDF and cosine directly from editable text, with explicit undefined results for zero vectors.

Both coordinate axes and their values are exact for this count space. It is not a learned embedding, a fitted topic model or a claim about semantic proximity. Laboratory bars use labeled scales and all vector dimensions feed similarity. The additional context laboratory computes base-2 PMI/PPMI with explicit zero-count and empty-matrix boundaries.

## Motion ownership and escape routes

GSAP/ScrollTrigger owns the main chapter SVG narratives, caption changes and scene progress. The home hero has its own spring renderer, while its GSAP tween controls only a numerical playhead. Cover Canvas renderers, the WebGL sculpture and interactive episodes own their separate surfaces. React owns content and experiment state. Cleanup reverts scoped GSAP contexts, cancels frames and disconnects observers when components leave the page.

The long scenes use native page scrolling and sticky composition rather than scroll hijacking. Scroll-linked states respond in both directions. Header navigation and chapter links remain accessible, and direct jumps can bypass the visual sequence.

When system reduced motion or the manual reduction control is active, cover art draws a still frame, the hero bypasses its long scroll and chapter timelines are not created. The main chapter scenes show their explanatory end state in a normal static block. Controls, exact values and study text remain available; no exercise requires watching a transformation.

## Mobile and review boundaries

Mobile layouts stack the question and graphic, then controls and results. Chapter miniatures are removed from the overview where they would compete with titles. Study navigation becomes a compact grid. Data regions can scroll horizontally without making the page itself overflow. Typography, spacing, hit targets and sticky offsets have responsive rules.

This document records design decisions, source-code behavior and the observed three-direction prototype review. It does not certify a frame rate, all mobile devices, screen-reader conformance or the completion of final browser tests. Those checks and measured limitations belong in the separate delivery QA report.
