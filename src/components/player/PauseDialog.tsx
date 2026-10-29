import { Play, RotateCcw, Undo2, Volume2 } from 'lucide-react';
import { Button, Dialog } from '../../ui';

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
    <Dialog title="Paused" onClose={onResume} closeLabel="Resume story">
      <div className="ui-stack">
        <Button
          block
          icon={<Play size={24} fill="currentColor" />}
          onClick={onResume}
        >
          Resume
        </Button>
        <Button
          block
          variant="secondary"
          icon={<Volume2 size={24} />}
          onClick={onReplayInstruction}
        >
          Hear That Again
        </Button>
        <Button
          block
          variant="ghost"
          icon={<RotateCcw size={24} />}
          onClick={onRestartStory}
        >
          Restart Story
        </Button>
        <Button
          block
          variant="ghost"
          icon={<Undo2 size={24} />}
          onClick={onExitToLibrary}
        >
          Exit to Library
        </Button>
      </div>
    </Dialog>
  );
}
