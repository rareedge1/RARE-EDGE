// RARE EDGE Service Worker — handles push notifications
self.addEventListener('push', function(event) {
  let data = {};
  try { data = event.data.json(); } catch(e) { data = { title: '⚡ RARE EDGE', body: event.data?.text() || 'Edge detected!' }; }

  const options = {
    body:    data.body  || 'New edge detected on RARE EDGE',
    icon:    '/icon-192.png',
    badge:   '/icon-192.png',
    vibrate: [200, 100, 200],
    data:    data.data  || { url: 'https://arareedge.com/app' },
    actions: [
      { action: 'view', title: 'View Edge' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || '⚡ RARE EDGE', options)
  );
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || 'https://arareedge.com/app';
  event.waitUntil(clients.openWindow(url));
});

self.addEventListener('install', function(event) {
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(clients.claim());
});
