import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProgressBar } from '../ui';

describe('ProgressBar', () => {
  it('exposes accessible progress values and a live-region announcement', () => {
    render(<ProgressBar value={3} max={5} label="squat progress" />);

    const bar = screen.getByRole('progressbar', { name: 'squat progress' });
    expect(bar).toHaveAttribute('aria-valuemin', '0');
    expect(bar).toHaveAttribute('aria-valuemax', '5');
    expect(bar).toHaveAttribute('aria-valuenow', '3');

    expect(
      screen.getByText('squat progress: 3 of 5 complete'),
    ).toBeInTheDocument();
  });

  it('clamps out-of-range values instead of exceeding the bar', () => {
    render(<ProgressBar value={99} max={5} label="jump progress" />);
    expect(screen.getByRole('progressbar')).toHaveAttribute(
      'aria-valuenow',
      '5',
    );
  });
});
