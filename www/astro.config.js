export default {
  renderers: ['@astrojs/renderer-vue'],
  vite: {
    ssr: {
      external: ['url'],
    },
  },
};
