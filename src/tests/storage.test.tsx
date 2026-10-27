import { IDBFactory } from 'fake-indexeddb';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import {
  saveStory,
  savedStories,
  getSavedStory,
  removeStory,
  completeStory,
  completions,
} from '../platform/storage';
import { LibraryShelf } from '../platform/LibraryShelf';
import { stories } from '../stories';
beforeEach(() => vi.stubGlobal('indexedDB', new IDBFactory()));
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
it('stores stories and completion stickers on this device, and removes saved stories', async () => {
  await saveStory(stories.hare);
  expect((await savedStories()).map((item) => item.id)).toEqual(['hare']);
  expect((await getSavedStory('hare'))?.story).toEqual(stories.hare);
  await completeStory({
    storyId: 'hare',
    title: stories.hare.title,
    recap: 'You helped our friends!',
  });
  await completeStory({
    storyId: 'hare',
    title: stories.hare.title,
    recap: 'Another gentle adventure!',
  });
  expect(await completions()).toHaveLength(1);
  await removeStory('hare');
  expect(await savedStories()).toEqual([]);
});
it('shows built-in and saved stories, stickers and recaps without scores', async () => {
  const story = {
    ...stories.hare,
    id: 'saved-adventure',
    title: 'Our own adventure',
  };
  await saveStory(story);
  await completeStory({
    storyId: story.id,
    title: story.title,
    recap: 'You helped Jack escape!',
  });
  render(
    <MemoryRouter>
      <LibraryShelf includeBuiltins />
    </MemoryRouter>,
  );
  expect(
    await screen.findByRole('link', { name: /Our own adventure/ }),
  ).toHaveAttribute('href', '/my-stories/saved-adventure/play');
  expect(await screen.findByLabelText('Story completed')).toBeInTheDocument();
  expect(screen.getByText(/You helped Jack escape/)).toBeInTheDocument();
  expect(screen.queryByText(/score|leaderboard/i)).not.toBeInTheDocument();
});
