import MainNav from '../components/main-nav/main-nav.js';
import c from './Default/default.module.css.js';

export function DefaultLayout() {
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
