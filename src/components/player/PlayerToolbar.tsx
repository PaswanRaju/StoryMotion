import { useI18n } from '../../i18n';
import { Pause, RotateCcw, Volume2, VolumeX } from 'lucide-react';
import { IconButton } from '../../ui';

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
        <IconButton
          className="player-toolbar__btn"
          icon={
            muted ? (
              <VolumeX size={26} strokeWidth={2.5} />
            ) : (
              <Volume2 size={26} strokeWidth={2.5} />
            )
          }
          label={muted ? t('unmuteNarration') : t('muteNarration')}
          title={muted ? t('soundOff') : t('soundOn')}
          aria-pressed={muted}
          sfx="toggle"
          onClick={onToggleMute}
        />
        <IconButton
          className="player-toolbar__btn"
          icon={<RotateCcw size={26} strokeWidth={2.5} />}
          label={t('restartStory')}
          onClick={onRestart}
        />
        <IconButton
          className="player-toolbar__btn"
          variant="secondary"
          icon={<Pause size={26} strokeWidth={2.5} fill="currentColor" />}
          label={t('pauseStory')}
          onClick={onPause}
        />
      </div>
    </div>
  );
}
