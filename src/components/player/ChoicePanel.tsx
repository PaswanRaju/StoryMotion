import { Button, Panel } from '../../ui';

export type Choice = { id: string; label: string };

type ChoicePanelProps = {
  prompt: string;
  choices: Choice[];
  onChoose: (choiceId: string) => void;
  selectedId?: string | null;
};

export function ChoicePanel({
  prompt,
  choices,
  onChoose,
  selectedId,
}: ChoicePanelProps) {
  return (
    <Panel
      variant="glow"
      role="group"
      aria-label={prompt}
      className="choice-panel"
    >
      <p className="choice-panel__prompt">{prompt}</p>
      <div className="ui-row">
        {choices.map((choice) => (
          <Button
            key={choice.id}
            variant={selectedId === choice.id ? 'primary' : 'secondary'}
            aria-pressed={selectedId === choice.id}
            onClick={() => onChoose(choice.id)}
          >
            {choice.label}
          </Button>
        ))}
      </div>
    </Panel>
  );
}
