import type { PointerEvent } from 'react';
import { Play } from 'lucide-react';
import type { StorySummary } from '../../data/stories/registry';
import { StoryCover } from '../art/StoryArt';

type StoryCardProps = {
  story: StorySummary;
  onSelect: (storyId: string) => void;
  featured?: boolean;
};

/** Menu copy: what the adventure is, and how the child takes part. */
const PITCH: Record<StorySummary['id'], { tagline: string; interaction: string; chips: string[] }> = {
  hare: {
    tagline: 'Help Tortoise win a magical forest race with motion-powered magic!',
    interaction: '🙌 Spread your arms, lean, and raise a hand to help Tortoise',
    chips: ['⭐ Featured', '3 magic moments', 'Camera or buttons'],
  },
  beanstalk: {
    tagline: "Climb into the clouds, discover a giant's castle, and help Jack using your movements.",
    interaction: '✋ Raise a hand to grow the beanstalk, lean to dodge, open your arms to glide home',
    chips: ['✨ New adventure', '3 magic moments', 'Camera or buttons'],
  },
  pigs: {
    tagline: 'Build the strongest little house and keep it safe from a windy wolf.',
    interaction: '🧱 Use your body to help the pigs build',
    chips: ['Build together', 'Camera or buttons'],
  },
};

/** Pointer-following 3D tilt via CSS variables (no re-render). */
function tilt(event: PointerEvent<HTMLElement>) {
  const el = event.currentTarget;
  const box = el.getBoundingClientRect();
  el.style.setProperty('--tilt-x', `${((event.clientY - box.top) / box.height - 0.5) * -6}deg`);
  el.style.setProperty('--tilt-y', `${((event.clientX - box.left) / box.width - 0.5) * 8}deg`);
}
function untilt(event: PointerEvent<HTMLElement>) {
  event.currentTarget.style.setProperty('--tilt-x', '0deg');
  event.currentTarget.style.setProperty('--tilt-y', '0deg');
}

export function StoryCard({ story, onSelect, featured = false }: StoryCardProps) {
  const pitch = PITCH[story.id];
  return (
    <article
      className={`story-card${featured ? ' story-card--featured' : ''}`}
      onPointerMove={tilt}
      onPointerLeave={untilt}
    >
      <div className="story-card__cover">
        <span className="story-card__orbit" aria-hidden="true">
          <i />
        </span>
        <StoryCover storyId={story.id} />
        <span className="story-card__theme">{story.theme}</span>
      </div>
      <div className="story-card__body">
        <h3>{story.title}</h3>
        <p className="story-card__tagline">{pitch.tagline}</p>
        <p className="story-card__hint">{pitch.interaction}</p>
        <ul className="story-card__chips" aria-label="Story features">
          {pitch.chips.map((chip) => (
            <li key={chip}>{chip}</li>
          ))}
        </ul>
        <p className="story-card__cast">
          Starring: {story.characters.map((c) => c.name).join(' & ')}
        </p>
        <button
          type="button"
          className="story-card__play"
          data-sfx="start"
          onClick={() => onSelect(story.id)}
          aria-label={`Start ${story.title}`}
        >
          <Play size={20} fill="currentColor" aria-hidden="true" /> Play Now
        </button>
      </div>
    </article>
  );
}
