import { RotateCcw } from 'lucide-react';
import { PrimaryButton } from '../layout/PrimaryButton';

export type NarrationPanelProps = {
  speaker: string;
  text: string;
  onReplay: () => void;
  onContinue?: () => void;
  accent?: string;
};

/**
 * The always-visible subtitle panel. Reused as-is for narrator lines, and
 * wrapped by DialoguePanel for in-character lines — captions stay on screen
 * regardless of Web Speech API support (CLAUDE.md §6: "captions always
 * visible").
 */
export function NarrationPanel({
  speaker,
  text,
  onReplay,
  onContinue,
  accent = 'var(--color-surface)',
}: NarrationPanelProps) {
  return (
    <div
      className="card"
      style={{ background: accent, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}
    >
      <span
        style={{
          fontFamily: 'var(--font-heading)',
          fontWeight: 600,
          color: 'var(--color-honey-dark)',
        }}
      >
        {speaker}
      </span>
      <p style={{ margin: 0, fontSize: 'var(--fs-md)' }} aria-live="polite">
        {text}
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-3)', justifyContent: 'flex-end' }}>
        <button
          type="button"
          className="btn btn--ghost btn--small"
          onClick={onReplay}
          aria-label="Replay narration"
        >
          <RotateCcw size={16} aria-hidden="true" />
          Replay
        </button>
        {onContinue && (
          <PrimaryButton size="small" onClick={onContinue}>
            Continue
          </PrimaryButton>
        )}
      </div>
    </div>
  );
}
