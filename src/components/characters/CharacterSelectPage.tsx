import { useNavigate, useParams } from 'react-router-dom';
import { CharacterPicker } from './CharacterPicker';
import { getStoryById } from '../../data/stories/registry';
import { useSession } from '../../app/SessionContext';
import { routes } from '../../app/router';
import { PrimaryButton } from '../layout/PrimaryButton';
import { StoryNotFound } from '../library/StoryNotFound';

export function CharacterSelectPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { mode, characterId, setCharacterId } = useSession();

  const story = storyId ? getStoryById(storyId) : undefined;
  if (!story) {
    return <StoryNotFound />;
  }

  const selectedValid = characterId
    ? story.characters.some((character) => character.id === characterId)
    : false;

  return (
    <section className="character-select">
      <p className="eyebrow">{story.title}</p>
      <h2>Choose Your Character</h2>
      <p className="character-select__sub">Who will you cheer for on this adventure?</p>

      {mode === 'family' && (
        <p
          className="card"
          style={{
            background: 'var(--color-sky)',
            border: 'none',
            fontWeight: 600,
          }}
        >
          👨‍👩‍👧 Parent: pick a character together with your child before you
          continue.
        </p>
      )}

      <CharacterPicker
        storyId={story.id}
        characters={story.characters}
        selectedId={selectedValid ? characterId : null}
        onSelect={setCharacterId}
      />

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 'var(--space-6)',
        }}
      >
        <PrimaryButton variant="ghost" onClick={() => navigate(routes.library())}>
          Back
        </PrimaryButton>
        <PrimaryButton
          data-sfx="start"
          disabled={!selectedValid}
          onClick={() => navigate(routes.player(story.id))}
        >
          Let's Go
        </PrimaryButton>
      </div>
    </section>
  );
}
