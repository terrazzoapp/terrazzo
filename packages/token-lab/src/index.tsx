import { useRouter } from './hooks/router.js';
import Config from './pages/config.js';
import Index from './pages/index.js';
import Linting from './pages/linting.js';
import NotFoundError from './pages/not-found-error.js';
import Output from './pages/output.js';
import Resolver from './pages/resolver.js';
import Sources from './pages/sources.js';
import './tailwind.config.css';

export default function App() {
  const { page } = useRouter();

  switch (page) {
    case 'index': {
      return <Index />;
    }
    case 'config': {
      return <Config />;
    }
    case 'linting': {
      return <Linting />;
    }
    case 'output': {
      return <Output />;
    }
    case 'resolver': {
      return <Resolver />;
    }
    case 'sources': {
      return <Sources />;
    }
    default: {
      return <NotFoundError />;
    }
  }
}
