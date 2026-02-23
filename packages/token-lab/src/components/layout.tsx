import { Link } from '@tanstack/react-router';
import '../styles/tokens.css';
import '../styles/global.css';
import * as c from './layout.css.js';

export interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className={c.layout}>
      <nav aria-label='Main' className={c.sidebar}>
        <ul className={c.sidebarList}>
          <li className={c.sidebarListItem}>
            <Link to='/' className={c.sidebarLink}>
              <svg className={c.logo} aria-hidden fill='none' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='m19.9333 21.792s0 1.5596-1.7302 1.5596h-16.47285c-1.73025 0-1.73025-1.5596-1.73025-1.5596z'
                  fill='#8cd10c'
                />
                <g fill='currentColor'>
                  <path d='m8.9733.5h-8.747783c-.124035 0-.225517.101495-.225517.225544v8.748856c0 .20074.24243.3011.384506.15901l8.748914-8.748857c.14207-.142093.04172-.384553-.15899-.384553z' />
                  <path d='m19.9334 9.4744v-8.748856c0-.124049-.1015-.225544-.2255-.225544h-8.7489c-.2007 0-.3011.24246-.159.384553l8.7488 8.748857c.1421.14209.3846.04173.3846-.15901z' />
                  <path d='m10.959 20.4333h8.7489c.124 0 .2255-.1015.2255-.2255v-8.7489c0-.2007-.2425-.3011-.3846-.159l-8.7488 8.7489c-.1421.1421-.0417.3845.159.3845z' />
                  <path d='m8.9744 20.4333h-8.748856c-.124049 0-.225544-.1015-.225544-.2255v-8.7489c0-.2007.24246-.3011.384553-.159l8.748857 8.7489c.14209.1421.04173.3845-.15901.3845z' />
                </g>
              </svg>
              Token Lab
            </Link>
          </li>
          <li className={c.sidebarListItem}>
            <Link to='/sources' className={c.sidebarLink}>
              Sources
            </Link>
          </li>
          <li className={c.sidebarListItem}>
            <Link to='/resolver' className={c.sidebarLink}>
              Resolver
            </Link>
          </li>
          <li className={c.sidebarListItem}>
            <Link to='/linting' className={c.sidebarLink}>
              Linting
            </Link>
          </li>
          <li className={c.sidebarListItem}>
            <Link to='/output' className={c.sidebarLink}>
              Output
            </Link>
          </li>
          <li className={c.sidebarListItem}>
            <Link to='/config' className={c.sidebarLink}>
              Config
            </Link>
          </li>
          <li className={c.sidebarListItem}>
            <Link to='https://terrazzo.app/docs' className={c.sidebarLink}>
              Docs
            </Link>
          </li>
        </ul>
      </nav>

      <main className={c.main}>{children}</main>
    </div>
  );
}
