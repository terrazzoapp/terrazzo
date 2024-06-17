import react from '@astrojs/react';
import mdx from '@astrojs/mdx';
import { defineConfig } from 'astro/config';
import json5 from 'json5';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeSlug from 'rehype-slug';
import fs from 'node:fs';
import remarkDirective from 'remark-directive';
import rehypeAutoToc from './src/plugins/rehype-auto-toc.js';
import remarkVitepress from './src/plugins/remark-vitepress.js';

// https://astro.build/config
export default defineConfig({
  integrations: [react(), mdx()],
  site: 'https://terrazzo.ds',
  markdown: {
    shikiConfig: {
      theme: json5.parse(fs.readFileSync(new URL('./src/themes/citree.json', import.meta.url), 'utf8')),
    },
    remarkRehype: {
      allowDangerousHtml: true,
    },
    remarkPlugins: [remarkDirective, remarkVitepress],
    rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings, rehypeAutoToc],
  },
});
