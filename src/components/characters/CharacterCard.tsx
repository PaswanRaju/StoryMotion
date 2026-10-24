import type { CharacterSummary } from '../../data/stories/registry';

type CharacterCardProps = {
  character: CharacterSummary;
  selected: boolean;
  onSelect: (characterId: string) => void;
};

export function CharacterCard({ character, selected, onSelect }: CharacterCardProps) {
  return (
    <button
      type="button"
      className={`card card--selectable${selected ? ' card--selected' : ''}`}
      aria-pressed={selected}
      onClick={() => onSelect(character.id)}
    >
      <div
        aria-hidden="true"
        style={{
          height: '96px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-sky)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          marginBottom: 'var(--space-3)',
        }}
      >
        🧑‍🎤
      </div>
      <h3 style={{ marginBottom: 'var(--space-1)' }}>{character.name}</h3>
      <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
        {character.persona}
      </p>
    </button>
  );
}
