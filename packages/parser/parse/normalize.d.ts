import type { TokenNormalized } from '../types.js';

export default function normalize<T extends TokenNormalized>(token: T): T['$value'];
