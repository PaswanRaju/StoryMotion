type RewardBadgeProps = {
  title: string;
  description: string;
};

export function RewardBadge({ title, description }: RewardBadgeProps) {
  return (
    <div
      className="card"
      style={{
        textAlign: 'center',
        background:
          'linear-gradient(160deg, var(--color-honey) 0%, var(--color-sage) 100%)',
        maxWidth: '360px',
        margin: '0 auto',
      }}
    >
      <div style={{ fontSize: '3rem' }} aria-hidden="true">
        🏅
      </div>
      <h3 style={{ marginBottom: 'var(--space-1)' }}>{title}</h3>
      <p style={{ margin: 0 }}>{description}</p>
    </div>
  );
}
