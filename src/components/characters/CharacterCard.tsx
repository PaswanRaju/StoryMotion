import { Check } from 'lucide-react';
import type { CharacterSummary } from '../../data/stories/registry';
import type { StoryId } from '../../engine/types';
import { CharacterArt } from '../art/StoryArt';
import './characters.css';

type CharacterCardProps = {
  storyId: StoryId;
  character: CharacterSummary;
  selected: boolean;
  onSelect: (characterId: string) => void;
};

export function CharacterCard({ storyId, character, selected, onSelect }: CharacterCardProps) {
  return (
    <button
      type="button"
      className={`character-card${selected ? ' is-selected' : ''}`}
      aria-pressed={selected}
      data-sfx="select"
      onClick={() => onSelect(character.id)}
    >
      <div className="character-card__stage">
        <span className="character-card__glow" aria-hidden="true" />
        <CharacterArt storyId={storyId} characterId={character.id} />
        {selected && (
          <span className="character-card__check" aria-hidden="true">
            <Check size={22} strokeWidth={3} />
          </span>
        )}
      </div>
      <span className="character-card__name">{character.name}</span>
      <span className="character-card__persona">{character.persona}</span>
      <span className="character-card__pick" aria-hidden="true">
        {selected ? 'Selected!' : 'Pick me'}
      </span>
    </button>
  );
}
