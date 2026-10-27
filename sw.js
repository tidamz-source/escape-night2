// À chaque déploiement : changer VERSION ici, VERSION dans src/core.js et les ?v= dans index.html.
const VERSION = 'v0.2.1';
const CACHE = 'escape-night2-' + VERSION;
const PROPS = ['pine1', 'pine2', 'oak1', 'oak2', 'tent_r', 'tent_b', 'tent_y', 'campfire', 'campfire2', 'bush', 'log', 'rock', 'lamp', 'sign', 'fence', 'flowers', 'table'];
const FILES = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png',
  'src/core.js?v=0.2.1', 'src/input.js?v=0.2.1', 'src/world.js?v=0.2.1', 'src/entities.js?v=0.2.1', 'src/objects.js?v=0.2.1', 'src/game.js?v=0.2.1',
  'assets/sacha.png?v=' + VERSION, 'assets/sacha.json?v=' + VERSION, ...PROPS.map(k => `assets/props/${k}.png?v=${VERSION}`)];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
// Réseau d'abord (toujours la dernière version en ligne), cache en secours hors ligne.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = e.request.url, mine = url.startsWith(self.location.origin);
  if (!mine && !url.includes('fonts.g')) return;
  e.respondWith(fetch(e.request, { cache: 'no-cache' }).then(res => {
    if (res.ok) { const cp = res.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); }
    return res;
  }).catch(() => caches.match(e.request, { ignoreSearch: false }).then(r => r || caches.match(e.request, { ignoreSearch: true })).then(r => r || caches.match('index.html'))));
});
