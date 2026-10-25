import { useEffect } from 'react';
import { playSfx, unlockSfx } from '../audio/sfx';
import type { Sfx } from '../audio/sfx';

const CUES = new Set<string>(['click', 'select', 'start', 'toggle', 'none']);
const INTERACTIVE = 'button, a[href], [role="button"]';

/**
 * One delegated listener for the whole app: every button gets a soft click, and a
 * button can ask for a special cue with data-sfx="start|select|toggle" or opt out
 * with data-sfx="none" (story actions play their own magic sounds). Hover gives a
 * barely-there tick, once per element entry and rate-limited in sfx.ts.
 */
export function useUiSounds() {
  useEffect(() => {
    const target = (event: Event) =>
      (event.target as Element | null)?.closest?.(INTERACTIVE) as HTMLElement | null;
    const onClick = (event: MouseEvent) => {
      unlockSfx();
      const el = target(event);
      if (!el || (el as HTMLButtonElement).disabled) return;
      const cue = el.dataset.sfx ?? 'click';
      if (cue !== 'none' && CUES.has(cue)) playSfx(cue as Sfx);
    };
    let hovered: Element | null = null;
    const onOver = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const el = target(event);
      if (el === hovered) return;
      hovered = el;
      if (el && !(el as HTMLButtonElement).disabled && el.dataset.sfx !== 'none')
        playSfx('hover');
    };
    document.addEventListener('click', onClick, true);
    document.addEventListener('pointerover', onOver);
    return () => {
      document.removeEventListener('click', onClick, true);
      document.removeEventListener('pointerover', onOver);
    };
  }, []);
}
