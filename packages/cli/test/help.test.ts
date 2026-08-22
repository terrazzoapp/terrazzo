import { afterEach, describe, expect, it, vi } from 'vitest';

import { helpCmd } from '../src/help.js';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('helpCmd', () => {
  it('documents the Figma variable override flags', () => {
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);

    helpCmd();

    expect(log).toHaveBeenCalledOnce();
    const output = log.mock.calls[0]?.[0];
    expect(output).toContain('--font-family-names [regex]');
    expect(output).toContain('--font-weight-names [regex]');
    expect(output).toContain('--number-names [regex]');
    expect(output).toContain('Deprecated: coerce matching primitives as number');
    expect(output).toContain('--number-float-names [regex]');
    expect(output).toContain('--duration-names [regex]');
    expect(output).toContain('--cubic-bezier-names [regex]');
    expect(output).toContain('Include unpublished Styles and Variables');
  });
});
