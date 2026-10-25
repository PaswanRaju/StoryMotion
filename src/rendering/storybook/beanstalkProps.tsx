import { Mother, JackActor, Place } from './cast';
import type { JackPose } from './cast';

/** Jack's scale on the ground. */
const JS = 0.8;

export function Jack({ x, y, s = JS, pose, facing = 1, rotate = 0 }: { x: number; y: number; s?: number; pose: JackPose; facing?: 1 | -1; rotate?: number }) {
  return (
    <Place x={x} y={y} scale={s} facing={facing} rotate={rotate}>
      <JackActor pose={pose} />
    </Place>
  );
}

export function Basket({ upside = 0, crumbs = 0 }: { upside?: number; crumbs?: number }) {
  return (
    <g transform={`rotate(${upside * 180})`}>
      <path d="M-34 0H34L26 34H-26Z" fill="#c9954a" stroke="#8a6446" strokeWidth="4" />
      <path d="M-30 12H30M-28 24H28" stroke="#a8763a" strokeWidth="3" />
      <path d="M-30 0Q0 -40 30 0" fill="none" stroke="#8a6446" strokeWidth="5" />
      {crumbs > 0 &&
        [0, 1, 2].map((i) => (
          <circle key={i} cx={-10 + i * 10} cy={-10 - crumbs * 60 - i * 8} r="3" fill="#c9a26a" opacity={1 - crumbs} />
        ))}
    </g>
  );
}

export function VeggieBasket({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="-26" cy="-50" rx="18" ry="28" fill="#e8775f" transform="rotate(-20 -26 -50)" />
      <circle cx="10" cy="-56" r="26" fill="#8ed97a" />
      <circle cx="40" cy="-44" r="18" fill="#a86ad0" />
      <path d="M-10 -78l-8 -20M-14 -76l10 -18" stroke="#4fa35a" strokeWidth="5" strokeLinecap="round" />
      <path d="M-60 -40H70L56 0H-46Z" fill="#c9954a" stroke="#8a6446" strokeWidth="5" />
    </g>
  );
}

export function Axe({ angle = 0 }: { angle?: number }) {
  return (
    <g transform={`rotate(${angle})`} data-testid="sb-axe">
      <rect x="-5" y="-110" width="10" height="120" rx="4" fill="#8a5a34" />
      <path d="M-4 -110H34Q46 -90 34 -70H-4Z" fill="#b8c2d0" stroke="#6e7888" strokeWidth="3" />
    </g>
  );
}

export function Zzz({ x, y, idle }: { x: number; y: number; idle: number }) {
  return (
    <g fill="none" stroke="#e6ecff" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round">
      {[0, 1, 2].map((i) => {
        const p = ((idle / 2400 + i / 3) % 1 + 1) % 1;
        const s = 0.6 + p * 0.8;
        return (
          <path key={i} opacity={Math.sin(p * Math.PI)} transform={`translate(${x + p * 120} ${y - p * 160}) scale(${s})`} d="M0 0h40l-40 40h40" />
        );
      })}
    </g>
  );
}

/** "Jack thought of his hungry mother": a thought cloud with her worried face. */
export function ThoughtOfMother({ x, y, show, idle }: { x: number; y: number; show: number; idle: number }) {
  if (show <= 0) return null;
  return (
    <g opacity={show} transform={`translate(${x} ${y}) scale(${0.8 + 0.2 * show})`}>
      <circle cx="-60" cy="70" r="10" fill="#fffaf0" />
      <circle cx="-34" cy="40" r="16" fill="#fffaf0" />
      <ellipse cx="40" cy="-60" rx="120" ry="90" fill="#fffaf0" stroke="#d9c49a" strokeWidth="4" />
      <g transform="translate(40 80) scale(0.42)">
        <Mother pose="basket" idle={idle} armL={38} armR={38}>
          <Basket upside={1} />
        </Mother>
      </g>
    </g>
  );
}

