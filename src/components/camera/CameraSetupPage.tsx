import { useNavigate, useParams } from 'react-router-dom';
import { getStoryById } from '../../data/stories/registry';
import { StoryNotFound } from '../library/StoryNotFound';
import { routes } from '../../app/router';
import { stories } from '../../stories';
import { toBodyGesture } from '../../engine/gestures';
import { Warmup } from './Warmup';
export function CameraSetupPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const story = storyId ? getStoryById(storyId) : undefined;
  return story ? (
    <Warmup
      gestures={stories[story.id].scenes.flatMap((scene) =>
        scene.interactions
          .flatMap((node) => [
            node.gesture,
            ...node.alternatives.map((alt) => alt.gesture),
          ])
          .map(toBodyGesture),
      )}
      onContinue={() => void navigate(routes.player(story.id))}
    />
  ) : (
    <StoryNotFound />
  );
}
