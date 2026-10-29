import type { Movement } from '../../engine/types';
import { Button, Panel, ProgressBar } from '../../ui';

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
    <Panel variant="glow" className="challenge-panel">
      <div className="challenge-panel__head">
        <span className="challenge-panel__icon" aria-hidden="true">
          {MOVEMENT_ICON[movement]}
        </span>
        <p>{instruction}</p>
      </div>

      <div className="challenge-panel__progress">
        <ProgressBar
          value={progress}
          max={target}
          label={`${movement} progress`}
        />
      </div>

      {completed ? (
        <>
          <p className="challenge-panel__done">🎉 Great job! You did it.</p>
          <Button onClick={onContinue}>Continue</Button>
        </>
      ) : (
        <Button variant="magic" onClick={onRecordRep}>
          I did it! (tap to count — camera arrives in Phase 05)
        </Button>
      )}
    </Panel>
  );
}
