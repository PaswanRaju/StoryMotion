import { Navigate, useParams } from 'react-router-dom';
import { getStoryById } from '../../data/stories/registry';
import { StoryNotFound } from '../library/StoryNotFound';
import { routes } from '../../app/router';

/** Preserve bookmarked setup URLs without showing the obsolete simulated permission flow. */
export function CameraSetupPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const story = storyId ? getStoryById(storyId) : undefined;
  return story ? (
    <Navigate to={routes.player(story.id)} replace />
  ) : (
    <StoryNotFound />
  );
}
