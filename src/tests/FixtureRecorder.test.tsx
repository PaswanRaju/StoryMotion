import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { FixtureRecorderPage } from '../gestures/dev/FixtureRecorderPage';
import type { PoseCameraOptions } from '../vision/poseCamera';
import { standing } from './fixtures/poses';
import { GESTURE_CONFIG } from '../gestures/config';
const mocks = vi.hoisted(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  setDebug: vi.fn(),
  setVisionOptions: vi.fn(),
  setRecordingEnabled: vi.fn(),
  setRecognitionEnabled: vi.fn(),
}));
let callbacks: PoseCameraOptions;
vi.mock('../vision/poseCamera', () => ({
  createPoseCamera: (_video: HTMLVideoElement, options: PoseCameraOptions) => {
    callbacks = options;
    return mocks;
  },
}));
beforeEach(() => vi.clearAllMocks());
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});
const frame = (atMs: number) => ({
  atMs,
  aspectRatio: 4 / 3,
  landmarks: standing(),
});
it('records only explicit samples, downloads local JSON with relative timestamps and cleans up', async () => {
  const createURL = vi.fn((_blob: Blob) => 'blob:fixture');
  const revokeURL = vi.fn();
  vi.stubGlobal('URL', {
    createObjectURL: createURL,
    revokeObjectURL: revokeURL,
  });
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  const { unmount } = render(<FixtureRecorderPage />);
  expect(mocks.start).not.toHaveBeenCalled();
  expect(callbacks.recognitionEnabled).toBe(false);
  expect(screen.getByRole('button', { name: 'Download JSON' })).toBeDisabled();
  act(() => callbacks.onFixtureFrame?.(frame(100)));
  expect(screen.getByRole('status')).toHaveTextContent('0 frames');
  fireEvent.click(screen.getByRole('button', { name: 'Start camera' }));
  expect(mocks.start).toHaveBeenCalledOnce();
  act(() => callbacks.onStatus('missing'));
  fireEvent.click(screen.getByRole('button', { name: 'Start recording' }));
  expect(mocks.setRecordingEnabled).toHaveBeenLastCalledWith(true);
  expect(mocks.setRecognitionEnabled).toHaveBeenLastCalledWith(true);
  act(() => {
    callbacks.onFixtureFrame?.(frame(1000));
    callbacks.onFixtureFrame?.(frame(1060));
  });
  fireEvent.click(screen.getByRole('button', { name: 'Stop recording' }));
  act(() => callbacks.onFixtureFrame?.(frame(1120)));
  expect(screen.getByRole('status')).toHaveTextContent('2 frames');
  fireEvent.click(screen.getByRole('button', { name: 'Download JSON' }));
  const blob = createURL.mock.calls[0][0] as Blob;
  expect(blob.type).toBe('application/json');
  const contents = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.readAsText(blob);
  });
  const data = JSON.parse(contents);
  expect(data.frames.map((sample: { atMs: number }) => sample.atMs)).toEqual([
    0, 60,
  ]);
  expect(data.label).toBe('HAND_RAISE');
  expect(revokeURL).toHaveBeenCalledWith('blob:fixture');
  fireEvent.click(screen.getByRole('button', { name: 'Clear samples' }));
  expect(screen.getByRole('button', { name: 'Download JSON' })).toBeDisabled();
  unmount();
  expect(mocks.stop).toHaveBeenCalled();
});
it('stops at the memory bound and does not append late frames', () => {
  render(<FixtureRecorderPage />);
  act(() => callbacks.onStatus('missing'));
  fireEvent.click(screen.getByRole('button', { name: 'Start recording' }));
  act(() => {
    for (let index = 0; index <= GESTURE_CONFIG.recorder.maxFrames; index++)
      callbacks.onFixtureFrame?.(frame(index * 50));
  });
  expect(screen.getByRole('status')).toHaveTextContent(
    `${GESTURE_CONFIG.recorder.maxFrames} frames`,
  );
  expect(screen.getByRole('button', { name: 'Stop recording' })).toBeDisabled();
  expect(mocks.setRecordingEnabled).toHaveBeenLastCalledWith(false);
  expect(mocks.setRecognitionEnabled).toHaveBeenLastCalledWith(false);
});
