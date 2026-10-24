import type { StorySummary } from '../../data/stories/registry';
import { StoryCard } from './StoryCard';

type StoryGridProps = {
  stories: StorySummary[];
  onSelect: (storyId: string) => void;
};

export function StoryGrid({ stories, onSelect }: StoryGridProps) {
  return (
    <div className="grid">
      {stories.map((story) => (
        <StoryCard key={story.id} story={story} onSelect={onSelect} />
      ))}
    </div>
  );
}
