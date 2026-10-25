import type { BodyGesture } from '../../vision/bodyGestures';
import type { MomentId } from '../../engine/automaticStory';
import { tortoiseMood } from './timeline';

/**
 * Story-driven animation states. The scene sets `is-<state>` on each character and
 * forest.css animates that state; nothing moves randomly.
 */
export type TortoiseState =
  | 'idle'
  | 'walk'
  /** Startled by the gust; forest.css plays a surprised beat before the worried loop. */
  | 'worried'
  | 'ponder'
  | 'magic'
  | 'energized'
  | 'tired'
  | 'tuck'
  | 'celebrate';

/** A resolved moment: the child's gesture, or 'auto' when the story found its own way. */
export type Outcome = BodyGesture | 'auto';
export type Reaction = { moment: MomentId; outcome: Outcome; at: number };

/** How long each reaction plays, in story ms after it lands. */
export const REACTION_MS = {
  magic: 1400,
  energized: 4500,
  tuck: 1800,
} as const;
/** Tortoise starts to tire on the last stretch, before the boost invitation. */
export const TIRED_FROM_MS = 24000;

export function tortoiseState({
  t,
  boostAt,
  open,
  reactions,
}: {
  t: number;
  boostAt: number | null;
  open: MomentId | null;
  reactions: readonly Reaction[];
}): TortoiseState {
  const base = tortoiseMood(t, boostAt);
  if (base === 'cheer') return 'celebrate';
  // Waiting at an invitation: the obstacle (story time is held meanwhile).
  if (open === 'shield') return 'worried';
  if (open === 'path') return 'ponder';
  if (open === 'boost') return 'tired';
  const since = (r: Reaction) => t - r.at;
  const latest = (pred: (r: Reaction) => boolean, ms: number) =>
    reactions.some((r) => pred(r) && since(r) >= 0 && since(r) < ms);
  if (
    latest(
      (r) => r.outcome === 'ARMS_WIDE' || r.outcome === 'HAND_RAISE',
      REACTION_MS.magic,
    )
  )
    return 'magic';
  if (
    latest((r) => r.outcome === 'HAND_RAISE', REACTION_MS.energized) &&
    base === 'walk'
  )
    return 'energized';
  if (latest((r) => r.moment === 'shield' && r.outcome === 'auto', REACTION_MS.tuck))
    return 'tuck';
  if (base === 'walk' && t >= TIRED_FROM_MS) return 'tired';
  return base;
}
