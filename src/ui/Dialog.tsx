import {
  useEffect,
  useId,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { X } from 'lucide-react';
import { IconButton } from './Button';

type DialogProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  closeLabel?: string;
  /** glass for app chrome; scroll for story/parent reading. */
  variant?: 'glass' | 'scroll';
};

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Accessible dialog: moves focus in on open, traps Tab, closes on Escape, and
 * restores focus to the trigger. The panel bounces in (fades only with reduced
 * motion) over a dimmed, softly blurred backdrop.
 */
export function Dialog({
  title,
  onClose,
  children,
  closeLabel = 'Close',
  variant = 'glass',
}: DialogProps) {
  const titleId = useId();
  const overlayRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    overlayRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
    return () => {
      previouslyFocused.current?.focus();
    };
  }, []);

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab') return;
    const node = overlayRef.current;
    if (!node) return;
    const focusable = Array.from(
      node.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
    );
    if (focusable.length === 0) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  return (
    <div
      className="ui-dialog-overlay"
      ref={overlayRef}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        className={`ui-dialog ui-panel ui-panel--${variant} ui-pop-in`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <div className="ui-dialog__head">
          <h2 id={titleId} className="ui-dialog__title">
            {title}
          </h2>
          <IconButton
            icon={<X size={24} strokeWidth={3} />}
            label={closeLabel}
            size="md"
            onClick={onClose}
          />
        </div>
        <div className="ui-dialog__body">{children}</div>
      </div>
    </div>
  );
}
