import type { TokenNormalized } from '@terrazzo/token-tools';

export default function normalize<T extends TokenNormalized>(token: T): T['$value'];
