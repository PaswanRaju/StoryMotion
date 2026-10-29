import { Link } from 'react-router-dom';
import { Music, Music2 } from 'lucide-react';
import { useSession } from '../../app/SessionContext';
import { IconButton } from '../../ui';

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
        <IconButton
          className={`sound-toggle${sfxEnabled ? ' is-on' : ''}`}
          variant={sfxEnabled ? 'secondary' : 'ghost'}
          icon={
            sfxEnabled ? (
              <Music2 size={26} strokeWidth={2.5} />
            ) : (
              <Music size={26} strokeWidth={2.5} />
            )
          }
          label={
            sfxEnabled ? 'Turn sound effects off' : 'Turn sound effects on'
          }
          title="Sound effects (narration has its own button)"
          aria-pressed={sfxEnabled}
          sfx="toggle"
          onClick={toggleSfx}
        />
      </div>
    </header>
  );
}
