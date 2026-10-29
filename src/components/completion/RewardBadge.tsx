type RewardBadgeProps = {
  title: string;
  description: string;
};

import { Medal } from '../../ui';

/** A medal that swings in on its ribbon (styles in completion.css). */
export function RewardBadge({ title, description }: RewardBadgeProps) {
  return (
    <div className="reward-badge">
      <Medal />
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
