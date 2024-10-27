import MainNav from '../../components/MainNav/MainNav.js';
import TokensNav from '../../components/TokensNav/TokensNav.js';
import c from './Default.module.css';

export function DefaultLayout() {
  return (
    <div className={c.layout}>
      <MainNav />
      <div className={c.page}>
        <aside className={c.sidebar}>
          <TokensNav />
        </aside>
        <main className={c.main}>Main content</main>
      </div>
    </div>
  );
}
