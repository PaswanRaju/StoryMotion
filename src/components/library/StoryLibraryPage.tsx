import { Link, useNavigate } from 'react-router-dom';
import { StoryGrid } from './StoryGrid';
import { storyRegistry } from '../../data/stories/registry';
import { useSession } from '../../app/SessionContext';
import { routes } from '../../app/router';

export function StoryLibraryPage() {
  const navigate = useNavigate();
  const { mode } = useSession();

  return (
    <section>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
        <h2>Story Library</h2>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
          Playing: <strong>{mode === 'family' ? 'Family Adventure' : 'Solo Adventure'}</strong>
          {' · '}
          <Link to={routes.home()}>Change</Link>
        </p>
      </div>
      <p>Every story is open and ready to play — pick any one to begin.</p>
      <StoryGrid
        stories={storyRegistry}
        onSelect={(storyId) => navigate(routes.characterSelect(storyId))}
      />
    </section>
  );
}
