import type { LocalVariable, Node } from '@figma/rest-api-spec';
import { defineConfig, Logger, parse } from '@terrazzo/parser';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { importFromFigma } from '../src/import/figma/index.js';
import { effectStyle } from '../src/import/figma/styles.js';

const fileKey = 'test';
function alias(id: string) {
  return { type: 'VARIABLE_ALIAS' as const, id };
}
const blue = { r: 0.13, g: 0.25, b: 0.85, a: 0.75 };
const shadow = {
  type: 'DROP_SHADOW',
  visible: true,
  color: blue,
  blendMode: 'NORMAL',
  offset: { x: 0, y: 0 },
  radius: 0,
  spread: 3,
  boundVariables: {
    color: alias('ring'),
    radius: alias('zero'),
    offsetX: alias('zero'),
    offsetY: alias('zero'),
  },
};
const node = {
  id: 'style-node',
  name: 'focus',
  type: 'RECTANGLE',
  effects: [
    shadow,
    {
      ...shadow,
      color: { r: 1, g: 1, b: 1, a: 1 },
      spread: 1,
      boundVariables: { color: alias('gap') },
    },
  ],
};

function variable(
  id: string,
  type: 'COLOR' | 'FLOAT',
  valuesByMode: Record<string, unknown>,
): LocalVariable {
  return {
    id,
    name: id,
    key: id,
    variableCollectionId: 'base',
    resolvedType: type,
    hiddenFromPublishing: true,
    description: '',
    codeSyntax: {},
    valuesByMode,
  } as LocalVariable;
}

function fixture() {
  const variables: Record<string, LocalVariable> = {
    black: variable('black', 'COLOR', { base: { r: 0, g: 0, b: 0, a: 1 } }),
    white: variable('white', 'COLOR', { base: { r: 1, g: 1, b: 1, a: 1 } }),
    zero: variable('zero', 'FLOAT', { base: 0 }),
    unused: variable('unused', 'FLOAT', { base: 99 }),
    ring: variable('ring', 'COLOR', { light: alias('black'), dark: alias('white') }),
    gap: variable('gap', 'COLOR', { light: alias('white'), dark: alias('black') }),
  };
  variables.ring!.variableCollectionId = 'theme';
  variables.gap!.variableCollectionId = 'theme';
  const variableCollections = {
    base: {
      id: 'base',
      name: 'base',
      defaultModeId: 'base',
      modes: [{ modeId: 'base', name: 'default' }],
    },
    theme: {
      id: 'theme',
      name: 'theme',
      defaultModeId: 'light',
      modes: [
        { modeId: 'light', name: 'light' },
        { modeId: 'dark', name: 'dark' },
      ],
    },
  };
  return { variables, variableCollections };
}

function mockFigma() {
  const local = fixture();
  vi.stubEnv('FIGMA_ACCESS_TOKEN', 'fig_fake_token');
  const fetch = vi.fn((url: string) => {
    const pathname = new URL(url).pathname;
    const responses: Record<string, unknown> = {
      '/v1/files/test/variables/local': { meta: local },
      '/v1/files/test/variables/published': { meta: { variables: {} } },
      '/v1/files/test/styles': {
        meta: { styles: [{ node_id: 'style-node', name: 'focus', style_type: 'EFFECT' }] },
      },
      '/v1/files/test/nodes': { nodes: { 'style-node': { document: node } } },
      '/v1/files/test': { styles: { 'style-node': { name: 'focus', styleType: 'EFFECT' } } },
    };
    const response = responses[pathname];
    if (!response) {
      throw new Error(`Unexpected request ${url}`);
    }
    return Promise.resolve(Response.json(response));
  });
  vi.stubGlobal('fetch', fetch);
  return { local, fetch };
}

