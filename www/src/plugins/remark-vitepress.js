import { nanoid } from 'nanoid';
import { visit } from 'unist-util-visit';

/**
 * “We have Vitepress at home”
 * Implements https://vitepress.dev/guide/markdown in remark.
 * Requires remark-directive
 */

const CONTAINER_DIRECTIVE = 'containerDirective';

const ICON = {
  caution:
    '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" role="graphics-symbol img" aria-hidden="true"><path d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.07 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12 13.8939 12H1.10608C1.02849 12 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81221 4.10423 7.11783 3.78663 7.5 3.78663C7.88217 3.78663 8.18778 4.10423 8.1731 4.48612L8.01921 8.48701C8.00848 8.766 7.7792 8.98664 7.5 8.98664C7.2208 8.98664 6.99151 8.766 6.98078 8.48701L6.8269 4.48611ZM8.24989 10.476C8.24989 10.8902 7.9141 11.226 7.49989 11.226C7.08567 11.226 6.74989 10.8902 6.74989 10.476C6.74989 10.0618 7.08567 9.72599 7.49989 9.72599C7.9141 9.72599 8.24989 10.0618 8.24989 10.476Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>',
  copy: '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" role="graphics-symbol img" aria-hidden="true"><path d="M1 9.50006C1 10.3285 1.67157 11.0001 2.5 11.0001H4L4 10.0001H2.5C2.22386 10.0001 2 9.7762 2 9.50006L2 2.50006C2 2.22392 2.22386 2.00006 2.5 2.00006L9.5 2.00006C9.77614 2.00006 10 2.22392 10 2.50006V4.00002H5.5C4.67158 4.00002 4 4.67159 4 5.50002V12.5C4 13.3284 4.67158 14 5.5 14H12.5C13.3284 14 14 13.3284 14 12.5V5.50002C14 4.67159 13.3284 4.00002 12.5 4.00002H11V2.50006C11 1.67163 10.3284 1.00006 9.5 1.00006H2.5C1.67157 1.00006 1 1.67163 1 2.50006V9.50006ZM5 5.50002C5 5.22388 5.22386 5.00002 5.5 5.00002H12.5C12.7761 5.00002 13 5.22388 13 5.50002V12.5C13 12.7762 12.7761 13 12.5 13H5.5C5.22386 13 5 12.7762 5 12.5V5.50002Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>',
  important:
    '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" role="graphics-symbol img" aria-hidden="true"><path d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.07 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12 13.8939 12H1.10608C1.02849 12 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81221 4.10423 7.11783 3.78663 7.5 3.78663C7.88217 3.78663 8.18778 4.10423 8.1731 4.48612L8.01921 8.48701C8.00848 8.766 7.7792 8.98664 7.5 8.98664C7.2208 8.98664 6.99151 8.766 6.98078 8.48701L6.8269 4.48611ZM8.24989 10.476C8.24989 10.8902 7.9141 11.226 7.49989 11.226C7.08567 11.226 6.74989 10.8902 6.74989 10.476C6.74989 10.0618 7.08567 9.72599 7.49989 9.72599C7.9141 9.72599 8.24989 10.0618 8.24989 10.476Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>',
  info: '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" role="graphics-symbol img" aria-hidden="true"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>',
  note: '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" role="graphics-symbol img" aria-hidden="true"><path d="M7.49991 0.876892C3.84222 0.876892 0.877075 3.84204 0.877075 7.49972C0.877075 11.1574 3.84222 14.1226 7.49991 14.1226C11.1576 14.1226 14.1227 11.1574 14.1227 7.49972C14.1227 3.84204 11.1576 0.876892 7.49991 0.876892ZM1.82707 7.49972C1.82707 4.36671 4.36689 1.82689 7.49991 1.82689C10.6329 1.82689 13.1727 4.36671 13.1727 7.49972C13.1727 10.6327 10.6329 13.1726 7.49991 13.1726C4.36689 13.1726 1.82707 10.6327 1.82707 7.49972ZM8.24992 4.49999C8.24992 4.9142 7.91413 5.24999 7.49992 5.24999C7.08571 5.24999 6.74992 4.9142 6.74992 4.49999C6.74992 4.08577 7.08571 3.74999 7.49992 3.74999C7.91413 3.74999 8.24992 4.08577 8.24992 4.49999ZM6.00003 5.99999H6.50003H7.50003C7.77618 5.99999 8.00003 6.22384 8.00003 6.49999V9.99999H8.50003H9.00003V11H8.50003H7.50003H6.50003H6.00003V9.99999H6.50003H7.00003V6.99999H6.50003H6.00003V5.99999Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>',
  tip: '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" role="graphics-symbol img" aria-hidden="true"><path d="M8.69667 0.0403541C8.90859 0.131038 9.03106 0.354857 8.99316 0.582235L8.0902 6.00001H12.5C12.6893 6.00001 12.8625 6.10701 12.9472 6.27641C13.0319 6.4458 13.0136 6.6485 12.8999 6.80001L6.89997 14.8C6.76167 14.9844 6.51521 15.0503 6.30328 14.9597C6.09135 14.869 5.96888 14.6452 6.00678 14.4178L6.90974 9H2.49999C2.31061 9 2.13748 8.893 2.05278 8.72361C1.96809 8.55422 1.98636 8.35151 2.09999 8.2L8.09997 0.200038C8.23828 0.0156255 8.48474 -0.0503301 8.69667 0.0403541ZM3.49999 8.00001H7.49997C7.64695 8.00001 7.78648 8.06467 7.88148 8.17682C7.97648 8.28896 8.01733 8.43723 7.99317 8.5822L7.33027 12.5596L11.5 7.00001H7.49997C7.353 7.00001 7.21347 6.93534 7.11846 6.8232C7.02346 6.71105 6.98261 6.56279 7.00678 6.41781L7.66968 2.44042L3.49999 8.00001Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>',
  warning:
    '<svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" role="graphics-symbol img" aria-hidden="true"><path d="M8.4449 0.608765C8.0183 -0.107015 6.9817 -0.107015 6.55509 0.608766L0.161178 11.3368C-0.275824 12.07 0.252503 13 1.10608 13H13.8939C14.7475 13 15.2758 12.07 14.8388 11.3368L8.4449 0.608765ZM7.4141 1.12073C7.45288 1.05566 7.54712 1.05566 7.5859 1.12073L13.9798 11.8488C14.0196 11.9154 13.9715 12 13.8939 12H1.10608C1.02849 12 0.980454 11.9154 1.02018 11.8488L7.4141 1.12073ZM6.8269 4.48611C6.81221 4.10423 7.11783 3.78663 7.5 3.78663C7.88217 3.78663 8.18778 4.10423 8.1731 4.48612L8.01921 8.48701C8.00848 8.766 7.7792 8.98664 7.5 8.98664C7.2208 8.98664 6.99151 8.766 6.98078 8.48701L6.8269 4.48611ZM8.24989 10.476C8.24989 10.8902 7.9141 11.226 7.49989 11.226C7.08567 11.226 6.74989 10.8902 6.74989 10.476C6.74989 10.0618 7.08567 9.72599 7.49989 9.72599C7.9141 9.72599 8.24989 10.0618 8.24989 10.476Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>',
};

