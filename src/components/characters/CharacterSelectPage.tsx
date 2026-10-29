import { useNavigate, useParams } from 'react-router-dom';
import { CharacterPicker } from './CharacterPicker';
import { getStoryById } from '../../data/stories/registry';
import { useSession } from '../../app/SessionContext';
import { routes } from '../../app/router';
import { ArrowLeft, Rocket } from 'lucide-react';
import { Button, Panel } from '../../ui';
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
      <p className="character-select__sub">
        Who will you cheer for on this adventure?
      </p>

      {mode === 'family' && (
        <Panel variant="scroll" className="family-note">
          👨‍👩‍👧 Parent: pick a character together with your child before you
          continue.
        </Panel>
      )}

      <CharacterPicker
        storyId={story.id}
        characters={story.characters}
        selectedId={selectedValid ? characterId : null}
        onSelect={setCharacterId}
      />

      <div className="page-actions">
        <Button
          variant="ghost"
          icon={<ArrowLeft size={24} />}
          onClick={() => navigate(routes.library())}
        >
          Back
        </Button>
        <Button
          size="xl"
          sfx="start"
          icon={<Rocket size={28} />}
          disabled={!selectedValid}
          onClick={() => navigate(routes.cameraSetup(story.id))}
        >
          Let's Go
        </Button>
      </div>
    </section>
  );
}
