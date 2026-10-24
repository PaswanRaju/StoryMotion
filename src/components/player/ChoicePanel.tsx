export type Choice = { id: string; label: string };

type ChoicePanelProps = {
  prompt: string;
  choices: Choice[];
  onChoose: (choiceId: string) => void;
  selectedId?: string | null;
};

export function ChoicePanel({ prompt, choices, onChoose, selectedId }: ChoicePanelProps) {
  return (
    <div className="card" role="group" aria-label={prompt}>
      <p style={{ fontWeight: 600, marginBottom: 'var(--space-3)' }}>{prompt}</p>
      <div style={{ display: 'flex', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
        {choices.map((choice) => (
          <button
            key={choice.id}
            type="button"
            className={`btn btn--secondary${selectedId === choice.id ? ' card--selected' : ''}`}
            aria-pressed={selectedId === choice.id}
            onClick={() => onChoose(choice.id)}
          >
            {choice.label}
          </button>
        ))}
      </div>
    </div>
  );
}
