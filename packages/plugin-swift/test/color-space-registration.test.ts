import type * as ColorJSFn from 'colorjs.io/fn';
import { describe, expect, it, vi } from 'vitest';

// colorjs.io's tree-shakeable `/fn` entrypoint registers no color spaces by default.
// This plugin depends on a separately-versioned colorjs.io (its own dependency range),
// so it can't assume another package (e.g. @terrazzo/token-tools) has already registered
// spaces into whichever colorjs.io module instance this plugin resolves at runtime. It
// must register the spaces it needs itself.
const registerMock = vi.fn();

vi.mock('colorjs.io/fn', async (importOriginal) => {
  const actual = await importOriginal<typeof ColorJSFn>();
  return {
    ...actual,
    ColorSpace: { ...actual.ColorSpace, register: registerMock },
  };
});

// Stub out @terrazzo/token-tools so its own (unrelated) colorjs.io space registration
// can't mask whether *this* plugin registers spaces itself.
vi.mock('@terrazzo/token-tools', () => ({
  tokenToColor: vi.fn(),
}));

describe('@terrazzo/plugin-swift color space registration', () => {
  it('explicitly registers color spaces on import', async () => {
    await import('../src/index.js');
    expect(registerMock).toHaveBeenCalled();
    expect(registerMock.mock.calls.length).toBeGreaterThan(1);
  });
});
