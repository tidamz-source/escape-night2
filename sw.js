// À chaque déploiement : changer VERSION ici, VERSION dans src/core.js et les ?v= dans index.html.
const VERSION = 'v0.1.4';
const CACHE = 'escape-night2-' + VERSION;
const PROPS = ['pine1', 'pine2', 'oak1', 'oak2', 'tent_r', 'tent_b', 'tent_y', 'campfire', 'campfire2', 'bush', 'log', 'rock', 'lamp', 'sign', 'fence', 'flowers', 'table'];
const FILES = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png',
  'src/core.js?v=0.1.4', 'src/input.js?v=0.1.4', 'src/world.js?v=0.1.4', 'src/entities.js?v=0.1.4', 'src/game.js?v=0.1.4',
  'assets/sacha.png?v=' + VERSION, 'assets/sacha.json?v=' + VERSION, ...PROPS.map(k => `assets/props/${k}.png?v=${VERSION}`)];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    if (res.ok && (e.request.url.startsWith(self.location.origin) || e.request.url.includes('fonts.g'))) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
    return res;
  }).catch(() => caches.match('index.html'))));
});
