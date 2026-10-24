import { useNavigate } from 'react-router-dom';
import { PrimaryButton } from '../layout/PrimaryButton';
import { routes } from '../../app/router';

type HeroProps = {
  onHowItWorks: () => void;
};

export function Hero({ onHowItWorks }: HeroProps) {
  const navigate = useNavigate();

  return (
    <section
      style={{
        borderRadius: 'var(--radius-lg)',
        background:
          'linear-gradient(135deg, var(--color-sky) 0%, var(--color-sage) 50%, var(--color-honey) 100%)',
        padding: 'var(--space-8) var(--space-6)',
        textAlign: 'center',
        color: 'var(--color-cocoa-dark)',
      }}
    >
      <p
        aria-hidden="true"
        style={{ fontSize: '3rem', margin: 0 }}
      >
        📖🐢🐰
      </p>
      <h1>StoryMotion</h1>
      <p style={{ fontSize: 'var(--fs-md)', maxWidth: '560px', margin: '0 auto var(--space-5)' }}>
        An interactive storybook where kids move to bring the story to life —
        jump, squat, march, and reach your way through magical tales.
      </p>
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-3)',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <PrimaryButton onClick={() => navigate(routes.library())}>
          Start Adventure
        </PrimaryButton>
        <PrimaryButton variant="ghost" onClick={onHowItWorks}>
          How It Works
        </PrimaryButton>
      </div>
    </section>
  );
}
