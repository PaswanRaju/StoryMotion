import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { CharacterSelectPage } from '../components/characters/CharacterSelectPage';
import { SessionProvider } from '../app/SessionContext';

function renderAt(path: string) {
  const router = createMemoryRouter(
    [{ path: '/library/:storyId/characters', element: <CharacterSelectPage /> }],
    { initialEntries: [path] },
  );
  return render(
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>,
  );
}

describe('CharacterSelectPage', () => {
  it('disables "Let\'s Go" until a character is chosen, then enables it', async () => {
    const user = userEvent.setup();
    renderAt('/library/hare/characters');

    const letsGo = screen.getByRole('button', { name: "Let's Go" });
    expect(letsGo).toBeDisabled();

    const tortoise = screen.getByRole('button', { name: /tortoise/i });
    await user.click(tortoise);

    expect(tortoise).toHaveAttribute('aria-pressed', 'true');
    expect(letsGo).toBeEnabled();
  });

  it('shows a friendly not-found screen for an unknown story id', () => {
    renderAt('/library/not-a-real-story/characters');
    expect(
      screen.getByRole('heading', { name: /couldn't find that story/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: /back to story library/i }),
    ).toBeInTheDocument();
  });
});
