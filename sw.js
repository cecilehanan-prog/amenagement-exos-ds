/* Mode hors ligne : l'appli se garde sur le téléphone et s'ouvre même sans internet (mode avion, Accès guidé).
   - Fichiers de l'appli : on prend la version en ligne quand il y a internet (mises à jour tout de suite),
     sinon celle gardée sur le téléphone.
   - Polices et outils PDF : gardés après le premier chargement.
   - La préparation (envoi de la photo) a toujours besoin d'internet : elle n'est jamais gardée ici. */
const VERSION = 'appli-v1';
const FICHIERS = ['./', 'index.html', 'config.js', 'exo.js', 'pictos.js', 'maths.js', 'revision.js', 'apprendre.js', 'app.js'];
const EXTERNES = /^https:\/\/(fonts\.googleapis\.com|fonts\.gstatic\.com|cdnjs\.cloudflare\.com)\//;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(l => Promise.all(l.filter(k => k !== VERSION).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;                       // la fonction (photos) n'est jamais gardée
  const u = new URL(r.url);
  if (u.origin === location.origin){
    if (u.pathname.includes('/api/')) return;
    // en ligne d'abord (4 s au plus), sinon la copie du téléphone
    e.respondWith((async () => {
      const c = await caches.open(VERSION);
      try {
        const rep = await Promise.race([fetch(r), new Promise((_, ko) => setTimeout(() => ko(new Error('lent')), 4000))]);
        if (rep && rep.ok) c.put(r, rep.clone());
        return rep;
      } catch (err) {
        return (await c.match(r, {ignoreSearch: true})) || (r.mode === 'navigate' ? await c.match('index.html') : Response.error());
      }
    })());
  } else if (EXTERNES.test(r.url)){
    e.respondWith(caches.open(VERSION).then(async c => {
      const garde = await c.match(r); if (garde) return garde;
      const rep = await fetch(r); if (rep && (rep.ok || rep.type === 'opaque')) c.put(r, rep.clone()); return rep;
    }));
  }
});
