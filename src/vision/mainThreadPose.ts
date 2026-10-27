import { createPoseProcessor } from './poseProcessor';
import type { PoseRequest } from './poseProcessor';

/** Compatibility path only: the same processor at the controller's capped frame rate. */
export function createMainThreadPoseWorker() {
  let stopped = false;
  const timers = new Set<ReturnType<typeof setTimeout>>();
  const endpoint = {
    onmessage: null as ((event: MessageEvent) => void) | null,
    onerror: null as ((event: ErrorEvent) => void) | null,
    postMessage(data: unknown) {
      const timer = setTimeout(() => {
        timers.delete(timer);
        if (!stopped) void handle({ data } as MessageEvent<PoseRequest>);
      }, 0);
      timers.add(timer);
    },
    terminate() {
      stopped = true;
      timers.forEach(clearTimeout);
      timers.clear();
      void handle({ data: { type: 'dispose' } } as MessageEvent<PoseRequest>);
    },
  };
  const handle = createPoseProcessor((data) => {
    if (!stopped) endpoint.onmessage?.({ data } as MessageEvent);
  }, false);
  return endpoint;
}
