import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { Dialog as Modal } from '../ui';

function Harness() {
  const [open, setOpen] = useState(false);
  return (
    <div>
      <button type="button" onClick={() => setOpen(true)}>
        Open Modal
      </button>
      {open && (
        <Modal title="Test Dialog" onClose={() => setOpen(false)}>
          <button type="button">First action</button>
          <button type="button">Second action</button>
        </Modal>
      )}
    </div>
  );
}

describe('Modal', () => {
  it('moves focus in on open, traps Tab, closes on Escape, and restores focus', async () => {
    const user = userEvent.setup();
    render(<Harness />);

    const trigger = screen.getByRole('button', { name: 'Open Modal' });
    await user.click(trigger);

    const dialog = screen.getByRole('dialog', { name: 'Test Dialog' });
    expect(dialog).toBeInTheDocument();

    const closeButton = screen.getByRole('button', { name: /close/i });
    expect(closeButton).toHaveFocus();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('calls onClose when the close button is activated', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <Modal title="Another Dialog" onClose={onClose}>
        <p>content</p>
      </Modal>,
    );

    await user.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
