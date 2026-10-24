import { useEffect, useRef, useState } from 'react';
import { CameraPreview, type CameraPreviewState } from './CameraPreview';
import { PoseStatus } from './PoseStatus';
import { PrimaryButton } from '../layout/PrimaryButton';

type CameraSetupProps = {
  onContinue: () => void;
  onBack: () => void;
};

/**
 * Phase 02 "shell": the full screen layout and interaction states, driven by
 * a simulated timer instead of a real getUserMedia() call. Phase 05 swaps
 * the simulation for the real permission request + MediaPipe pipeline
 * without changing this component's props or layout.
 */
export function CameraSetup({ onContinue, onBack }: CameraSetupProps) {
  const [state, setState] = useState<CameraPreviewState>('idle');
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  function requestCamera() {
    setState('requesting');
    timeoutRef.current = window.setTimeout(() => setState('granted'), 900);
  }

  const ready = state === 'granted' || state === 'skipped';

  return (
    <section>
      <h2>Camera Setup</h2>
      <p>
        We use your camera to see your movements in real time — nothing is
        recorded, saved, or sent anywhere. Everything happens on this device.
      </p>

      <CameraPreview state={state} />

      <div style={{ marginTop: 'var(--space-4)' }}>
        <PoseStatus state={state} />
      </div>

      <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--fs-xs)' }}>
        Safety check: make sure you have clear space around you to move
        before you start.
      </p>

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          flexWrap: 'wrap',
          marginTop: 'var(--space-4)',
        }}
      >
        {(state === 'idle' || state === 'denied') && (
          <PrimaryButton onClick={requestCamera}>
            {state === 'denied' ? 'Retry Camera' : 'Allow Camera'}
          </PrimaryButton>
        )}
        {state !== 'skipped' && state !== 'granted' && (
          <PrimaryButton variant="secondary" onClick={() => setState('skipped')}>
            Play without camera
          </PrimaryButton>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: 'var(--space-6)',
        }}
      >
        <PrimaryButton variant="ghost" onClick={onBack}>
          Back
        </PrimaryButton>
        <PrimaryButton disabled={!ready} onClick={onContinue}>
          Continue
        </PrimaryButton>
      </div>
    </section>
  );
}
