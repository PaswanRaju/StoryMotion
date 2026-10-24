import { useNavigate, useParams } from 'react-router-dom';
import { getStoryById } from '../../data/stories/registry';
import { StoryNotFound } from '../library/StoryNotFound';
import { useSession } from '../../app/SessionContext';
import { routes } from '../../app/router';
import { RewardBadge } from './RewardBadge';
import { PrimaryButton } from '../layout/PrimaryButton';

export function CompletionPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { mode, characterId, setCharacterId } = useSession();

  const story = storyId ? getStoryById(storyId) : undefined;
  if (!story) {
    return <StoryNotFound />;
  }

  const character =
    story.characters.find((candidate) => candidate.id === characterId) ??
    story.characters[0];

  const playAgain = () => {
    setCharacterId(null);
    navigate(routes.characterSelect(story.id));
  };

  const anotherStory = () => {
    setCharacterId(null);
    navigate(routes.library());
  };

  return (
    <section style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
      <div style={{ fontSize: '3rem' }} aria-hidden="true">
        🎉
      </div>
      <h2>You did it, {character.name}'s friend!</h2>
      <p style={{ fontSize: 'var(--fs-md)', fontStyle: 'italic' }}>"{story.moral}"</p>

      <RewardBadge title={story.badge.title} description={story.badge.description} />

      {mode === 'family' && (
        <div className="card" style={{ background: 'var(--color-sky)', border: 'none' }}>
          <h3>Family Reflection</h3>
          <p style={{ margin: 0 }}>
            What was your favorite part of the story? Talk about it together
            before you pick the next adventure!
          </p>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <PrimaryButton variant="secondary" onClick={playAgain}>
          Play This Story Again
        </PrimaryButton>
        <PrimaryButton onClick={anotherStory}>Choose Another Story</PrimaryButton>
      </div>
    </section>
  );
}
