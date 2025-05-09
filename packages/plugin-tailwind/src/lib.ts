export interface TailwindPluginOptions {
  /**
   * Filename to output.
   * @default "tailwind-theme.css"
   */
  filename?: string;
  /** @see https://tailwindcss.com/docs/theme */
  theme: Record<string, any>;
  /** Array of mapping variants to DTCG modes. */
  modeVariants?: { variant: string; mode: string }[];
}

/** Flatten an arbitrarily-nested object */
export function flattenThemeObj(themeObj: Record<string, unknown>): { path: string[]; value: string | string[] }[] {
  const result: { path: string[]; value: string | string[] }[] = [];

  function traverse(obj: Record<string, unknown>, path: string[]) {
    for (const [key, value] of Object.entries(obj)) {
      const newPath = [...path, key];
      if (typeof value === 'string' || Array.isArray(value)) {
        if (Array.isArray(value) && (value.length === 0 || value.some((v) => typeof v !== 'string'))) {
          throw new Error(
            `Invalid value at path "${newPath.join('.')}": expected a string or an array of strings, but got ${JSON.stringify(value)}`,
          );
        }
        result.push({ path: newPath, value });
      } else if (typeof value === 'object' && value !== null) {
        traverse(value as Record<string, unknown>, newPath);
      }
    }
  }

  traverse(themeObj, []);
  return result;
}
