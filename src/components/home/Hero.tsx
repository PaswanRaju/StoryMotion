import type { PointerEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { HelpCircle, Play, Sparkles } from 'lucide-react';
import { routes } from '../../app/router';
import { StoryCover } from '../art/StoryArt';
import { GestureHint } from '../player/GestureHint';
import { SolarSystem } from '../art/SolarSystem';
import { Badge, Button } from '../../ui';
import './home.css';

type HeroProps = {
  onHowItWorks: () => void;
};

/** Gentle pointer parallax via CSS variables (no re-render). */
function parallax(event: PointerEvent<HTMLElement>) {
  const el = event.currentTarget;
  const box = el.getBoundingClientRect();
  el.style.setProperty(
    '--px',
    `${(event.clientX - box.left) / box.width - 0.5}`,
  );
  el.style.setProperty(
    '--py',
    `${(event.clientY - box.top) / box.height - 0.5}`,
  );
}

export function Hero({ onHowItWorks }: HeroProps) {
  const navigate = useNavigate();

  return (
    <section className="hero" onPointerMove={parallax}>
      <div className="hero__copy">
        <p className="hero__eyebrow">
          <Sparkles size={16} aria-hidden="true" /> Interactive stories from the
          galaxy
        </p>
        <h1 className="hero__title">StoryMotion</h1>
        <p className="hero__tagline">
          Move. Imagine. <span>Explore the story through motion.</span>
        </p>
        <p className="hero__lede">
          Watch a magical tale come to life — then spread your arms, lean, or
          raise a hand, and watch the characters react to <em>you</em>. No
          camera? Just tap.
        </p>
        <div className="hero__actions">
          <Button
            size="xl"
            sfx="start"
            icon={<Play size={30} fill="currentColor" />}
            onClick={() => navigate(routes.library())}
          >
            Start Adventure
          </Button>
          <Button
            variant="ghost"
            icon={<HelpCircle size={24} />}
            onClick={onHowItWorks}
          >
            How It Works
          </Button>
        </div>
        <ul className="hero__chips" aria-label="Highlights">
          <li>
            <Badge icon="🎬">Plays like a cartoon</Badge>
          </li>
          <li>
            <Badge icon="🙌">Gesture magic</Badge>
          </li>
          <li>
            <Badge icon="🔒">Camera stays on your device</Badge>
          </li>
        </ul>
      </div>
      <div className="hero__stage" aria-hidden="true">
        <div className="hero__solar">
          <SolarSystem />
        </div>
        <div className="hero__window">
          <StoryCover storyId="hare" />
          <div className="hero__shield" />
        </div>
        <div className="hero__float hero__float--gesture">
          <GestureHint gesture="ARMS_WIDE" />
          <span>
            <strong>Spread your arms</strong>
            magic shield!
          </span>
        </div>
        <div className="hero__float hero__float--badge">
          <span className="hero__live-dot" /> Camera magic ready
        </div>
      </div>
    </section>
  );
}
