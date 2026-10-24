import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChallengePanel } from '../components/player/ChallengePanel';

describe('ChallengePanel', () => {
  it('lets the manual/simulated movement path record reps via a labeled button', async () => {
    const user = userEvent.setup();
    const onRecordRep = vi.fn();

    render(
      <ChallengePanel
        instruction="Squat down low!"
        movement="squat"
        progress={2}
        target={5}
        completed={false}
        onRecordRep={onRecordRep}
        onContinue={vi.fn()}
      />,
    );

    const repButton = screen.getByRole('button', { name: /i did it/i });
    await user.click(repButton);
    expect(onRecordRep).toHaveBeenCalledTimes(1);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2');
  });

  it('swaps to a Continue action once the target is reached', async () => {
    const user = userEvent.setup();
    const onContinue = vi.fn();

    render(
      <ChallengePanel
        instruction="Squat down low!"
        movement="squat"
        progress={5}
        target={5}
        completed
        onRecordRep={vi.fn()}
        onContinue={onContinue}
      />,
    );

    expect(screen.queryByRole('button', { name: /i did it/i })).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continue' }));
    expect(onContinue).toHaveBeenCalledTimes(1);
  });
});
