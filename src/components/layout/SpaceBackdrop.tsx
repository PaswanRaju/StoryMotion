import { useEffect, useRef } from 'react';
import { SolarSystem } from '../art/SolarSystem';
import './spaceBackdrop.css';

/** Deterministic star maps as box-shadow lists: three depths, generated once. */
function stars(count: number, seed: number, color: string) {
  let s = seed;
  const rnd = () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
  return Array.from(
    { length: count },
    () => `${Math.round(rnd() * 2000)}px ${Math.round(rnd() * 2000)}px ${color}`,
  ).join(',');
}
const STARS_FAR = stars(160, 7, 'rgb(255 255 255 / 55%)');
const STARS_MID = stars(70, 99, 'rgb(200 225 255 / 85%)');
const STARS_NEAR = stars(28, 4242, '#fff6d8');

/**
 * App-wide animated galaxy: nebula clouds, three twinkling star layers with pointer
 * parallax, shooting stars, floating planets and an orbiting solar system. Pure CSS
 * motion (transform/opacity); the only JS is a rAF-throttled pointer listener.
 */
export function SpaceBackdrop() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    let x = 0,
      y = 0;
    const move = (event: PointerEvent) => {
      x = event.clientX / window.innerWidth - 0.5;
      y = event.clientY / window.innerHeight - 0.5;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        root.current?.style.setProperty('--mx', x.toFixed(3));
        root.current?.style.setProperty('--my', y.toFixed(3));
      });
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => {
      window.removeEventListener('pointermove', move);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <div ref={root} className="space-backdrop" aria-hidden="true">
      <div className="space-nebula space-nebula--a" />
      <div className="space-nebula space-nebula--b" />
      <div className="space-nebula space-nebula--c" />
      <div className="space-stars space-stars--far">
        <span style={{ boxShadow: STARS_FAR }} />
      </div>
      <div className="space-stars space-stars--mid">
        <span style={{ boxShadow: STARS_MID }} />
      </div>
      <div className="space-stars space-stars--near">
        <span style={{ boxShadow: STARS_NEAR }} />
      </div>
      <span className="space-comet space-comet--a" />
      <span className="space-comet space-comet--b" />
      <div className="space-solar">
        <SolarSystem />
      </div>
      <div className="space-planet space-planet--ringed">
        <span />
      </div>
      <div className="space-planet space-planet--moon" />
    </div>
  );
}
