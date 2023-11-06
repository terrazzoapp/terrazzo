import {defineConfig} from 'vitepress';
import packageJSON from '../../packages/cli/package.json';

const HOSTNAME = 'https://cobalt-ui.pages.dev';

/** @see https://vitepress.dev/reference/site-config */
export default defineConfig({
  title: 'Cobalt',
  description: 'Tooling to use DTFM Design Tokens anywhere',
  cleanUrls: true,
  head: [
    ['link', {rel: 'shortcut icon', type: 'image/png', href: '/favicon-32.png'}],
    ['link', {rel: 'apple-touch-icon', type: 'image/png', sizes: '128x128', href: '/favicon-128.png'}],
    ['link', {rel: 'apple-touch-icon', type: 'image/png', sizes: '512x512', href: '/favicon-512.png'}],
    ['script', {defer: '', src: 'https://static.cloudflareinsights.com/beacon.min.js', 'data-cf-beacon': '{"token": "f5713e86f9aa43278151f2763d6b59ae"}'}],
  ],
  sitemap: {
    hostname: HOSTNAME,
  },
  transformHead(context) {
    return [
      ['meta', {name: 'og:title', content: context.pageData.frontmatter.title ? `${context.pageData.frontmatter.title} | Cobalt` : 'Cobalt: CI for your Design Tokens'}],
      ['meta', {name: 'og:description', content: context.pageData.frontmatter.description || 'Use Design Tokens Format Module tokens to generate CSS, Sass, JS/TS, universal JSON, and more.'}],
      ['meta', {name: 'og:image', content: `${HOSTNAME}/social.png`}],
      ['meta', {name: 'twitter:card', content: 'summary_large_image'}],
    ];
  },
  /** @see https://vitepress.dev/reference/default-theme-config */
  themeConfig: {
    logo: '/images/cobalt-icon-solid.svg',
    nav: [
      {
        text: `v${packageJSON.version}`,
        items: [{text: 'Changelog', link: 'https://github.com/drwpow/cobalt-ui/blob/main/packages/cli/CHANGELOG.md'}],
      },
    ],
    sidebar: [
      {
        text: 'Guides',
        collapsed: false,
        items: [
          {text: 'Getting Started', link: '/guides/getting-started'},
          {text: 'tokens.json', link: '/guides/tokens'},
          {text: 'CLI', link: '/guides/cli'},
          {text: 'Modes', link: '/guides/modes'},
        ],
      },
      {
        text: 'Tokens',
        collapsed: true,
        items: [
          {text: 'Color', link: '/tokens/color'},
          {text: 'Dimension', link: '/tokens/dimension'},
          {text: 'Font Family', link: '/tokens/font-family'},
          {text: 'Font Weight', link: '/tokens/font-weight'},
          {text: 'Duration', link: '/tokens/duration'},
          {text: 'Cubic Bézier', link: '/tokens/cubic-bezier'},
          {text: 'Number', link: '/tokens/number'},
          {text: 'Link (ext)', link: '/tokens/link'},
          {text: 'Stroke Style', link: '/tokens/stroke-style'},
          {text: 'Border', link: '/tokens/border'},
          {text: 'Transition', link: '/tokens/transition'},
          {text: 'Shadow', link: '/tokens/shadow'},
          {text: 'Gradient', link: '/tokens/gradient'},
          {text: 'Typography', link: '/tokens/typography'},
          {text: 'Group', link: '/tokens/group'},
          {text: 'Alias', link: '/tokens/alias'},
          {text: 'Custom Tokens', link: '/tokens/custom'},
        ],
      },
      {
        text: 'Integrations',
        collapsed: false,
        items: [
          {text: 'CSS', link: '/integrations/css'},
          {text: 'Figma', link: '/integrations/figma'},
          {text: 'JS/TS', link: '/integrations/js'},
          {text: 'JSON/Native', link: '/integrations/json'},
          {text: 'Sass', link: '/integrations/sass'},
          {text: 'Style Dictionary', link: '/integrations/style-dictionary'},
          {text: 'Tailwind', link: '/integrations/tailwind'},
          {text: 'Other', link: '/integrations/other'},
        ],
      },
      {
        text: 'Advanced',
        collapsed: true,
        items: [
          {text: 'Config', link: '/advanced/config'},
          {text: 'Node.js API', link: '/advanced/node'},
          {text: 'Plugin API', link: '/advanced/plugin-api'},
          {text: 'CI', link: '/advanced/ci'},
          {text: 'About', link: '/advanced/about'},
        ],
      },
    ],
    search: {
      provider: 'algolia',
      options: {
        appId: '2U13I82HTZ',
        apiKey: 'b67c6e8504f5721bb7c0875d044bfddb',
        indexName: 'cobalt-ui',
      },
    },
    socialLinks: [{icon: 'github', link: 'https://github.com/drwpow/cobalt-ui'}],
  },
});
