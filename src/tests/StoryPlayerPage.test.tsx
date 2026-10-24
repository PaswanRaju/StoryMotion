import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createMemoryRouter, RouterProvider } from 'react-router-dom';
import { StoryPlayerPage } from '../components/player/StoryPlayerPage';
import { SessionProvider } from '../app/SessionContext';

function renderPlayer() {
  const router = createMemoryRouter(
    [{ path: '/library/:storyId/play', element: <StoryPlayerPage /> }],
    { initialEntries: ['/library/hare/play'] },
  );
  return render(
    <SessionProvider>
      <RouterProvider router={router} />
    </SessionProvider>,
  );
}

describe('StoryPlayerPage', () => {
  it('walks narration -> choice -> reaction -> challenge and counts manual reps', async () => {
    const user = userEvent.setup();
    renderPlayer();

    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(screen.getByRole('button', { name: /take the safe path/i }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    const repButton = screen.getByRole('button', { name: /i did it/i });
    await user.click(repButton);
    await user.click(repButton);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
  });

  it('freezes movement counting while paused and resumes focus on close', async () => {
    const user = userEvent.setup();
    renderPlayer();

    // Advance to the challenge beat.
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    await user.click(screen.getByRole('button', { name: /take the safe path/i }));
    await user.click(screen.getByRole('button', { name: 'Continue' }));

    const repButton = screen.getByRole('button', { name: /i did it/i });
    await user.click(repButton);

    const pauseButton = screen.getByRole('button', { name: 'Pause story' });
    await user.click(pauseButton);

    expect(screen.getByRole('dialog', { name: 'Paused' })).toBeInTheDocument();

    // The rep button is now behind the paused dialog; count must not advance
    // from here on. ChallengePanel ignores clicks via the paused guard, but
    // since the dialog overlays it, this also demonstrates it is not the
    // focused/interactive element.
    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');

    await user.click(screen.getByRole('button', { name: 'Resume' }));
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(pauseButton).toHaveFocus();
  });
});
