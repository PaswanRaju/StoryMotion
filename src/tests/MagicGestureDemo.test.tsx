import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { MagicGestureDemo } from '../components/gesture/MagicGestureDemo';
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
  act(() => vi.advanceTimersByTime(11000));
  fireEvent.click(screen.getByRole('button', { name: 'Use Magic' }));
  expect(screen.getByText('✨ You did it!')).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(10600));
  fireEvent.click(screen.getByRole('button', { name: 'Choose Left' }));
  expect(screen.getByText('✨ You did it!')).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(4600));
  fireEvent.click(screen.getByRole('button', { name: 'Give Boost' }));
  act(() => vi.advanceTimersByTime(20000));
  expect(
    screen.getByText(/story continued automatically/i),
  ).toBeInTheDocument();
  fireEvent.click(
    screen.getByRole('button', { name: 'Replay optional scene' }),
  );
  // No input at all: every window resolves itself and the story still ends.
  act(() => vi.advanceTimersByTime(42000 + 8000 + 7000 + 7000 + 1000));
  expect(
    screen.getByText(/story continued automatically/i),
  ).toBeInTheDocument();
});
