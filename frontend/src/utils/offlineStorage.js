/**
 * IndexedDB Wrapper für Offline-Mode Transaktionen
 */

const DB_NAME = 'BULA2026'
const STORE_NAME = 'transactions'
const DB_VERSION = 1

let db = null

export const offlineStorage = {
  /**
   * Initialisiere die Datenbank
   */
  async init() {
    return new Promise((resolve, reject) => {
      if (db) {
        resolve(db)
        return
      }

      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        db = request.result
        resolve(db)
      }

      request.onupgradeneeded = event => {
        const database = event.target.result
        if (!database.objectStoreNames.contains(STORE_NAME)) {
          database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
        }
      }
    })
  },

  /**
   * Speichere Transaktion lokal
   */
  async saveTransaction(transactionData) {
    const database = await this.init()

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      const data = {
        ...transactionData,
        synced: false,
        timestamp: new Date().toISOString()
      }

      const request = store.add(data)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  },

  /**
   * Hole alle lokalen Transaktionen
   */
  async getAllTransactions() {
    const database = await this.init()

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readonly')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.getAll()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  },

  /**
   * Hole nur ungesyncte Transaktionen
   */
  async getPendingTransactions() {
    const allTransactions = await this.getAllTransactions()
    return allTransactions.filter(t => !t.synced)
  },

  /**
   * Markiere Transaktionen als gesynct
   */
  async markAsSynced(ids) {
    const database = await this.init()

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)

      ids.forEach(id => {
        const request = store.get(id)
        request.onsuccess = () => {
          const data = request.result
          data.synced = true
          store.put(data)
        }
      })

      transaction.onerror = () => reject(transaction.error)
      transaction.oncomplete = () => resolve()
    })
  },

  /**
   * Lösche alle Transaktionen
   */
  async clearAll() {
    const database = await this.init()

    return new Promise((resolve, reject) => {
      const transaction = database.transaction([STORE_NAME], 'readwrite')
      const store = transaction.objectStore(STORE_NAME)
      const request = store.clear()

      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve()
    })
  }
}

/**
 * Service Worker Registrierung
 */
export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return false

  try {
    const registration = await navigator.serviceWorker.register('/service-worker.js')
    console.log('Service Worker registered:', registration)
    return registration
  } catch (error) {
    console.error('Service Worker registration failed:', error)
    return null
  }
}

/**
 * Überprüfe Online-Status
 */
export function isOnline() {
  return navigator.onLine
}

/**
 * Höre auf Online/Offline Events
 */
export function onOnlineStatusChange(callback) {
  window.addEventListener('online', () => callback(true))
  window.addEventListener('offline', () => callback(false))

  return () => {
    window.removeEventListener('online', () => callback(true))
    window.removeEventListener('offline', () => callback(false))
  }
}

/**
 * Synchronisiere Transaktionen mit Server
 */
export async function syncTransactions(token) {
  if (!isOnline()) {
    throw new Error('Offline - Synchronisierung später')
  }

  const pending = await offlineStorage.getPendingTransactions()
  if (pending.length === 0) return { synced: 0 }

  try {
    const response = await fetch('/api/pocket-money/transactions/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ transactions: pending })
    })

    if (!response.ok) {
      throw new Error('Sync failed')
    }

    // Mark as synced
    const ids = pending.map(t => t.id)
    await offlineStorage.markAsSynced(ids)

    return { synced: ids.length }
  } catch (error) {
    console.error('Sync error:', error)
    throw error
  }
}
