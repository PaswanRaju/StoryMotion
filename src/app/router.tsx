import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '../components/home/HomePage';
import { StoryLibraryPage } from '../components/library/StoryLibraryPage';
import { CharacterSelectPage } from '../components/characters/CharacterSelectPage';
import { CameraSetupPage } from '../components/camera/CameraSetupPage';
import { StoryPlayerPage } from '../components/player/StoryPlayerPage';
import { CompletionPage } from '../components/completion/CompletionPage';
import { StoryGeneratorPage } from '../generation/StoryGeneratorPage';
import { StoryCreatorPage } from '../creator/StoryCreatorPage';
import { SavedCompletionPage } from '../platform/CompletionRecap';
import { SavedStoryPage } from '../platform/SavedStoryPage';
import { App } from './App';

/** Route path builders — keep every navigation call typed through these,
 * never hand-build a route string in a component. */
export const routes = {
  home: () => '/',
  library: () => '/library',
  characterSelect: (storyId: string) => `/library/${storyId}/characters`,
  cameraSetup: (storyId: string) => `/library/${storyId}/camera`,
  player: (storyId: string) => `/library/${storyId}/play`,
  complete: (storyId: string) => `/library/${storyId}/complete`,
} as const;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'parent/create', element: <StoryGeneratorPage /> },
      { path: 'parent/editor', element: <StoryCreatorPage /> },
      { path: 'my-stories/:id/play', element: <SavedStoryPage /> },
      { path: 'my-stories/:id/complete', element: <SavedCompletionPage /> },
      ...(import.meta.env.DEV
        ? [
            {
              path: 'dev/gesture-fixtures',
              lazy: async () => ({
                Component: (await import('../gestures/dev/FixtureRecorderPage'))
                  .FixtureRecorderPage,
              }),
            },
          ]
        : []),
      { path: 'library', element: <StoryLibraryPage /> },
      { path: 'library/:storyId/characters', element: <CharacterSelectPage /> },
      { path: 'library/:storyId/camera', element: <CameraSetupPage /> },
      { path: 'library/:storyId/play', element: <StoryPlayerPage /> },
      { path: 'library/:storyId/complete', element: <CompletionPage /> },
    ],
  },
]);
