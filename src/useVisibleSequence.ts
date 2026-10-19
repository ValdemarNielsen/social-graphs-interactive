import { useLayoutEffect, useRef, useState, type RefObject } from 'react';
import gsap from 'gsap';
import { sequenceIsVisible } from './sequenceVisibility';
import './sequence-playback.css';

type Options = {
  root: RefObject<HTMLElement | null>;
  reduced: boolean;
  build: (element: HTMLElement) => gsap.core.Timeline;
  onProgress?: (progress: number) => void;
};
const noop = () => {};

/** One playback owner per scene. Scrolling only gates visibility: it never
 * advances the movie, overrides a user's pause, or consumes hidden time. */
export function useVisibleSequence({ root, reduced, build, onProgress }: Options) {
  const [paused, setPaused] = useState(false);
  const actions = useRef({ togglePause: noop, restart: noop, select: (_progress: number) => {} });

  useLayoutEffect(() => {
    const element = root.current;
    if (!element) return;
    const stage = element.querySelector<HTMLElement>('[data-sequence-stage]') ?? element;
    let manualPause = false, visible = false, disposed = false, frame = 0, cycles = 0;
    let animation: gsap.core.Timeline, loop: gsap.core.Timeline | undefined;
    const proxy = { progress: reduced ? 1 : 0 };
    setPaused(false);
    const paint = () => {
      animation.progress(proxy.progress).pause();
      element.dataset.sequenceProgress = proxy.progress.toFixed(3);
      onProgress?.(proxy.progress);
    };
    const sync = () => {
      if (disposed) return;
      const playing = !reduced && !manualPause && visible && !document.hidden;
      element.dataset.playback = reduced ? 'reduced' : manualPause ? 'paused' : document.hidden ? 'hidden' : visible ? 'playing' : 'waiting';
      element.dataset.sequenceVisible = String(visible);
      if (playing) loop?.resume(); else loop?.pause();
    };
    const measure = () => {
      frame = 0;
      const navigation = document.querySelector('.chapter-nav') ?? document.querySelector('.site-header');
      const safeTop = Math.max(0, navigation?.getBoundingClientRect().bottom ?? 0) + 12;
      const bounds = stage.getBoundingClientRect();
      visible = sequenceIsVisible(bounds.top, bounds.bottom, innerHeight, safeTop, visible);
      sync();
    };
    const requestMeasure = () => { if (!disposed && !frame) frame = requestAnimationFrame(measure); };
    const context = gsap.context(() => {
      animation = build(element);
      animation.pause();
      const duration = Math.max(1, animation.duration() * .75);
      paint();
      element.dataset.sequenceCycle = '0';
      if (!reduced) {
        loop = gsap.timeline({ paused: true, repeat: -1, onRepeat: () => { element.dataset.sequenceCycle = String(++cycles); } });
        loop.to(proxy, { progress: 1, duration, ease: 'none', onUpdate: paint }, 0)
          .to({}, { duration: 2 })
          .to(stage, { opacity: 0, duration: .24, ease: 'power1.inOut' })
          .call(() => { proxy.progress = 0; paint(); })
          .to(stage, { opacity: 1, duration: .35, ease: 'power1.inOut' });
      }
      actions.current = {
        togglePause: () => {
          if (reduced) return;
          manualPause = !manualPause;
          setPaused(manualPause);
          sync();
        },
        restart: () => {
          if (reduced) return;
          manualPause = false; setPaused(false);
          loop?.pause(0, true);
          stage.style.opacity = '1'; proxy.progress = 0; paint();
          measure();
        },
        select: progress => {
          manualPause = true; setPaused(true);
          const value = Math.max(0, Math.min(1, progress));
          loop?.pause(duration * value, true);
          stage.style.opacity = '1'; proxy.progress = value; paint();
          sync();
        },
      };
    }, element);
    const observer = new IntersectionObserver(requestMeasure, { threshold: Array.from({ length: 21 }, (_, i) => i / 20) });
    observer.observe(stage);
    const resize = new ResizeObserver(requestMeasure);
    resize.observe(stage);
    window.addEventListener('scroll', requestMeasure, { passive: true });
    window.addEventListener('resize', requestMeasure, { passive: true });
    document.addEventListener('visibilitychange', sync);
    measure();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect(); resize.disconnect();
      window.removeEventListener('scroll', requestMeasure);
      window.removeEventListener('resize', requestMeasure);
      document.removeEventListener('visibilitychange', sync);
      actions.current = { togglePause: noop, restart: noop, select: noop };
      loop?.kill();
      context.revert();
    };
  }, [root, reduced, build, onProgress]);

  return { paused, togglePause: () => actions.current.togglePause(), restart: () => actions.current.restart(), select: (progress: number) => actions.current.select(progress) };
}
