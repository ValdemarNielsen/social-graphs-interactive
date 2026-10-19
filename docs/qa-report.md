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

The final home character scene was inspected at 1440 × 960. Scrolling to progress 0.769 produced the hanging typography, including a 53 px sag in the middle letters; reversing to 0.157 restored their original transforms. A keyboard Enter replay in a fresh preview tab completed at progress 1.000 after 262 rendered frames. A screenshot was saved locally as `qa/hero-desktop.jpg`. An older inspection tab had stale animation timing; the fresh-tab replay completed normally.

## Public deployment

The standalone repository is [ValdemarNielsen/social-graphs-interactive](https://github.com/ValdemarNielsen/social-graphs-interactive). The initial [GitHub Actions run](https://github.com/ValdemarNielsen/social-graphs-interactive/actions/runs/39305578765) completed both build and deploy successfully for commit `24056c6`.

The [live site](https://valdemarnielsen.github.io/social-graphs-interactive/) was opened on 19 October 2026. All six chapter routes rendered their distinct headings and both interactive episodes. The week 1 graph laboratory loaded; keyboard Space added A–F and the F–A matrix cell updated symmetrically. A direct week 6 link survived refresh, rendered its WebGL canvas without the fallback, and loaded its chapter content. The fresh live tab reported no console errors or warnings during these checks. Local calculations and the broader visual checks above complement these deployment smoke checks.

## Sculptural revision QA — 19 October 2026

This is a second visual pass responding to the opening scroll stutter and requests for more elaborate, varied animation. It supersedes the original cover descriptions above, while preserving the course calculations.

- In-browser desktop review confirmed all five new cover scenes render: filament knot, chrome mechanism, transit tunnel, pearl liquid and particle type. All five direct controls were exercised. Week 5 visibly reassembled WORDS into LANGUAGE.
- The home playhead moved to 0.417, reversed to 0.148, and an independent replay completed at 1.000 with its loop stopped. Intermediate and peak poses were inspected. The final composition was checked at 1440×900 and 1280×720; the shorter layout had no horizontal page overflow.
- An initially blank tunnel was repaired with immediate first-paint/resize rendering and a vanishing point in the unobscured side. The browser then confirmed visible rings and signals, advancing canvas-frame markers, alternate state, and an offscreen pause when scrolling into the story.
- The week 3 story was scrolled into its final act. Its front plane settled to an ordinary zero-offset transform, keeping the numerical diagram readable. Cover rendering stopped offscreen.
- The production build verified still-mode liquid and immediate alternate particle compositions for weeks 1 and 5. Story components remount on motion changes to prevent animation cleanup from overwriting static final geometry. Week 6 retained a working WebGL canvas with no fallback. No console warnings or errors were recorded in this production check.
- A visual-only error boundary now contains rejected lazy sculpture imports. That recovery path was inspected in code, not induced by browser network fault injection.

A 19-second production sample of the final week 4 liquid scene at 1440×900 recorded 779 animation-frame intervals: median 16.8 ms, p95 33.5 ms, 11 above 50 ms, CLS 0, LCP 1140 ms and 3 long tasks. This is one instrumented browser sample, not a promise of device-independent frame rate. No new physical-device or screen-reader audit was performed.

All 13 calculation tests passed and the final TypeScript/production build passed. The main JavaScript bundle is 565.78 kB (192.96 kB gzip); new sculpture modules load separately. The existing bundler size advisory still applies. The numerical laboratories were not changed in this revision.


## Chapter-wide motion revision — 19 October 2026

The third pass retains all 48 topics and 65 exercise briefs, inserting twelve new sequences between study-note halves and after exercises. Static content extraction and scene-anchor mapping were independently reviewed.

The home replay completed at progress 1.000 in hold mode with its loop stopped, after 5.819 seconds of its local clock. The middle letter retained a 53.18px limp sag. The implementation now has a deterministic pose rather than underdamped springs; source lifecycle checks covered reverse/revisit equivalence, one RAF owner, resize without transform reset, offscreen/hidden pause and cleanup.

The new map, loom, press, sliced type, lenticular panel and document fan were reviewed at desktop size in the browser. Replay was exercised, and the map/loom/wall/book completed. Inspection found paper geometry crossing the controls; the map and book transformations were corrected, and the type-wall stage received a clipping boundary. A shared layout observer now refreshes scroll positions after lazy content changes document height.

In the production build, the matrix contains 14 one-cells and six zero diagonal cells, and its replay ends in hold. The probability cascade has eight chips; their completed coordinates put them in groups of 1, 3, 3, 1. These checks complement the existing 13 passing mathematical tests. No numerical laboratory implementation changed.

The production build passes TypeScript and bundling. Main JavaScript is 569.40 kB (193.77 kB gzip); the two new choreography modules load separately at 26.44 and 29.16 kB (9.05 and 9.69 kB gzip). No new dependency was introduced.

A 13.4-second instrumented production sample spanning the week 1 cover and a jump to the matrix, at 1280×720, recorded 599 frame intervals: median 16.7 ms, p95 33.2 ms, 9 above 50 ms, CLS 0.0034, LCP 728 ms and 6 long tasks. This is a mixed navigation sample, not an isolated-animation benchmark or frame-rate guarantee. Some browser inspection tabs stalled during repeated development navigation and were replaced; final checks use the stable production preview.

Final production-preview checks confirmed the A, A, A, B, C, D conveyor tickets, the distance board's 0, 1, 1, 2, 3, infinity values and completed replay, and the nine route ribbons through the shared bridge. Route replay and motion reduction were exercised. Both network sequences switched to complete static artwork with no running replay.

The corrected map's folded panels fit inside its 430 px stage. The book fan's five final pages also fit within that height, and selecting its first and final still views worked. There was no horizontal overflow on the tested week 6 page. The compact comic now measures 794 px overall, with a 455 px artwork area, at 1440×900.

In the production home page, scrolling forward reached progress 0.999 toward 1.000; reversing to the top restored progress 0.000 and stopped the animation loop. The final production inspection tab reported no console warnings or errors. This revision does not claim a physical-device or screen-reader audit.

## Visible autoplay revision — 19 October 2026

The chapter stories and twenty-four episodes now run on a visibility-gated loop, with a two-second final hold. New unit checks cover fixed-navigation occlusion, tall scenes, short viewports and hysteresis at the visibility boundary. All 16 tests pass. An independent actual-GSAP check also covered three resets and selecting a phase before resuming; this was a focused local check, not a new browser test suite.

At 1280×720, the document scene's art occupied y=232–662 after a scene-index jump. With no further scrolling it reached progress 1.000, then began another cycle. Pause held progress 0.469 despite scrolling away and returning. Resume advanced it to 0.619. After jumping to another scene, it stopped at 0.628 and remained there during later checks. The lenticular scene independently began its second cycle. The chapter story reached its final act and repeated twice while its artwork remained within y=224–616.

The production build's reduced-motion toggle put all five sequence instances in the tested chapter into reduced mode at progress 1.000. The preferential-attachment teaching episode fit within y=211–557. Its explicit action changed five nodes/seven edges to six nodes/nine edges; automatic loops do not trigger that action or alter the data.

The final compact network layouts were checked at 1280×720: the probability stage occupied y=208–638, including all four outcome bins, and repeated without scrolling; the conveyor stage also measured 430 px, with its odds readout ending at y=580. The complete six-row distance board ended at y=578 inside its 430 px stage, reached the final act and began another cycle. The final inspection tab had no console warnings/errors or horizontal overflow. A stalled automation tab was replaced during these checks.

The final TypeScript/production build passes. Main JavaScript is 572.07 kB (195.92 kB gzip); the existing bundle-size advisory remains. No dependency or numerical-laboratory change was introduced. These are desktop browser checks, not a physical-device or screen-reader audit.

### Earlier animation starts

The initial autoplay gate was too late for ordinary scrolling. It now starts with 40 px of artwork visible, retains an 8 px exit threshold, removes the 300 ms lead-in and reduces sequence playback duration by 25%. The two-second final hold is unchanged. All 16 tests and the production build pass. At 1280×720 the probability scene remained playing with its top at y=640, leaving only 80 px on screen. Restarting there immediately advanced to progress 0.204; it no longer waits for almost the whole stage to enter. The shared phase-selection seek was adjusted to the new timing as well.

## Immediate action and material revision — 19 October 2026

The specific week 6 story was covered by the shared controller, but its semantic action was delayed inside the scene timeline. All six story timelines now begin meaningful movement at time zero. Independent sampling of the production builder with real GSAP core and AttrPlugin confirmed changes at 2% progress, correct final values and exact resets. The 21 community edges remain attached to their matching node positions within attribute rounding tolerance. Week 6 still maps A, B and C to (2,1), (1,2) and (0,3), with equal units on the axes and cosine 0.800. Its camera stays flat. Server-rendering the actual six Story components with reduced motion confirmed the final acts and visible results.

In the browser at 1280×720, restarting week 6 with its art starting at y=620 produced progress 0.306 and a ray dash offset of 0.018, with visibly displaced word chips. It no longer spends the opening seconds moving only its frame. A scene-index jump places the full 401.5 px artwork within y=224–625. The new optical context plate and document fan completed and repeated while stationary; the fan fits within y=232–662. Small coordinate labels were enlarged and darkened without increasing the artwork height.

The six cover compositions were visually checked. The material pass uses a metal aperture, ivory folded sheets, continuous filaments and route ribs, solid printed typography and an optical glass ribbon. Controls changed the cover compositions and live status messages. The glass rotation button reached rotation 0.993 toward its target of 1 without remounting the renderer. An independent shader review found that a bounded internal ray could fail to exit; that case now uses an explicit single-interface approximation rather than an invalid interior exit normal.

The production reduced-motion toggle put all five week 4 sequence instances at progress 1.000 and kept the selected expanded cover in a still view. Motion was restored afterward. A 19.5-second production sample including the paper cover, its action and the still-view toggle recorded median frame interval 16.7 ms, p95 33.3 ms, CLS 0.0077 and six long tasks. This mixed interaction sample is not an isolated GPU benchmark or frame-rate guarantee. The adaptive shader fallback stopped at 85% spatial density with a 30 Hz rendering budget, rather than progressively reducing density to 45%.

All 16 calculation/visibility tests pass. Production TypeScript and bundling pass, with the existing main-bundle size advisory. Numerical laboratory code and educational content are unchanged. No new dependency was introduced. These checks use the desktop browser; no physical-device or screen-reader audit is claimed.
