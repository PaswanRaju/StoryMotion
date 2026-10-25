import type { CharacterSummary } from '../../data/stories/registry';
import type { StoryId } from '../../engine/types';
import { CharacterCard } from './CharacterCard';

type CharacterPickerProps = {
  storyId?: StoryId;
  characters: CharacterSummary[];
  selectedId: string | null;
  onSelect: (characterId: string) => void;
};

export function CharacterPicker({
  storyId = 'hare',
  characters,
  selectedId,
  onSelect,
}: CharacterPickerProps) {
  return (
    <div className="character-grid" role="group" aria-label="Choose your character">
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          storyId={storyId}
          character={character}
          selected={character.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
