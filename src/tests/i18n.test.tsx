import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { SessionProvider } from '../app/SessionContext';
import { StoryPlayer } from '../components/player/StoryPlayer';
import { stories } from '../stories';
vi.mock('../components/gesture/GestureCamera', () => ({
  GestureCamera: () => <aside />,
}));
afterEach(() => {
  cleanup();
  localStorage.clear();
  vi.useRealTimers();
});
it('uses translated narration and localized core controls while retaining English fallback data', () => {
  vi.useFakeTimers();
  localStorage.setItem(
    'storymotion.preferences.v1',
    JSON.stringify({ language: 'es' }),
  );
  const story = structuredClone(stories.hare);
  story.scenes[0].narration[0].translations = {
    es: { text: 'Había una vez dos amigos en el bosque.' },
  };
  render(
    <MemoryRouter>
      <SessionProvider>
        <StoryPlayer story={story} />
      </SessionProvider>
    </MemoryRouter>,
  );
  expect(
    screen.getByText('Había una vez dos amigos en el bosque.'),
  ).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Pausar cuento' }),
  ).toBeInTheDocument();
  act(() => vi.advanceTimersByTime(9000));
  expect(
    screen.getByText(story.scenes[1].narration[0].text),
  ).toBeInTheDocument();
});
