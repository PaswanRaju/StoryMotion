type RewardBadgeProps = {
  title: string;
  description: string;
};

/** A medal that swings in on its ribbon (styles in completion.css). */
export function RewardBadge({ title, description }: RewardBadgeProps) {
  return (
    <div className="reward-badge">
      <div className="reward-badge__medal" aria-hidden="true">
        <span className="reward-badge__ribbon" />
        <span className="reward-badge__disc">★</span>
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}
