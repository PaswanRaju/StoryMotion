import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { CompletionPage } from '../components/completion/CompletionPage';
import { SessionProvider, useSession } from '../app/SessionContext';
import { useEffect } from 'react';

function SetFamilyMode() {
  const { setMode } = useSession();
  useEffect(() => setMode('family'), [setMode]);
  return null;
}

function renderCompletion(options: { family?: boolean } = {}) {
  const router = createMemoryRouter(
    [{ path: '/library/:storyId/complete', element: <CompletionPage /> }],
    { initialEntries: ['/library/hare/complete'] },
  );
  return render(
    <SessionProvider>
      {options.family && <SetFamilyMode />}
      <RouterProvider router={router} />
    </SessionProvider>,
  );
}

describe('CompletionPage', () => {
  it('shows the badge and moral for solo mode without a family reflection prompt', () => {
    renderCompletion();
    expect(screen.getByText('Steady Champion')).toBeInTheDocument();
    expect(screen.queryByText('Family Reflection')).not.toBeInTheDocument();
  });

  it('shows the family reflection prompt in family mode', () => {
    renderCompletion({ family: true });
    expect(screen.getByText('Family Reflection')).toBeInTheDocument();
  });
});