export default function remarkVitepress() {
  return function transform(tree) {
    visit(tree, (node) => {
      if (node.type === CONTAINER_DIRECTIVE) {
        switch (node.name) {
          // :::note, :::tip, :::warning, etc.
          case 'caution':
          case 'danger':
          case 'important':
          case 'info':
          case 'note':
          case 'tip':
          case 'warning': {
            node.type = 'paragraph';
            node.data = { hName: 'div', hProperties: { className: ['callout', `callout--${node.name}`] } };
            node.children.unshift({
              type: 'html',
              value: `<div class="callout-indicator">${ICON[node.name] ?? ''}${
                node.attributes?.title ?? node.name
              }</div>`,
            });
            break;
          }

          // :::details
          case 'details': {
            node.type = 'details';
            node.data = { hName: 'details' };
            node.children.unshift({ type: 'html', value: `<summary>${node.attributes.title ?? ''}</summary>` });
            break;
          }
          // :::npm (codeblock but with npm/bun/pnpm) {
          case 'npm': {
            node.type = 'paragraph';
            node.data = { hName: 'div', hProperties: { className: ['code-group'] } };
            const id = nanoid(5);
            const cmd = node.children.find((c) => c.type === 'code');
            node.children = [
              {
                type: 'html',
                value: `<div class="code-group-tabs" role="tablist">${['npm', 'pnpm', 'bun']
                  .map(
                    (cli, i) =>
                      `<button class="code-group-tab" type="button" role="tab" aria-controls="tab-${id}-${i}"${
                        i === 0 ? ' aria-selected="true"' : ''
                      }>${cli}</button>`,
                  )
                  .join('')}</div>`,
              },
              ...['npm', 'pnpm', 'bun'].map((cli, i) => ({
                type: 'paragraph',
                data: {
                  hName: 'div',
                  hProperties: {
                    id: `tab-${id}-${i}`,
                    className: ['code-group-tabpanel'],
                    role: 'tabpanel',
                    hidden: i !== 0 ? 'hidden' : undefined,
                  },
                },
                children: [
                  {
                    ...cmd,
                    value: cmd.value.replace(/^(npm|pnpm|bun)/, cli),
                  },
                ],
              })),
            ];
            break;
          }

          // :::code-group
          case 'code-group': {
            node.type = 'paragraph';
            node.data = { hName: 'div', hProperties: { className: ['code-group'] } };
            const children = [...node.children];
            const id = nanoid(5);
            const codeBlocks = children.filter((cb) => cb.type === 'code');
            node.children = [
              {
                type: 'html',
                value: `<div class="code-group-tabs" role="tablist">${codeBlocks
                  .map(
                    (cb, i) =>
                      `<button class="code-group-tab" type="button" role="tab" aria-controls="tab-${id}-${i}"${
                        i === 0 ? ' aria-selected="true"' : ''
                      }>${(cb.meta ?? 'code').replace(/\[([^\]]+)\]/, '$1')}</button>`,
                  )
                  .join('')}</div>`,
              },
              ...codeBlocks.map((node, i) => ({
                type: 'paragraph',
                data: {
                  hName: 'div',
                  hProperties: {
                    id: `tab-${id}-${i}`,
                    className: ['code-group-tabpanel'],
                    role: 'tabpanel',
                    hidden: i !== 0 ? 'hidden' : undefined,
                  },
                },
                children: [node],
              })),
            ];
          }
        }
      }

      // copy button
      if (node.type === 'code' && !node.data?.processed) {
        const code = { ...node, data: { processed: true } };
        node.type = 'paragraph';
        node.data = { hName: 'div', hProperties: { className: ['code-block-wrapper'], 'data-language': node.lang } };
        node.children = [
          code,
          {
            type: 'html',
            value: `<button class="code-block-copy-btn" type="button" aria-label="Copy to Clipboard" data-code="${code.value
              .replace(/"/g, '&quot;')
              .replace(/</g, '&lt;')}">${ICON.copy}</button>`,
          },
        ];
      }
    });
  };
}
