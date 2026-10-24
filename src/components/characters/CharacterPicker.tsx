import type { CharacterSummary } from '../../data/stories/registry';
import { CharacterCard } from './CharacterCard';

type CharacterPickerProps = {
  characters: CharacterSummary[];
  selectedId: string | null;
  onSelect: (characterId: string) => void;
};

export function CharacterPicker({
  characters,
  selectedId,
  onSelect,
}: CharacterPickerProps) {
  return (
    <div className="grid" role="group" aria-label="Choose your character">
      {characters.map((character) => (
        <CharacterCard
          key={character.id}
          character={character}
          selected={character.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
