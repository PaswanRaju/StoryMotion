import { useEffect, useState } from 'react';
interface InstallEvent extends Event {
  prompt(): Promise<void>;
}
export function InstallButton() {
  const [event, setEvent] = useState<InstallEvent | null>(null);
  useEffect(() => {
    const ready = (event: Event) => {
      event.preventDefault();
      setEvent(event as InstallEvent);
    };
    window.addEventListener('beforeinstallprompt', ready);
    return () => window.removeEventListener('beforeinstallprompt', ready);
  }, []);
  return event ? (
    <button
      className="btn btn--secondary"
      onClick={() => void event.prompt().finally(() => setEvent(null))}
    >
      Install StoryMotion
    </button>
  ) : null;
}
