import { describe, expect, it } from 'vitest';
import { clamp, snap } from './number.js';

describe('clamp', () => {
  it('basic', () => {
    expect(clamp(0.5, 0, 1)).toBe(0.5);
    expect(clamp(1.5, 0, 1)).toBe(1);
    expect(clamp(-1, 0, 1)).toBe(0);
  });
});

describe('snap', () => {
  it('basic', () => {
    expect(snap(0.5, 0.1)).toBe(0.5);
    expect(snap(342, 1)).toBe(342);
    expect(snap(342.000001, 0.01)).toBe(342);
    expect(snap(0.5, 1)).toBe(1);
    expect(snap(0.1 + 0.2, 0.1)).toBe(0.3);
  });
});
