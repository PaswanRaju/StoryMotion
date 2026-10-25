import { Pig, Place, Wolf } from './cast';
import type { PigId, PigPose, WolfPose } from './cast';
import { GROUND_Y } from './sets';

export const Y = GROUND_Y + 40;
const PS = 1; // pig scale
export const WS = 0.95; // wolf scale

export function P({ id, x, y = Y, pose, t, idle, facing = 1, opacity = 1, tool, s = PS }: { id: PigId; x: number; y?: number; pose: PigPose; t: number; idle: number; facing?: 1 | -1; opacity?: number; tool?: boolean; s?: number }) {
  return (
    <Place x={x} y={y} scale={s} facing={facing} opacity={opacity}>
      <Pig id={id} pose={pose} t={t} idle={idle} tool={tool} />
    </Place>
  );
}
export function W({ x, y = Y, pose, t, idle, puff = 0, facing = 1, rotate = 0 }: { x: number; y?: number; pose: WolfPose; t: number; idle: number; puff?: number; facing?: 1 | -1; rotate?: number }) {
  return (
    <Place x={x} y={y} scale={WS} facing={facing} rotate={rotate} testId="wolf">
      <Wolf pose={pose} t={t} idle={idle} puff={puff} />
    </Place>
  );
}
/** A bundle/stone/brick held overhead by a carrying pig. */
export function Load({ kind, x, y }: { kind: 'wheat' | 'stone' | 'brick'; x: number; y: number }) {
  if (kind === 'wheat') return <rect x={x - 26} y={y - 30} width="52" height="34" rx="10" fill="#f2cf63" stroke="#c99a2a" strokeWidth="3" />;
  if (kind === 'stone') return <ellipse cx={x} cy={y - 14} rx="32" ry="22" fill="#a8b0bc" stroke="#7a8290" strokeWidth="3" />;
  return <rect x={x - 28} y={y - 28} width="56" height="28" rx="3" fill="#d9775f" stroke="#8f4a3a" strokeWidth="3" />;
}
/** Three little faces peeking from the brick house window. */
export function WindowFaces({ x, idle, mood = 'smile' }: { x: number; idle: number; mood?: 'smile' | 'worried' | 'grin' }) {
  const clip = `sb-window-${Math.round(x)}`;
  return (
    <g>
      <defs>
        <clipPath id={clip}>
          <rect x={x - 196} y={Y - 236} width="82" height="72" rx="6" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clip})`}>
        <g transform={`translate(${x - 155} ${Y - 150}) scale(0.26)`}>
          {(['one', 'two', 'three'] as const).map((id, i) => (
            <g key={id} transform={`translate(${(i - 1) * 105} 0)`}>
              <Pig id={id} pose={mood === 'grin' ? 'cheer' : mood === 'worried' ? 'scared' : 'idle'} idle={idle + i * 300} />
            </g>
          ))}
        </g>
      </g>
    </g>
  );
}

