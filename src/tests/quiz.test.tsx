import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { StoryPlayer } from '../components/player/StoryPlayer';
import { SessionProvider } from '../app/SessionContext';
import { stories } from '../stories';
import type { Story } from '../engine/schema';
import type { MagicAction } from '../vision/magicGesture';
let hand: (action: MagicAction) => void;
vi.mock('../components/gesture/GestureCamera', () => ({
  GestureCamera: ({ onAction }: { onAction: typeof hand }) => {
    hand = onAction;
    return <aside>Optional camera</aside>;
  },
}));
const story: Story = {
  ...stories.hare,
  id: 'quiz-example',
  title: 'Our friends',
  startSceneId: 'end',
  coverAsset: 'meadow',
  scenes: [
    {
      ...stories.hare.scenes.at(-1)!,
      id: 'end',
      background: 'meadow',
      durationMs: 400,
      interactions: [],
    },
  ],
  quiz: [
    {
      question: 'Who kept going?',
      choices: ['Tortoise', 'A cloud'],
      answer: 0,
    },
    {
      question: 'What helps our friends?',
      choices: ['Giving up', 'Kindness'],
      answer: 1,
    },
  ],
};
beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
function player() {
  const done = vi.fn();
  render(
    <MemoryRouter>
      <SessionProvider>
        <StoryPlayer story={story} onComplete={done} />
      </SessionProvider>
    </MemoryRouter>,
  );
  act(() => vi.advanceTimersByTime(400));
  return done;
}
it('keeps questions visible and accepts hand and button answers without a score', () => {
  const done = player();
  const choice = screen.getByRole('button', { name: 'A: Tortoise' });
  expect(choice.closest('.magic-invitation')).not.toHaveClass('is-quiet');
  act(() => hand({ type: 'MAGIC_ACTIVATE', hand: 'left' }));
  act(() => vi.advanceTimersByTime(1500));
  fireEvent.click(screen.getByRole('button', { name: 'B: Kindness' }));
  act(() => vi.advanceTimersByTime(1500));
  expect(done).toHaveBeenCalledOnce();
  expect(screen.queryByText(/score|wrong/i)).not.toBeInTheDocument();
});
it('continues kindly when nobody answers either question', () => {
  const done = player();
  for (let index = 0; index < 2; index++) {
    act(() => vi.advanceTimersByTime(10000));
    act(() => vi.advanceTimersByTime(1500));
  }
  expect(done).toHaveBeenCalledOnce();
});
