import { defineConfig, type ParseResult, parse, type TokensJSONError } from '@terrazzo/parser';
import radix from 'dtcg-examples/figma-sds.json' with { type: 'json' };
import { atom, useAtom } from 'jotai';
import { createContext, use, useEffect, useMemo } from 'react';
import { getDB } from '../lib/indexed-db.js';

export const TokensFileContext = createContext<
  [tokens: string | undefined, onUpdate: ((tokens: string) => unknown) | undefined]
>([undefined, undefined]);

const DEFAULT_FILENAME = 'tokens.json'; // TODO: add support for multiple files

const DB_NAME = 'tz-ds';
const DB_VERSION = 1;
const TABLE_NAME = 'tokens';
const TZ_CONFIG = defineConfig(
  {},
  {
    // CWD doesn't matter how we're using it
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
  const [tokens, setTokens] = useAtom($tokens);
  const [isLoaded, setIsLoaded] = useAtom($tokensLoaded);
  const [parseResult, setParseResult] = useAtom($parseResult);
  const [parseError, setParseError] = useAtom($parseError);
  const [contextTokens, contextTokensOnUpdate] = use(TokensFileContext);

  // load (only once)
  useEffect(() => {
    if (isLoaded) {
      return;
    }
    setIsLoaded(true); // set isLoaded FIRST to prevent race conditions
    loadTokens(filename).then((data) => {
      if (data && data !== '{}') {
        // Use IndexedDB data if available
        setTokens(data);
      } else if (contextTokens) {
        // Use context tokens if provided and IndexedDB is empty
        setTokens(contextTokens);
      } else {
        // Fallback to default Figma SDS tokens
        setTokens(JSON.stringify(radix, null, 2));
      }
    });
  }, []);

  // save
  useEffect(() => {
    if (!isLoaded) {
      return;
    }
    setParseError(undefined);
    saveTokens(filename, tokens);
    contextTokensOnUpdate?.(tokens);

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

function onupgradeneeded(ev: IDBVersionChangeEvent) {
  const db = (ev.target as IDBOpenDBRequest).result as IDBDatabase;
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
  const tx = db.transaction(TABLE_NAME, 'readwrite'); // "readwrite" is needed in case the DB hasn’t been initialized
  const store = tx.objectStore(TABLE_NAME);
  const req = store.get(filename);
  return await new Promise<string>((resolve) => {
    req.onerror = (_ev) => {
      resolve('{}');
    };
    req.onsuccess = (ev) => {
      const data = (ev.target as IDBRequest).result?.data || '{}';
      resolve(data);
    };
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
    req.onerror = (ev) => reject((ev.target as IDBRequest).error);
    req.onsuccess = () => resolve();
  });
}
