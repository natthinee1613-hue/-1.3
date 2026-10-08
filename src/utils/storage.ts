/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PoliceOfficer } from '../types/personnel';

const DB_NAME = 'PolicePersonnelDB';
const DB_VERSION = 1;
const STORE_NAME = 'officersStore';
const ROSTER_KEY = 'current_roster';

// Helper to open IndexedDB with Promise
function openIDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported in this environment'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onerror = () => {
      reject(request.error);
    };
  });
}

/**
 * Save officers to IndexedDB.
 * Bypasses browser localStorage ~5MB quota limits.
 */
export async function saveOfficersToCache(officers: PoliceOfficer[]): Promise<void> {
  try {
    const db = await openIDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(officers, ROSTER_KEY);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
      tx.oncomplete = () => db.close();
      tx.onerror = () => db.close();
    });
  } catch (err) {
    console.warn('Could not save officers to IndexedDB cache:', err);
  }
}

/**
 * Retrieve officers from IndexedDB.
 */
export async function loadOfficersFromCache(): Promise<PoliceOfficer[] | null> {
  try {
    const db = await openIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(ROSTER_KEY);

      req.onsuccess = () => {
        const val = req.result;
        resolve(Array.isArray(val) ? val : null);
      };
      req.onerror = () => {
        resolve(null);
      };
      tx.oncomplete = () => db.close();
      tx.onerror = () => db.close();
    });
  } catch (err) {
    console.warn('Could not read officers from IndexedDB cache:', err);
    return null;
  }
}

/**
 * Clear cached officers from IndexedDB.
 */
export async function clearOfficersCache(): Promise<void> {
  try {
    const db = await openIDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(ROSTER_KEY);

      req.onsuccess = () => resolve();
      req.onerror = () => resolve();
      tx.oncomplete = () => db.close();
      tx.onerror = () => db.close();
    });
  } catch (err) {
    console.warn('Could not clear IndexedDB cache:', err);
  }
}

/**
 * Clean up legacy bloated localStorage keys to free up quota
 */
export function purgeLegacyLocalStorage(): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    localStorage.removeItem('police_directory_officers_v1');
    localStorage.removeItem('police_directory_officers_v2');
    localStorage.removeItem('police_directory_officers_v3');
  } catch (err) {
    // Ignore any quota or security exceptions
  }
}

/**
 * Safe localStorage setter that never throws or outputs quota error logs
 */
export function safeLocalStorageSet(key: string, value: string): boolean {
  if (typeof window === 'undefined' || !window.localStorage) return false;
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (err) {
    console.warn(`SafeStorage: unable to save key "${key}" to localStorage`);
    return false;
  }
}

/**
 * Safe localStorage getter
 */
export function safeLocalStorageGet(key: string): string | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    return localStorage.getItem(key);
  } catch (err) {
    return null;
  }
}