describe('Figma effect variable bindings', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('preserves shadow color, gap, and geometry references', () => {
    const ids = new Set<string>();
    const result = effectStyle(node as Node, { variables: fixture().variables, variableIDs: ids });
    expect(result?.[0]).toEqual({
      inset: false,
      color: '{ring}',
      blur: '{zero}',
      offsetX: '{zero}',
      offsetY: '{zero}',
      spread: { value: 3, unit: 'px' },
    });
    expect(result?.[1]?.color).toBe('{gap}');
    expect(ids).toEqual(new Set(['ring', 'gap', 'zero']));
  });

  it('keeps raw values without a variable context', () => {
    expect(effectStyle(node as Node)?.[0]?.color).toEqual({
      colorSpace: 'srgb',
      components: [0.13, 0.25, 0.85],
      alpha: 0.75,
    });
  });

  it('warns and uses the raw value for an unavailable binding', () => {
    const logger = { warn: vi.fn() };
    const result = effectStyle(node as Node, { variables: {}, logger: logger as never });
    expect(result?.[0]?.color).toEqual({
      colorSpace: 'srgb',
      components: [0.13, 0.25, 0.85],
      alpha: 0.75,
    });
    expect(logger.warn).toHaveBeenCalled();
  });

  it('retains raw color when an available variable has an unavailable alias dependency', async () => {
    const { local } = mockFigma();
    local.variables.ring!.valuesByMode.light = alias('unavailable-remote');
    const result = await importFromFigma({
      url: `https://www.figma.com/design/${fileKey}`,
      logger: new Logger(),
    });
    expect(result.code.sets.styles.sources[0].focus.$value[0].color.components).toEqual([
      0.13, 0.25, 0.85,
    ]);
    expect(result.code.modifiers.theme.contexts.light[0]).not.toHaveProperty('ring');
    const parsed = await parse(
      {
        src: JSON.stringify(result.code),
        filename: new URL('file:///tmp/missing-style-dependency.json'),
      },
      { config: defineConfig({}, { cwd: new URL('file:///tmp/') }) },
    );
    expect(parsed.tokens.focus).toBeDefined();
  });

  it('retains raw dimensions when number-name matching changes the imported type', async () => {
    mockFigma();
    const result = await importFromFigma({
      url: `https://www.figma.com/design/${fileKey}`,
      logger: new Logger(),
      numberNames: '^zero$',
    });
    expect(result.code.sets.styles.sources[0].focus.$value[0].blur).toEqual({
      value: 0,
      unit: 'px',
    });
    expect(result.code.sets.base.sources[0]).not.toHaveProperty('zero');
    const parsed = await parse(
      {
        src: JSON.stringify(result.code),
        filename: new URL('file:///tmp/matched-style-type.json'),
      },
      { config: defineConfig({}, { cwd: new URL('file:///tmp/') }) },
    );
    expect(parsed.tokens.focus).toBeDefined();
  });

  it('rejects cyclic binding dependencies rather than emitting a cyclic reference', () => {
    const variables = fixture().variables;
    variables.ring!.valuesByMode.light = alias('ring');
    const logger = { warn: vi.fn() };
    const result = effectStyle(node as Node, { variables, logger: logger as never });
    expect(result?.[0]?.color).toEqual({
      colorSpace: 'srgb',
      components: [0.13, 0.25, 0.85],
      alpha: 0.75,
    });
    expect(logger.warn).toHaveBeenCalled();
  });

  it.each([false, true])(
    'includes only style dependency closure with unpublished=%s',
    async (unpublished) => {
      const { fetch } = mockFigma();
      const result = await importFromFigma({
        url: `https://www.figma.com/design/${fileKey}`,
        logger: new Logger(),
        unpublished,
      });
      expect(result.variableCount).toBe(5);
      expect(result.styleCount).toBe(1);
      expect(result.code.sets.styles.sources[0].focus.$value[0].color).toBe('{ring}');
      expect(result.code.sets.base.sources[0]).not.toHaveProperty('unused');
      expect(result.code.modifiers.theme.contexts.light[0].ring.$value).toBe('{black}');
      expect(result.code.modifiers.theme.contexts.dark[0].ring.$value).toBe('{white}');
      expect(
        fetch.mock.calls.filter(([url]) => String(url).endsWith('/variables/local')),
      ).toHaveLength(1);
    },
  );

  it('resolves shadow color and gap according to the selected mode', async () => {
    mockFigma();
    const imported = await importFromFigma({
      url: `https://www.figma.com/design/${fileKey}`,
      logger: new Logger(),
    });
    const config = defineConfig({}, { cwd: new URL('file:///tmp/') });
    const parsed = await parse(
      { src: JSON.stringify(imported.code), filename: new URL('file:///tmp/figma-bindings.json') },
      { config },
    );
    const light = parsed.resolver.apply({ theme: 'light' }).focus!.$value as {
      color: { components: number[] };
    }[];
    const dark = parsed.resolver.apply({ theme: 'dark' }).focus!.$value as {
      color: { components: number[] };
    }[];
    expect(light[0]?.color.components).toEqual([0, 0, 0]);
    expect(light[1]?.color.components).toEqual([1, 1, 1]);
    expect(dark[0]?.color.components).toEqual([1, 1, 1]);
    expect(dark[1]?.color.components).toEqual([0, 0, 0]);
  });

  it('styles-only imports do not fetch variables or emit unresolved references', async () => {
    const { fetch } = mockFigma();
    const result = await importFromFigma({
      url: `https://www.figma.com/design/${fileKey}`,
      logger: new Logger(),
      skipVariables: true,
    });
    expect(result.variableCount).toBe(0);
    expect(result.styleCount).toBe(1);
    expect(result.code.sets.styles.sources[0].focus.$value[0].color.components).toEqual([
      0.13, 0.25, 0.85,
    ]);
    expect(fetch.mock.calls.some(([url]) => String(url).includes('/variables/'))).toBe(false);
  });

  it('variables-only imports do not fetch styles', async () => {
    const { fetch } = mockFigma();
    const result = await importFromFigma({
      url: `https://www.figma.com/design/${fileKey}`,
      logger: new Logger(),
      skipStyles: true,
    });
    expect(result.styleCount).toBe(0);
    expect(fetch.mock.calls.some(([url]) => /\/(styles|nodes)/.test(String(url)))).toBe(false);
  });
});
