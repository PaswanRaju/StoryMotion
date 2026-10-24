import { useNavigate, useParams } from 'react-router-dom';
import { CameraSetup } from './CameraSetup';
import { getStoryById } from '../../data/stories/registry';
import { StoryNotFound } from '../library/StoryNotFound';
import { routes } from '../../app/router';

export function CameraSetupPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const story = storyId ? getStoryById(storyId) : undefined;

  if (!story) {
    return <StoryNotFound />;
  }

  return (
    <CameraSetup
      onBack={() => navigate(routes.characterSelect(story.id))}
      onContinue={() => navigate(routes.player(story.id))}
    />
  );
}
