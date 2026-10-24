import { Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';

type PlayerToolbarProps = {
  title: string;
  chapterLabel: string;
  muted: boolean;
  onToggleMute: () => void;
  onPause: () => void;
  onRestart: () => void;
};

export function PlayerToolbar({
  title,
  chapterLabel,
  muted,
  onToggleMute,
  onPause,
  onRestart,
}: PlayerToolbarProps) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
      }}
    >
      <div>
        <h2 style={{ marginBottom: 0 }}>{title}</h2>
        <p style={{ margin: 0, color: 'var(--color-text-muted)' }}>{chapterLabel}</p>
      </div>
      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
        <button
          type="button"
          className="btn btn--ghost btn--small"
          onClick={onToggleMute}
          aria-pressed={muted}
          aria-label={muted ? 'Unmute narration' : 'Mute narration'}
        >
          {muted ? <VolumeX size={18} aria-hidden="true" /> : <Volume2 size={18} aria-hidden="true" />}
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--small"
          onClick={onRestart}
          aria-label="Restart story"
        >
          <RotateCcw size={18} aria-hidden="true" />
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--small"
          onClick={onPause}
          aria-label="Pause story"
        >
          <Pause size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
