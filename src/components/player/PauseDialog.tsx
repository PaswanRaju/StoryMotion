import { Modal } from '../layout/Modal';
import { PrimaryButton } from '../layout/PrimaryButton';

type PauseDialogProps = {
  onResume: () => void;
  onReplayInstruction: () => void;
  onRestartStory: () => void;
  onExitToLibrary: () => void;
};

export function PauseDialog({
  onResume,
  onReplayInstruction,
  onRestartStory,
  onExitToLibrary,
}: PauseDialogProps) {
  return (
    <Modal title="Paused" onClose={onResume} closeLabel="Resume story">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <PrimaryButton onClick={onResume}>Resume</PrimaryButton>
        <PrimaryButton variant="secondary" onClick={onReplayInstruction}>
          Hear That Again
        </PrimaryButton>
        <PrimaryButton variant="ghost" onClick={onRestartStory}>
          Restart Story
        </PrimaryButton>
        <PrimaryButton variant="ghost" onClick={onExitToLibrary}>
          Exit to Library
        </PrimaryButton>
      </div>
    </Modal>
  );
}
