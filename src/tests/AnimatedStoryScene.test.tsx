import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AnimatedStoryScene } from '../rendering/AnimatedStoryScene';

const scene = (characterId: string) =>
  render(
    <AnimatedStoryScene
      storyId="hare"
      characterId={characterId}
      elapsed={12000}
      magic={false}
      paused={false}
      gesture="ARMS_WIDE"
    />,
  );

describe('AnimatedStoryScene gesture target', () => {
  it('applies the shield to the tortoise when Tortoise is chosen', () => {
    scene('tortoise');
    expect(
      screen.getByTestId('tortoise-actor').querySelector('.actor-shield'),
    ).not.toBeNull();
    expect(
      screen.getByTestId('hare-actor').querySelector('.actor-shield'),
    ).toBeNull();
  });
  it('applies the shield to the hare when Hare is chosen', () => {
    scene('hare');
    expect(
      screen.getByTestId('hare-actor').querySelector('.actor-shield'),
    ).not.toBeNull();
    expect(
      screen.getByTestId('tortoise-actor').querySelector('.actor-shield'),
    ).toBeNull();
  });
  it('renders both characters visibly even before layout reports a width', () => {
    const { container } = scene('tortoise');
    const stage = container.querySelector<HTMLElement>('.forest-stage')!;
    expect(stage.style.transform).not.toBe('scale(0)');
    expect(screen.getByTestId('tortoise-actor').querySelector('svg')).not.toBeNull();
    expect(screen.getByTestId('hare-actor').querySelector('svg')).not.toBeNull();
    expect(
      screen.getByRole('img', { name: /Tortoise and the Hare/ }),
    ).toBeInTheDocument();
  });
});
