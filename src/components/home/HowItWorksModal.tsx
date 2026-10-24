import { Modal } from '../layout/Modal';

type HowItWorksModalProps = {
  onClose: () => void;
};

const STEPS = [
  {
    title: '1. Pick a story and character',
    text: 'Choose a tale and the character you want to play as.',
  },
  {
    title: '2. Move to make it happen',
    text: 'Squat, reach, march, or jump along with the story — the camera (or a tap, if you skip it) counts your moves.',
  },
  {
    title: '3. Watch the story react',
    text: 'Every move changes the scene. Finish the story and earn a badge!',
  },
];

export function HowItWorksModal({ onClose }: HowItWorksModalProps) {
  return (
    <Modal title="How It Works" onClose={onClose} closeLabel="Close How It Works">
      <ol style={{ paddingLeft: 'var(--space-5)', margin: 0 }}>
        {STEPS.map((step) => (
          <li key={step.title} style={{ marginBottom: 'var(--space-4)' }}>
            <strong>{step.title}</strong>
            <p style={{ margin: 0 }}>{step.text}</p>
          </li>
        ))}
      </ol>
    </Modal>
  );
}
