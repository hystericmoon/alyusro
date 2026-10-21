import { useEffect, useRef, useState } from 'react';
import { Toggle } from '@/components/ui/toggle';
import { cn } from '@/lib/utils';
import { cssVar, loadGsap, onceInView, prefersReducedMotion } from '@/lib/motion';
import type { JuzMapData } from '@/lib/juz-map';

// One lapis step per class, in hafalan order (VII → XI).
const TONES = [
  { cell: 'bg-lapis-1 text-ink', swatch: 'bg-lapis-1 shadow-[inset_0_0_0_1px_rgb(27_34_53/0.3)]' },
  { cell: 'bg-lapis-2 text-ink', swatch: 'bg-lapis-2 shadow-[inset_0_0_0_1px_rgb(27_34_53/0.3)]' },
  { cell: 'bg-lapis-3 text-ink', swatch: 'bg-lapis-3 shadow-[inset_0_0_0_1px_rgb(27_34_53/0.3)]' },
  { cell: 'bg-lapis-4 text-white', swatch: 'bg-lapis-4 shadow-[inset_0_0_0_1px_rgb(27_34_53/0.3)]' },
  { cell: 'bg-lapis-5 text-white', swatch: 'bg-lapis-5 shadow-[inset_0_0_0_1px_rgb(255_255_255/0.5)]' },
];
const OFF = 'bg-juz-off text-juz-off-ink';

type Props = Pick<JuzMapData, 'ariaLabel' | 'classes' | 'readouts'>;

export default function JuzMap({ ariaLabel, classes, readouts }: Props) {
  const [sel, setSel] = useState('all');
  const gridRef = useRef<HTMLDivElement>(null);
  const finishRef = useRef<(() => void) | null>(null);

  const classOf = new Map<number, number>();
  classes.forEach((c, i) => c.juz.forEach((n) => classOf.set(n, i)));

  // Motion moment 1: the map fills in class order the first time it is in view.
  useEffect(() => {
    const grid = gridRef.current;
    if (!grid) return;
    if (prefersReducedMotion() || !document.documentElement.classList.contains('motion-ok')) {
      grid.dataset.motion = 'done';
      return;
    }
    let cancelled = false;
    let kill = () => {};
    const stopWatching = onceInView(grid, async () => {
      const gsap = await loadGsap();
      if (cancelled) return;
      const all = Array.from(grid.querySelectorAll<HTMLElement>('[data-juz-cell]'));
      const off = cssVar('--color-juz-off', '#EEF0F4');
      const offInk = cssVar('--color-juz-off-ink', '#5B6374');
      gsap.set(all, { transition: 'none' });
      // Lift the CSS gate and start the timeline in the same task, so the
      // filled colours never paint before the `from` values apply.
      grid.dataset.motion = 'done';
      const tl = gsap.timeline({
        onComplete: () => {
          gsap.set(all, { clearProps: 'backgroundColor,color,transition' });
          finishRef.current = null;
        },
      });
      classes.forEach((c, i) => {
        const cells = c.juz
          .map((n) => grid.querySelector<HTMLElement>(`[data-juz-cell="${n}"]`))
          .filter((el): el is HTMLElement => el !== null);
        tl.from(
          cells,
          { backgroundColor: off, color: offInk, duration: 0.32, stagger: 0.05, ease: 'power1.out' },
          i === 0 ? 0 : '-=0.12',
        );
      });
      finishRef.current = () => tl.progress(1);
      kill = () => tl.kill();
    });
    return () => {
      cancelled = true;
      stopWatching();
      kill();
    };
  }, []);

  const pick = (key: string) => {
    finishRef.current?.(); // a click ends the intro at its final state
    setSel(key);
  };

  return (
    <div className="flex flex-col gap-20">
      <div
        ref={gridRef}
        data-juz-grid
        data-motion="pending"
        role="img"
        aria-label={ariaLabel}
        className="grid grid-cols-5 gap-6 sm:grid-cols-10"
      >
        {Array.from({ length: 30 }, (_, i) => i + 1).map((n) => {
          const tone = classOf.get(n);
          const on = tone !== undefined && (sel === 'all' || classes[tone]?.key === sel);
          return (
            <div
              key={n}
              data-juz-cell={n}
              className={cn(
                'flex aspect-square items-center justify-center rounded-sm text-16 font-bold tabular-nums transition-colors duration-200',
                on ? TONES[tone as number]?.cell : OFF,
              )}
            >
              {n}
            </div>
          );
        })}
      </div>

      <div role="group" aria-label="Pilih kelas" className="flex flex-wrap gap-8">
        <Toggle pressed={sel === 'all'} onPressedChange={() => pick('all')}>
          Semua kelas
        </Toggle>
        {classes.map((c, i) => (
          <Toggle key={c.key} pressed={sel === c.key} onPressedChange={() => pick(c.key)}>
            <span aria-hidden="true" className={cn('size-12 flex-none', TONES[i]?.swatch)} />
            {c.label} <span className="font-normal">juz {c.range}</span>
          </Toggle>
        ))}
      </div>

      <p
        aria-live="polite"
        className="m-0 min-h-[2.6em] font-display text-25 leading-[1.3] text-ink [text-wrap:pretty]"
      >
        {readouts[sel]}
      </p>
    </div>
  );
}
