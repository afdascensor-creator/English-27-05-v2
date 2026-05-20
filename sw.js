// Sin caché offline: se mantiene vacío para evitar que móviles conserven versiones anteriores.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
