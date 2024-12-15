import { type ParseResult, type TokensJSONError, defineConfig, parse } from '@terrazzo/parser';
import { useStore } from '@nanostores/react';
import radix from 'dtcg-examples/figma-sds.json';
import { atom } from 'nanostores';
import { useEffect, useMemo } from 'react';
import { getDB } from '../lib/indexed-db.js';

const DEFAULT_FILENAME = 'tokens.json'; // TODO: add support for multiple files

const DB_NAME = 'tz-ds';
const DB_VERSION = 1;
const TABLE_NAME = 'tokens';
const TZ_CONFIG = defineConfig(
  {},
  {
    // CWD doesn’t matter how we’re using it
    cwd: new URL(typeof window !== 'undefined' ? window.location.href : import.meta.url),
  },
);

// tokens are saved as a STRING, not a JSON object, because:
// - it memoizes better
// - it’s higher fidelity (e.g. users may have unique spacing/formatting)
// - it’s what triggers updates to Monaco editor
// - the terrazzo parser works with strings better (for column/row errors)
const $tokens = atom('{}');
const $tokensLoaded = atom(false); // singleton to prevent multiple loads from IndexedDB
const $parseResult = atom<ParseResult>({ tokens: {}, sources: [] });
const $parseError = atom<TokensJSONError | undefined>();

/**
 * Synchronous hook that works with async IndexedDB.
 * Note that it will update after loading ONCE to load from IndexedDB
 * ⚠️ Prefer prop drilling / inheritance over using this; this is just to ensure data integrity. If consumed in too many places, can cause performance issues.
 */
export default function useTokens(filename = DEFAULT_FILENAME) {
  const tokens = useStore($tokens);
  const isLoaded = useStore($tokensLoaded);
  const parseResult = useStore($parseResult);
  const parseError = useStore($parseError);

  // load (only once)
  useEffect(() => {
    if (isLoaded) {
      return;
    }
    loadTokens(filename).then((data) => {
      const code = !data || data === '{}' ? JSON.stringify(radix, null, 2) : data;
      $tokens.set(code);
      $tokensLoaded.set(true);
    });
  }, []);

  // save
  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    $parseError.set(undefined);
    saveTokens(filename, tokens);

    (async () => {
      try {
        const result = await parse([{ filename: new URL(`file://${filename}`), src: tokens }], { config: TZ_CONFIG });
        $parseResult.set(result);
      } catch (err) {
        $parseError.set(err as TokensJSONError);
      }
    })();
  }, [tokens, isLoaded]);

  return useMemo(() => {
    return {
      tokens,
      setTokens: isLoaded ? $tokens.set : () => {}, // don’t allow data loss before loaded
      parseResult,
      parseError,
    };
  }, [filename, tokens, isLoaded, parseResult]);
}

function onupgradeneeded(ev: IDBVersionChangeEvent) {
  console.debug('indexeddb: upgradeneeded');
  const db = (ev.target as IDBOpenDBRequest).result as IDBDatabase;
  db.createObjectStore('tokens', { keyPath: 'id' });
}

/**
 * Load tokens from IndexedDB (NOT Jotai!)
 */
export async function loadTokens(filename: string): Promise<string> {
  console.time('loadTokens');
  if (typeof window === 'undefined') {
    return '{}';
  }

  const db = await getDB(DB_NAME, { version: DB_VERSION, onupgradeneeded });
  const tx = db.transaction(TABLE_NAME, 'readwrite'); // "readwrite" is needed in case the DB hasn’t been initialized
  const store = tx.objectStore(TABLE_NAME);
  const req = store.get(filename);
  return await new Promise<string>((resolve) => {
    req.onerror = (ev) => {
      console.error((ev.target as IDBOpenDBRequest).error);
      resolve('{}');
    };
    req.onsuccess = (ev) => {
      const data = (ev.target as IDBRequest).result?.data || '{}';
      console.timeEnd('loadTokens');
      resolve(data);
    };
  });
}

/**
 * Save tokens to IndexedDB (NOT Jotai!)
 */
export async function saveTokens(filename: string, tokens: string): Promise<void> {
  if (tokens === $tokens.get()) {
    return; // treat saves as idempotent
  }
  console.time('saveTokens');
  const db = await getDB(DB_NAME, { version: DB_VERSION, onupgradeneeded });
  return await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(TABLE_NAME, 'readwrite');
    const store = tx.objectStore(TABLE_NAME);
    const req = store.put({ id: filename, data: tokens });
    req.onerror = (ev) => reject((ev.target as IDBRequest).error);
    req.onsuccess = () => {
      console.timeEnd('saveTokens');
      return resolve();
    };
  });
}
