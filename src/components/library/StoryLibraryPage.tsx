import { Link, useNavigate } from 'react-router-dom';
import { StoryGrid } from './StoryGrid';
import { storyRegistry } from '../../data/stories/registry';
import { useSession } from '../../app/SessionContext';
import { routes } from '../../app/router';

export function StoryLibraryPage() {
  const navigate = useNavigate();
  const { mode, setCharacterId } = useSession();
  // One-character stories are a single continuous story: straight to the player.
  const choose = (storyId: string) => {
    const story = storyRegistry.find((candidate) => candidate.id === storyId);
    if (story && story.characters.length === 1) {
      setCharacterId(story.characters[0].id);
      void navigate(routes.player(storyId));
    } else void navigate(routes.characterSelect(storyId));
  };

  return (
    <section className="library">
      <header className="library__head">
        <div>
          <p className="eyebrow">Choose your adventure</p>
          <h2>Story Library</h2>
          <p className="library__sub">
            Every story is open and ready to play. Watch, move, and make the magic happen!
          </p>
        </div>
        <p className="library__mode">
          Playing: <strong>{mode === 'family' ? 'Family Adventure' : 'Solo Adventure'}</strong>
          {' · '}
          <Link to={routes.home()}>Change</Link>
        </p>
      </header>
      <StoryGrid
        stories={storyRegistry}
        onSelect={choose}
      />
    </section>
  );
}
