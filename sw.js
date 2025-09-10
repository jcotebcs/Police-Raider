/**
 * Service Worker for Public Records Search PWA
 * Provides offline functionality and caching for professional search application
 */

const CACHE_NAME = 'public-search-v1';
const ESSENTIAL_FILES = [
    '/',
    '/index.html',
    '/styles.css',
    '/app.js',
    '/manifest.json'
];

// Cache API responses for offline use
const API_CACHE_NAME = 'api-cache-v1';

// Install: Cache essential files
self.addEventListener('install', event => {
    console.log('[SW] Installing service worker');
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Caching essential files');
            return cache.addAll(ESSENTIAL_FILES);
        })
    );
    self.skipWaiting(); // Activate immediately
});

// Activate: Clean up old caches
self.addEventListener('activate', event => {
    console.log('[SW] Activating service worker');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME && cacheName !== API_CACHE_NAME) {
                        console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Take control of all pages
});

// Fetch: Handle requests with appropriate caching strategy
self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    
    // API requests: Network-first with cache fallback
    if (url.pathname.includes('/api/')) {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    // Cache successful API responses
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(API_CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                })
                .catch(() => {
                    // Fallback to cache if network fails
                    console.log('[SW] Network failed, trying cache for:', event.request.url);
                    return caches.match(event.request);
                })
        );
    } 
    // Static assets: Cache-first with network fallback
    else {
        event.respondWith(
            caches.match(event.request).then(response => {
                if (response) {
                    console.log('[SW] Serving from cache:', event.request.url);
                    return response;
                }
                
                console.log('[SW] Fetching from network:', event.request.url);
                return fetch(event.request).then(response => {
                    // Cache successful responses
                    if (response.ok) {
                        const responseClone = response.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseClone);
                        });
                    }
                    return response;
                });
            })
        );
    }
});

// Background sync for offline search requests
self.addEventListener('sync', event => {
    if (event.tag === 'search-sync') {
        console.log('[SW] Background sync for search');
        event.waitUntil(
            // Process any pending searches when back online
            processOfflineSearches()
        );
    }
});

// Push notifications for search alerts (if needed)
self.addEventListener('push', event => {
    if (event.data) {
        const data = event.data.json();
        console.log('[SW] Push notification received:', data);
        
        const options = {
            body: data.body || 'New search result available',
            icon: '/icon-192.png',
            badge: '/icon-192.png',
            vibrate: [200, 100, 200],
            data: data,
            actions: [
                {
                    action: 'view',
                    title: 'View Results'
                },
                {
                    action: 'dismiss',
                    title: 'Dismiss'
                }
            ]
        };
        
        event.waitUntil(
            self.registration.showNotification(data.title || 'Search Alert', options)
        );
    }
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
    console.log('[SW] Notification clicked:', event.notification.data);
    event.notification.close();
    
    if (event.action === 'view') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

// Helper function to process offline searches
async function processOfflineSearches() {
    try {
        // In a real implementation, this would process any searches
        // that were queued while offline
        console.log('[SW] Processing offline searches');
        
        // Get queued searches from IndexedDB or localStorage
        // Send them to the server when back online
        // Update the UI with results
        
    } catch (error) {
        console.error('[SW] Error processing offline searches:', error);
    }
}

// Error handling
self.addEventListener('error', event => {
    console.error('[SW] Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
    console.error('[SW] Unhandled rejection in service worker:', event.reason);
});

console.log('[SW] Service worker script loaded');