import type { Group } from 'src/types.js';
import { describe, expectTypeOf, it } from 'vitest';

describe('types', () => {
  it('group', () => {
    const simpleGroup = {
      $description: 'group',
      color: {
        $type: 'color',
        $description: 'token',
        $value: '#000000',
      },
    } satisfies Group;

    expectTypeOf(simpleGroup).toMatchTypeOf<Group>();
  });

  it('nested groups', () => {
    const groupsWithCore = {
      $description: 'group',
      color: {
        $description: 'nested group',
        primary: {
          $type: 'color',
          $description: 'token',
          $value: '#000000',
        },
      },
    } satisfies Group;

    expectTypeOf(groupsWithCore).toMatchTypeOf<Group>();

    const groupsWithoutCore = {
      color: {
        primary: {
          $type: 'color',
          $value: '#000000',
        },
      },
    } satisfies Group;

    expectTypeOf(groupsWithoutCore).toMatchTypeOf<Group>();
  });
});
