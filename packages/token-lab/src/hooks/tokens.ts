import { type ParseResult, type TokensJSONError, defineConfig, parse } from '@terrazzo/parser';
import radix from 'dtcg-examples/radix/tokens.json';
import { atom, useAtom } from 'jotai';
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
 */
export default function useTokens(filename = DEFAULT_FILENAME) {
  const [tokens, setTokens] = useAtom($tokens);
  const [isLoaded, setIsLoaded] = useAtom($tokensLoaded);
  const [parseResult, setParseResult] = useAtom($parseResult);
  const [parseError, setParseError] = useAtom($parseError);

  // load (only once)
  useEffect(() => {
    if (isLoaded) {
      return;
    }
    setIsLoaded(true); // set isLoaded FIRST to prevent race conditions
    loadTokens(filename).then((data) => {
      const code = !data || data === '{}' ? JSON.stringify(radix, null, 2) : data;
      setTokens(code);
    });
  }, []);

  // save
  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    setParseError(undefined);
    saveTokens(filename, tokens);

    (async () => {
      try {
        const result = await parse([{ filename: new URL(`file://${filename}`), src: tokens }], { config: TZ_CONFIG });
        setParseResult(result);
      } catch (err) {
        setParseError(err as TokensJSONError);
      }
    })();
  }, [tokens]);

  return useMemo(() => {
    return {
      tokens,
      setTokens: isLoaded ? setTokens : () => {}, // don’t allow data loss before loaded
      parseResult,
      parseError,
    };
  }, [filename, tokens, parseResult]);
}

function onupgradeneeded(evt: IDBVersionChangeEvent) {
  const db = (evt.target as IDBOpenDBRequest).result as IDBDatabase;
  db.createObjectStore('tokens', { keyPath: 'id' });
}

/**
 * Load tokens from IndexedDB (NOT Jotai!)
 */
export async function loadTokens(filename: string): Promise<string> {
  if (typeof window === 'undefined') {
    return '{}';
  }

  const db = await getDB(DB_NAME, { version: DB_VERSION, onupgradeneeded });
  const tx = db.transaction(TABLE_NAME, 'readonly');
  const store = tx.objectStore(TABLE_NAME);
  const req = store.get(filename);
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
export async function saveTokens(filename: string, tokens: string): Promise<void> {
  const db = await getDB(DB_NAME, { version: DB_VERSION, onupgradeneeded });
  const tx = db.transaction(TABLE_NAME, 'readwrite');
  const store = tx.objectStore(TABLE_NAME);
  const req = store.put({ id: filename, data: tokens });
  return await new Promise<void>((resolve, reject) => {
    req.onerror = (evt) => reject((evt.target as IDBRequest).error);
    req.onsuccess = () => resolve();
  });
}
