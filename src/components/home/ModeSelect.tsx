import type { Mode } from '../../engine/types';
import { SelectCard } from '../../ui';

type ModeSelectProps = {
  mode: Mode;
  onChange: (mode: Mode) => void;
};

const OPTIONS: Array<{
  id: Mode;
  label: string;
  description: string;
  icon: string;
}> = [
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
      className="mode-select"
      role="group"
      aria-label="Choose how you want to play"
    >
      {OPTIONS.map((option) => {
        const selected = mode === option.id;
        return (
          <SelectCard
            key={option.id}
            selected={selected}
            className="mode-select__card"
            onClick={() => onChange(option.id)}
          >
            <span className="mode-select__icon" aria-hidden="true">
              {option.icon}
            </span>
            <span className="mode-select__label">{option.label}</span>
            <span className="mode-select__desc">{option.description}</span>
          </SelectCard>
        );
      })}
    </div>
  );
}
