import { createPoseProcessor } from './poseProcessor';
self.onmessage = createPoseProcessor((message, transfer) => {
  if (transfer) self.postMessage(message, transfer);
  else self.postMessage(message);
});
