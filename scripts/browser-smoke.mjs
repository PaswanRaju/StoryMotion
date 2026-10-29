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
      ['worker', 'service_worker', 'shared_worker'].includes(
        message.params.targetInfo.type,
      )
    ) {
      const session = message.params.sessionId;
      void (async () => {
        await send('Runtime.runIfWaitingForDebugger', {}, session);
        await send('Runtime.enable', {}, session);
        await send('Network.enable', {}, session);
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
    waitForDebuggerOnStart: false,
    flatten: true,
  });
  await send('Emulation.setDeviceMetricsOverride', {
    width: 1280,
    height: 900,
    deviceScaleFactor: 1,
    mobile: false,
  });
  await send('Network.enable');
  if (process.argv.includes('--offline-only')) {
    await send('Page.navigate', { url: base });
    await waitFor("document.body.innerText.includes('Start Adventure')");
  } else {
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
    await waitFor("document.body.innerText.includes('Hello, explorer!')");
    await click('Skip warm-up');
    await waitFor("document.querySelector('.animated-story svg') !== null");
    console.log('PASS home → library → character → skippable warm-up → player');
    const fixture = await fetch(
      'https://storage.googleapis.com/mediapipe-assets/pose.jpg',
    );
    assert.equal(fixture.status, 200);
    const fixtureData = Buffer.from(await fixture.arrayBuffer()).toString(
      'base64',
    );
    await evaluate(`(async () => {
    const NativeWorker = window.Worker;
    window.__poseTest = { inferences: 0, landmarkCount: 0, ready: false, errors: [], debugFrames: 0 };
    window.Worker = class extends NativeWorker {
      constructor(...args) {
        super(...args); window.__poseTest.worker = this;
        this.addEventListener('message', ({data}) => {
          if (data.type === 'ready') window.__poseTest.ready = true;
          if (data.type === 'error') window.__poseTest.errors.push(data.reason);
          if (data.type === 'pose') { window.__poseTest.lastTracking = data.tracking; window.__poseTest.inferences++; window.__poseTest.landmarkCount = Math.max(window.__poseTest.landmarkCount, data.tracking.landmarkCount); }
        });
      }
    };
    const image = new Image(); image.src = 'data:image/jpeg;base64,${fixtureData}'; await image.decode();
    const canvas = document.createElement('canvas'); canvas.width = image.naturalWidth; canvas.height = image.naturalHeight;
    const context = canvas.getContext('2d'); window.__poseTest.canvas = canvas;
    navigator.mediaDevices.getUserMedia = async () => {
      const draw = () => context.drawImage(image, 0, 0); draw(); const timer = setInterval(draw, 60);
      const stream = canvas.captureStream(18);
      for (const track of stream.getTracks()) { const original = track.stop.bind(track); track.stop = () => { clearInterval(timer); original(); }; }
      return stream;
    };
  })()`);
    await click('Start Camera');
    await waitFor(
      'window.__poseTest.ready || window.__poseTest.errors.length > 0',
      30000,
    );
    assert.deepEqual(await evaluate('window.__poseTest.errors'), []);
    assert.equal(
      await evaluate('window.__poseTest.inferences'),
      0,
      'No inference before an interaction',
    );
    assert.equal(
      await evaluate(
        "getComputedStyle(document.querySelector('video')).display",
      ),
      'none',
      'Raw video is never visible',
    );
    await waitFor(
      'window.__poseTest.landmarkCount === 33 || window.__poseTest.errors.length > 0',
      35000,
    );
    assert.equal(await evaluate('window.__poseTest.landmarkCount'), 33);
    console.log(
      'PASS real worker MediaPipe inference with synthetic image, raw video hidden',
    );
    const frameTimes = await evaluate(`new Promise(resolve => {
    const samples = []; let last = performance.now(), start = last;
    function tick(now) { samples.push(now - last); last = now; if (now - start >= 1500) resolve(samples); else requestAnimationFrame(tick); }
    requestAnimationFrame(tick);
  })`);
    frameTimes.sort((a, b) => a - b);
    console.log(
      'Animation RAF p95 (ms):',
      frameTimes[Math.floor(frameTimes.length * 0.95)].toFixed(1),
    );
    if ((await text()).includes('Tortoise needs your help!'))
      await click('Use Magic');
    await waitFor("!document.querySelector('.magic-invitation.is-open')");
    await delay(300);
    const before = await evaluate('window.__poseTest.inferences');
    await delay(1000);
    assert.equal(
      await evaluate('window.__poseTest.inferences'),
      before,
      'Inference stops when the window closes',
    );
    if (process.argv.includes('--models')) {
      for (const gesture of ['BLOW', 'CLAP']) {
        const count = await evaluate('window.__poseTest.inferences');
        await evaluate(`(async () => {
        const worker = window.__poseTest.worker;
        worker.postMessage({ type: 'debug', enabled: true });
        worker.postMessage({ type: 'options', options: { allowed: ['${gesture}'], players: 1 } });
        worker.postMessage({ type: 'recognition', enabled: true });
        const bitmap = await createImageBitmap(window.__poseTest.canvas);
        worker.postMessage({ type: 'frame', bitmap, at: performance.now() }, [bitmap]);
      })()`);
        await waitFor(
          `window.__poseTest.inferences > ${count} || window.__poseTest.errors.length > 0`,
          30000,
        );
        assert.deepEqual(await evaluate('window.__poseTest.errors'), []);
        assert.ok(
          !(await evaluate(
            `window.__poseTest.lastTracking.unavailable.includes('${gesture}')`,
          )),
          JSON.stringify(await evaluate('window.__poseTest.lastTracking')),
        );
        console.log(
          'PASS real optional model initializes and processes synthetic frame:',
          gesture,
        );
      }
    }
    await click('Stop Camera');
    assert.ok(
      await evaluate("document.querySelector('video').srcObject === null"),
    );
    console.log('PASS interaction gating and camera cleanup');
    await send('Emulation.setDeviceMetricsOverride', {
      width: 390,
      height: 844,
      deviceScaleFactor: 1,
      mobile: true,
    });
    assert.ok(
      await evaluate('document.documentElement.scrollWidth <= innerWidth'),
      'No mobile overflow',
    );
    const screenshot = await send('Page.captureScreenshot', { format: 'png' });
    const screenshotPath = join(profile, 'story-mobile.png');
    await writeFile(screenshotPath, Buffer.from(screenshot.data, 'base64'));
    console.log('SCREENSHOT', screenshotPath);
    await send('Page.navigate', { url: `${base}/parent/editor` });
    await waitFor("document.body.innerText.includes('Open story creator')");
    assert.ok(
      !(await evaluate("!!document.querySelector('textarea')")),
      'Editor is behind a parent gate',
    );
    console.log('PASS parent-gated creator');
  }
  console.log(
    'SW DIAGNOSTICS',
    JSON.stringify(
      await evaluate(`(async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    const source = await fetch('/sw.js').then(async r => ({ status: r.status, type: r.headers.get('content-type'), text: (await r.text()).slice(0, 100) }));
    const registration = await navigator.serviceWorker.register('/sw.js').then(r => ({ scope: r.scope, active: r.active?.state, installing: r.installing?.state })).catch(e => ({ error: String(e) }));
    return { registrations: registrations.map(r => ({ scope: r.scope, active: r.active?.state, installing: r.installing?.state })), source, registration, caches: await caches.keys(), readyState: document.readyState };
  })()`),
    ),
  );
  await evaluate(
    "Promise.race([navigator.serviceWorker.ready, new Promise((_, reject) => setTimeout(() => reject(new Error('Offline cache did not become ready')), 20000))])",
  );
  await waitFor('navigator.serviceWorker.controller !== null', 15000);
  await send('Network.emulateNetworkConditions', {
    offline: true,
    latency: 0,
    downloadThroughput: 0,
    uploadThroughput: 0,
  });
  await send('Page.navigate', { url: `${base}/library/pigs/play` });
  await waitFor(
    "document.body.innerText.includes('The Three Little Pigs') && document.querySelector('.animated-story') !== null",
    15000,
  );
  console.log('PASS built-in story route works offline from precached assets');
  await send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
  });
  assert.deepEqual(errors, [], 'No uncaught browser exceptions');
  console.log('PASS production browser smoke (synthetic camera only)');
} finally {
  socket?.close();
  chrome.kill();
}
