import { type ParseResult, defineConfig, parse } from '@terrazzo/parser';
import figmaSDS from 'dtcg-examples/figma-sds.json' with { type: 'json' };
import { createContext, useCallback, useEffect, useState } from 'react';
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

export class TokenLoader {
  filename: string;
  public tokensRaw = '{}';
  public json: Record<string, any> = {};
  public parseResult: ParseResult | undefined;
  public tokens: ParseResult['tokens'] | undefined;
  public parseError: string | undefined;
  private isLoading = false;

  constructor(
    /** filename to be retrieved from IndexedDB */
    filename: string,
  ) {
    this.filename = filename;
  }

  /** Retrieve tokens from IndexedDB */
  async load(): Promise<void> {
    if (typeof window === 'undefined') {
      this.tokensRaw = '{}';
      this.json = JSON.parse(this.tokensRaw);
      return;
    }

    // allow idempotent calls while loading
    if (this.isLoading) {
      return;
    }

    this.isLoading = true;
    const db = await getDB(DB_NAME, { version: DB_VERSION, onupgradeneeded });
    const tx = db.transaction(TABLE_NAME, 'readwrite'); // "readwrite" is needed in case the DB hasn’t been initialized
    const store = tx.objectStore(TABLE_NAME);
    const req = store.get(this.filename);
    try {
      this.tokensRaw = await new Promise<string>((resolve, reject) => {
        req.onerror = (ev) => {
          reject(ev);
        };
        req.onsuccess = (ev) => {
          const data = (ev.target as IDBRequest).result?.data || '{}';
          resolve(data);
        };
      });
    } catch (err) {
      // biome-ignore lint/suspicious/noConsole: intentional
      console.warn(`Couldn’t load ${this.filename}. ${err}`);
      this.tokensRaw = JSON.stringify(figmaSDS);
    }
    await this.reparse();
    this.isLoading = false;
  }

  /**
   * Update tokens in IndexedDB
   * tokens are saved as a STRING, not a JSON object, because:
   * - it memoizes better
   * - it’s higher fidelity (e.g. users may have unique spacing/formatting)
   *- it’s what triggers updates to Monaco editor
   * - the terrazzo parser works with strings better (for column/row errors)
   */
  async save(newValue: string): Promise<void> {
    this.tokensRaw = newValue;
    this.json = JSON.parse(this.tokensRaw);
    await this.reparse();
    const db = await getDB(DB_NAME, { version: DB_VERSION, onupgradeneeded });
    const tx = db.transaction(TABLE_NAME, 'readwrite');
    const store = tx.objectStore(TABLE_NAME);
    const req = store.put({ id: this.filename, data: newValue });
    await new Promise<void>((resolve, reject) => {
      req.onerror = (ev) => reject((ev.target as IDBRequest).error);
      req.onsuccess = () => resolve();
    });
  }

  /** Reparse and re-update tokens */
  async reparse(): Promise<void> {
    this.parseError = undefined;
    try {
      this.parseResult = await parse([{ src: this.tokensRaw, filename: new URL(`file:///${this.filename}`) }], {
        config: TZ_CONFIG,
      });
    } catch (err) {
      this.parseError = String(err);
    }
    if (this.parseResult?.tokens) {
      this.tokens = this.parseResult.tokens;
    }
  }
}

const allTokens = new Map<string, TokenLoader>();

/**
 * Synchronous hook that works with async IndexedDB.
 * Note that it will update after loading ONCE to load from IndexedDB
 */
export default function useTokensLoader(filename = DEFAULT_FILENAME): [TokenLoader, (newValue: string) => void] {
  const [tokenLoader, setTokenLoader] = useState<TokenLoader>(new TokenLoader(filename));

  useEffect(() => {
    if (!filename) {
      return;
    }
    let newTokenLoader = allTokens.get(filename);
    if (!newTokenLoader) {
      newTokenLoader = new TokenLoader(filename);
      allTokens.set(filename, newTokenLoader);
    }
    setTokenLoader((value) => value);

    newTokenLoader.load().then(() => {
      setTokenLoader(newTokenLoader); // set to self to force update
    });
  }, [filename]);

  const setTokens = useCallback(
    (newValue: string) => {
      tokenLoader.save(newValue).then(() => {
        setTokenLoader(tokenLoader); // set to self to force update
      });
    },
    [tokenLoader],
  );

  return [tokenLoader, setTokens];
}

function onupgradeneeded(ev: IDBVersionChangeEvent) {
  const db = (ev.target as IDBOpenDBRequest).result as IDBDatabase;
  db.createObjectStore('tokens', { keyPath: 'id' });
}
