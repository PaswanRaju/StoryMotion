import { Dialog } from '../../ui';

type HowItWorksModalProps = {
  onClose: () => void;
};

const STEPS = [
  {
    title: '1. Pick a story and character',
    text: 'Choose a tale and the character you want to play as.',
  },
  {
    title: '2. Settle in and watch',
    text: 'The animated story plays by itself. You can pause or replay whenever you like.',
  },
  {
    title: '3. Watch the story react',
    text: 'At a magic moment, briefly raise one hand or tap a button. Doing nothing is fine — the story keeps going!',
  },
];

export function HowItWorksModal({ onClose }: HowItWorksModalProps) {
  return (
    <Dialog
      title="How It Works"
      onClose={onClose}
      closeLabel="Close How It Works"
    >
      <ol className="how-it-works">
        {STEPS.map((step) => (
          <li key={step.title}>
            <strong>{step.title}</strong>
            <p>{step.text}</p>
          </li>
        ))}
      </ol>
    </Dialog>
  );
}
