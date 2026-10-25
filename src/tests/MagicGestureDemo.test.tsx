import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { MagicGestureDemo } from '../components/gesture/MagicGestureDemo';
import { MOMENTS, STORY_DURATION_MS } from '../engine/automaticStory';

const [SHIELD, PATH, BOOST] = MOMENTS;
vi.mock('../components/gesture/GestureCamera', () => ({
  GestureCamera: () => <div>Camera controls</div>,
}));
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
it('offers each optional window in turn, accepts its button, and continues without input', () => {
  vi.useFakeTimers();
  render(<MagicGestureDemo />);
  expect(screen.getByRole('button', { name: 'Use Magic' })).toBeDisabled();
  act(() => vi.advanceTimersByTime(SHIELD.startMs));
  fireEvent.click(screen.getByRole('button', { name: 'Use Magic' }));
  expect(screen.getByText('✨ You did it!')).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(PATH.startMs - SHIELD.startMs + 100));
  fireEvent.click(screen.getByRole('button', { name: 'Choose Left' }));
  expect(screen.getByText('✨ You did it!')).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(BOOST.startMs - PATH.startMs + 100));
  fireEvent.click(screen.getByRole('button', { name: 'Give Boost' }));
  act(() => vi.advanceTimersByTime(STORY_DURATION_MS - BOOST.startMs + 1000));
  expect(
    screen.getByText(/story continued automatically/i),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', { name: 'Replay optional scene' }),
  );
  // No input at all: every window resolves itself and the story still ends.
  act(() => vi.advanceTimersByTime(
      STORY_DURATION_MS + MOMENTS.reduce((sum, m) => sum + m.windowMs, 0) + 1000,
    ),
  );
  expect(
    screen.getByText(/story continued automatically/i),
  ).toBeInTheDocument();
});
