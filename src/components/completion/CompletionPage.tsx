import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { playSfx } from '../../audio/sfx';
import { getStoryById } from '../../data/stories/registry';
import { StoryNotFound } from '../library/StoryNotFound';
import { useSession } from '../../app/SessionContext';
import { routes } from '../../app/router';
import { RewardBadge } from './RewardBadge';
import { PrimaryButton } from '../layout/PrimaryButton';
import { Hare, Tortoise } from '../../rendering/forest/characters';
import '../../rendering/forest/forest.css';
import { CompletionCast } from './CompletionCast';
import './completion.css';

const CONFETTI = ['#e8775f', '#f5bf72', '#7fb8de', '#a9d7a0', '#d99ad0', '#fff4c2'];
/** Deterministic confetti layout (no randomness during render). */
const PIECES = Array.from({ length: 36 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: ((i * 7) % 30) / 10,
  duration: 3.2 + ((i * 13) % 20) / 10,
  color: CONFETTI[i % CONFETTI.length],
  size: 8 + ((i * 5) % 9),
}));

export function CompletionPage() {
  const { storyId } = useParams<{ storyId: string }>();
  const navigate = useNavigate();
  const { mode, characterId, setCharacterId } = useSession();

  const story = storyId ? getStoryById(storyId) : undefined;
  // One fanfare on arrival (sfx.ts drops StrictMode's immediate duplicate).
  useEffect(() => {
    if (story) playSfx('celebrate');
  }, [story]);
  if (!story) {
    return <StoryNotFound />;
  }

  const character =
    story.characters.find((candidate) => candidate.id === characterId) ??
    story.characters[0];

  const playAgain = () => {
    if (story.characters.length === 1) {
      setCharacterId(story.characters[0].id);
      navigate(routes.player(story.id));
      return;
    }
    setCharacterId(null);
    navigate(routes.characterSelect(story.id));
  };

  const anotherStory = () => {
    setCharacterId(null);
    navigate(routes.library());
  };

  return (
    <section className="completion">
      <div className="completion-stage">
        <div className="completion-rays" aria-hidden="true" />
        <div className="completion-confetti" aria-hidden="true">
          {PIECES.map((piece, i) => (
            <span
              key={i}
              style={{
                left: `${piece.left}%`,
                width: piece.size,
                height: piece.size * 0.6,
                background: piece.color,
                animationDelay: `${piece.delay}s`,
                animationDuration: `${piece.duration}s`,
              }}
            />
          ))}
        </div>
        {story.id === 'hare' ? (
          <div className="forest-scene completion-actors" aria-hidden="true">
            <div className="forest-actor hare is-celebrate">
              <Hare />
            </div>
            <div className="forest-actor tortoise is-celebrate">
              <Tortoise />
            </div>
          </div>
        ) : (
          <CompletionCast storyId={story.id} />
        )}
        <p className="completion-kicker">The End — Adventure Complete!</p>
        <h2 className="completion-title">
          {story.characters.length === 1
            ? `You finished ${story.title}!`
            : `You did it, ${character.name}'s friend!`}
        </h2>
        <p className="completion-moral">"{story.moral}"</p>
      </div>

      <RewardBadge title={story.badge.title} description={story.badge.description} />

      {mode === 'family' && (
        <div className="card" style={{ background: 'var(--color-sky)', border: 'none' }}>
          <h3>Family Reflection</h3>
          <p style={{ margin: 0 }}>
            What was your favorite part of the story? Talk about it together
            before you pick the next adventure!
          </p>
        </div>
      )}

      <div
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <PrimaryButton variant="secondary" onClick={playAgain}>
          Play This Story Again
        </PrimaryButton>
        <PrimaryButton onClick={anotherStory}>Choose Another Story</PrimaryButton>
      </div>
    </section>
  );
}
