import { expect, it } from 'vitest';
import { assignPlayerSlots } from '../vision/playerSlots';
import { standing } from './fixtures/poses';
it('assigns mirrored sides independently of model order and preserves a remaining child slot', () => {
  const left = standing().map((point) => ({ ...point, x: point.x + 0.2 }));
  const right = standing().map((point) => ({ ...point, x: point.x - 0.2 }));
  const both = assignPlayerSlots([right, left], [null, null]);
  expect(both.poses[0]).toBe(left);
  expect(both.poses[1]).toBe(right);
  const remaining = assignPlayerSlots([right], both.centers);
  expect(remaining.poses[0]).toHaveLength(0);
  expect(remaining.poses[1]).toBe(right);
});
