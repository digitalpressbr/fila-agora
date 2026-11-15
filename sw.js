// Fila Agora: serviço em segundo plano. Permite instalar o aplicativo e receber aviso de vaga com ele fechado.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", e => e.waitUntil(self.clients.claim()));
self.addEventListener("fetch", e => { e.respondWith(fetch(e.request)); });

self.addEventListener("push", e => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch (x) { d = { corpo: e.data ? e.data.text() : "" }; }
  const titulo = d.titulo || "Fila Agora";
  e.waitUntil((async () => {
    const abertas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    const visivel = abertas.find(c => c.visibilityState === "visible");
    if (visivel) { visivel.postMessage({ tipo: "fila-aviso", titulo, corpo: d.corpo || "" }); return; }
    await self.registration.showNotification(titulo, {
      body: d.corpo || "", icon: "icone-192.png", badge: "icone-192.png", tag: "fila-" + (d.unidade || "geral"),
      renotify: true, requireInteraction: true, vibrate: [350, 120, 350, 120, 700], data: { url: self.registration.scope },
    });
  })());
});

self.addEventListener("notificationclick", e => {
  e.notification.close();
  e.waitUntil((async () => {
    const abertas = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    if (abertas.length) return abertas[0].focus();
    return self.clients.openWindow(e.notification.data && e.notification.data.url || "./");
  })());
});
