import type { StorySummary } from '../../data/stories/registry';

type StoryCardProps = {
  story: StorySummary;
  onSelect: (storyId: string) => void;
};

export function StoryCard({ story, onSelect }: StoryCardProps) {
  return (
    <article className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div
        aria-hidden="true"
        style={{
          background: story.coverBackground,
          borderRadius: 'var(--radius-md)',
          height: '140px',
          marginBottom: 'var(--space-4)',
        }}
      />
      <h3>{story.title}</h3>
      <p
        style={{
          color: 'var(--color-honey-dark)',
          fontWeight: 700,
          margin: '0 0 var(--space-2)',
          fontSize: 'var(--fs-xs)',
          textTransform: 'uppercase',
          letterSpacing: '0.04em',
        }}
      >
        {story.theme}
      </p>
      <p style={{ flex: 1 }}>{story.teaser}</p>
      <button
        type="button"
        className="btn btn--primary"
        onClick={() => onSelect(story.id)}
        aria-label={`Start ${story.title}`}
      >
        Start This Story
      </button>
    </article>
  );
}
