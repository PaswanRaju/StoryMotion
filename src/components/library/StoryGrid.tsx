import type { StorySummary } from '../../data/stories/registry';
import { StoryCard } from './StoryCard';
import './library.css';

type StoryGridProps = {
  stories: StorySummary[];
  onSelect: (storyId: string) => void;
};

export function StoryGrid({ stories, onSelect }: StoryGridProps) {
  return (
    <div className="story-grid">
      {stories.map((story, index) => (
        <div
          key={story.id}
          className={`story-grid__item${index === 0 ? ' story-grid__item--featured' : ''}`}
          style={{ animationDelay: `${index * 120}ms` }}
        >
          <StoryCard story={story} onSelect={onSelect} featured={index === 0} />
        </div>
      ))}
    </div>
  );
}
