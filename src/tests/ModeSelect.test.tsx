import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModeSelect } from '../components/home/ModeSelect';

describe('ModeSelect', () => {
  it('exposes labeled, keyboard-operable controls and reports pressed state', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<ModeSelect mode="solo" onChange={onChange} />);

    const solo = screen.getByRole('button', { name: /solo adventure/i });
    const family = screen.getByRole('button', { name: /family adventure/i });

    expect(solo).toHaveAttribute('aria-pressed', 'true');
    expect(family).toHaveAttribute('aria-pressed', 'false');

    await user.tab();
    expect(solo).toHaveFocus();
    await user.tab();
    expect(family).toHaveFocus();

    await user.keyboard('{Enter}');
    expect(onChange).toHaveBeenCalledWith('family');
  });
});
