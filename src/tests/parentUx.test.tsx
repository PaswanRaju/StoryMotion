import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ParentGate } from '../settings/ParentGate';
import { ParentSettings } from '../settings/ParentSettings';
import { PreferencesProvider } from '../settings/preferences';
import { loadPreferences } from '../settings/schema';
import { StoryEditor } from '../creator/StoryCreatorPage';
import { Warmup } from '../components/camera/Warmup';
import { SessionProvider } from '../app/SessionContext';
vi.mock('../components/gesture/GestureCamera', () => ({
  GestureCamera: ({
    onContinueWithoutCamera,
  }: {
    onContinueWithoutCamera?: () => void;
  }) => (
    <button onClick={onContinueWithoutCamera}>Continue with buttons</button>
  ),
}));
beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  localStorage.clear();
});
it('opens the parent gate only after a continuous three-second keyboard hold and cancels early release', () => {
  render(
    <ParentGate>
      <p>Parent controls</p>
    </ParentGate>,
  );
  const gate = screen.getByRole('button', { name: /hold for 3 seconds/ });
  fireEvent.keyDown(gate, { key: ' ' });
  act(() => vi.advanceTimersByTime(2000));
  fireEvent.keyUp(gate, { key: ' ' });
  act(() => vi.advanceTimersByTime(2000));
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  fireEvent.keyDown(gate, { key: 'Enter' });
  act(() => vi.advanceTimersByTime(3000));
  expect(screen.getByRole('dialog')).toBeInTheDocument();
  expect(screen.getByText('Parent controls')).toBeInTheDocument();
  fireEvent.keyDown(screen.getByRole('dialog'), { key: 'Escape' });
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
});
it('persists parent preferences and applies accessible language/reduced-motion settings', () => {
  render(
    <MemoryRouter>
      <PreferencesProvider>
        <ParentSettings />
      </PreferencesProvider>
    </MemoryRouter>,
  );
  fireEvent.keyDown(
    screen.getByRole('button', { name: /hold for 3 seconds/ }),
    { key: 'Enter' },
  );
  act(() => vi.advanceTimersByTime(3000));
  fireEvent.click(screen.getByLabelText('Reduce motion'));
  fireEvent.change(screen.getByLabelText('Language'), {
    target: { value: 'es' },
  });
  expect(loadPreferences().reducedMotion).toBe(true);
  expect(loadPreferences().language).toBe('es');
  expect(document.documentElement.lang).toBe('es');
});
it('shows inline validation in the visual editor and disables invalid previews', () => {
  render(
    <MemoryRouter>
      <SessionProvider>
        <StoryEditor />
      </SessionProvider>
    </MemoryRouter>,
  );
  const title = screen.getByLabelText('Story title');
  fireEvent.change(title, { target: { value: '' } });
  expect(screen.getByRole('alert')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Live preview' })).toBeDisabled();
  fireEvent.change(title, { target: { value: 'A friendly adventure' } });
  expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Add interaction' }));
  expect(screen.getByLabelText('Gesture')).toHaveValue('raiseHand');
});
it('lets the warm-up be skipped and continues after all no-input mini games', () => {
  const next = vi.fn();
  render(
    <SessionProvider>
      <Warmup onContinue={next} />
    </SessionProvider>,
  );
  fireEvent.click(screen.getByRole('button', { name: 'Skip warm-up' }));
  expect(next).toHaveBeenCalledOnce();
});

it('finishes every no-input warm-up mini game without a camera', () => {
  const next = vi.fn();
  render(
    <SessionProvider>
      <Warmup onContinue={next} />
    </SessionProvider>,
  );
  act(() => vi.advanceTimersByTime(12000));
  for (let step = 0; step < 5; step++) act(() => vi.advanceTimersByTime(8000));
  act(() => vi.advanceTimersByTime(2500));
  expect(next).toHaveBeenCalledOnce();
});
