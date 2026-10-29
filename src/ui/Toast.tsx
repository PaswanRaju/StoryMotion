import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

type ToastTone = 'info' | 'success' | 'magic';
type ToastItem = {
  id: number;
  message: string;
  icon?: string;
  tone: ToastTone;
};
type ToastApi = {
  show: (
    message: string,
    options?: { icon?: string; tone?: ToastTone },
  ) => void;
};

const ToastContext = createContext<ToastApi>({ show: () => {} });
const VISIBLE_MS = 3600;
const MAX_TOASTS = 3;

/** Bubbly notes that float up from the bottom and pop away by themselves. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const next = useRef(0);
  const show = useCallback<ToastApi['show']>((message, options) => {
    const id = ++next.current;
    setToasts((list) =>
      [
        ...list,
        { id, message, icon: options?.icon, tone: options?.tone ?? 'info' },
      ].slice(-MAX_TOASTS),
    );
    window.setTimeout(
      () => setToasts((list) => list.filter((toast) => toast.id !== id)),
      VISIBLE_MS,
    );
  }, []);
  const api = useMemo(() => ({ show }), [show]);
  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="ui-toasts" role="status" aria-live="polite">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`ui-toast ui-toast--${toast.tone} ui-pop-in`}
          >
            {toast.icon && (
              <span className="ui-toast__icon" aria-hidden="true">
                {toast.icon}
              </span>
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useToast = () => useContext(ToastContext);
