import { visit } from 'unist-util-visit';

export default function remarkColorSwatch() {
  return function transform(tree) {
    visit(tree, (node) => {
      if (node.type !== 'paragraph') {
        return;
      }

      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (child.type !== 'text') {
          continue;
        }

        // ancient technique: find start/end of strings, then go backwards
        const matches = [];

        const re = /\[\[[a-z]+[^\]]+\]\]/g;
        let next;
        // biome-ignore lint/suspicious/noAssignInExpressions: old magic
        while ((next = re.exec(child.value)) !== null) {
          matches.push([next.index, next.index + next[0].length]);
        }

        if (!matches.length) {
          continue;
        }

        matches.reverse();

        // push parts
        for (let j = 0; j < matches.length; j++) {
          const [start, end] = matches[j];
          node.children.splice(i + 1, 0, { type: 'text', value: child.value.substring(end, matches[j - 1]?.[0]) });
          node.children.splice(i + 1, 0, { type: 'html', value: transformSwatch(child.value.substring(start, end)) });
        }

        // modify original node
        node.children[i].value = child.value.substring(0, matches.at(-1)[0]);
      }
    });
  };
}

function transformSwatch(input) {
  const [colorSpace, ...components] = input
    .replace(/^\[\[\s*/, '')
    .replace(/\s*\]\]$/, '')
    .split(' ')
    .filter(Boolean);
  const alpha = components.length > 3 ? components.pop() : 1;
  const code = `${colorSpace}(${components.join(' ')}${alpha !== 1 ? ` / ${alpha}` : ''})`;
  return `<span class="color-swatch"><span class="color-swatch-preview" style="background:${code}"></span><span class="color-swatch-code">${code}</span></span>`;
}
