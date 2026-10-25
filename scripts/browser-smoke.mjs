/** Mac Chrome smoke check using its native DevTools protocol; no new npm dependency.
 * Run with: node scripts/browser-smoke.mjs [http://127.0.0.1:5173]
 * Uses Chrome's synthetic camera, never the physical webcam.
 */
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const base = process.argv[2] ?? 'http://127.0.0.1:5173';
const profile = await mkdtemp(join(tmpdir(), 'storymotion-browser-'));
const chrome = spawn(
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--use-fake-device-for-media-stream',
    '--use-fake-ui-for-media-stream',
    '--autoplay-policy=no-user-gesture-required',
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] },
);
let stderr = '';
chrome.stderr.on('data', (data) => {
  stderr += data;
});
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
let socket;
try {
  let port;
  for (let i = 0; i < 100; i++) {
    try {
      port = (
        await readFile(join(profile, 'DevToolsActivePort'), 'utf8')
      ).split('\n')[0];
      break;
    } catch {
      await delay(100);
    }
  }
  if (!port) throw new Error(`Chrome failed to start: ${stderr.slice(-2000)}`);
  const targets = await (
    await fetch(`http://127.0.0.1:${port}/json/list`)
  ).json();
  socket = new WebSocket(
    targets.find((target) => target.type === 'page').webSocketDebuggerUrl,
  );
  await new Promise((resolve, reject) => {
    socket.onopen = resolve;
    socket.onerror = reject;
  });
  let id = 0;
  const pending = new Map();
  const errors = [];
  const assetResponses = new Map();
  socket.onmessage = ({ data }) => {
    const message = JSON.parse(data);
    if (message.id) {
      const entry = pending.get(message.id);
      pending.delete(message.id);
      message.error
        ? entry.reject(message.error)
        : entry.resolve(message.result);
    }
    if (
      message.method === 'Target.attachedToTarget' &&
      message.params.targetInfo.type === 'worker'
    ) {
      const session = message.params.sessionId;
      void (async () => {
        await send('Runtime.enable', {}, session);
        await send('Network.enable', {}, session);
        await send('Runtime.runIfWaitingForDebugger', {}, session);
      })().catch((error) => errors.push(error));
    }
    if (message.method === 'Network.responseReceived') {
      const { url, status } = message.params.response;
      if (/vision_wasm_module_internal|pose_landmarker_lite\.task/.test(url))
        assetResponses.set(url, status);
    }
    if (message.method === 'Runtime.exceptionThrown')
      errors.push(message.params.exceptionDetails);
    if (
      message.method === 'Runtime.consoleAPICalled' &&
      ['error', 'warning'].includes(message.params.type)
    )
      console.log(
        'BROWSER CONSOLE:',
        message.params.args
          .map((arg) => arg.value ?? arg.description)
          .join(' '),
      );
  };
  const send = (method, params = {}, sessionId) =>
    new Promise((resolve, reject) => {
      const key = ++id;
      pending.set(key, { resolve, reject });
      socket.send(
        JSON.stringify({
          id: key,
          method,
          params,
          ...(sessionId ? { sessionId } : {}),
        }),
      );
    });
  const evaluate = async (expression) => {
    const result = await send('Runtime.evaluate', {
      expression,
      returnByValue: true,
      awaitPromise: true,
    });
    if (result.exceptionDetails)
      throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const text = () => evaluate('document.body.innerText');
  const waitFor = async (expression, timeout = 10000) => {
    const start = Date.now();
    while (!(await evaluate(expression))) {
      if (Date.now() - start > timeout)
        throw new Error(`Timed out: ${expression}\n${await text()}`);
      await delay(200);
    }
  };
  const click = async (name) => {
    const found = await evaluate(
      `(() => { const b = [...document.querySelectorAll('button, a')].find(b => (b.getAttribute('aria-label') || b.textContent.trim()) === ${JSON.stringify(name)}); if (!b || b.disabled) return false; b.click(); return true; })()`,
    );
    assert.ok(found, `Button available: ${name}`);
  };
  await send('Runtime.enable');
  await send('Page.enable');
  await send('Target.setAutoAttach', {
    autoAttach: true,
    waitForDebuggerOnStart: true,
    flatten: true,
  });
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send('Page.navigate', { url: base });
  await waitFor("document.body.innerText.includes('Start Adventure')");
  await click('Start Adventure');
  await waitFor("document.body.innerText.includes('Play Now')");
  await click('Start The Tortoise and the Hare');
  await waitFor("document.body.innerText.includes('Choose Your Character')");
  await evaluate(
    "[...document.querySelectorAll('button')].find(b => b.textContent.includes('Tortoise')).click()",
  );
  await click("Let's Go");
  await waitFor("document.querySelector('.animated-story svg') !== null");
  assert.ok((await evaluate('location.pathname')).endsWith('/hare/play'));
  assert.ok(!(await text()).includes('🎬'));
  console.log(
    'PASS home → library → character → animated player (no setup screen)',
  );
  // Google's public pose test image is converted to a local synthetic video stream.
  // No physical webcam is used and no camera data is uploaded.
  const fixtureUrl = 'https://storage.googleapis.com/mediapipe-assets/pose.jpg';
  const fixture = await fetch(fixtureUrl);
  assert.equal(fixture.status, 200, 'Official pose test image downloads');
  const fixtureData = Buffer.from(await fixture.arrayBuffer()).toString(
    'base64',
  );
  console.log('PASS official pose test fixture HTTP 200');
  await evaluate(`(async () => {
    const NativeWorker = window.Worker;
    window.__poseTest = { inferences: 0, landmarkCount: 0, ready: false, errors: [], debugFrames: 0 };
    window.Worker = class extends NativeWorker {
      constructor(...args) {
        super(...args);
        window.__poseTest.worker = this;
        this.addEventListener('message', ({data}) => {
          if (data.type === 'ready') window.__poseTest.ready = true;
          if (data.type === 'error') window.__poseTest.errors.push(data.reason);
          if (data.type === 'pose') {
            if (data.debugFrame) window.__poseTest.debugFrames++;
            window.__poseTest.inferences++;
            window.__poseTest.landmarkCount = Math.max(window.__poseTest.landmarkCount, data.tracking.landmarkCount);
          }
        });
      }
    };
    const image = new Image();
    image.src = 'data:image/jpeg;base64,${fixtureData}';
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d');
    const originalGetUserMedia = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices);
    navigator.mediaDevices.getUserMedia = async constraints => {
      const fakeCamera = await originalGetUserMedia(constraints);
      fakeCamera.getTracks().forEach(track => track.stop());
      const draw = () => context.drawImage(image, 0, 0);
      draw();
      const timer = setInterval(draw, 100);
      const stream = canvas.captureStream(10);
      for (const track of stream.getTracks()) {
        const stop = track.stop.bind(track);
        track.stop = () => { clearInterval(timer); stop(); };
      }
      return stream;
    };
  })()`);
  await click('Start Camera');
  // The story intentionally never waits for the camera, so a slow cold model download
  // could otherwise let it finish (and unmount the camera) mid-check. Pausing freezes
  // story time only; the camera and worker keep running.
  await click('Pause story');
  await waitFor("document.querySelector('video')?.videoWidth > 0");
  console.log(
    'PASS explicit camera permission and live synthetic video preview',
  );
  await waitFor(
    "document.body.innerText.includes('Move into view') || document.body.innerText.includes('Camera ready') || document.body.innerText.includes('took a nap')",
    40000,
  );
  await waitFor(
    'window.__poseTest.landmarkCount === 33 || window.__poseTest.errors.length > 0',
    30000,
  );
  const inference = await evaluate('(({ worker, ...rest }) => rest)(window.__poseTest)');
  assert.equal(
    inference.landmarkCount,
    33,
    `Real model must infer 33 landmarks: ${JSON.stringify(inference)}`,
  );
  assert.ok(inference.inferences > 0);
  console.log(
    'PASS real MediaPipe VIDEO inference:',
    JSON.stringify(inference),
  );
  for (const [url, status] of assetResponses) {
    assert.equal(status, 200);
    console.log('ASSET HTTP', status, url);
  }
  assert.ok(
    assetResponses.size >= 3,
    'Observed successful module loader, WASM, and model requests',
  );
  const cameraText = await text();
  console.log(
    'CAMERA STATUS:',
    cameraText.slice(
      cameraText.indexOf('Your camera'),
      cameraText.indexOf('Only on this device'),
    ),
  );
  assert.ok(
    !cameraText.includes('took a nap'),
    'MediaPipe worker initializes with real model',
  );
  await click('Resume');
  await waitFor("document.body.innerText.includes('Use Magic')", 15000);
  await click('Use Magic');
  await waitFor(
    "document.querySelector('[data-testid=tortoise-actor] .actor-shield') !== null",
    2000,
  );
  console.log('PASS manual Use Magic button raises the same shield');
  assert.equal(
    await evaluate('window.__poseTest.debugFrames'),
    0,
    'No diagnostic images without opt-in',
  );
  assert.ok(
    await evaluate("document.querySelector('.pose-debug-controls') === null"),
  );
  await evaluate(
    "history.replaceState(null, '', location.pathname + '?debugPose=1')",
  );
  await waitFor("document.querySelector('.pose-debug-controls') !== null");
  await evaluate(
    "document.querySelector('.pose-debug-controls').open = true; document.querySelector('.pose-debug-controls input').click()",
  );
  const hasSkeletonPixels = `(() => {
    const canvas = document.querySelector('.camera-preview canvas');
    if (!canvas || canvas.hidden || !canvas.width || !canvas.height) return false;
    return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data.some((v, i) => i % 4 === 3 && v > 0);
  })()`;
  await waitFor(hasSkeletonPixels);
  assert.ok(await evaluate('window.__poseTest.debugFrames > 0'));
  await evaluate(
    "document.querySelector('.pose-debug-controls input').click()",
  );
  assert.ok(
    await evaluate("document.querySelector('.camera-preview canvas').hidden"),
  );
  assert.ok(
    await evaluate(`(() => {
    const canvas = document.querySelector('.camera-preview canvas');
    return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data.every(v => v === 0);
  })()`),
  );
  console.log(
    'PASS skeleton is opt-in, renders actual inferred joints, and clears when disabled',
  );
  await click('Pause story');
  const transform = await evaluate(
    "document.querySelector('.story-traveler').style.transform",
  );
  await delay(1500);
  assert.equal(
    await evaluate("document.querySelector('.story-traveler').style.transform"),
    transform,
  );
  await click('Resume');
  await click('Restart story');
  assert.ok(!(await text()).includes('Magic activated!'));
  console.log('PASS pause, resume, replay');
  // Gesture → story: deliver the worker's own reply shape on the live worker, so the real
  // camera controller, player reducer and scene all run. (The model seeing a real body
  // is the one step this cannot cover: that needs a physical webcam test.)
  const workerGesture = (type) =>
    evaluate(`window.__poseTest.worker.dispatchEvent(new MessageEvent('message', { data: {
      type: 'pose', event: { type: '${type}' },
      tracking: { landmarkCount: 33, upperBody: true, calibrated: true, legsVisible: false, crouchAvailable: false, headDirection: 'forward' },
    } }))`);
  await waitFor("document.body.innerText.includes('Tortoise needs your help!')", 15000);
  await workerGesture('LEAN_LEFT'); // not what this moment asks for: ignored
  assert.ok((await text()).includes('Tortoise needs your help!'));
  await workerGesture('ARMS_WIDE');
  await waitFor(
    "document.querySelector('[data-testid=tortoise-actor] .actor-shield') !== null",
    2000,
  );
  assert.ok((await text()).includes('Magic shield!'));
  assert.ok(await evaluate("document.querySelector('.forest-glow') !== null"));
  console.log('PASS camera ARMS_WIDE event raises the shield and lights the forest');
  await waitFor("document.body.innerText.includes('Which way should Tortoise go?')", 15000);
  await workerGesture('LEAN_RIGHT');
  await waitFor("document.body.innerText.includes('Right path chosen!')", 2000);
  assert.ok(
    await evaluate(
      "document.querySelector('[data-testid=tortoise-actor] .actor-lane').classList.contains('lane-sunny') && document.querySelector('.forest-fork').classList.contains('chose-sunny')",
    ),
  );
  assert.ok((await text()).includes('Leaning right!'));
  console.log('PASS camera LEAN_RIGHT event chooses the sunny trail');
  await waitFor("document.body.innerText.includes('Give Tortoise one last boost!')", 15000);
  await workerGesture('HAND_RAISE');
  await waitFor("document.body.innerText.includes('A sparkly boost!')", 2000);
  assert.ok(
    await evaluate(
      "document.querySelector('.animated-story').classList.contains('has-magic') && ['magic','energized'].includes(document.querySelector('[data-testid=tortoise-actor]').dataset.state)",
    ),
  );
  console.log('PASS camera HAND_RAISE event gives Tortoise the final boost');
  await click('Restart story');
  const screenshot = await send('Page.captureScreenshot', { format: 'png' });
  const screenshotPath = join(profile, 'story-desktop.png');
  await writeFile(screenshotPath, Buffer.from(screenshot.data, 'base64'));
  console.log('SCREENSHOT', screenshotPath);
  await send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
  });
  assert.ok(
    await evaluate('document.documentElement.scrollWidth <= innerWidth'),
    'No mobile horizontal overflow',
  );
  await click('Stop Camera');
  assert.ok(
    await evaluate("document.querySelector('video').srcObject === null"),
  );
  console.log('PASS responsive layout and camera stop cleanup');
  // No input after restart: three held invitations resolve themselves (~65 s).
  await waitFor("document.body.innerText.includes('Steady Champion')", 80000);
  console.log('PASS story completes automatically without gestures');
  await send('Page.navigate', { url: `${base}/library/hare/camera` });
  await waitFor(
    "location.pathname.endsWith('/hare/play') && document.querySelector('.animated-story') !== null",
  );
  console.log('PASS legacy camera URL redirects into story');
  assert.deepEqual(errors, [], 'No uncaught browser exceptions');
  console.log('PASS browser smoke checks (synthetic camera only)');
} finally {
  socket?.close();
  chrome.kill();
}
