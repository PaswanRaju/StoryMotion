import { Link } from 'react-router-dom';
import { PrimaryButton } from '../layout/PrimaryButton';

export function HomePage() {
  return (
    <section>
      <h1>StoryMotion</h1>
      <p>
        An interactive storybook where kids move to bring the story to life.
      </p>
      <Link to="/library">
        <PrimaryButton>Start Adventure</PrimaryButton>
      </Link>
      <p style={{ marginTop: 'var(--space-6)', color: 'var(--color-text-muted)' }}>
        Placeholder screen — full Home layout (mode select, how-it-works,
        privacy note) arrives in Phase 02.
      </p>
    </section>
  );
}
