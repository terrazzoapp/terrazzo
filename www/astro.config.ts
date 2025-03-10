import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import remarkDirective from 'remark-directive';
import rehypeAutoToc from './src/plugins/rehype-auto-toc.js';
import remarkVitepress from './src/plugins/remark-vitepress.js';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx(), sitemap()],
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
});
