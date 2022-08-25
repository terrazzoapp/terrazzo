import vue from '@astrojs/vue';
import { defineConfig } from 'astro/config';

export default defineConfig({
  integrations: [vue()],
  site: `http://cobalt-ui.pages.dev`,
});
