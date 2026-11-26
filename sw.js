/* Ola · servicio en segundo plano de la versión web: muestra las notificaciones en el celular. */
const CFG = 'ola-cfg';
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));
// La app le entrega la dirección del servidor y la sesión para poder preguntar qué pasó
self.addEventListener('message', (e) => {
  if (e.data && e.data.ola === 'cfg') e.waitUntil(caches.open(CFG).then((c) => c.put('cfg', new Response(JSON.stringify(e.data)))));
});
self.addEventListener('push', (e) => e.waitUntil((async () => {
  let titulo = 'Ola', cuerpo = 'Tienes una novedad. Toca para verla.', tipo = '';
  try {
    const c = await caches.open(CFG), r = await c.match('cfg'), cfg = r && (await r.json());
    if (cfg && cfg.api && cfg.token) {
      const res = await fetch(cfg.api, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify({ action: 'ultimoAviso', token: cfg.token }) });
      const d = await res.json();
      if (d.ok && d.aviso) { titulo = d.aviso.titulo; cuerpo = d.aviso.cuerpo; tipo = d.aviso.tipo; }
    }
  } catch (_) {}
  await self.registration.showNotification(titulo, { body: cuerpo, icon: 'icono.png', badge: 'icono.png', data: { tipo } });
})()));
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((cs) => (cs.length ? cs[0].focus() : self.clients.openWindow('./'))));
});
