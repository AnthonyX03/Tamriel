const CACHE = 'tamriel-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './assets/ceil.png',
  './assets/ceil_dark.png',
  './assets/chest.png',
  './assets/enemy_atronach.png',
  './assets/enemy_bandit.png',
  './assets/enemy_bat.png',
  './assets/enemy_draugr.png',
  './assets/enemy_giant.png',
  './assets/enemy_rat.png',
  './assets/enemy_skel.png',
  './assets/enemy_spider.png',
  './assets/enemy_spriggan.png',
  './assets/enemy_wolf.png',
  './assets/floor.png',
  './assets/floor_dirt.png',
  './assets/floor_grass.png',
  './assets/floor_marble.png',
  './assets/floor_stone.png',
  './assets/floor_wood.png',
  './assets/gold.png',
  './assets/portrait.png',
  './assets/potion.png',
  './assets/sky_day.png',
  './assets/sky_dusk.png',
  './assets/sky_night.png',
  './assets/sword.png',
  './assets/wall.png',
  './assets/wall_crypt.png',
  './assets/wall_dungeon.png',
  './assets/wall_forest.png',
  './assets/wall_plaster.png',
  './assets/wall_town.png',
  './assets/wall_wood.png',
  './assets/weapon_axe.png',
  './assets/weapon_bow.png',
  './assets/weapon_staff.png',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      for (const url of ASSETS) {
        try { await cache.add(url); } catch (e) {}
      }
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((k) => k !== CACHE ? caches.delete(k) : null))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  const isHTML = req.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname.endsWith('/') || url.pathname.endsWith('index.html');
  if (isHTML) {
    event.respondWith(
      fetch(req, { cache: 'no-store' }).then((res) => {
        if (res && res.ok) {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() => caches.match(req).then((c) => c || caches.match('./index.html')))
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((cached) => {
      const fetched = fetch(req).then((res) => {
        if (res && res.ok && req.url.startsWith(self.location.origin)) {
          const clone = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, clone));
        }
        return res;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});
