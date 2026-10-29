import type { CharacterSummary } from '../../data/stories/registry';
import type { StoryId } from '../../engine/types';
import { CharacterArt } from '../art/StoryArt';
import { SelectCard } from '../../ui';
import './characters.css';

type CharacterCardProps = {
  storyId: StoryId;
  character: CharacterSummary;
  selected: boolean;
  onSelect: (characterId: string) => void;
};

export function CharacterCard({
  storyId,
  character,
  selected,
  onSelect,
}: CharacterCardProps) {
  return (
    <SelectCard
      tone={storyId}
      selected={selected}
      className="character-card"
      onClick={() => onSelect(character.id)}
      art={
        <span className="character-card__stage">
          <span className="character-card__glow" aria-hidden="true" />
          <CharacterArt storyId={storyId} characterId={character.id} />
        </span>
      }
    >
      <span className="character-card__name">{character.name}</span>
      <span className="character-card__persona">{character.persona}</span>
      <span className="character-card__pick" aria-hidden="true">
        {selected ? 'Selected!' : 'Pick me'}
      </span>
    </SelectCard>
  );
}
