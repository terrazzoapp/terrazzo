export interface CustomTransformOptions {
  /** Token $type */
  $type: string;
}

/** Give a user pertinent feedback if they override a transform incorrectly */
export function validateCustomTransform(value: unknown, { $type }: CustomTransformOptions) {
  if (value) {
    if ((typeof value !== 'string' && typeof value !== 'object') || Array.isArray(value)) {
      throw new Error(
        `transform(): expected string or Object of strings, received ${Array.isArray(value) ? 'Array' : typeof value}`,
      );
    }
    switch ($type) {
      case 'typography': {
        if (typeof value !== 'object') {
          throw new Error('transform(): typography tokens must be an object of keys');
        }
        break;
      }
    }
  }
}
