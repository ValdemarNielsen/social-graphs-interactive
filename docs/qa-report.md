# Verification record

Local review on 19 October 2026, using the production Vite preview in the Codex browser. Desktop composition was inspected at 1440 × 960. This is an observed browser session, not a hardware benchmark or an exhaustive accessibility audit.

## Research and content

- Followed the current course index: six linked, available teaching weeks. All six primary pages were read.
- Independently matched all 65 numbered exercise identifiers to the source headings: 8, 12, 12, 13, 9 and 11 exercises across weeks 1–6. The site contains 48 substantive study sections.
- Per-chapter source notes record inaccessible/full-length readings and unwatched video material. Future weeks were not filled with invented content.
- Three design prototypes were rendered and their graph/matrix controls exercised before selecting the initial visual direction. Later character and glass references informed the final motion refinement; see [motion references](motion-references.md).

## Calculations exercised in the browser

| Check | Observed result |
|---|---|
| Clear six-node graph | 0 edges, mean degree 0, density 0, 6 components |
| Add A–F by keyboard | 1 edge, mean degree 0.333, density 0.067, 5 components; matrix remains symmetric |
| Watts–Strogatz, beta 0 | 36 nodes, 72 edges, degree 4, clustering 0.500, mean distance 4.886 |
| Erdős–Rényi, p = 0 | 0 edges, 36 components; disconnected mean distance shown as undefined |
| Erdős–Rényi, p = 1 | 630 edges, mean degree 35, clustering 1, mean distance 1 |
| Model/null comparison | 40 generated null graphs; observed and null statistics displayed separately |
| BFS, first layer | Nodes 1 and 2 appear; 3 of 8 nodes reached including source |
| Remove the bridge | Four nodes become unreachable, with infinity labels |
| Two five-node communities | Modularity 0.4524; assigning all nodes to one group gives 0 |
| Disparity, degree 1 | Alpha 1 with the degenerate-case convention explained |
| Tokenize “Cat cat dog” | 3 tokens, 2 types, 1 hapax with lowercase enabled |
| Empty text with log axes | Zero counts and an empty-chart explanation; no NaN |
| Initial document corpus | 13 dimensions, 20 tokens, document 1–2 cosine about 0.214 |
| Three identical “shared” documents | All IDF weights zero; cosine explicitly undefined |
| Clear word-context matrix | Empty empirical distribution and undefined PMI explained; PPMI zero convention stated |

Range inputs were tested with keyboard Home/End and arrow keys. An automation fill operation did not reliably fire React range events; those initial observations were discarded and replaced with keyboard checks.

## Scope of checks

The deterministic calculation suite checks known graph values, seeded models, distributions, modularity, disparity, tokenization, TF-IDF and zero-vector boundaries. `npm run build` also checks TypeScript. Browser checks cover the visible controls in the table, direct week navigation and representative small-screen layouts. Week 5 and week 6 were checked at 390 × 844 without horizontal page overflow. The final visual direction prioritizes desktop, as requested.

The opt-in `?diagnostics=1` instrument measures animation-frame intervals, layout shift, LCP and long tasks within the browser. Results depend on the machine, browser, caching and the inspection environment. It is disabled on the ordinary public URL. An earlier, pre-refinement production opening measured median 16.7 ms and p95 16.8 ms over 599 frame samples, CLS 0.0022 and LCP 1548 ms; this is not a measurement of the later character scene.

No physical mobile-device test, screen-reader audit, video-content review or full-corpus reproduction is claimed. The cinematic transitions are illustrations; numerical evidence belongs to the labeled laboratories.

## Final chapter visual and interaction pass

The final production build was inspected in the same browser session:

- All six distinct chapter covers and all six three-act stories were inspected. Week 2’s story correctly reversed from act 2 to act 1 on reverse scrolling.
- All twelve chapter-episode action buttons were exercised and displayed the correct result statuses.
- All six chapter routes were checked at a real 390 × 844 browser viewport. Each reported a 375 px document width, with no horizontal page overflow.
- In week 6, the manual reduced-motion control collapsed the story from 3168 px to 776 px; direct interaction remained functional. OS-level reduced-motion emulation was not tested.
- Saved completion survived a reload and was then toggled back to incomplete. Browser Back correctly navigated from week 5 to week 6 in the tested history.

The week 6 glass sculpture rendered through WebGL. An instrumented 19-second production sample recorded **1,109 frames**, median **16.7 ms**, p95 **16.9 ms**, **3 frames above 50 ms**, CLS **0.0046**, LCP **7,092 ms**, **3 long tasks**, **1,238 DOM nodes**, **1 canvas** and **10 assets**. This is one instrumented sample in one browser, not a cross-device performance guarantee. Startup LCP remained slow in this run.

The final build passed, and all **13 calculation tests** passed. The main JavaScript bundle was **575.02 kB**, or **196.94 kB gzip**; the bundler’s size advisory remains applicable. An earlier asset-fetch failure occurred when the production output was rebuilt while an older tab remained open. The stable build was reloaded, and `ExperimentBoundary` recovery was added.

This pass does not claim a screen-reader audit.

The final home character scene was inspected at 1440 × 960. Scrolling to progress 0.769 produced the hanging typography, including a 53 px sag in the middle letters; reversing to 0.157 restored their original transforms. A keyboard Enter replay in a fresh preview tab completed at progress 1.000 after 262 rendered frames. A screenshot was saved locally as `qa/hero-desktop.jpg`. An older inspection tab had stale animation timing; the fresh-tab replay completed normally. Deployment confirmation is recorded separately below when available.
