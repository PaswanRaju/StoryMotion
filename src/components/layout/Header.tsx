import { Link } from 'react-router-dom';

export function Header() {
  return (
    <header className="app-header">
      <Link to="/" className="app-header__brand" aria-label="StoryMotion home">
        <span aria-hidden="true">📖</span>
        StoryMotion
      </Link>
    </header>
  );
}
