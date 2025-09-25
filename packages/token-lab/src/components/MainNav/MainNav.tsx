import CodePanel from '../CodePanel/CodePanel.js';
import Logo from '../Logo/Logo.js';
import ThemePicker from '../ThemePicker/ThemePicker.js';
import c from './MainNav.module.css';

export default function MainNav() {
  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: false "banner" is nameable
    <header className={c.header} aria-label='Header'>
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
