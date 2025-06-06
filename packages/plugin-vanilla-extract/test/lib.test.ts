import { describe, expect, it } from 'vitest';
import { isJSIdent, serializeValue } from '../src/lib.js';

describe('isJSIdent', () => {
  const TESTS: [string, [any, boolean]][] = [
    ['varName', ['varName', true]],
    ['$varName', ['$varName', true]],
    ['JS_CONSTANT', ['JS_CONSTANT', true]],
    ['__HIDDEN_CONSTANT', ['__HIDDEN_CONSTANT', true]],
    ['n123', ['n123', true]],
    ['kebab-case', ['kebab-case', false]],
    ['spaces', ['This has spaces', false]],
    ['hash', ['var#123', false]],
    ['🚀🚀🚀', ['🚀🚀🚀', false]],
    ['number', [123, false]],
    ['boolean (true)', [true, false]],
    ['boolean (false)', [false, false]],
    ['null', [null, false]],
    ['undefined', [undefined, false]],
  ];

  it.each(TESTS)('%s', (_, [given, want]) => {
    expect(isJSIdent(given)).toBe(want);
  });
});

describe('serializeValue', () => {
  const tokens = [
    {
      id: 'color.background.default',
      localID: 'color.background.default',
      type: 'MULTI_VALUE',
      value: { __cssName: '--color-background-default' },
    },
    {
      id: 'color.green.600',
      localID: 'color.green.600',
      type: 'MULTI_VALUE',
      value: { __cssName: '--color-green-600' },
    },
    {
      id: 'color.blue.07',
      localID: 'color.blue.07',
      type: 'MULTI_VALUE',
      value: { __cssName: '--color-blue-07' },
    },
    {
      id: '123abc',
      localID: '123abc',
      type: 'MULTI_VALUE',
      value: { __cssName: '--123abc' },
    },
    {
      id: '123abc',
      localID: '123abc',
      type: 'MULTI_VALUE',
      value: { __cssName: '--123abc' },
    },
    {
      id: 'on_brand.disabled',
      localID: 'on_brand.disabled',
      type: 'MULTI_VALUE',
      value: { __cssName: '--on_brand.disabled' },
    },
    {
      id: 'foo-bar',
      localID: 'foo-bar',
      type: 'MULTI_VALUE',
      value: { __cssName: '--foo-bar' },
    },
    {
      id: "color.'.-07",
      localID: "color.'.-07",
      type: 'MULTI_VALUE',
      value: { __cssName: "--color-\\'--07" },
    },
    {
      id: '1.2.3',
      localID: '1.2.3',
      type: 'MULTI_VALUE',
      value: { __cssName: '--1-2-3' },
    },
  ] as any;

  const TESTS: [string, [string | number | boolean, string]][] = [
    // normal values
    ['#2c2c2c', ['#2c2c2c', '#2c2c2c']],
    ['1.5rem', ['1.5rem', '1.5rem']],
    ['8px', ['8px', '8px']],
    ['0rem', ['0rem', '0']],
    ['2.5px', ['2.5px', '2.5px']], // not a real value
    ['0.875em', ['0.875em', '0.875em']],
    ['15ms', ['15ms', '15ms']],
    ['0.002s', ['0.002s', '0.002s']],
    ['true', [true, 'true']],
    ['23', [23, '23']],

    // aliases
    [
      'var(--color-background-default)',
      ['var(--color-background-default)', '__ident__tzVars.color.background.default__ident__'],
    ],
    ['var(--color-green-600)', ['var(--color-green-600)', '__ident__tzVars.color.green[600]__ident__']],
    ['var(--color-blue-07)', ['var(--color-blue-07)', "__ident__tzVars.color.blue['07']__ident__"]],
    ['var(--123abc)', ['var(--123abc)', "__ident__tzVars['123abc']__ident__"]],
    ['var(--on_brand.disabled)', ['var(--on_brand.disabled)', '__ident__tzVars.on_brand.disabled__ident__']],
    ['var(--foo-bar)', ['var(--foo-bar)', "__ident__tzVars['foo-bar']__ident__"]],
    ["var(--color-\\'--07)", ["var(--color-\\'--07)", "__ident__tzVars.color['\\'']['-07']__ident__"]],
    ['var(--1-2-3)', ['var(--1-2-3)', '__ident__tzVars[1][2][3]__ident__']],
  ];

  it.each(TESTS)('%s', (_, [given, want]) => {
    expect(serializeValue(given, tokens)).toBe(want);
  });
});
