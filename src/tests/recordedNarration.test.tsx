import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { useNarration } from '../hooks/useNarration';
import { NarrationPanel } from '../components/player/NarrationPanel';
import { narrator } from '../audio/narrator';
let clips: Clip[];
class Clip {
  currentTime = 0;
  duration = 2;
  volume = 1;
  playbackRate = 1;
  onerror: (() => void) | null = null;
  play = vi.fn().mockResolvedValue(undefined);
  pause = vi.fn();
  load = vi.fn();
  removeAttribute = vi.fn();
  src: string;
  constructor(src: string) {
    this.src = src;
    clips.push(this);
  }
}
const words = [
  { atMs: 0, charIndex: 0 },
  { atMs: 500, charIndex: 6 },
];
function Harness({ paused = false }: { paused?: boolean }) {
  const playback = useNarration(
    'audio-example',
    'Hello friend',
    true,
    paused,
    '/audio/example.wav',
    words,
  );
  return (
    <NarrationPanel
      text="Hello friend"
      speaker="Narrator"
      onReplay={playback.replay}
      getCharIndex={playback.getCharIndex}
    />
  );
}
beforeEach(() => {
  clips = [];
  vi.useFakeTimers();
  narrator.stop();
  vi.stubGlobal('Audio', Clip);
});
afterEach(() => {
  cleanup();
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});
it('uses authored audio word timings and pauses the clip without blocking playback', () => {
  const view = render(<Harness />);
  expect(clips[0].play).toHaveBeenCalled();
  clips[0].currentTime = 0.6;
  act(() => vi.advanceTimersByTime(80));
  expect(screen.getByText('friend')).toHaveClass('is-current');
  view.rerender(<Harness paused />);
  expect(clips[0].pause).toHaveBeenCalled();
});
it('falls back to Web Speech when the authored file is unavailable', () => {
  const speak = vi.fn();
  vi.stubGlobal('speechSynthesis', { speak, cancel: vi.fn() });
  vi.stubGlobal(
    'SpeechSynthesisUtterance',
    class {
      text: string;
      constructor(text: string) {
        this.text = text;
      }
    },
  );
  render(<Harness />);
  act(() => clips[0].onerror?.());
  expect(speak).toHaveBeenCalledWith(
    expect.objectContaining({ text: 'Hello friend' }),
  );
});
