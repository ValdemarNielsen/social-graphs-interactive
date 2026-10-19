# Social Graphs — an interactive field guide

A standalone React, TypeScript and Vite learning companion to [Sune Lehmann’s 2026 Social Graphs and Interactions course, DTU 02805](https://sunelehmann.com/socialgraphs2026-web/index.html#weeks). Six independent chapter pages combine live mathematical experiments, study notes and exercise briefs with **six distinct chapter covers, six animated stories and twenty-four interactive visual episodes**.

The home scene uses an original SVG Spider-Man drawing to pull connected typography, with one smoothed, reversible pull-and-release playhead. Its hanging letters derive from the same pose, avoiding independent spring wobble. The chapter openings now include a woven three-dimensional filament knot, an exploding chrome mechanism, a bending transit tunnel, merging iridescent liquid forms, particle typography, and the original week 6 glass sculpture. Canvas scenes use perspective projection; the chrome, liquid and glass use custom WebGL raymarching. These are illustrative compositions with approximate optical effects, not measured networks or physically validated optical simulations.

Twelve additional full-width scenes now interrupt the study notes and follow the exercises: a hinged comic, flip-tile matrix, probability cascade, popularity conveyor, departure board, route ribbons, folding map, weaving loom, printing press, fractured type wall, lenticular context panels and document scanner. Each chapter has a six-scene index, prominent playback controls and a reduced-motion presentation.

Chapter stories and episodes automatically play while their artwork is clearly visible, hold the finished composition for two seconds, then gently reset and repeat. Scrolling no longer drives these timelines. Pause/resume and restart sit above the artwork; offscreen or hidden scenes stop advancing. Scene jumps frame the playback controls and artwork together. Numerical teaching actions stay under the reader's control, and reduced motion provides still views. The home Spider-Man sequence retains its fitted sticky scroll stage.

This project lives in its own repository, **[ValdemarNielsen/social-graphs-interactive](https://github.com/ValdemarNielsen/social-graphs-interactive)**, with its own GitHub Pages deployment. It does not require or modify another project.

**Live website:** [valdemarnielsen.github.io/social-graphs-interactive](https://valdemarnielsen.github.io/social-graphs-interactive/). The initial build and deployment succeeded on 19 October 2026; all six public chapter routes were checked in the browser.

## Run locally

Use Node.js **24** and npm. From this project’s directory:

```sh
npm ci
npm run dev
```

Open the local address printed by Vite, normally `http://127.0.0.1:5173`. To build and inspect the static production output:

```sh
npm test
npm run build
npm run preview
```

The preview normally runs at `http://127.0.0.1:4173`. Serve `dist/` through an HTTP server; do not open its HTML directly with a `file:` URL. `npm run build` includes TypeScript checking. `npm test` runs deterministic calculation and animation-visibility tests. These commands document how to verify the project; observed browser and performance results are reported separately in the delivery QA notes.

## Course coverage

The index was checked on **19 October 2026**. All six linked weekly teaching pages were read. The companion contains **48 explanation sections and 65 numbered exercise briefs**, preserving source exercise identifiers and linking back to complete instructions.

| Week | Coverage | Live experiment |
|---|---|---|
| 1 | Graph representation, data collection, degree, matrices and distributions | Edit a small graph and its adjacency matrix |
| 2 | Random graphs, small worlds, preferential attachment and null comparisons | Change model parameters on seeded synthetic networks |
| 3 | Paths, brokerage, centrality and interpretations of importance | Compare node measures and paths |
| 4 | Communities, modularity, Louvain, overlap, weights and backbones | Edit community membership and calculate modularity |
| 5 | Tokens, preprocessing, frequencies, Zipf, context and Bag of Words | Edit text, inspect tokens and exact rank-frequency counts |
| 6 | TF-IDF, cosine, term contrasts, LDA, PPMI and static embeddings | Edit documents plus a word-context matrix; inspect TF-IDF, cosine and PPMI |

Weeks 7 and 8 are listed but do not have available weekly pages in the discovered index. Weeks 9–13 are the project period without separate weekly teaching-page links. Future material has not been invented or substituted from a different course year.

The research inventories record detailed coverage and access limits:

- [Weeks 1–3 inventory](docs/inventory-weeks-1-3.md)
- [Weeks 4–6 inventory](docs/inventory-weeks-4-6.md)
- [Design studies and chapter storyboards](docs/design-and-storyboards.md)
- [Motion references and implementation notes](docs/motion-references.md), including links to the primary references and official implementation documentation
- [QA report](docs/qa-report.md), separating observed checks from limitations

The experiments deliberately use labeled synthetic data. The [frozen course datasets](https://sunelehmann.com/socialgraphs2026-web/data/) remain external downloads. Reported philosopher/Marvel results are attributed course examples, not newly reproduced measurements. Full datasets, pretrained embeddings, LDA training and Word2Vec training are not bundled. External videos and every optional paper were not individually reviewed; per-chapter source notes distinguish accessible readings, parser limitations and linked extensions.

## Navigation, accessibility and local state

Routes use hashes: `#/`, `#/week/1`, …, `#/week/6`. A direct chapter link such as `https://valdemarnielsen.github.io/social-graphs-interactive/#/week/6` loads the same static entry document, so refreshing a chapter does not require server rewrite rules. Unknown chapter routes display a return path to the overview.

Vite’s `base: './'` makes built assets relative to the repository’s Pages path. Navigation, the study-topic list, section jumps and browser back/forward remain separate from the scroll illustrations. The six-node graph-to-matrix story preserves exact relationships. The twelve original teaching episodes calculate the values they display, including degree counts, seeded networks, paths, modularity, token frequencies and TF-IDF. Illustrative placement and decorative scenes are identified where used; the laboratories support more detailed numerical exploration.

The interface includes keyboard controls, visible focus, a skip link, responsive layouts, a system reduced-motion response and a manual motion control. Reduced motion keeps stories still and makes episode changes immediate while preserving the actions and results. Canvas/WebGL animation owners handle offscreen and hidden-tab work locally; laboratory modules load on demand. See the QA report for the checks actually performed.

Chapter completion, self-check boxes and the motion preference are stored only in this browser’s local storage. No account, backend, tracking service or paid API is required. Clearing site storage clears progress. Typed laboratory text is processed in the browser and is not uploaded or saved by the application.

## Deploy this repository to GitHub Pages

1. Place this project at the root of the separate repository `ValdemarNielsen/social-graphs-interactive`, using `main` as the publication branch.
2. In that repository’s **Settings → Pages**, select **GitHub Actions** as the source.
3. Push to `main`, or run **Deploy to GitHub Pages** from the Actions tab.
4. Wait for both the build and deploy jobs to succeed. Use the deployment URL emitted by the `github-pages` environment as the confirmed live address.

The included [.github/workflows/deploy.yml](.github/workflows/deploy.yml) installs Node 24, performs `npm ci`, runs calculation tests, builds the project, uploads `dist/` and deploys that artifact. Deployment requires the repository’s Pages configuration and the workflow’s Pages/OIDC permissions. It publishes only this repository’s artifact.

Workflow versions were checked against the official GitHub release endpoints on 19 October 2026: checkout 7.0.1, setup-node 7.1.0, configure-pages 6.0.0, upload-pages-artifact 5.0.0 and deploy-pages 5.0.1. See [GitHub’s custom Pages workflow documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages) for configuration details.

## Project map

```text
src/App.tsx                  Page shell, routes, navigation and local progress
src/content-networks.ts      Weeks 1–3 learning content
src/content-language.ts      Weeks 4–6 learning content
src/HeroExperience.tsx       Original Spider-Man SVG and connected-type interaction
src/ChapterCover.tsx         Six chapter-specific cover compositions
src/GlassSculpture.tsx       Custom WebGL raymarching sculpture and fallback
src/MatterSculpture.tsx      Chrome mechanism and iridescent liquid raymarching
src/ParticleTheatre.tsx      Projected filament, transit and typography scenes
src/Visuals.tsx              Six GSAP/SVG scroll stories and diagram previews
src/ChapterInterlude.tsx     Twelve distinct interactive teaching episodes
src/ChapterJourney.tsx       Scene index, split study notes, lazy sequence boundaries
src/NetworkChoreography.tsx  Six additional network mechanisms within/beyond notes
src/LanguageChoreography.tsx Six additional map, print and document mechanisms
src/MotionAtmosphere.tsx     Editorial entrances, preview tilt and scroll accents
src/GraphLabs.tsx            Quantitative graph experiments
src/LanguageLabs.tsx         Quantitative text experiments
src/ContextLab.tsx           Editable word-context and PPMI laboratory
src/Diagnostics.tsx          Opt-in browser timing instrument
src/math.ts                  Pure, deterministic calculation functions
src/style.css               Core layout and responsive fallbacks
src/*-experience.css        Home and story presentation
src/chapter-*.css            Cover and episode identities
src/motion-atmosphere.css    Scoped interface motion and depth
tests/math.test.ts           Numerical and boundary-case checks
public/concepts.html        Three lightweight visual design studies
public/licenses/            Notices included in the published site
docs/                       Research inventories and design rationale
```

## Attribution and licenses

Educational explanations and exercise adaptations credit **Sune Lehmann / DTU**, [Social Graphs and Interactions 2026](https://sunelehmann.com/socialgraphs2026-web/index.html#weeks), and are shared under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/). The adaptation changes wording, organization, presentation and interactive examples. This is an independent companion, not an official DTU website.

Original application code and original visual implementations are licensed under MIT, with the content and third-party exclusions described in [LICENSE](LICENSE). The Spider-Man SVG was drawn for this project; no downloaded Marvel images or copied reference assets are included. MIT grants no rights in the Spider-Man character, Marvel characters or their trademarks. Fonts retain SIL Open Font License 1.1. GSAP retains its own standard license, **not MIT**. Exact package versions and notices appear in [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) and [licenses/](licenses/).
