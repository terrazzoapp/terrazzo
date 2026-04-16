import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { getVariables } from '../src/import/figma/variables.js';

vi.stubEnv('FIGMA_ACCESS_TOKEN', 'fig_fake_token');

const originalFetch = globalThis.fetch;
const FILE_KEY = 'AaAaAaAaAaAaAaAaAa';
const COLLECTION_ID = 'VariableCollectionId:test/1:1';
const MODE_ID = '1:1';
const HIDDEN_LEAF_ID = 'VariableID:hidden-leaf';
const HIDDEN_ALIAS_TARGET_ID = 'VariableID:hidden-target';
const PUBLISHED_ALIAS_ID = 'VariableID:published-alias';
const UNPUBLISHED_VISIBLE_ID = 'VariableID:unpublished-visible';

const localVariablesResponse = {
  status: 200,
  error: false,
  meta: {
    variableCollections: {
      [COLLECTION_ID]: {
        defaultModeId: MODE_ID,
        id: COLLECTION_ID,
        name: 'base',
        remote: false,
        modes: [{ modeId: MODE_ID, name: 'default' }],
        hiddenFromPublishing: false,
      },
    },
    variables: {
      [HIDDEN_LEAF_ID]: {
        id: HIDDEN_LEAF_ID,
        name: 'foundation/leaf',
        variableCollectionId: COLLECTION_ID,
        resolvedType: 'COLOR',
        hiddenFromPublishing: true,
        valuesByMode: {
          [MODE_ID]: { r: 0.1, g: 0.2, b: 0.3, a: 1 },
        },
        description: '',
        codeSyntax: {},
      },
      [HIDDEN_ALIAS_TARGET_ID]: {
        id: HIDDEN_ALIAS_TARGET_ID,
        name: 'foundation/hidden',
        variableCollectionId: COLLECTION_ID,
        resolvedType: 'COLOR',
        hiddenFromPublishing: true,
        valuesByMode: {
          [MODE_ID]: { type: 'VARIABLE_ALIAS', id: HIDDEN_LEAF_ID },
        },
        description: '',
        codeSyntax: {},
      },
      [PUBLISHED_ALIAS_ID]: {
        id: PUBLISHED_ALIAS_ID,
        name: 'semantic/published',
        variableCollectionId: COLLECTION_ID,
        resolvedType: 'COLOR',
        hiddenFromPublishing: false,
        valuesByMode: {
          [MODE_ID]: { type: 'VARIABLE_ALIAS', id: HIDDEN_ALIAS_TARGET_ID },
        },
        description: '',
        codeSyntax: {},
      },
      [UNPUBLISHED_VISIBLE_ID]: {
        id: UNPUBLISHED_VISIBLE_ID,
        name: 'semantic/unpublished',
        variableCollectionId: COLLECTION_ID,
        resolvedType: 'COLOR',
        hiddenFromPublishing: false,
        valuesByMode: {
          [MODE_ID]: { type: 'VARIABLE_ALIAS', id: HIDDEN_ALIAS_TARGET_ID },
        },
        description: '',
        codeSyntax: {},
      },
    },
  },
};

const publishedVariablesResponse = {
  status: 200,
  error: false,
  meta: {
    variables: {
      [PUBLISHED_ALIAS_ID]: {
        id: PUBLISHED_ALIAS_ID,
      },
    },
  },
};

describe('getVariables', () => {
  beforeEach(() => {
    globalThis.fetch = vi.fn().mockImplementation((url: string) => {
      return Promise.resolve(
        new Response(
          {
            [`https://api.figma.com/v1/files/${FILE_KEY}/variables/local`]: JSON.stringify(localVariablesResponse),
            [`https://api.figma.com/v1/files/${FILE_KEY}/variables/published`]:
              JSON.stringify(publishedVariablesResponse),
          }[url],
        ),
      );
    });
  });

  afterAll(() => {
    globalThis.fetch = originalFetch;
  });

  it('emits the hidden local alias dependency closure in published mode', async () => {
    const result = await getVariables(FILE_KEY, {
      logger: { error() {}, warn() {}, info() {}, success() {} } as never,
      matchers: {
        fontFamily: undefined,
        fontWeight: undefined,
        number: undefined,
      },
    });

    expect(result.count).toBe(3);
    expect(result.remoteCount).toBe(0);
    expect(result.code.sets.base.sources[0]).toEqual({
      foundation: {
        hidden: expect.objectContaining({
          $value: '{foundation.leaf}',
        }),
        leaf: expect.objectContaining({
          $value: {
            colorSpace: 'srgb',
            components: [0.1, 0.2, 0.3],
            alpha: 1,
          },
        }),
      },
      semantic: {
        published: expect.objectContaining({
          $value: '{foundation.hidden}',
        }),
      },
    });
  });

  it('emits the hidden local alias dependency closure in unpublished mode', async () => {
    const result = await getVariables(FILE_KEY, {
      logger: { error() {}, warn() {}, info() {}, success() {} } as never,
      unpublished: true,
      matchers: {
        fontFamily: undefined,
        fontWeight: undefined,
        number: undefined,
      },
    });

    expect(result.count).toBe(4);
    expect(result.remoteCount).toBe(0);
    expect(result.code.sets.base.sources[0]).toEqual({
      foundation: {
        hidden: expect.objectContaining({
          $value: '{foundation.leaf}',
        }),
        leaf: expect.objectContaining({
          $value: {
            colorSpace: 'srgb',
            components: [0.1, 0.2, 0.3],
            alpha: 1,
          },
        }),
      },
      semantic: {
        published: expect.objectContaining({
          $value: '{foundation.hidden}',
        }),
        unpublished: expect.objectContaining({
          $value: '{foundation.hidden}',
        }),
      },
    });
  });
});
