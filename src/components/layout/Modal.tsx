import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type ReactNode,
} from 'react';

type ModalProps = {
  title: string;
  onClose: () => void;
  children: ReactNode;
  closeLabel?: string;
};

const FOCUSABLE_SELECTOR =
  'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * Minimal accessible dialog: traps Tab focus inside, restores focus to the
 * trigger on close, and closes on Escape. Used for both the Home "How It
 * Works" modal and the in-player Pause Dialog.
 */
export function Modal({ title, onClose, children, closeLabel = 'Close' }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    const node = overlayRef.current;
    const first = node?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
    first?.focus();

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
      className="modal-overlay"
      ref={overlayRef}
      onKeyDown={handleKeyDown}
      role="presentation"
    >
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h2 id="modal-title" style={{ marginBottom: 0 }}>
            {title}
          </h2>
          <button
            type="button"
            className="btn btn--ghost btn--small"
            onClick={onClose}
            aria-label={closeLabel}
          >
            ✕
          </button>
        </div>
        <div style={{ marginTop: 'var(--space-4)' }}>{children}</div>
      </div>
    </div>
  );
}
