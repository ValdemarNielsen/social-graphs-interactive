import { useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './motion-atmosphere.css';

gsap.registerPlugin(ScrollTrigger);

type MotionAtmosphereProps = { route: number; reduced: boolean };

/** Editorial motion around the learning content. This module deliberately owns
 * neither the home hero nor Story SVGs, laboratory controls, or body paragraphs.
 * It adds no content wrappers, so React retains ownership of all text nodes.
 */
export default function MotionAtmosphere({ route, reduced }: MotionAtmosphereProps) {
  useLayoutEffect(() => {
    const main = document.querySelector<HTMLElement>('#main');
    if (!main || reduced) return;

    const media = gsap.matchMedia();
    media.add('(min-width: 1024px) and (prefers-reduced-motion: no-preference)', context => {
      const html = document.documentElement;
      html.dataset.motionAtmosphere = 'on';
      const cleanups: Array<() => void> = [];

      // Existing line spans remain the accessible heading; no duplicate text or
      // SplitText markup is injected. Only the chapter's opening title is masked.
      const hero = main.querySelector<HTMLElement>('.chapter-cover, .chapter-hero');
      const lines = hero?.querySelectorAll<HTMLElement>('h1 > span');
      if (lines?.length) {
        gsap.fromTo(lines,
          { yPercent: 42, rotationX: -12, opacity: .72, clipPath: 'inset(0% -4% 100% -4%)', transformPerspective: 1000, transformOrigin: '50% 100%' },
          { yPercent: 0, rotationX: 0, opacity: 1, clipPath: 'inset(-8% -4% -16% -4%)', duration: .9, stagger: .12, ease: 'expo.out', clearProps: 'transform,opacity,clipPath,transformOrigin,transformPerspective' },
        );
      }

      const number = hero?.querySelector<HTMLElement>('.cover-edition, .chapter-hero-number');
      if (hero && number) {
        gsap.to(number, {
          y: 105, opacity: .38, ease: 'none',
          scrollTrigger: { trigger: hero, start: 'top top+=110', end: 'bottom top', scrub: .5, invalidateOnRefresh: true },
        });
      }

      // A vertical contrast sweep reads the existing three-line manifesto in
      // order. The initial large-type contrast remains readable; no text is hidden.
      const manifesto = main.querySelector<HTMLElement>('.manifesto h2');
      if (manifesto) {
        gsap.fromTo(manifesto,
          { '--manifesto-progress': '-18%' },
          { '--manifesto-progress': '112%', ease: 'none', scrollTrigger: { trigger: manifesto, start: 'top 84%', end: 'bottom 42%', scrub: .35 } },
        );
      }

      // Only headings/objective rows receive a short, one-time entrance. Start
      // from a readable opacity; jumping directly to notes never waits for prose.
      const revealElements = main.querySelectorAll<HTMLElement>([
        '.section-heading h2', '.working-method h2', '.source-note h2',
        '.checkpoint h2', '.sources h2', '.topic > h3',
        '.learning-map > .eyebrow', '.learning-map > div > p',
      ].join(','));
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          observer.unobserve(entry.target);
          const element = entry.target as HTMLElement;
          context.add(() => {
            gsap.fromTo(element,
              { y: element.matches('.topic > h3') ? 13 : 22, opacity: .78 },
              { y: 0, opacity: 1, duration: .72, ease: 'power3.out', clearProps: 'transform,opacity' },
            );
          });
        }
      }, { threshold: .12, rootMargin: '0px 0px -5% 0px' });
      revealElements.forEach(element => observer.observe(element));
      cleanups.push(() => observer.disconnect());

      // Tilt belongs to the decorative preview, not the link text or hit target.
      // The spotlight has an equivalent keyboard focus state, and pointer writes
      // are batched into one animation frame instead of occurring per mouse event.
      const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      if (canHover) {
        main.querySelectorAll<HTMLElement>('.chapter-row').forEach(row => {
          const miniature = row.querySelector<SVGElement>('.miniature');
          if (!miniature) return;
          gsap.set(miniature, { transformPerspective: 650, transformOrigin: '50% 50%', force3D: true });
          const rotateX = gsap.quickTo(miniature, 'rotationX', { duration: .65, ease: 'power3.out' });
          const rotateY = gsap.quickTo(miniature, 'rotationY', { duration: .65, ease: 'power3.out' });
          const moveX = gsap.quickTo(miniature, 'x', { duration: .65, ease: 'power3.out' });
          const moveY = gsap.quickTo(miniature, 'y', { duration: .65, ease: 'power3.out' });
          let frame = 0;
          let pointerX = 0;
          let pointerY = 0;
          let bounds = row.getBoundingClientRect();

          const focus = () => {
            row.dataset.atmosphereActive = 'true';
            row.style.setProperty('--row-glow-x', '72%');
            row.style.setProperty('--row-glow-y', '50%');
            moveY(-5);
          };
          const reset = () => {
            cancelAnimationFrame(frame);
            frame = 0;
            rotateX(0); rotateY(0); moveX(0); moveY(0);
            if (document.activeElement !== row) delete row.dataset.atmosphereActive;
          };
          const enter = (event: PointerEvent) => {
            bounds = row.getBoundingClientRect();
            row.dataset.atmosphereActive = 'true';
            move(event);
          };
          const move = (event: PointerEvent) => {
            pointerX = event.clientX;
            pointerY = event.clientY;
            if (frame) return;
            frame = requestAnimationFrame(() => {
              frame = 0;
              const x = Math.max(0, Math.min(1, (pointerX - bounds.left) / Math.max(bounds.width, 1)));
              const y = Math.max(0, Math.min(1, (pointerY - bounds.top) / Math.max(bounds.height, 1)));
              row.style.setProperty('--row-glow-x', `${(x * 100).toFixed(2)}%`);
              row.style.setProperty('--row-glow-y', `${(y * 100).toFixed(2)}%`);
              rotateX((.5 - y) * 13);
              rotateY((x - .5) * 22);
              moveX((x - .5) * 12);
              moveY((y - .5) * 7 - 4);
            });
          };
          const refreshBounds = () => { bounds = row.getBoundingClientRect(); };
          const blur = () => { delete row.dataset.atmosphereActive; reset(); };

          row.addEventListener('pointerenter', enter);
          row.addEventListener('pointermove', move);
          row.addEventListener('pointerleave', reset);
          row.addEventListener('focus', focus);
          row.addEventListener('blur', blur);
          // ScrollTrigger already throttles its own measurements; this listener
          // only refreshes bounds while the pointer is actively over this row.
          const refreshActiveBounds = () => { if (row.matches(':hover')) refreshBounds(); };
          window.addEventListener('scroll', refreshActiveBounds, { passive: true });
          window.addEventListener('resize', refreshBounds, { passive: true });
          cleanups.push(() => {
            cancelAnimationFrame(frame);
            row.removeEventListener('pointerenter', enter);
            row.removeEventListener('pointermove', move);
            row.removeEventListener('pointerleave', reset);
            row.removeEventListener('focus', focus);
            row.removeEventListener('blur', blur);
            window.removeEventListener('scroll', refreshActiveBounds);
            window.removeEventListener('resize', refreshBounds);
            delete row.dataset.atmosphereActive;
            row.style.removeProperty('--row-glow-x');
            row.style.removeProperty('--row-glow-y');
          });
        });
      }

      return () => {
        cleanups.forEach(cleanup => cleanup());
        delete html.dataset.motionAtmosphere;
      };
    }, main);

    return () => media.revert();
  }, [route, reduced]);

  return null;
}
