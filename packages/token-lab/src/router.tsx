import { createRouter } from '@tanstack/react-router';
import { routeTree } from './routeTree.gen.js';

export function getRouter() {
  const router = createRouter({
    routeTree,
    scrollRestoration: true,
  });

  return router;
}
