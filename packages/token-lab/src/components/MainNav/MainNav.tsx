import CodePanel from '../CodePanel/CodePanel.js';
import Logo from '../Logo/Logo.js';
import ThemePicker from '../ThemePicker/ThemePicker.js';
import c from './MainNav.module.css';

export default function MainNav() {
  return (
    <header className={c.header}>
      <h1 className={c.title}>
        <Logo className={c.logo} />
        Token Lab
      </h1>
      <div className={c.actions}>
        <ThemePicker />
        <CodePanel />
      </div>
    </header>
  );
}
