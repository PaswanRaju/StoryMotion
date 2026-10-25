import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { SessionProvider } from '../app/SessionContext';

/** Minimal Web Audio fake that counts started oscillators. */
let started = 0;
class FakeAudioContext {
  state = 'running';
  currentTime = 0;
  destination = {};
  resume = () => Promise.resolve();
  createOscillator() {
    const param = { setValueAtTime() {}, exponentialRampToValueAtTime() {} };
    return {
      type: 'sine',
      frequency: param,
      connect: (node: unknown) => node,
      start: () => void started++,
      stop() {},
    };
  }
  createGain() {
    const param = { setValueAtTime() {}, exponentialRampToValueAtTime() {} };
    return { gain: param, connect: (node: unknown) => node };
  }
}

let sfx: typeof import('../audio/sfx');
beforeEach(async () => {
  vi.resetModules();
  vi.stubGlobal('AudioContext', FakeAudioContext);
  started = 0;
  sfx = await import('../audio/sfx');
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('sound effects', () => {
  it('plays a cue, drops an immediate repeat, and respects the effects switch', () => {
    sfx.playSfx('click');
    const once = started;
    expect(once).toBeGreaterThan(0);
    sfx.playSfx('click'); // anti-spam window
    expect(started).toBe(once);
    sfx.setSfxEnabled(false);
    sfx.playSfx('celebrate');
    expect(started).toBe(once);
  });
  it('gives buttons their data-sfx cue, and data-sfx="none" stays silent', async () => {
    const { useUiSounds: hook } = await import('../hooks/useUiSounds');
    function Buttons() {
      hook();
      return (
        <>
          <button data-sfx="start">Go</button>
          <button data-sfx="none">Magic</button>
        </>
      );
    }
    render(<Buttons />);
    fireEvent.click(screen.getByText('Magic'));
    expect(started).toBe(0);
    fireEvent.click(screen.getByText('Go'));
    expect(started).toBeGreaterThan(0);
  });
  it('header toggle switches effects off and on', () => {
    render(
      <MemoryRouter>
        <SessionProvider>
          <Header />
        </SessionProvider>
      </MemoryRouter>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Turn sound effects off' }));
    expect(screen.getByRole('button', { name: 'Turn sound effects on' })).toHaveAttribute(
      'aria-pressed',
      'false',
    );
  });
});
