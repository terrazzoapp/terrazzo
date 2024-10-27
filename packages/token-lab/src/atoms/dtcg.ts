/**
 * Atomic state of DTCG JSON
 */

import { atom } from 'jotai';
import { getDB } from '../lib/indexed-db.js';

const DB_NAME = 'tz-ds';
const DB_VERSION = 1;
const TABLE_NAME = 'tokens';
const TOKENS_ID = 'tokens.json'; // TODO: add support for multiple files

function onupgradeneeded(evt: IDBVersionChangeEvent) {
  const db = (evt.target as IDBOpenDBRequest).result as IDBDatabase;
  db.createObjectStore('tokens', { keyPath: 'id' });
}

/**
 * Load tokens from IndexedDB (NOT Jotai!)
 */
export async function loadTokens(): Promise<string> {
  if (typeof window === 'undefined') {
    return '{}';
  }

  const db = await getDB(DB_NAME, { version: DB_VERSION, onupgradeneeded });
  const tx = db.transaction(TABLE_NAME, 'readonly');
  const store = tx.objectStore(TABLE_NAME);
  const req = store.get(TOKENS_ID);
  return await new Promise<string>((resolve) => {
    req.onerror = (evt) => {
      console.error((evt.target as IDBOpenDBRequest).error);
      resolve('{}');
    };
    req.onsuccess = (evt) => resolve((evt.target as IDBRequest).result.data);
  });
}

/**
 * Save tokens to IndexedDB (NOT Jotai!)
 */
export async function saveTokens(tokens: string): Promise<void> {
  const db = await getDB(DB_NAME, { version: DB_VERSION, onupgradeneeded });
  const tx = db.transaction(TABLE_NAME, 'readwrite');
  const store = tx.objectStore(TABLE_NAME);
  const req = store.put({ id: TOKENS_ID, data: tokens });
  return await new Promise<void>((resolve, reject) => {
    req.onerror = (evt) => reject((evt.target as IDBRequest).error);
    req.onsuccess = () => resolve();
  });
}

const dtcg = atom('{}');

export default dtcg;
