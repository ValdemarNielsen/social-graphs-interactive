# Attribution and third-party notices

Versions below were read from the installed packages and lockfile on **19 October 2026**. `package-lock.json` records the complete resolved dependency graph. A later dependency update should review these notices and refresh copied license files where necessary.

## Educational source

**Sune Lehmann / Technical University of Denmark, Social Graphs and Interactions 2026 (02805)** — [course index](https://sunelehmann.com/socialgraphs2026-web/index.html#weeks).

The original weekly pages identify their content as [Creative Commons Attribution-ShareAlike 4.0 International](https://creativecommons.org/licenses/by-sa/4.0/). Course-derived explanations and exercise briefs in this companion are adapted under that license. Changes include original paraphrasing, a new sequence and layout, study summaries, linked exercise briefs and new interactive synthetic examples. Attribution is retained in the website footer, each chapter’s sources, the inventories and this file. The companion is independent; no endorsement by DTU or the course author is implied.

Research copies are not part of the public site build. Datasets, third-party papers, videos and pretrained models are linked to their original hosts rather than relicensed by this project. Their own terms continue to apply. No downloaded Marvel images, course photography or external video is bundled.

## Character depiction and visual references

The home scene includes an **original SVG drawing depicting Spider-Man**, created for this project. Original drawing and animation code do not transfer rights in the underlying character. Spider-Man, other Marvel characters and associated names and trademarks remain subject to their respective owners’ rights. **The project’s MIT license grants no rights in those characters or trademarks.** No endorsement or affiliation is claimed.

The six covers, six scroll stories and twelve interactive episodes use original canvas, SVG, CSS and shader implementations. The project does not include downloaded Marvel images or assets copied from Ollivere, T.RICKS, Codrops or other visual references. [Motion references and implementation notes](https://github.com/ValdemarNielsen/social-graphs-interactive/blob/main/docs/motion-references.md) identify the inspiration and primary documentation separately from the implementation.

The WebGL glass sculpture uses custom raymarching and approximate optical effects. It is a visual metaphor, not a physically validated optics simulation or a measured embedding projection. Three.js documentation informed material concepts; the application does not import Three.js.

## Runtime packages

| Package | Installed version | License and source |
|---|---|---|
| React | 19.3.1 | MIT; Meta Platforms, Inc. and affiliates; [React](https://github.com/facebook/react) |
| React DOM | 19.3.1 | MIT; Meta Platforms, Inc. and affiliates; [React](https://github.com/facebook/react) |
| scheduler | 0.28.0 | MIT; Meta Platforms, Inc. and affiliates; [React](https://github.com/facebook/react) |
| GSAP, including ScrollTrigger | 3.15.0 | GSAP standard no-charge license; [license terms](https://gsap.com/standard-license/) |
| @fontsource/inter | 5.3.0 | Font files: SIL OFL 1.1; [Inter](https://github.com/rsms/inter) |
| @fontsource/instrument-serif | 5.3.0 | Font files: SIL OFL 1.1; [Instrument Serif](https://github.com/Instrument/instrument-serif) |
| @fontsource/space-grotesk | 5.3.0 | Font files: SIL OFL 1.1; [Space Grotesk](https://github.com/floriankarsten/space-grotesk) |

**GSAP is not MIT-licensed.** Its installed package identifies the standard license at the link above. The distributed library header credits GreenSock, 2008–2026; the current license page identifies Webflow’s terms. Original proprietary notices remain applicable. This project uses GSAP for page animation. The project’s MIT license does not override GSAP’s license or extend rights to its code. See [licenses/GSAP-NOTICE.txt](licenses/GSAP-NOTICE.txt).

React also uses the MIT-licensed scheduler package; its copied notice is included in the licenses directory. The explicit copies in this project provide a readable record of runtime copyright notices and license terms. Preserve these notices with redistributed builds.

## Fonts

- **Inter:** Copyright 2016 The Inter Project Authors. [Full bundled license](licenses/Inter-OFL.txt).
- **Instrument Serif:** Copyright 2022 The Instrument Serif Project Authors. [Full bundled license](licenses/Instrument-Serif-OFL.txt).
- **Space Grotesk:** Copyright 2020 The Space Grotesk Project Authors. [Full bundled license](licenses/Space-Grotesk-OFL.txt).

Font binaries are unmodified package assets. The site imports Latin weights/styles locally through Fontsource. The font copyrights and complete SIL OFL text are copied verbatim from each installed package into `licenses/` and `public/licenses/`, so the published artifact includes them.

## Build and verification tools

| Package | Installed version | Declared license |
|---|---|---|
| Vite | 8.3.4 | MIT |
| @vitejs/plugin-react | 6.1.2 | MIT |
| TypeScript | 7.0.2 | Apache-2.0 |

| @types/react | 19.3.0 | MIT |
| @types/react-dom | 19.3.0 | MIT |

These tools support development, building or verification; they are not external paid services required by the learner-facing website. Transitive packages retain their respective licenses as shipped in npm. Consult the lockfile and installed package notices when redistributing development dependencies.

## Original material

The original application implementation, chapter compositions, SVG/code drawings, custom shader, synthetic graph examples and laboratory interface were created for this project. Their licensing is described in [LICENSE](LICENSE), separately from adapted educational content, underlying character and trademark rights, and third-party dependencies.
