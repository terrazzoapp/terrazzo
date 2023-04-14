import pluginCSS from '@cobalt-ui/plugin-css';
import pluginSass from '@cobalt-ui/plugin-sass';

/** @type import('@cobalt-ui/core').Config */
export default {
  plugins: [
    pluginCSS({
      modeSelectors: {
        'ui#light': ['body[data-color-mode="light"]'],
        'ui#dark': ['body[data-color-mode="dark"]', '@media(prefers-color-scheme:dark)'],
      },
    }),
    pluginSass(),
  ],
  figma: {
    docs: [
      {
        url: 'https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/Cobalt-Test?node-id=2%3A2',
        tokens: [
          // colors
          {style: 'Black', token: 'color.black', type: 'color'},
          {style: 'Blue', token: 'color.blue', type: 'color'},
          {style: 'Dark Gray', token: 'color.dark-gray', type: 'color'},
          {style: 'Green', token: 'color.green', type: 'color'},
          {style: 'Purple', token: 'color.purple', type: 'color'},
          {style: 'Red', token: 'color.red', type: 'color'},
          {style: 'White', token: 'color.white', type: 'color'},
          {style: 'Red Gradient', token: 'gradient.red', type: 'gradient'},

          // typography
          {style: 'Brand Sans', token: 'typography.family.brand', type: 'fontFamily'},
          {style: 'Heading 1', token: 'typography.heading-1', type: 'typography'},
          {style: 'Heading 2', token: 'typography.heading-2', type: 'typography'},
          {style: 'Heading 3', token: 'typography.heading-3', type: 'typography'},
          {style: 'Body', token: 'typography.body', type: 'typography'},

          // icons
          {component: 'cloud--download', token: 'icon.cloud-download', type: 'file', filename: './icon/cloud-download.svg'},
          {component: 'cloud--upload', token: 'icon.cloud-upload', type: 'file', filename: './icon/cloud-upload.svg'},
          {component: 'crop', token: 'icon.crop', type: 'file', filename: './icon/crop.svg'},
          {component: 'delete', token: 'icon.delete', type: 'file', filename: './icon/delete.svg'},
          {component: 'do-not--02', token: 'icon.do-not-2', type: 'file', filename: './icon/do-not-2.svg'},
          {component: 'do-not', token: 'icon.do-not', type: 'file', filename: './icon/do-not.svg'},
          {component: 'download--01', token: 'icon.download-1', type: 'file', filename: './icon/download-1.svg'},
          {component: 'download--02', token: 'icon.download-2', type: 'file', filename: './icon/download-2.svg'},
          {component: 'embed', token: 'icon.embed', type: 'file', filename: './icon/embed.svg'},
          {component: 'export--01', token: 'icon.export-1', type: 'file', filename: './icon/export-1.svg'},
          {component: 'export--02', token: 'icon.export-2', type: 'file', filename: './icon/export-2.svg'},
          {component: 'launch', token: 'icon.launch', type: 'file', filename: './icon/launch.svg'},
          {component: 'love', token: 'icon.love', type: 'file', filename: './icon/love.svg'},
          {component: 'maximize', token: 'icon.maximize', type: 'file', filename: './icon/maximize.svg'},
          {component: 'minimize', token: 'icon.minimize', type: 'file', filename: './icon/minimize.svg'},
          {component: 'paperclip', token: 'icon.paperclip', type: 'file', filename: './icon/paperclip.svg'},
          {component: 'player--flow', token: 'icon.player-flow', type: 'file', filename: './icon/player-flow.svg'},
          {component: 'refresh', token: 'icon.refresh', type: 'file', filename: './icon/refresh.svg'},
          {component: 'renew', token: 'icon.renew', type: 'file', filename: './icon/renew.svg'},
          {component: 'repeat', token: 'icon.repeat', type: 'file', filename: './icon/repeat.svg'},
          {component: 'reset', token: 'icon.reset', type: 'file', filename: './icon/reset.svg'},
          {component: 'trash', token: 'icon.trash', type: 'file', filename: './icon/trash.svg'},
          {component: 'upload--01', token: 'icon.upload-1', type: 'file', filename: './icon/upload-1.svg'},
          {component: 'upload--02', token: 'icon.upload-2', type: 'file', filename: './icon/upload-2.svg'},

          // shadows
          {style: 'Distance / Near', token: 'distance.near', type: 'shadow'},
          {style: 'Distance / Med', token: 'distance.med', type: 'shadow'},
          {style: 'Distance / Far', token: 'distance.far', type: 'shadow'},
        ],
      },
    ],
    optimize: {
      svgo: {},
    },
  },
};
