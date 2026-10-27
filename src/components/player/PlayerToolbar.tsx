import { useI18n } from '../../i18n';
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
  const { t } = useI18n();
  return (
    <div className="player-toolbar">
      <div className="player-toolbar__title">
        <h2>{title}</h2>
        <p>{chapterLabel}</p>
      </div>
      <div className="player-toolbar__controls">
        <button
          type="button"
          className="btn btn--ghost player-toolbar__btn"
          onClick={onToggleMute}
          aria-pressed={muted}
          data-sfx="toggle"
          aria-label={muted ? t('unmuteNarration') : t('muteNarration')}
        >
          {muted ? (
            <VolumeX size={18} aria-hidden="true" />
          ) : (
            <Volume2 size={18} aria-hidden="true" />
          )}
          {muted ? t('soundOff') : t('soundOn')}
        </button>
        <button
          type="button"
          className="btn btn--ghost player-toolbar__btn"
          onClick={onRestart}
          aria-label={t('restartStory')}
        >
          <RotateCcw size={18} aria-hidden="true" /> Replay
        </button>
        <button
          type="button"
          className="btn btn--ghost player-toolbar__btn"
          onClick={onPause}
          aria-label={t('pauseStory')}
        >
          <Pause size={18} aria-hidden="true" /> {t('pause')}
        </button>
      </div>
    </div>
  );
}
