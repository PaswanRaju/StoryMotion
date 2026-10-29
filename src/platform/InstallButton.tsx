import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '../ui';
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
    <Button
      variant="secondary"
      size="md"
      className="install-button"
      icon={<Download size={20} />}
      onClick={() => void event.prompt().finally(() => setEvent(null))}
    >
      Install StoryMotion
    </Button>
  ) : null;
}
