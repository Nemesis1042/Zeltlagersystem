const CACHE_NAME = 'bula2026-v1'
const URLS_TO_CACHE = [
  '/',
  '/scanner',
  '/index.html',
  '/manifest.json'
]

// Install: Cache essential assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(URLS_TO_CACHE)
    })
  )
  self.skipWaiting()
})

// Activate: Clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch: Network-first, fall back to cache
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip API calls (they'll be handled by IndexedDB sync)
  if (url.pathname.startsWith('/api/')) {
    return
  }

  event.respondWith(
    fetch(request)
      .then(response => {
        // Cache successful responses
        if (response.ok) {
          const cache = caches.open(CACHE_NAME)
          cache.then(c => c.put(request, response.clone()))
        }
        return response
      })
      .catch(() => {
        // Fall back to cache on network error
        return caches.match(request)
          .then(response => response || new Response('Offline'))
      })
  )
})

// Handle background sync for transactions
self.addEventListener('sync', event => {
  if (event.tag === 'sync-transactions') {
    event.waitUntil(syncTransactions())
  }
})

async function syncTransactions() {
  try {
    // Get pending transactions from IndexedDB
    const db = await openDB()
    const pendingTransactions = await getAllPending(db)

    if (pendingTransactions.length === 0) return

    // Send to server
    const response = await fetch('/api/pocket-money/transactions/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ transactions: pendingTransactions })
    })

    if (response.ok) {
      // Clear pending transactions
      const db = await openDB()
      await clearPending(db)

      // Notify clients
      const clients = await self.clients.matchAll()
      clients.forEach(client => {
        client.postMessage({
          type: 'SYNC_SUCCESS',
          message: `${pendingTransactions.length} Transaktionen synchronisiert`
        })
      })
    }
  } catch (error) {
    console.error('Sync failed:', error)
  }
}

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('BULA2026', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = event => {
      const db = event.target.result
      if (!db.objectStoreNames.contains('transactions')) {
        db.createObjectStore('transactions', { keyPath: 'id', autoIncrement: true })
      }
    }
  })
}

function getAllPending(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['transactions'], 'readonly')
    const store = transaction.objectStore('transactions')
    const request = store.getAll()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result.filter(t => !t.synced))
  })
}

function clearPending(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['transactions'], 'readwrite')
    const store = transaction.objectStore('transactions')
    const request = store.clear()

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve()
  })
}
