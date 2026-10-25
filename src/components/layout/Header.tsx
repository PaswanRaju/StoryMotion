import { Link } from 'react-router-dom';
import { Music, Music2 } from 'lucide-react';
import { useSession } from '../../app/SessionContext';

export function Header() {
  const { sfxEnabled, toggleSfx } = useSession();
  return (
    <header className="app-header">
      <Link to="/" className="app-header__brand" aria-label="StoryMotion home">
        <span className="app-header__logo" aria-hidden="true">
          <span className="app-header__orbit" />✦
        </span>
        <span className="app-header__word">StoryMotion</span>
      </Link>
      <div className="app-header__right">
        <span className="app-header__tag">Move · Imagine · Play</span>
        <button
          type="button"
          className={`sound-toggle${sfxEnabled ? ' is-on' : ''}`}
          onClick={toggleSfx}
          aria-pressed={sfxEnabled}
          aria-label={sfxEnabled ? 'Turn sound effects off' : 'Turn sound effects on'}
          data-sfx="toggle"
          title="Sound effects (narration has its own button)"
        >
          {sfxEnabled ? <Music2 size={18} aria-hidden="true" /> : <Music size={18} aria-hidden="true" />}
          <span>{sfxEnabled ? 'Effects on' : 'Effects off'}</span>
          <span className="sound-toggle__bars" aria-hidden="true">
            <i />
            <i />
            <i />
          </span>
        </button>
      </div>
    </header>
  );
}
