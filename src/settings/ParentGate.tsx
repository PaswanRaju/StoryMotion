import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Modal } from '../components/layout/Modal';

export function ParentGate({
  children,
  label = 'Grown-up settings',
  onOpenChange,
}: {
  children: ReactNode;
  label?: string;
  onOpenChange?: (open: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const [holding, setHolding] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const cancel = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    setHolding(false);
  };
  const start = () => {
    if (timer.current) return;
    setHolding(true);
    timer.current = setTimeout(() => {
      timer.current = null;
      setHolding(false);
      setOpen(true);
      onOpenChange?.(true);
    }, 3000);
  };
  useEffect(() => {
    const close = () => {
      setOpen(false);
      if (timer.current) clearTimeout(timer.current);
      timer.current = null;
      setHolding(false);
    };
    window.addEventListener('storymotion-parent-close', close);
    return () => {
      window.removeEventListener('storymotion-parent-close', close);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);
  return (
    <>
      <button
        type="button"
        className="btn btn--secondary parent-gate"
        aria-label={`${label}: hold for 3 seconds`}
        onPointerDown={(event) => {
          if (event.button !== 0) return;
          event.currentTarget.setPointerCapture?.(event.pointerId);
          start();
        }}
        onPointerUp={cancel}
        onPointerCancel={cancel}
        onLostPointerCapture={cancel}
        onBlur={cancel}
        onKeyDown={(event) => {
          if ([' ', 'Enter'].includes(event.key)) {
            event.preventDefault();
            if (!event.repeat) start();
          }
        }}
        onKeyUp={cancel}
      >
        {holding ? 'Keep holding…' : label}
      </button>
      {open && (
        <Modal
          title={label}
          onClose={() => {
            setOpen(false);
            onOpenChange?.(false);
          }}
        >
          {children}
        </Modal>
      )}
    </>
  );
}
