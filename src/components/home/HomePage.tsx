import { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Hero } from './Hero';
import { ModeSelect } from './ModeSelect';
import { HowItWorksModal } from './HowItWorksModal';
import { useSession } from '../../app/SessionContext';

export function HomePage() {
  const { mode, setMode, audioEnabled, toggleAudio } = useSession();
  const [showHowItWorks, setShowHowItWorks] = useState(false);

  return (
    <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      <Hero onHowItWorks={() => setShowHowItWorks(true)} />

      <div>
        <h2>How do you want to play?</h2>
        <ModeSelect mode={mode} onChange={setMode} />
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--space-3)',
        }}
      >
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

        <p
          style={{
            margin: 0,
            fontSize: 'var(--fs-xs)',
            color: 'var(--color-text-muted)',
          }}
        >
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
