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

  it('offers FLOAT-only number matching without changing legacy coercion', async () => {
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
        numberFloat: /^Layer\//,
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

    const legacyResult = await getVariables(FILE_KEY, {
      logger: { error() {}, warn() {}, info() {}, success() {} } as never,
      matchers: {
        number: /^Layer\//,
        numberFloat: /^Layer\//,
      },
    });

    expect(legacyResult.code.sets.float.sources[0].layer).toEqual({
      order: expect.objectContaining({ $type: 'number', $value: 42 }),
      orderAlias: expect.objectContaining({ $type: 'number', $value: '{layer.order}' }),
    });
    expect(legacyResult.code.sets.string.sources[0].layer).toEqual({
      order: expect.objectContaining({ $type: 'number', $value: 42 }),
      orderAlias: expect.objectContaining({ $type: 'number', $value: '{layer.order}' }),
    });
    expect(legacyResult.code.sets.boolean.sources[0].layer.order).toEqual(
      expect.objectContaining({ $type: 'number', $value: 1 }),
    );
  });

  it('limits legacy number coercion to finite alias-component values', async () => {
    const collectionID = 'VariableCollectionId:legacy-numbers';
    const cases = [
      {
        key: 'string',
        resolvedType: 'STRING',
        value: '42',
        expectedType: 'number',
        expectedValue: 42,
      },
      {
        key: 'boolean',
        resolvedType: 'BOOLEAN',
        value: false,
        expectedType: 'number',
        expectedValue: 0,
      },
      {
        key: 'invalid',
        resolvedType: 'STRING',
        value: 'not-a-number',
        expectedType: 'string',
        expectedValue: 'not-a-number',
      },
      {
        key: 'nonfinite',
        resolvedType: 'STRING',
        value: '1e999',
        expectedType: 'string',
        expectedValue: '1e999',
      },
    ];
    const variables: Record<string, object> = {};
    for (const testCase of cases) {
      const leafID = `VariableID:legacy-${testCase.key}-leaf`;
      const aliasID = `VariableID:legacy-${testCase.key}-alias`;
      variables[leafID] = {
        id: leafID,
        name: `Legacy/${testCase.key} raw`,
        variableCollectionId: collectionID,
        resolvedType: testCase.resolvedType,
        valuesByMode: { [MODE_ID]: testCase.value },
        description: '',
        codeSyntax: {},
      };
      variables[aliasID] = {
        id: aliasID,
        name: `Legacy/${testCase.key} alias`,
        variableCollectionId: collectionID,
        resolvedType: testCase.resolvedType,
        valuesByMode: { [MODE_ID]: { type: 'VARIABLE_ALIAS', id: leafID } },
        description: '',
        codeSyntax: {},
      };
    }
    mockVariableResponses({
      local: {
        status: 200,
        error: false,
        meta: {
          variableCollections: {
            [collectionID]: {
              defaultModeId: MODE_ID,
              id: collectionID,
              name: 'legacy',
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
    const logger = { error() {}, warn: vi.fn(), info() {}, success() {} };

    const result = await getVariables(FILE_KEY, {
      logger: logger as never,
      matchers: { number: /^Legacy\// },
    });
    const legacy = result.code.sets.legacy.sources[0].legacy;

    for (const testCase of cases) {
      const rawName = `${testCase.key}Raw`;
      const aliasName = `${testCase.key}Alias`;
      expect(legacy[rawName]).toEqual(
        expect.objectContaining({
          $type: testCase.expectedType,
          $value: testCase.expectedValue,
        }),
      );
      expect(legacy[aliasName]).toEqual(
        expect.objectContaining({
          $type: testCase.expectedType,
          $value: `{legacy.${rawName}}`,
        }),
      );
    }
    expect(logger.warn).toHaveBeenCalledTimes(2);
    expect(JSON.stringify(result.code)).not.toContain('"$value":null');
  });

  it('preserves mixed-mode alias components when direct matchers conflict', async () => {
    const collectionID = 'VariableCollectionId:conflicts';
    const alternateModeID = '1:2';
    const sourceID = 'VariableID:conflict-source';
    const targetID = 'VariableID:conflict-target';
    const variables = {
      [sourceID]: {
        id: sourceID,
        name: 'Motion/fontFamily',
        variableCollectionId: collectionID,
        resolvedType: 'STRING',
        valuesByMode: {
          [MODE_ID]: '150ms',
          [alternateModeID]: { type: 'VARIABLE_ALIAS', id: targetID },
        },
        description: '',
        codeSyntax: {},
      },
      [targetID]: {
        id: targetID,
        name: 'Motion/raw value',
        variableCollectionId: collectionID,
        resolvedType: 'STRING',
        valuesByMode: {
          [MODE_ID]: '150ms',
          [alternateModeID]: '200ms',
        },
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
              name: 'conflicts',
              remote: false,
              modes: [
                { modeId: MODE_ID, name: 'default' },
                { modeId: alternateModeID, name: 'alternate' },
              ],
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
    const logger = { error() {}, warn: vi.fn(), info() {}, success() {} };

    const result = await getVariables(FILE_KEY, {
      logger: logger as never,
      matchers: {
        fontFamily: /\/fontFamily$/,
        duration: /fontFamily$/,
        number: /fontFamily$/,
        cubicBezier: /fontFamily$/,
      },
    });
    const defaultTokens = result.code.modifiers.conflicts.contexts.default[0].motion;
    const alternateTokens = result.code.modifiers.conflicts.contexts.alternate[0].motion;

    expect(defaultTokens.fontFamily).toEqual(
      expect.objectContaining({ $type: 'string', $value: '150ms' }),
    );
    expect(defaultTokens.rawValue).toEqual(
      expect.objectContaining({ $type: 'string', $value: '150ms' }),
    );
    expect(alternateTokens.fontFamily).toEqual(
      expect.objectContaining({ $type: 'string', $value: '{motion.rawValue}' }),
    );
    expect(alternateTokens.rawValue).toEqual(
      expect.objectContaining({ $type: 'string', $value: '200ms' }),
    );
    expect(logger.warn).toHaveBeenCalledOnce();
    expect(logger.warn).toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining('Conflicting type overrides') }),
    );
  });

  it('maps valid duration and cubic-bezier strings without coercing incompatible values', async () => {
    const collectionID = 'VariableCollectionId:motion';
    const durationID = 'VariableID:duration';
    const negativeDurationID = 'VariableID:negative-duration';
    const positiveDurationID = 'VariableID:positive-duration';
    const decimalDurationID = 'VariableID:decimal-duration';
    const invalidDurationID = 'VariableID:invalid-duration';
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
      [negativeDurationID]: {
        id: negativeDurationID,
        name: 'Motion/duration negative',
        variableCollectionId: collectionID,
        resolvedType: 'STRING',
        valuesByMode: { [MODE_ID]: '-150ms' },
        description: '',
        codeSyntax: {},
      },
      [positiveDurationID]: {
        id: positiveDurationID,
        name: 'Motion/duration positive',
        variableCollectionId: collectionID,
        resolvedType: 'STRING',
        valuesByMode: { [MODE_ID]: '+0.2s' },
        description: '',
        codeSyntax: {},
      },
      [decimalDurationID]: {
        id: decimalDurationID,
        name: 'Motion/duration decimal',
        variableCollectionId: collectionID,
        resolvedType: 'STRING',
        valuesByMode: { [MODE_ID]: '.5ms' },
        description: '',
        codeSyntax: {},
      },
      [invalidDurationID]: {
        id: invalidDurationID,
        name: 'Motion/duration invalid',
        variableCollectionId: collectionID,
        resolvedType: 'STRING',
        valuesByMode: { [MODE_ID]: '1e3ms' },
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
      durationNegative: expect.objectContaining({
        $type: 'duration',
        $value: { value: -150, unit: 'ms' },
      }),
      durationPositive: expect.objectContaining({
        $type: 'duration',
        $value: { value: 0.2, unit: 's' },
      }),
      durationDecimal: expect.objectContaining({
        $type: 'duration',
        $value: { value: 0.5, unit: 'ms' },
      }),
      durationInvalid: expect.objectContaining({
        $type: 'string',
        $value: '1e3ms',
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

  it('propagates overrides through mismatched-name multi-hop aliases with cycle safety', async () => {
    const collectionID = 'VariableCollectionId:aliases';
    const chains = [
      {
        key: 'duration',
        resolvedType: 'STRING',
        value: '-25ms',
        expectedType: 'duration',
      },
      {
        key: 'cubicBezier',
        resolvedType: 'STRING',
        value: 'cubic-bezier(0.1, 0.2, 0.3, 1)',
        expectedType: 'cubicBezier',
      },
      {
        key: 'fontFamily',
        resolvedType: 'STRING',
        value: 'Inter, Arial',
        expectedType: 'fontFamily',
      },
      {
        key: 'fontWeight',
        resolvedType: 'FLOAT',
        value: 500,
        expectedType: 'fontWeight',
      },
      {
        key: 'number',
        resolvedType: 'FLOAT',
        value: 4,
        expectedType: 'number',
      },
    ];
    const variables: Record<string, object> = {};
    for (const chain of chains) {
      const sourceID = `VariableID:${chain.key}-source`;
      const middleID = `VariableID:${chain.key}-middle`;
      const targetID = `VariableID:${chain.key}-target`;
      variables[sourceID] = {
        id: sourceID,
        name: `${chain.key}/source`,
        variableCollectionId: collectionID,
        resolvedType: chain.resolvedType,
        valuesByMode: { [MODE_ID]: { type: 'VARIABLE_ALIAS', id: middleID } },
        description: '',
        codeSyntax: {},
      };
      variables[middleID] = {
        id: middleID,
        name: `${chain.key}/different middle name`,
        variableCollectionId: collectionID,
        resolvedType: chain.resolvedType,
        valuesByMode: { [MODE_ID]: { type: 'VARIABLE_ALIAS', id: targetID } },
        description: '',
        codeSyntax: {},
      };
      variables[targetID] = {
        id: targetID,
        name: `${chain.key}/raw target`,
        variableCollectionId: collectionID,
        resolvedType: chain.resolvedType,
        valuesByMode: { [MODE_ID]: chain.value },
        description: '',
        codeSyntax: {},
      };
    }
    const cycleSourceID = 'VariableID:cycle-source';
    const cycleTargetID = 'VariableID:cycle-target';
    variables[cycleSourceID] = {
      id: cycleSourceID,
      name: 'cycle/source',
      variableCollectionId: collectionID,
      resolvedType: 'STRING',
      valuesByMode: { [MODE_ID]: { type: 'VARIABLE_ALIAS', id: cycleTargetID } },
      description: '',
      codeSyntax: {},
    };
    variables[cycleTargetID] = {
      id: cycleTargetID,
      name: 'cycle/different target',
      variableCollectionId: collectionID,
      resolvedType: 'STRING',
      valuesByMode: { [MODE_ID]: { type: 'VARIABLE_ALIAS', id: cycleSourceID } },
      description: '',
      codeSyntax: {},
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
              name: 'aliases',
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
        duration: /^(?:duration|cycle)\/source$/,
        cubicBezier: /^cubicBezier\/source$/,
        fontFamily: /^fontFamily\/source$/,
        fontWeight: /^fontWeight\/source$/,
        numberFloat: /^number\/source$/,
      },
    });

    for (const { key, expectedType } of chains) {
      const group = result.code.sets.aliases.sources[0][key];
      expect(group.source.$type).toBe(expectedType);
      expect(group.differentMiddleName.$type).toBe(expectedType);
      expect(group.rawTarget.$type).toBe(expectedType);
    }
    expect(result.code.sets.aliases.sources[0].cycle.source.$type).toBe('duration');
    expect(result.code.sets.aliases.sources[0].cycle.differentTarget.$type).toBe('duration');
  });

  it('accepts only DTCG fontWeight values and preserves invalid values', async () => {
    const collectionID = 'VariableCollectionId:font-weight';
    const values = [
      ['minimum', 'FLOAT', 1],
      ['maximum', 'FLOAT', 1000],
      ['too low', 'FLOAT', 0],
      ['too high', 'FLOAT', 1001],
      ['allowed string', 'STRING', 'semi-bold'],
      ['invalid string', 'STRING', 'Semi Bold'],
      ['numeric string', 'STRING', '400'],
    ] as const;
    const variables: Record<string, object> = Object.fromEntries(
      values.map(([name, resolvedType, value]) => {
        const id = `VariableID:font-weight-${name}`;
        return [
          id,
          {
            id,
            name: `weight/${name}`,
            variableCollectionId: collectionID,
            resolvedType,
            valuesByMode: { [MODE_ID]: value },
            description: '',
            codeSyntax: {},
          },
        ];
      }),
    );
    const invalidAliasID = 'VariableID:font-weight-invalid-alias';
    variables[invalidAliasID] = {
      id: invalidAliasID,
      name: 'weight/invalid alias',
      variableCollectionId: collectionID,
      resolvedType: 'STRING',
      valuesByMode: {
        [MODE_ID]: { type: 'VARIABLE_ALIAS', id: 'VariableID:font-weight-invalid string' },
      },
      description: '',
      codeSyntax: {},
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
              name: 'font weights',
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
    const logger = { error() {}, warn: vi.fn(), info() {}, success() {} };

    const result = await getVariables(FILE_KEY, {
      logger: logger as never,
      matchers: { fontWeight: /^weight\// },
    });
    const weights = result.code.sets.fontWeights.sources[0].weight;

    expect(weights.minimum).toEqual(expect.objectContaining({ $type: 'fontWeight', $value: 1 }));
    expect(weights.maximum).toEqual(expect.objectContaining({ $type: 'fontWeight', $value: 1000 }));
    expect(weights.allowedString).toEqual(
      expect.objectContaining({ $type: 'fontWeight', $value: 'semi-bold' }),
    );
    expect(weights.tooLow).toEqual(
      expect.objectContaining({ $type: 'dimension', $value: { value: 0, unit: 'px' } }),
    );
    expect(weights.tooHigh).toEqual(
      expect.objectContaining({ $type: 'dimension', $value: { value: 1001, unit: 'px' } }),
    );
    expect(weights.invalidString).toEqual(
      expect.objectContaining({ $type: 'string', $value: 'Semi Bold' }),
    );
    expect(weights.numericString).toEqual(
      expect.objectContaining({ $type: 'string', $value: '400' }),
    );
    expect(weights.invalidAlias).toEqual(
      expect.objectContaining({ $type: 'string', $value: '{weight.invalidString}' }),
    );
    expect(logger.warn).toHaveBeenCalledTimes(4);
  });
});
