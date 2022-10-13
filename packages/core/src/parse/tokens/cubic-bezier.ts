import type {ParsedCubicBezierToken} from '../../token.js';

/**
 * 8.5 Cubic Bezier
 * https://design-tokens.github.io/community-group/format/#cubic-bezier
 *
 * {
 *   "$type": "cubicBezier",
 *   "$value": [0.4, 0, 0.6, 1]
 * }
 */
export function normalizeCubicBezierValue(value: unknown): ParsedCubicBezierToken['$value'] {
  if (!value) throw new Error('missing value');
  if (!Array.isArray(value) || value.length !== 4 || value.some((v) => typeof v !== 'number')) throw new Error(`expected [𝑥1, 𝑦1, 𝑥2, 𝑦2], received ${value}`);
  return [
    Math.max(0, Math.min(1, value[0])), // x must be between 0–1
    value[1],
    Math.max(0, Math.min(1, value[2])), // x must be between 0–1
    value[3],
  ];
}
