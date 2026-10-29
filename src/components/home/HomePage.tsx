import { LibraryShelf } from '../../platform/LibraryShelf';
import { InstallButton } from '../../platform/InstallButton';
import { useState } from 'react';
import { Hero } from './Hero';
import { ModeSelect } from './ModeSelect';
import { HowItWorksModal } from './HowItWorksModal';
import { GestureHint } from '../player/GestureHint';
import { useSession } from '../../app/SessionContext';
import type { BodyGesture } from '../../vision/bodyGestures';
import { Panel, Toggle } from '../../ui';

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
      <InstallButton />
      <LibraryShelf includeBuiltins />
      <Hero onHowItWorks={() => setShowHowItWorks(true)} />

      <ol className="home-steps" aria-label="How StoryMotion works">
        {STEPS.map((step, i) => (
          <Panel
            as="li"
            key={step.title}
            className="home-step"
            style={{ animationDelay: `${200 + i * 120}ms` }}
          >
            <GestureHint gesture={step.gesture} />
            <div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          </Panel>
        ))}
      </ol>

      <div className="home-mode">
        <h2>How do you want to play?</h2>
        <ModeSelect mode={mode} onChange={setMode} />
      </div>

      <div className="home-footer">
        <Toggle
          label="Story voice"
          checked={audioEnabled}
          onChange={toggleAudio}
        />
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
