import { useEffect, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button, IconButton, Panel } from '../../ui';

export type NarrationPanelProps = {
  language?: 'en' | 'es';
  getCharIndex?: () => number;
  speaker: string;
  text: string;
  onReplay: () => void;
  onContinue?: () => void;
  accent?: string;
  /** 'subtitle': movie-style caption bar under a cinematic scene. */
  variant?: 'card' | 'subtitle';
};

/**
 * The always-visible subtitle panel. Reused as-is for narrator lines, and
 * wrapped by DialoguePanel for in-character lines — captions stay on screen
 * regardless of Web Speech API support (CLAUDE.md §6: "captions always
 * visible").
 */
export function NarrationPanel({
  speaker,
  getCharIndex,
  language = 'en',
  text,
  onReplay,
  onContinue,
  accent,
  variant = 'card',
}: NarrationPanelProps) {
  const [charIndex, setCharIndex] = useState(-1);
  useEffect(() => {
    if (!getCharIndex) return;
    const timer = setInterval(() => setCharIndex(getCharIndex()), 80);
    return () => clearInterval(timer);
  }, [getCharIndex]);
  if (variant === 'subtitle')
    return (
      <div className="subtitle-bar">
        <span className="subtitle-bar__speaker">{speaker}</span>
        <p className="subtitle-bar__text" lang={language} aria-live="polite">
          <span key={text} className="narration-line">
            <CaptionWords text={text} charIndex={charIndex} />
          </span>
        </p>
        <IconButton
          className="subtitle-bar__replay"
          icon={<RotateCcw size={26} strokeWidth={2.5} />}
          label="Replay narration"
          title="Hear it again"
          onClick={onReplay}
        />
      </div>
    );
  return (
    <Panel
      variant="scroll"
      className="narration-card"
      style={accent ? { background: accent } : undefined}
    >
      <span className="narration-card__speaker">{speaker}</span>
      <p className="narration-card__text" aria-live="polite">
        <span key={text} className="narration-line">
          <CaptionWords text={text} charIndex={charIndex} />
        </span>
      </p>
      <div className="narration-card__actions">
        <Button
          variant="secondary"
          icon={<RotateCcw size={22} />}
          onClick={onReplay}
          aria-label="Replay narration"
        >
          Replay
        </Button>
        {onContinue && <Button onClick={onContinue}>Continue</Button>}
      </div>
    </Panel>
  );
}

function CaptionWords({
  text,
  charIndex,
}: {
  text: string;
  charIndex: number;
}) {
  const words = [...text.matchAll(/\S+/g)];
  const active = words.findLastIndex((word) => word.index <= charIndex);
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {words.map((word, index) => (
          <span
            key={word.index}
            className={
              index === active && charIndex >= 0
                ? 'caption-word is-current'
                : 'caption-word'
            }
          >
            {word[0]}
            {index < words.length - 1 ? ' ' : ''}
          </span>
        ))}
      </span>
    </>
  );
}
