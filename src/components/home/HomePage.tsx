import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Hero } from './Hero';
import { ModeSelect } from './ModeSelect';
import { HowItWorksModal } from './HowItWorksModal';
import { GestureHint } from '../player/GestureHint';
import { useSession } from '../../app/SessionContext';
import type { BodyGesture } from '../../vision/bodyGestures';

const STEPS: { gesture: BodyGesture; title: string; text: string }[] = [
  {
    gesture: 'LEAN_LEFT',
    title: '1 · Watch',
    text: 'The story plays by itself, like your favorite cartoon.',
  },
  {
    gesture: 'ARMS_WIDE',
    title: '2 · Move once',
    text: 'When a friend needs help, do one quick move — or tap a button.',
  },
  {
    gesture: 'HAND_RAISE',
    title: '3 · Magic happens!',
    text: 'Shields, sparkles and speed boosts — then the story carries on.',
  },
];

export function HomePage() {
  const { mode, setMode, audioEnabled, toggleAudio } = useSession();
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <section className="home">
      <Hero onHowItWorks={() => setShowHowItWorks(true)} />

      <ol className="home-steps" aria-label="How StoryMotion works">
        {STEPS.map((step, i) => (
          <li key={step.title} style={{ animationDelay: `${200 + i * 120}ms` }}>
            <GestureHint gesture={step.gesture} />
            <div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className="home-mode">
        <h2>How do you want to play?</h2>
        <ModeSelect mode={mode} onChange={setMode} />
      </div>

      <div className="home-footer">
        <button
          type="button"
          className="btn btn--ghost btn--small"
          onClick={toggleAudio}
          aria-pressed={audioEnabled}
        >
          {audioEnabled ? (
            <Volume2 size={18} aria-hidden="true" />
          ) : (
            <VolumeX size={18} aria-hidden="true" />
          )}
          {audioEnabled ? 'Sound On' : 'Sound Off'}
        </button>
        <p>
          🔒 Your camera stays on this device. We never record, save, or send
          video anywhere.
        </p>
      </div>

      {showHowItWorks && (
        <HowItWorksModal onClose={() => setShowHowItWorks(false)} />
      )}
    </section>
  );
}
