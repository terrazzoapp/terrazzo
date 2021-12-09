import sass from '@cobalt-ui/plugin-sass';
import ts from '@cobalt-ui/plugin-ts';
import json from '@cobalt-ui/plugin-json';

export default {
  plugins: [sass(), ts(), json()],
  figma: {
    'https://www.figma.com/file/Mm0nTq0UXZKG1WXu7PeCmS/Cobalt-Test?node-id=2%3A2': {
      // colors
      'Black':            {group: 'color', fill: ['default', 'light']},
      'Blue':             {group: 'color', fill: ['default', 'light']},
      'Dark Gray':        {group: 'color', name: 'Dark_Gray', fill: ['default', 'light']},
      'Green':            {group: 'color', fill: ['default', 'light']},
      'Purple':           {group: 'color', fill: ['default', 'light']},
      'Red':              {group: 'color', fill: ['default', 'light']},
      'White':            {group: 'color', fill: ['default', 'light']},

      // icons
      'cloud--download':  {group: 'icon', file: './public/icons/cloud--download.svg'},
      'cloud--upload':    {group: 'icon', file: './public/icons/cloud--upload.svg'},
      'crop':             {group: 'icon', file: './public/icons/crop.svg'},
      'delete':           {group: 'icon', file: './public/icons/delete.svg'},
      'do-not':           {group: 'icon', file: './public/icons/do-not.svg'},
      'do-not--02':       {group: 'icon', file: './public/icons/do-not--02.svg'},
      'download--01':     {group: 'icon', file: './public/icons/download--01.svg'},
      'download--02':     {group: 'icon', file: './public/icons/download--02.svg'},
      'embed':            {group: 'icon', file: './public/icons/embed.svg'},
      'export--01':       {group: 'icon', file: './public/icons/export--01.svg'},
      'export--02':       {group: 'icon', file: './public/icons/export--02.svg'},
      'launch':           {group: 'icon', file: './public/icons/launch.svg'},
      'love':             {group: 'icon', file: './public/icons/love.svg'},
      'minimize':         {group: 'icon', file: './public/icons/minimize.svg'},
      'paperclip':        {group: 'icon', file: './public/icons/paperclip.svg'},
      'player--flow':     {group: 'icon', file: './public/icons/player--flow.svg'},
      'renew':            {group: 'icon', file: './public/icons/renew.svg'},
      'repeat':           {group: 'icon', file: './public/icons/repeat.svg'},
      'reset':            {group: 'icon', file: './public/icons/reset.svg'},
      'trash':            {group: 'icon', file: './public/icons/trash.svg'},
      'upload--01':       {group: 'icon', file: './public/icons/upload--01.svg'},
      'upload--02':       {group: 'icon', file: './public/icons/upload--02.svg'},
    },
  },
};
