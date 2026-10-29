import { describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Button, IconButton, Slider, Toggle, ToastProvider, useToast } from '../ui';
import { PreferencesProvider } from '../settings/preferences';
import { PREFERENCES_KEY } from '../settings/schema';

describe('ui kit', () => {
  it('Button keeps its accessible name, fires onClick and bursts sparkles', () => {
    const onClick = vi.fn();
    const { container } = render(<Button onClick={onClick}>Play Now</Button>);
    fireEvent.click(screen.getByRole('button', { name: 'Play Now' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(container.querySelectorAll('.ui-sparkles i')).toHaveLength(6);
  });

  it('Button skips the sparkle burst when reduced motion is on', () => {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify({ reducedMotion: true }));
    const { container } = render(
      <PreferencesProvider>
        <Button>Calm</Button>
      </PreferencesProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Calm' }));
    expect(container.querySelector('.ui-sparkles')).toBeNull();
    localStorage.removeItem(PREFERENCES_KEY);
  });

  it('disabled Button does not fire', () => {
    const onClick = vi.fn();
    render(
      <Button disabled onClick={onClick}>
        Wait
      </Button>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Wait' }));
    expect(onClick).not.toHaveBeenCalled();
  });

  it('IconButton is named by its label and passes the UI sound cue', () => {
    render(<IconButton icon={<span>★</span>} label="Pause story" sfx="toggle" />);
    expect(screen.getByRole('button', { name: 'Pause story' })).toHaveAttribute(
      'data-sfx',
      'toggle',
    );
  });

  it('Toggle is a labelled switch', () => {
    const onChange = vi.fn();
    render(<Toggle label="Captions" checked={false} onChange={onChange} />);
    const toggle = screen.getByRole('switch', { name: 'Captions' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(toggle);
    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('Slider is a labelled native range with value text', () => {
    const onChange = vi.fn();
    render(
      <Slider
        label="Volume"
        min={0}
        max={1}
        step={0.1}
        value={0.5}
        format={(v) => `${v * 100}%`}
        onChange={onChange}
      />,
    );
    const slider = screen.getByRole('slider', { name: /Volume/ });
    expect(slider).toHaveAttribute('aria-valuetext', '50%');
    fireEvent.change(slider, { target: { value: '0.8' } });
    expect(onChange).toHaveBeenCalledWith(0.8);
  });

  it('toasts announce politely and disappear on their own', () => {
    vi.useFakeTimers();
    function Trigger() {
      const toast = useToast();
      return <button onClick={() => toast.show('Sticker saved!')}>Go</button>;
    }
    render(
      <ToastProvider>
        <Trigger />
      </ToastProvider>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Go' }));
    expect(screen.getByRole('status')).toHaveTextContent('Sticker saved!');
    act(() => vi.advanceTimersByTime(4000));
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
    vi.useRealTimers();
  });
});
