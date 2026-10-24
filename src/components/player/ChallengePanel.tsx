import type { Movement } from '../../engine/types';
import { ProgressBar } from '../layout/ProgressBar';
import { PrimaryButton } from '../layout/PrimaryButton';

const MOVEMENT_ICON: Record<Movement, string> = {
  squat: '🏋️',
  reach: '🙆',
  march: '🚶',
  jump: '🤸',
  balance: '🦩',
};

type ChallengePanelProps = {
  instruction: string;
  movement: Movement;
  progress: number;
  target: number;
  completed: boolean;
  onRecordRep: () => void;
  onContinue: () => void;
};

/**
 * "I did it!" is the manual/simulated movement input — CLAUDE.md §0 rule 6
 * requires this path to exist permanently, using the same engine contract a
 * real camera rep would. Phase 05 adds the camera-driven MovementEvent
 * alongside this button, it never replaces it.
 */
export function ChallengePanel({
  instruction,
  movement,
  progress,
  target,
  completed,
  onRecordRep,
  onContinue,
}: ChallengePanelProps) {
  return (
    <div className="card">
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <span style={{ fontSize: '2rem' }} aria-hidden="true">
          {MOVEMENT_ICON[movement]}
        </span>
        <p style={{ margin: 0, fontWeight: 600 }}>{instruction}</p>
      </div>

      <div style={{ margin: 'var(--space-4) 0' }}>
        <ProgressBar value={progress} max={target} label={`${movement} progress`} />
      </div>

      {completed ? (
        <>
          <p style={{ color: 'var(--color-sage-dark)', fontWeight: 700 }}>
            🎉 Great job! You did it.
          </p>
          <PrimaryButton onClick={onContinue}>Continue</PrimaryButton>
        </>
      ) : (
        <PrimaryButton onClick={onRecordRep}>
          I did it! (tap to count — camera arrives in Phase 05)
        </PrimaryButton>
      )}
    </div>
  );
}
