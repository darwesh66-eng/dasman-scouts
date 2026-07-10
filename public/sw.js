/* Kill-switch service worker.
   The old Vite site registered a caching SW at this scope; this replacement
   unregisters itself and clears old caches so returning visitors get the new site. */
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", async () => {
  const keys = await caches.keys();
  await Promise.all(keys.map((k) => caches.delete(k)));
  await self.registration.unregister();
  const clientsList = await self.clients.matchAll({ type: "window" });
  clientsList.forEach((c) => c.navigate(c.url));
});
