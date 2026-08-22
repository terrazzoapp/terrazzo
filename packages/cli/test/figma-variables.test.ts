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

function mockVariableResponses({
  local = localVariablesResponse,
  published = publishedVariablesResponse,
}: {
  local?: object;
  published?: object;
} = {}) {
  globalThis.fetch = vi.fn().mockImplementation((url: string) =>
    Promise.resolve(
      new Response(
        {
          [`https://api.figma.com/v1/files/${FILE_KEY}/variables/local`]: JSON.stringify(local),
          [`https://api.figma.com/v1/files/${FILE_KEY}/variables/published`]:
            JSON.stringify(published),
        }[url],
      ),
    ),
  );
}

describe('getVariables', () => {
  beforeEach(() => {
    mockVariableResponses();
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

  it('applies number name matching only to FLOAT variables and aliases', async () => {
    const floatCollectionID = 'VariableCollectionId:float';
    const stringCollectionID = 'VariableCollectionId:string';
    const booleanCollectionID = 'VariableCollectionId:boolean';
    const floatID = 'VariableID:float';
    const floatAliasID = 'VariableID:float-alias';
    const stringID = 'VariableID:string';
    const stringAliasID = 'VariableID:string-alias';
    const booleanID = 'VariableID:boolean';
    const variableCollections = Object.fromEntries(
      [
        [floatCollectionID, 'float'],
        [stringCollectionID, 'string'],
        [booleanCollectionID, 'boolean'],
      ].map(([id, name]) => [
        id,
        {
          defaultModeId: MODE_ID,
          id,
          name,
          remote: false,
          modes: [{ modeId: MODE_ID, name: 'default' }],
          hiddenFromPublishing: false,
        },
      ]),
    );
    const variables = {
      [floatID]: {
        id: floatID,
        name: 'Layer/order',
        variableCollectionId: floatCollectionID,
        resolvedType: 'FLOAT',
        valuesByMode: { [MODE_ID]: 42 },
        description: '',
        codeSyntax: {},
      },
      [floatAliasID]: {
        id: floatAliasID,
        name: 'Layer/order alias',
        variableCollectionId: floatCollectionID,
        resolvedType: 'FLOAT',
        valuesByMode: { [MODE_ID]: { type: 'VARIABLE_ALIAS', id: floatID } },
        description: '',
        codeSyntax: {},
      },
      [stringID]: {
        id: stringID,
        name: 'Layer/order',
        variableCollectionId: stringCollectionID,
        resolvedType: 'STRING',
        valuesByMode: { [MODE_ID]: '42' },
        description: '',
        codeSyntax: {},
      },
      [stringAliasID]: {
        id: stringAliasID,
        name: 'Layer/order alias',
        variableCollectionId: stringCollectionID,
        resolvedType: 'STRING',
        valuesByMode: { [MODE_ID]: { type: 'VARIABLE_ALIAS', id: stringID } },
        description: '',
        codeSyntax: {},
      },
      [booleanID]: {
        id: booleanID,
        name: 'Layer/order',
        variableCollectionId: booleanCollectionID,
        resolvedType: 'BOOLEAN',
        valuesByMode: { [MODE_ID]: true },
        description: '',
        codeSyntax: {},
      },
    };
    mockVariableResponses({
      local: {
        status: 200,
        error: false,
        meta: { variableCollections, variables },
      },
      published: {
        status: 200,
        error: false,
        meta: {
          variables: Object.fromEntries(Object.keys(variables).map((id) => [id, { id }])),
        },
      },
    });

    const result = await getVariables(FILE_KEY, {
      logger: { error() {}, warn() {}, info() {}, success() {} } as never,
      matchers: {
        fontFamily: undefined,
        fontWeight: undefined,
        number: /^Layer\//,
      },
    });

    expect(result.code.sets.float.sources[0].layer).toEqual({
      order: expect.objectContaining({ $type: 'number', $value: 42 }),
      orderAlias: expect.objectContaining({ $type: 'number', $value: '{layer.order}' }),
    });
    expect(result.code.sets.string.sources[0].layer).toEqual({
      order: expect.objectContaining({ $type: 'string', $value: '42' }),
      orderAlias: expect.objectContaining({ $type: 'string', $value: '{layer.order}' }),
    });
    expect(result.code.sets.boolean.sources[0].layer.order).toEqual(
      expect.objectContaining({ $type: 'boolean', $value: true }),
    );
  });

  it('maps valid duration and cubic-bezier strings without coercing incompatible values', async () => {
    const collectionID = 'VariableCollectionId:motion';
    const durationID = 'VariableID:duration';
    const numericDurationID = 'VariableID:numeric-duration';
    const easingID = 'VariableID:easing';
    const invalidEasingID = 'VariableID:invalid-easing';
    const variables = {
      [durationID]: {
        id: durationID,
        name: 'Motion/duration',
        variableCollectionId: collectionID,
        resolvedType: 'STRING',
        valuesByMode: { [MODE_ID]: '150ms' },
        description: '',
        codeSyntax: {},
      },
      [numericDurationID]: {
        id: numericDurationID,
        name: 'Motion/duration numeric',
        variableCollectionId: collectionID,
        resolvedType: 'FLOAT',
        valuesByMode: { [MODE_ID]: 150 },
        description: '',
        codeSyntax: {},
      },
      [easingID]: {
        id: easingID,
        name: 'Motion/easing',
        variableCollectionId: collectionID,
        resolvedType: 'STRING',
        valuesByMode: { [MODE_ID]: 'cubic-bezier(0.25, 0.1, 0.25, 1)' },
        description: '',
        codeSyntax: {},
      },
      [invalidEasingID]: {
        id: invalidEasingID,
        name: 'Motion/invalid easing',
        variableCollectionId: collectionID,
        resolvedType: 'STRING',
        valuesByMode: { [MODE_ID]: 'ease-in' },
        description: '',
        codeSyntax: {},
      },
    };
    mockVariableResponses({
      local: {
        status: 200,
        error: false,
        meta: {
          variableCollections: {
            [collectionID]: {
              defaultModeId: MODE_ID,
              id: collectionID,
              name: 'motion',
              remote: false,
              modes: [{ modeId: MODE_ID, name: 'default' }],
              hiddenFromPublishing: false,
            },
          },
          variables,
        },
      },
      published: {
        status: 200,
        error: false,
        meta: {
          variables: Object.fromEntries(Object.keys(variables).map((id) => [id, { id }])),
        },
      },
    });

    const result = await getVariables(FILE_KEY, {
      logger: { error() {}, warn() {}, info() {}, success() {} } as never,
      matchers: {
        cubicBezier: /easing/i,
        duration: /duration/i,
      },
    });

    expect(result.code.sets.motion.sources[0].motion).toEqual({
      duration: expect.objectContaining({
        $type: 'duration',
        $value: { value: 150, unit: 'ms' },
      }),
      durationNumeric: expect.objectContaining({
        $type: 'dimension',
        $value: { value: 150, unit: 'px' },
      }),
      easing: expect.objectContaining({
        $type: 'cubicBezier',
        $value: [0.25, 0.1, 0.25, 1],
      }),
      invalidEasing: expect.objectContaining({
        $type: 'string',
        $value: 'ease-in',
      }),
    });
  });
});
