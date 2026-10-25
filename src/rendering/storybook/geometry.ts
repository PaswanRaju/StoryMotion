/** Rig measurements shared by the cast and the scenes (hands, ropes, hand-offs). */
export type Side = -1 | 1;
/** Arm angles are "outward" degrees: 0 hangs down, 90 points sideways, 180 is up. */
export const armRotation = (side: Side, deg: number) => (side > 0 ? -deg : deg);

export const MOTHER_SHOULDER = [44, -232] as const;
export const MOTHER_ARM = 100;
/** The rope ring on Milky-White's collar, in cow coordinates (facing right). */
export const COW_COLLAR = [150, -170] as const;
export const TRADER_SHOULDER = [46, -238] as const;
export const TRADER_ARM = 104;
/** Where the brick house's last wall brick goes, relative to the house's feet. */
export const LAST_BRICK = { x: 180, y: -306, w: 58 } as const;

/** World position of a hand, for ropes, held props and hand-offs. */
export function handAt(
  x: number,
  y: number,
  scale: number,
  shoulder: readonly [number, number],
  side: Side,
  deg: number,
  len: number,
  facing: Side = 1,
) {
  const a = (armRotation(side, deg) * Math.PI) / 180;
  const hx = shoulder[0] - Math.sin(a) * len;
  const hy = shoulder[1] + Math.cos(a) * len;
  return { x: x + hx * scale * facing, y: y + hy * scale };
}

