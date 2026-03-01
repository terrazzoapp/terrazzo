import { Button } from '@base-ui/react/button';
import { Config, Docs, Lint, Output, Resolver, Token } from '@terrazzo/icons';
import Link from '../components/link.js';

export interface LayoutProps {
  children?: React.ReactNode;
}

export default function LayoutDefault({ children }: LayoutProps) {
  return (
    <div className='grid-cols-[10rem auto] grid-rows-[3rem auto] grid-areas min-h-svh'>
      <header className='bg-2'>
        <Link
          page='index'
          className='items-center border-bottom flex gap-2 font-bold h-[3rem] no-underline px-4 w-full'
        >
          <svg
            className='w-[1.25rem] h-[1.25rem]'
            aria-hidden
            fill='none'
            viewBox='0 0 24 24'
            xmlns='http://www.w3.org/2000/svg'
          >
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
        <nav aria-label='Main' className='flex-col content-center border-right'>
          <ul>
            <li>
              <Link page='sources'>
                <Token />
                Sources
              </Link>
            </li>
            <li>
              <Link page='resolver'>
                <Resolver />
                Resolver
              </Link>
            </li>
            <li>
              <Link page='linting'>
                <Lint />
                Linting
              </Link>
            </li>
            <li>
              <Link page='output'>
                <Output />
                Output
              </Link>
            </li>
          </ul>
        </nav>
        <nav>
          <ul>
            <li>
              <Link page='config'>
                <Config />
                Config
              </Link>
            </li>
            <li>
              <a href='https://terrazzo.app/docs'>
                <Docs />
                Docs
              </a>
            </li>
          </ul>
        </nav>
      </header>

      <section>
        <header>
          <Button>+ New</Button>
        </header>
      </section>

      <main>{children}</main>
    </div>
  );
}
