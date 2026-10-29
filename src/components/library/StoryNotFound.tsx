import { routes } from '../../app/router';
import { ButtonLink, Panel } from '../../ui';

export function StoryNotFound() {
  return (
    <Panel as="section" variant="glow" entrance className="page-message">
      <h2>We couldn't find that story</h2>
      <p>
        It may have been a typo in the link. Let's head back to the library.
      </p>
      <ButtonLink to={routes.library()}>Back to Story Library</ButtonLink>
    </Panel>
  );
}
