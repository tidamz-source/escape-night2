// À chaque déploiement : changer VERSION ici, VERSION dans src/core.js et les ?v= dans index.html.
const VERSION = 'v3.0.0';
const CACHE = 'escape-night2-' + VERSION;
const PROPS = ['pine1', 'pine2', 'oak1', 'oak2', 'tent_r', 'tent_b', 'tent_y', 'campfire', 'campfire2', 'bush', 'log', 'rock', 'lamp', 'sign', 'fence', 'flowers', 'table'];
const SCRIPTS = ['src/core.js', 'src/bus.js', 'src/input.js', 'src/systems/save.js', 'src/systems/heroes.js', 'src/systems/inventory.js', 'src/systems/wallet.js', 'src/systems/shop.js', 'src/systems/story.js', 'src/systems/loot.js', 'src/world.js', 'src/entities.js', 'src/objects.js', 'src/actors.js', 'src/bois.js', 'src/tools.js', 'src/mines.js', 'src/lac.js', 'src/temple.js', 'src/tower.js', 'src/castle.js', 'src/areas.js', 'src/ui.js', 'src/game.js'];
const FACES = ['sacha', 'cam', 'rox', 'papa'].flatMap(w => ['smile', 'o', 'angry', 'wink'].map(m => `${w}_${m}`)).concat(['amandine_smile', 'claudine_smile']);
const FILES = ['./', 'index.html', 'manifest.json', 'icon-192.png', 'icon-512.png',
  ...SCRIPTS.map(s => s + '?v=3.0.0'),
  ...['heroes', 'items', 'shops', 'dialogues'].map(k => `data/${k}.json?v=${VERSION}`),
  ...['sacha', 'cam', 'rox'].flatMap(h => [`assets/${h}.png?v=${VERSION}`, `assets/${h}.json?v=${VERSION}`]),
  ...FACES.map(f => `assets/faces/${f}.png?v=${VERSION}`),
  ...PROPS.map(k => `assets/props/${k}.png?v=${VERSION}`),
  ...['claudine', 'dog_down', 'dog_up', 'dog_left', 'dog_right', 'amandine', 'papa_down', 'papa_up', 'papa_left', 'papa_right'].map(k => `assets/npc/${k}.png?v=${VERSION}`),
  ...['sacha', 'cam', 'rox', 'papa'].flatMap(k => [0, 1].map(i => `assets/swim/${k}${i}.png?v=${VERSION}`))];
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
