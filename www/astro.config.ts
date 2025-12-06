import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkDirective from 'remark-directive';
import rehypeAutoToc from './src/plugins/rehype-auto-toc.js';
import remarkVitepress from './src/plugins/remark-vitepress.js';

// https://astro.build/config
export default defineConfig({
  integrations: [react({ devTarget: 'esnext' }), mdx(), sitemap()],
  site: 'https://terrazzo.app',
  devToolbar: {
    enabled: false,
  },
  markdown: {
    shikiConfig: {
      theme: 'ayu-dark',
    },
    remarkRehype: {
      allowDangerousHtml: true,
    },
    remarkPlugins: [remarkDirective, remarkVitepress],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, rehypeAutoToc],
  },
  redirects: {
    '/docs/cli/api/js/': '/docs/reference/js-api/',
    '/docs/cli/api/node/': '/docs/reference/js-api/',
    '/docs/cli/api/plugin-development/': '/docs/reference/plugin-api/',
    '/docs/cli/commands/': '/docs/reference/cli-api/',
    '/docs/cli/config/': '/docs/reference/config/',
    '/docs/cli/integrations/css/': '/docs/integrations/css/',
    '/docs/cli/integrations/custom/': '/docs/integrations/custom/',
    '/docs/cli/integrations/js/': '/docs/integrations/js/',
    '/docs/cli/integrations/sass/': '/docs/integrations/sass/',
    '/docs/cli/integrations/swift/': '/docs/integrations/swift/',
    '/docs/cli/integrations/tailwind/': '/docs/integrations/tailwind/',
    '/docs/cli/integrations/vanilla-extract/': '/docs/integrations/vanilla-extract/',
    '/docs/cli/lint/': '/docs/linting/',
    '/docs/cli/migrating/': '/docs/guides/migrating-cobalt/',
    '/docs/cli/': '/docs/',
  },
});
