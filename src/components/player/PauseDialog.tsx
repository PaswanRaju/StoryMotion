import { Modal } from '../layout/Modal';
import { PrimaryButton } from '../layout/PrimaryButton';

type PauseDialogProps = {
  onResume: () => void;
  onReplayInstruction: () => void;
  onRestartChapter: () => void;
  onRestartStory: () => void;
  onExitToLibrary: () => void;
};

export function PauseDialog({
  onResume,
  onReplayInstruction,
  onRestartChapter,
  onRestartStory,
  onExitToLibrary,
}: PauseDialogProps) {
  return (
    <Modal title="Paused" onClose={onResume} closeLabel="Resume story">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
        <PrimaryButton onClick={onResume}>Resume</PrimaryButton>
        <PrimaryButton variant="secondary" onClick={onReplayInstruction}>
          Replay Instruction
        </PrimaryButton>
        <PrimaryButton variant="ghost" onClick={onRestartChapter}>
          Restart Chapter
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
