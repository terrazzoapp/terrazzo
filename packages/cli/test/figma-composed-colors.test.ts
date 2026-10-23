import type { LocalVariable, LocalVariableCollection } from '@figma/rest-api-spec';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { getAliasIDs, resolveComposedColor } from '../src/import/figma/composed-color.js';
import { getVariables } from '../src/import/figma/variables.js';

function alias(id: string) {
  return { type: 'VARIABLE_ALIAS', id };
}
const collections = {
  theme: {
    key: 'theme-key',
    remote: false,
    hiddenFromPublishing: false,
    variableIds: [],
    id: 'theme',
    name: 'theme',
    defaultModeId: 'light',
    modes: [
      { modeId: 'light', name: 'Light' },
      { modeId: 'dark', name: 'Dark' },
    ],
  },
  base: {
    key: 'base-key',
    remote: false,
    hiddenFromPublishing: false,
    variableIds: [],
    id: 'base',
    name: 'base',
    defaultModeId: 'base-default',
    modes: [{ modeId: 'base-default', name: 'Default' }],
  },
  other: {
    key: 'other-key',
    remote: false,
    hiddenFromPublishing: false,
    variableIds: [],
    id: 'other',
    name: 'other',
    defaultModeId: 'other-light',
    modes: [
      { modeId: 'other-light', name: 'light' },
      { modeId: 'other-dark', name: 'dark' },
    ],
  },
} as Record<string, LocalVariableCollection>;

function variable(
  id: string,
  resolvedType: 'COLOR' | 'FLOAT',
  valuesByMode: Record<string, unknown>,
): LocalVariable {
  return {
    id,
    name: id,
    key: `${id}-key`,
    variableCollectionId: 'base',
    resolvedType,
    valuesByMode,
    description: '',
    codeSyntax: {},
    hiddenFromPublishing: true,
  } as LocalVariable;
}

function fixtures(): Record<string, LocalVariable> {
  const variables = {
    palette: variable('palette', 'COLOR', { 'base-default': { r: 0.1, g: 0.2, b: 0.3, a: 0.8 } }),
    opacity: variable('opacity', 'FLOAT', { 'base-default': 50 }),
    semantic: variable('semantic', 'COLOR', {
      light: { color: alias('palette'), opacity: alias('opacity') },
      dark: { color: alias('palette'), opacity: 0 },
    }),
  };
  variables.semantic.variableCollectionId = 'theme';
  return variables;
}

describe('Figma composed colors', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('discovers both nested dependency aliases', () => {
    expect(getAliasIDs({ color: alias('palette'), opacity: alias('opacity') })).toEqual([
      'palette',
      'opacity',
    ]);
    expect(getAliasIDs(alias('palette'))).toEqual(['palette']);
  });

  it.each([0, 25, 50, 100])('replaces source alpha with authored %s percent opacity', (opacity) => {
    expect(
      resolveComposedColor({ color: alias('palette'), opacity }, 'light', {
        variables: fixtures(),
        collections,
        remoteIDs: new Set(),
      }),
    ).toEqual({ r: 0.1, g: 0.2, b: 0.3, a: opacity / 100 });
  });

  it('resolves literal RGB with an aliased opacity', () => {
    expect(
      resolveComposedColor({ color: { r: 1, g: 0, b: 0 }, opacity: alias('opacity') }, 'light', {
        variables: fixtures(),
        collections,
        remoteIDs: new Set(),
      }),
    ).toEqual({ r: 1, g: 0, b: 0, a: 0.5 });
  });

  it('resolves alias chains through another composed color', () => {
    expect(
      resolveComposedColor({ color: alias('semantic'), opacity: 25 }, 'dark', {
        variables: fixtures(),
        collections,
        remoteIDs: new Set(),
      }),
    ).toEqual({ r: 0.1, g: 0.2, b: 0.3, a: 0.25 });
  });

  it('uses a matching mode name in another collection', () => {
    const variables = fixtures();
    variables.opacity = variable('opacity', 'FLOAT', { 'other-light': 100, 'other-dark': 25 });
    variables.opacity.variableCollectionId = 'other';
    expect(
      resolveComposedColor({ color: alias('palette'), opacity: alias('opacity') }, 'dark', {
        variables,
        collections,
        remoteIDs: new Set(),
      })?.a,
    ).toBe(0.25);
  });

  it('reports unavailable nested aliases without emitting a color', () => {
    const remoteIDs = new Set<string>();
    expect(
      resolveComposedColor({ color: alias('missing'), opacity: 50 }, 'light', {
        variables: fixtures(),
        collections,
        remoteIDs,
      }),
    ).toBeUndefined();
    expect(remoteIDs).toEqual(new Set(['missing']));
  });

  it('rejects cyclic alias chains', () => {
    const variables = fixtures();
    variables.palette = variable('palette', 'COLOR', { 'base-default': alias('palette') });
    expect(() =>
      resolveComposedColor({ color: alias('palette'), opacity: 50 }, 'light', {
        variables,
        collections,
        remoteIDs: new Set(),
      }),
    ).toThrow('Cyclic Figma composed color alias');
  });

  it.each([-1, 101, Number.NaN, '50'])('rejects invalid opacity %s', (opacity) => {
    expect(() =>
      resolveComposedColor({ color: alias('palette'), opacity }, 'light', {
        variables: fixtures(),
        collections,
        remoteIDs: new Set(),
      }),
    ).toThrow('opacity must resolve to a percentage');
  });

  it('rejects a non-color target instead of serializing null components', () => {
    expect(() =>
      resolveComposedColor({ color: alias('opacity'), opacity: 50 }, 'light', {
        variables: fixtures(),
        collections,
        remoteIDs: new Set(),
      }),
    ).toThrow('must resolve to RGB or RGBA');
  });

  it.each([false, true])(
    'imports nested hidden dependencies with unpublished=%s',
    async (unpublished) => {
      const variables = fixtures();
      variables.semantic!.hiddenFromPublishing = false;
      vi.stubEnv('FIGMA_ACCESS_TOKEN', 'fig_fake_token');
      vi.stubGlobal(
        'fetch',
        vi.fn((url: string) =>
          Promise.resolve(
            Response.json({
              meta: url.endsWith('/local')
                ? { variables, variableCollections: collections }
                : { variables: { semantic: { id: 'semantic' } } },
            }),
          ),
        ),
      );
      const result = await getVariables('test', {
        logger: { warn() {} } as never,
        unpublished,
        matchers: { fontFamily: undefined, fontWeight: undefined, number: undefined },
      });
      expect(result.count).toBe(3);
      expect(result.remoteCount).toBe(0);
      expect(result.code.modifiers.theme.contexts.light[0].semantic.$value).toEqual({
        colorSpace: 'srgb',
        components: [0.1, 0.2, 0.3],
        alpha: 0.5,
      });
      expect(result.code.modifiers.theme.contexts.dark[0].semantic.$value.alpha).toBe(0);
      expect(result.code.sets.base.sources[0]).toHaveProperty('palette');
      expect(result.code.sets.base.sources[0]).toHaveProperty('opacity');
    },
  );
});
