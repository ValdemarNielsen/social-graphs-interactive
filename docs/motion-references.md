# Motion references and the interface atmosphere pass

The second motion pass responds to a request for a more expressive desktop experience. The references inform timing, depth and typography; this project does not download, copy or redistribute their images, scripts, fonts, dinosaur artwork or other assets.

## References and what they contribute

- [Ollivere](https://ollivere.webflow.io/) — the project’s browser review observed a dinosaur biting the word “Nonsense” and letters that droop. The useful lesson is that typography can respond with personality rather than appearing as a generic fade. The companion applies this at a smaller editorial scale: chapter title lines emerge with a brief perspective change, and diagram previews respond to the pointer. The dinosaur and its animation are not reproduced. The text-only web fetch of this reference failed; the observations come from the actual browser review, not that fetch.
- [T.RICKS glassmorphism study](https://tricks-glassmorphism.webflow.io/) — a source for studying optical layers, fine rims and light on surfaces. Here the main laboratory panel gains a restrained layered gradient, a bright upper edge and a soft depth shadow. Its reading surface remains opaque enough to keep mathematical controls and charts legible. This is a fresh CSS implementation, not imported Webflow code. The page was reachable through the web reader; the project’s separate browser review examines the original moving composition.
- [Codrops: On-Scroll Letter Animations](https://tympanus.net/codrops/2021/01/20/on-scroll-letter-animations/) — a reference for typography that develops with scroll position. The companion’s manifesto uses a continuous contrast sweep through existing lines, preserving the text and its DOM order. No demo assets or source code are copied, and no letter-splitting library is required by this interface pass.
- [GSAP: matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/) and [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) — primary implementation documentation for responsive, reversible animation setup and teardown. Desktop-only setup is scoped to a GSAP media context and is reverted when the route, viewport condition or reduced-motion state changes.
- [Three.js: MeshPhysicalMaterial](https://threejs.org/docs/pages/MeshPhysicalMaterial.html) — the cover work researched transmission, iridescence and dispersion concepts in the official documentation. Week 6 uses an original custom WebGL shader; it does not import Three.js or claim physically exact optical simulation.
- [Codrops Scroll3DGrid](https://tympanus.net/Development/Scroll3DGrid/) and [Codrops 3DCarousel](https://tympanus.net/Development/3DCarousel/) — the project reviewed these spatial compositions as further references for perspective and depth. Their assets and code are not included in this project.
- [GSAP MotionPathPlugin](https://gsap.com/docs/v3/Plugins/MotionPathPlugin/) and [GSAP easing documentation](https://www.gsap.com/docs/v3/Eases/) — official implementation references reviewed for the expanded motion pass. The interlude’s route packet is instead an original finite sequence of SVG coordinate tweens along its calculated path, so its behavior does not require MotionPathPlugin.

## Scope and ownership

`MotionAtmosphere.tsx` is an effect-only component. Render it once with the current `route` number and resolved `reduced` boolean; it imports `motion-atmosphere.css` itself. It does not add wrappers, clone text, change a control value or own an application route.

This module owns only chapter-title entrance transforms, the chapter background numeral’s parallax, small entrances on headings/objectives, the manifesto’s contrast variable and decorative chapter-preview pointer motion. The home hero and narrative Story sequences retain their own animation owners. No body paragraph, exercise prompt or mathematical value is hidden behind a reveal.

The chapter title and numeral selectors support the new `.chapter-cover` / `.cover-edition` as well as the earlier `.chapter-hero` markup. The cover owns its composition, canvas and WebGL art; the atmosphere effect only adds those two editorial motions.

The main laboratory glass treatment is static: it uses layered gradients, rim lighting and shadows. It does not animate filters or blur an entire scrolling canvas. Chart values, scales and control positions are untouched.

## Behavior

- Chapter title spans enter over 0.9 seconds with 0.12-second staggering; temporary transforms and clipping are cleared after the entrance.
- The large chapter number drifts behind the title as that opening leaves the viewport. It is decorative and excluded from the accessible reading order by the original component.
- The manifesto gains contrast as its lines cross the viewport. Even its initial state is visible; this is emphasis rather than a text unlock.
- Headings and objective rows receive one short entrance when observed. Their initial opacity is 0.78, and body text remains unchanged. An IntersectionObserver avoids continuously polling every note section.
- Chapter navigation links remain flat and stable. Only their decorative SVG previews tilt, with a localized light response behind the row. Keyboard focus receives the same visible light treatment; no pointer action is required to open a chapter.

The effect is enabled only from **1024 CSS pixels** upward and when the resolved user/system preference allows motion. Small screens keep the base layout. The component tears down observers, listeners, animation frames, GSAP effects and temporary attributes on cleanup. It adds no perpetual floating animation and performs no network requests.

This document records implementation intent and verified reference access. Visual integration, motion-in-browser review and performance checks must be recorded by the main QA pass after the component is mounted; source inspection alone does not certify those outcomes.

## Twelve independent chapter episodes

`ChapterInterlude.tsx` exports a component accepting `{ week, reduced, variant }`, where `variant` is `before-study` or `after-study`. Each chapter receives two different original scenes, a named central action, a visible result and a methodological note. Their layouts use SVG and local CSS; no third-party visual assets are used.

| Week | Before study | After study | Numerical basis |
| --- | --- | --- | --- |
| 1 | Comic-style introductions update every node’s degree | Lettered node tiles move into degree bins | Exact graph degrees, edge count and handshaking identity |
| 2 | A seeded preferential-attachment machine admits new nodes | An ensemble of 96 random worlds becomes an edge-count histogram | Seeded BA with m = 2 and complete K3 seed; exact G(12, 0.18) samples |
| 3 | Transit lines gain an express connection and a packet traverses the shortest route | A severed bridge splits two islands | Breadth-first path, components and unreachable unordered pairs |
| 4 | Contour-map borders redraw a fixed network’s partition | Weighted star links fade under a local disparity cutoff | Exact modularity at γ = 1; central-endpoint disparity α |
| 5 | A printing plate cuts a sentence into lowercase tokens | Repeated letterpress blocks form a frequency skyline | Actual tokenizer output and exact token counts |
| 6 | Three document cards collapse into TF-IDF columns | “Bank” changes from river to financial context | Relative-TF unsmoothed-IDF weights; exact context counts in a ±2 token window |

All spatial positions are illustrative, except representation positions that explicitly encode a labelled bin or value. The context constellation is not a trained embedding. Community contours are not a community-detection algorithm, and a local disparity check is not a complete two-endpoint backbone. The random-world comparison is not presented as a statistical significance test. The scenes say this where the reader uses them.

Animations have separate roles: a short scroll entrance traces edges, the outer framing responds gently to scroll, and each direct action animates a meaningful representation change. Packet movement is finite. There are no continuous animation loops in the episode module. Manual or system reduced motion preserves every action and result with immediate state changes. CSS and GSAP scopes are disposed on route/unmount; SVG titles describe current data and result text uses polite live regions.

Both added TypeScript modules passed an isolated strict type check. Integrated visual QA remains a separate task; this document does not equate source validation with browser verification.

## Sculptural revision — 19 October 2026

Following feedback that the opening scroll felt uneven and the other covers were too restrained, the second pass researched additional primary demonstrations:

- [Codrops: cinematic 3D scroll experiences](https://tympanus.net/codrops/2025/11/19/how-to-build-cinematic-3d-scroll-experiences-with-gsap/) informed synchronized depth, camera orientation, and smooth target-following. The home now has one RAF owner for its playhead, character pose, springs and webs. Scroll updates a target instead of snapping the drawing; a 50 ms time constant closes 96% of the gap in 160 ms. Replay uses an independent local clock and pauses offscreen/hidden. The page progress meter no longer causes an entire chapter React render on each scroll frame.
- [Codrops: interactive droplet-like metaballs](https://tympanus.net/codrops/2025/06/09/how-to-create-interactive-droplet-like-metaballs-with-three-js-and-glsl/) and its [live demonstration](https://tympanus.net/Tutorials/InteractiveBubbleMetaballs/) were reviewed, including the moving demo in the browser. They informed the material and fusion direction for week 4. Our original shader blends seven signed-distance forms with pearl, cyan, pink and violet studio reflections; its transmission is an artistic approximation.
- [Codrops: infinite tubes](https://tympanus.net/codrops/2017/05/09/infinite-tubes-with-three-js/) informed week 3's genuine perspective tunnel, curved rails and approaching light streaks. The implementation projects coordinates onto Canvas 2D, without Three.js.
- [Codrops: interactive text destruction](https://tympanus.net/codrops/2025/07/22/interactive-text-destruction-with-three-js-webgpu-and-tsl/) and [kinetic typography](https://tympanus.net/codrops/2020/06/02/kinetic-typography-with-three-js/) informed the week 5 text-to-particle transition. Up to 2,500 particles sampled from the bundled font disperse through a depth-sorted spiral and reassemble from WORDS into LANGUAGE.
- [Codrops: Luma morphing study](https://tympanus.net/codrops/2024/12/09/creating-the-morphing-effect-of-the-luma-dream-machine-website/) and [Lusion Particle Love](https://v2.lusion.co/work/particle-love/) informed changes in form and dimensional depth. Week 1 weaves 34 three-dimensional filaments with traveling signals into a knot, then opens them into a spherical field. Week 2 has eight evolving blocks, twelve struts and three gyroscopes around a luminous core.

These references inform original implementation; no demo assets or source code were copied. No dependencies were added. The new cover modules are lazy loaded and have a static visual error fallback so a rejected asset does not remove course content. Week 6's existing glass scene is retained.

The sculptures have different direct actions, live status text and pointer response. Reduced motion renders a fixed composition and applies the alternate composition immediately. Offscreen and hidden scenes suspend their continuing animation loop. Canvas rendering uses bounded pixel counts; the WebGL scenes additionally lower resolution adaptively. These measures are implementation choices, not a guarantee of equal performance across devices.

The scroll stories also have chapter-specific three-dimensional entrances and layered framing; their final quantitative plane settles flat. Remounting a story when reduced motion changes prevents GSAP cleanup from restoring old animated SVG attributes over its static final geometry.


## Motion throughout the chapter — third pass, 19 October 2026

The latest feedback asked for varied, intricate motion below the openings and a steadier Spider-Man pull. This revision adds twelve full-width sequences, placed between the study-note halves and after the exercises. Each chapter now has six major scenes and a direct scene index. The original numerical teaching episodes remain available.

Fresh primary references reviewed for this pass:

- [Codrops: 3D folding technique](https://tympanus.net/codrops/2020/01/14/3d-folding-technique/) and [folding a cardboard box](https://tympanus.net/codrops/2022/12/13/how-to-code-an-on-scroll-folding-3d-cardboard-box-animation-with-three-js-and-gsap/) informed hinged paper and nested transform geometry. The comic triptych and concertina map are original CSS/SVG constructions.
- [Codrops: kinetic typography transition](https://tympanus.net/codrops/2021/09/29/kinetic-typography-page-transition/) and [on-scroll sliced text](https://tympanus.net/codrops/2023/12/05/on-scroll-sliced-text-animation/) informed coordinated type, timing and section-to-section variety. Our letterpress uses actual tokenizer output; the sliced wall is explicitly decorative.
- [Codrops: an infinite loom](https://tympanus.net/codrops/2026/09/05/building-an-infinite-loom-unravelling-images-into-threads-with-three-js/) informed the woven-material direction. The local loom uses original masked over/under SVG ribbons and a traveling shuttle, not copied images.
- [Codrops: scroll-driven SVG maps](https://tympanus.net/codrops/2026/05/21/creating-scroll-driven-svg-map-animations-with-gsap/) informed path drawing and moving route markers. The nine-route illustration follows a disclosed synthetic topology and its shared bridge.
- [Obys: a tactile web library](https://tympanus.net/codrops/2026/01/12/obys-design-books-turning-a-reading-list-into-a-tactile-web-library/) and [Codrops animated books](https://tympanus.net/Development/AnimatedBooks/) informed layered paper and book mechanics. The five-page document fan, scanner and feature strips are conceptual illustrations, not measured weights.
- [Colorion: holographic card typography](https://text-effects.colorion.co/effects/holographic-card-text-effect/) informed the direction-changing surface. Our lenticular construction uses eighteen original two-sided CSS slats to change the context around “bank”.
- [Codrops: 3D scroll-driven typography](https://tympanus.net/codrops/2025/11/04/creating-3d-scroll-driven-text-animations-with-css-and-gsap/) was read and its [cylinder demo](https://tympanus.net/Tutorials/3DTextScroll/) scrolled in the browser. It supported the emphasis on actual dimensional transformations. No cylinder effect or demo code was copied into this revision.
- [Codrops: scroll-driven ghost trails](https://tympanus.net/codrops/2026/10/13/scroll-driven-ghost-trails/) provided a recent example of a page continuing through several different motion rhythms. It informed the chapter-wide sequencing, not a claim that this site implements that demo’s ghost renderer.

The other new mechanisms are a flip-tile adjacency instrument, an enumeration of all eight three-trial outcomes, a degree-weighted ticket conveyor and a split-flap shortest-distance board. Their numerical claims are exact for the small examples stated alongside them. All assets and animation code are original, and no new dependencies were added.

Spider-Man now makes one approach, pull, hold and release. The same eased playhead determines the character, letters and attached webs; the limp arc remains, but the underdamped letter springs and repeated character recoil are removed. Cached untransformed measurements also avoid temporarily clearing live transforms during resize. Replay, reverse scrolling, still mode and offscreen/hidden suspension remain supported.

New sequences have finite replay and local state, with no extra pinned blank scrolling. Their layouts are lazy loaded behind independent visual error boundaries. A shared layout observer refreshes scroll ranges after asynchronous content changes height. Reduced motion keeps static views and explanatory controls; no study paragraph is hidden by the new animations.
