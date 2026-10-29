import { useSyncExternalStore } from 'react';
import { usePreferences } from '../settings/preferences';

const QUERY = '(prefers-reduced-motion: reduce)';

function subscribe(onChange: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {};
  const media = window.matchMedia(QUERY);
  media.addEventListener?.('change', onChange);
  return () => media.removeEventListener?.('change', onChange);
}

const systemPrefersReduced = () =>
  typeof window !== 'undefined' && !!window.matchMedia?.(QUERY).matches;

/** True when the OS asks for less motion or a grown-up turned it on in settings. */
export function useReducedMotion(): boolean {
  const { settings } = usePreferences();
  const system = useSyncExternalStore(
    subscribe,
    systemPrefersReduced,
    () => false,
  );
  return settings.reducedMotion || system;
}
