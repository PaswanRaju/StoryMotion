import { Link } from 'react-router-dom';
import { routes } from '../../app/router';

export function StoryNotFound() {
  return (
    <section style={{ textAlign: 'center' }}>
      <h2>We couldn't find that story</h2>
      <p>It may have been a typo in the link. Let's head back to the library.</p>
      <Link to={routes.library()} className="btn btn--primary">
        Back to Story Library
      </Link>
    </section>
  );
}
