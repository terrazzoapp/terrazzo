import radix from 'dtcg-examples/radix/tokens.json';
import { useAtom } from 'jotai';
import { useEffect } from 'react';
import dtcg, { loadTokens, saveTokens } from '../atoms/dtcg.js';
import MainNav from '../components/main-nav/main-nav.js';
import c from './default.module.css';

export function DefaultLayout() {
  const [tokens, setTokens] = useAtom(dtcg);

  // on mount, load last-saved tokens (or Radix by default)
  useEffect(() => {
    (async () => {
      let code = await loadTokens();
      if (!code || code.trim() === '{}') {
        code = JSON.stringify(radix, null, 2);
        saveTokens(code);
      }
      setTokens(code);
    })();
  }, []);

  return (
    <>
      <MainNav />
      <div className={c.page}>
        <aside className={c.sidebar}>Tokens</aside>
        <main className={c.main}>Main content</main>
      </div>
    </>
  );
}
