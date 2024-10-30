import MainNav from '../../components/MainNav/MainNav.js';
import TokensEditor from '../../components/TokensEditor/TokensEditor.js';
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
        <main className={c.main}>
          <TokensEditor />
        </main>
      </div>
    </div>
  );
}
