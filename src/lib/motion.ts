/**
 * Shared helpers for the three GSAP moments (juz map fill, terraces, now line).
 * GSAP is only downloaded when the visitor allows motion.
 */
export const prefersReducedMotion = (): boolean =>
  typeof window === 'undefined' || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export const loadGsap = () => import('gsap').then((m) => m.gsap);

/** Calls `cb` once, the first time `el` is at least `threshold` visible. */
export function onceInView(el: Element, cb: () => void, threshold = 0.3): () => void {
  if (!('IntersectionObserver' in window)) {
    cb();
    return () => {};
  }
  const io = new IntersectionObserver(
    (entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        io.disconnect();
        cb();
      }
    },
    { threshold },
  );
  io.observe(el);
  return () => io.disconnect();
}

export const cssVar = (name: string, fallback: string): string =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fallback;
