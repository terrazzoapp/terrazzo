import MainNav from '../components/main-nav/main-nav';
import TokensNav from '../components/tokens-nav/tokens-nav';
import c from './default.module.css';

export function DefaultLayout() {
  return (
    <>
      <MainNav />
      <div className={c.page}>
        <aside className={c.tokensNav}>
          <TokensNav />
        </aside>
        <main className={c.main}>Main content</main>
      </div>
    </>
  );
}
