var C = 'transline-tel-v17';
var SHELL = ['./', './index.html', './style.css', './manifest.webmanifest', '../icon-192.png', '../icon-512.png'];
self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(caches.open(C).then(function (c) { return Promise.all(SHELL.map(function (u) { return fetch(u, { cache: 'no-store' }).then(function (r) { if (r.ok) return c.put(u, r); }); })); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    var old = ks.filter(function (k) { return k !== C; });
    return Promise.all(old.map(function (k) { return caches.delete(k); })).then(function () { return self.clients.claim(); }).then(function () {
      if (!old.length) return;
      return self.clients.matchAll({ type: 'window' }).then(function (cs) { cs.forEach(function (c) { try { c.navigate(c.url); } catch (x) {} }); });
    });
  }));
});
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(caches.open(C).then(function (c) {
    var net = fetch(e.request, { cache: 'no-store' }).then(function (r) { if (r && r.ok) c.put(e.request, r.clone()); return r; });
    var late = new Promise(function (res) { setTimeout(res, 2500); });
    return Promise.race([net, late.then(function () { return c.match(e.request, { ignoreSearch: true }); })])
      .then(function (r) { return r || net; })
      .catch(function () { return c.match(e.request, { ignoreSearch: true }); });
  }));
});
