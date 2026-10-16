self.addEventListener('install', event => event.waitUntil(self.skipWaiting()));
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const ownPrecache = `workbox-precache-v2-${self.registration.scope}`;
    await Promise.all(keys.filter(key => key.startsWith('tome-of-changes-') || key === ownPrecache).map(key => caches.delete(key)));
    await self.registration.unregister();
  })());
});
