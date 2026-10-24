import type { Mode } from '../../engine/types';

type ModeSelectProps = {
  mode: Mode;
  onChange: (mode: Mode) => void;
};

const OPTIONS: Array<{ id: Mode; label: string; description: string; icon: string }> = [
  {
    id: 'solo',
    label: 'Solo Adventure',
    description: 'Play on your own, at your own pace.',
    icon: '🧒',
  },
  {
    id: 'family',
    label: 'Family Adventure',
    description: 'Play together — grown-up picks the path, kid does the moves.',
    icon: '👨‍👩‍👧',
  },
];

export function ModeSelect({ mode, onChange }: ModeSelectProps) {
  return (
    <div
      className="grid"
      role="group"
      aria-label="Choose how you want to play"
      style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}
    >
      {OPTIONS.map((option) => {
        const selected = mode === option.id;
        return (
          <button
            key={option.id}
            type="button"
            className={`card card--selectable${selected ? ' card--selected' : ''}`}
            aria-pressed={selected}
            onClick={() => onChange(option.id)}
          >
            <div style={{ fontSize: '2rem' }} aria-hidden="true">
              {option.icon}
            </div>
            <h3>{option.label}</h3>
            <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>
              {option.description}
            </p>
          </button>
        );
      })}
    </div>
  );
}
