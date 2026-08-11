import type { Token } from '@terrazzo/token-types';

/** Is this $type a valid DTCG type? (note: does NOT include Terrazzo extensions like "string") */
export function isValidDTCGType($type: string): boolean {
  switch ($type as Token['$type']) {
    case 'color':
    case 'dimension':
    case 'fontFamily':
    case 'fontWeight':
    case 'duration':
    case 'cubicBezier':
    case 'number':
    case 'strokeStyle':
    case 'border':
    case 'transition':
    case 'shadow':
    case 'gradient':
    case 'typography': {
      return true;
    }
    default: {
      return false;
    }
  }
}
