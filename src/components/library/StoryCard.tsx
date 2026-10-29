import { Play } from 'lucide-react';
import type { StorySummary } from '../../data/stories/registry';
import { StoryCover } from '../art/StoryArt';
import { Badge, Button, Card } from '../../ui';

type StoryCardProps = {
  story: StorySummary;
  onSelect: (storyId: string) => void;
  featured?: boolean;
};

/** Menu copy: what the adventure is, and how the child takes part. */
const PITCH: Record<
  StorySummary['id'],
  { tagline: string; interaction: string; chips: string[] }
> = {
  hare: {
    tagline:
      'Help Tortoise win a magical forest race with motion-powered magic!',
    interaction: '🙌 Spread your arms, lean, and raise a hand to help Tortoise',
    chips: ['⭐ Featured', '3 magic moments', 'Camera or buttons'],
  },
  beanstalk: {
    tagline:
      "Trade a cow for magic beans, climb to the Giant's castle, and escape with the golden hen!",
    interaction:
      '✋ Raise a hand to grow the beanstalk, lean to dodge, spread your arms to protect Jack',
    chips: ['✨ Full story', '3 magic moments', 'Camera or buttons'],
  },
  pigs: {
    tagline:
      'Wheat, stone, then brick: follow all three pigs as they outsmart the huffing, puffing wolf.',
    interaction:
      '✋ Raise a hand to lift the last brick, 🙌 spread your arms to keep the house strong',
    chips: ['🐷 One story, three pigs', '2 magic moments', 'Camera or buttons'],
  },
};

export function StoryCard({
  story,
  onSelect,
  featured = false,
}: StoryCardProps) {
  const pitch = PITCH[story.id];
  return (
    <Card
      tone={story.id}
      className={`story-card${featured ? ' story-card--featured' : ''}`}
      art={
        <>
          <StoryCover storyId={story.id} />
          <span className="story-card__theme">
            <Badge tone="gold">{story.theme}</Badge>
          </span>
        </>
      }
    >
      <h3>{story.title}</h3>
      <p className="story-card__tagline">{pitch.tagline}</p>
      <p className="story-card__hint">{pitch.interaction}</p>
      <ul className="story-card__chips" aria-label="Story features">
        {pitch.chips.map((chip) => (
          <li key={chip}>
            <Badge>{chip}</Badge>
          </li>
        ))}
      </ul>
      <p className="story-card__cast">Starring: {story.starring}</p>
      <Button
        block
        className="story-card__play"
        sfx="start"
        icon={<Play size={26} fill="currentColor" />}
        onClick={() => onSelect(story.id)}
        aria-label={`Start ${story.title}`}
      >
        Play Now
      </Button>
    </Card>
  );
}
