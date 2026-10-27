import { readdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';
async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map((entry) =>
      entry.isDirectory()
        ? walk(join(directory, entry.name))
        : [join(directory, entry.name)],
    ),
  );
  return nested.flat();
}
const files = (await walk('dist')).filter(
  (file) =>
    !file.endsWith('sw.js') &&
    !file.split(/[\\/]/).some((part) => part.startsWith('.')),
);
const hash = createHash('sha256');
for (const file of files.sort()) hash.update(await readFile(file));
const cache = `storymotion-${hash.digest('hex').slice(0, 14)}`;
const urls = files.map(
  (file) => '/' + relative('dist', file).replaceAll('\\', '/'),
);
await writeFile(
  'dist/sw.js',
  `const CACHE = ${JSON.stringify(cache)};
const ASSETS = ${JSON.stringify(urls)};
self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS))); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key.startsWith('storymotion-') && key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', event => {
  const request = event.request, url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== self.location.origin || url.pathname.startsWith('/api/') || url.pathname.startsWith('/dev/')) return;
  if (request.mode === 'navigate') { event.respondWith(fetch(request).catch(() => caches.match('/index.html'))); return; }
  event.respondWith(caches.match(request, { ignoreSearch: true }).then(hit => hit || fetch(request).then(response => {
    if (response.ok && /\\.(?:wasm|task|riv|mp3|wav|ogg|js|css|svg|png)$/.test(url.pathname)) { const copy = response.clone(); void caches.open(CACHE).then(cache => cache.put(request, copy)); }
    return response;
  })));
});
`,
);
console.log(`Offline cache: ${urls.length} local assets (${cache})`);
