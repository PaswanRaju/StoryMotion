import { useNavigate, useParams } from 'react-router-dom';
import { getStoryById } from '../../data/stories/registry';
import { stories } from '../../stories';
import { routes } from '../../app/router';
import { StoryNotFound } from '../library/StoryNotFound';
import { StoryPlayer } from './StoryPlayer';

export function StoryPlayerPage() {
  const navigate = useNavigate();
  const { storyId } = useParams<{ storyId: string }>();
  const story = storyId ? getStoryById(storyId) : undefined;
  return story ? (
    <StoryPlayer
      key={story.id}
      story={stories[story.id]}
      summary={story}
      onComplete={() => void navigate(routes.complete(story.id))}
    />
  ) : (
    <StoryNotFound />
  );
}
