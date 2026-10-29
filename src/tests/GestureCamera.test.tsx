import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from '@testing-library/react';
import { GestureCamera } from '../components/gesture/GestureCamera';
import type { PoseCameraOptions } from '../vision/poseCamera';
const mocks = vi.hoisted(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  setDebug: vi.fn(),
}));
let options: PoseCameraOptions;
vi.mock('../vision/poseCamera', () => ({
  createPoseCamera: (
    _video: HTMLVideoElement,
    callbacks: PoseCameraOptions,
  ) => {
    options = callbacks;
    return mocks;
  },
}));
beforeEach(() => {
  vi.clearAllMocks();
  history.replaceState(null, '', '/');
});
afterEach(() => cleanup());
it('starts only on click, hides developer controls by default, and cleans up on unmount', () => {
  const { unmount } = render(<GestureCamera onAction={vi.fn()} />);
  expect(mocks.start).not.toHaveBeenCalled();
  expect(screen.queryByLabelText('Show skeleton')).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Start Camera' }));
  expect(mocks.start).toHaveBeenCalledOnce();
  act(() => options.onStatus('tracking'));
  fireEvent.click(screen.getByRole('button', { name: 'Stop Camera' }));
  expect(mocks.stop).toHaveBeenCalledOnce();
  unmount();
  expect(mocks.stop).toHaveBeenCalledTimes(2);
});
it('shows lower-body availability and removes stale readiness when tracking disappears', () => {
  render(<GestureCamera onAction={vi.fn()} />);
  const tracking = {
    landmarkCount: 33,
    upperBody: true,
    calibrated: true,
    legsVisible: false,
    crouchAvailable: false,
    headDirection: 'unknown' as const,
  };
  act(() => {
    options.onStatus('tracking');
    options.onTracking?.(tracking);
  });
  expect(screen.getByText(/Upper body detected/)).toBeInTheDocument();
  act(() =>
    options.onTracking?.({
      ...tracking,
      legsVisible: true,
      crouchAvailable: true,
    }),
  );
  expect(screen.getByText(/Full body detected/)).toBeInTheDocument();
  act(() => {
    options.onStatus('missing');
    options.onTracking?.({ ...tracking, upperBody: false });
  });
  expect(screen.getByText(/Move into view/)).toBeInTheDocument();
  expect(screen.queryByText(/Upper body detected/)).not.toBeInTheDocument();
});
it('requires both the debug URL and an explicit checkbox to enable the skeleton', () => {
  history.replaceState(null, '', '/library/hare/play?debugPose=1');
  render(<GestureCamera onAction={vi.fn()} />);
  const checkbox = screen.getByLabelText('Show skeleton');
  expect(checkbox).not.toBeChecked();
  expect(mocks.setDebug).not.toHaveBeenCalled();
  fireEvent.click(checkbox);
  expect(mocks.setDebug).toHaveBeenLastCalledWith(true);
  fireEvent.click(checkbox);
  expect(mocks.setDebug).toHaveBeenLastCalledWith(false);
});

it('reports a forming gesture only when it changes, and shows friendly progress', () => {
  const onPending = vi.fn();
  render(<GestureCamera onAction={vi.fn()} onPending={onPending} />);
  const tracking = {
    landmarkCount: 33,
    upperBody: true,
    calibrated: true,
    legsVisible: false,
    crouchAvailable: false,
    headDirection: 'forward' as const,
  };
  act(() => {
    options.onStatus('tracking');
    options.onTracking?.({ ...tracking, pending: 'ARMS_WIDE', progress: 0.3 });
    options.onTracking?.({ ...tracking, pending: 'ARMS_WIDE', progress: 0.6 });
  });
  expect(onPending.mock.calls).toEqual([['ARMS_WIDE']]);
  expect(screen.getByText(/Arms opening… almost there/)).toBeInTheDocument();
  act(() => options.onTracking?.({ ...tracking, pending: null }));
  expect(onPending.mock.calls).toEqual([['ARMS_WIDE'], [null]]);
  expect(screen.queryByText(/almost there/)).not.toBeInTheDocument();
});

it('exposes hold progress as a progress ring and hides it outside interaction windows', () => {
  const props = { onAction: vi.fn(), recognitionEnabled: true };
  const view = render(<GestureCamera {...props} />);
  act(() => {
    options.onStatus('tracking');
    options.onTracking?.({
      landmarkCount: 33,
      upperBody: true,
      calibrated: true,
      legsVisible: false,
      crouchAvailable: false,
      headDirection: 'forward',
      pending: 'HAND_RAISE',
      progress: 0.5,
    });
  });
  expect(
    screen.getByRole('progressbar', { name: 'Gesture hold progress' }),
  ).toHaveAttribute('aria-valuenow', '50');
  expect(screen.getByText(/Use the button for crouching/)).toBeInTheDocument();
  view.rerender(<GestureCamera {...props} recognitionEnabled={false} />);
  expect(screen.queryByRole('progressbar')).not.toBeInTheDocument();
});
