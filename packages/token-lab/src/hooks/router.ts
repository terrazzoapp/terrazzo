import { useCallback, useMemo, useState } from 'react';

/** Top-level page */
export type Page = 'index' | 'sources' | 'resolver' | 'linting' | 'config' | 'output';

/** Client-side search param router */
export function useRouter() {
  const [search, setSearch] = useState(() => {
    const s = new URLSearchParams(globalThis.location?.search);
    if (!s.get('page')) {
      s.set('page', 'index');
    }
    return s;
  });

  const updateSearch = useCallback(
    (params: Record<string, string | null>) => {
      const newS = new URLSearchParams(search);
      for (const [k, v] of Object.entries(params)) {
        if (k === 'page') {
          validatePage(v);
        }
        if (v === null) {
          newS.delete(k);
        } else {
          newS.set(k, v);
        }
        globalThis.location.search = newS.toString();
        setSearch(newS);
      }
    },
    [search],
  );

  const page = useMemo(() => search.get('page'), [search]);

  const setPage = useCallback(
    (page: Page) => {
      validatePage(page);
      updateSearch({ page });
    },
    [updateSearch],
  );

  return useMemo(() => ({ page, search, setPage, setSearch: updateSearch }), [page, search, setPage, updateSearch]);
}

function validatePage(page: string | undefined | null) {
  if (!page || !['index', 'tokens', 'linting', 'config'].includes(page)) {
    throw Error(`Invalid page: ${page}`);
  }
}
