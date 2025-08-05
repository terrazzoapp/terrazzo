import type { TokenNormalized } from '@terrazzo/parser';

export const FORMAT_ID = 'token-listing';

// TODO: finish type
export interface TokenListingExtension {
  names: Record<string, string>;
  mode?: string;
  subtype?: string;
  source?: string;
  previewValue?: Value;
  originalValue?: Value;
}

export interface ListedToken {
  $name: string;
  $type: string;
  $value: string | number | boolean | Record<string, any>;
  $extensions: {
    'app.terrazzo.listing': TokenListingExtension;
  };
}

type ModeOption = {
  name: string;
  values: string[];
  description?: string;
};

type NameOptionBase = {
  type: 'design' | 'token-editor' | 'code';
  description?: string;
  built: boolean;
};

export type NameOption = NameOptionBase &
  // | {
  //     builtIn: 'figma' | 'penpot';
  //   }
  (
    | {
        getName: (token: TokenNormalized) => string;
      }
    | {
        plugin: string;
      }
  );

interface PreviewValueOptionObject {
  [key: string]: string | number | boolean | PreviewValueOptionObject;
}
export type Value = string | number | boolean | PreviewValueOptionObject;

export type Subtype =
  | 'bgColor'
  | 'fgColor'
  | 'borderColor'
  | 'padding'
  | 'margin'
  | 'gap'
  | 'size'
  | 'borderWidth'
  | 'borderRadius';

export interface TokenListingPluginOptions {
  /**
   * Where to output the listing files
   * @default "tokens-[mode].listing.json"
   */
  filename?: string;
  modes?: ModeOption[];
  names?: Record<string, NameOption>;
  defaultSource?: string;
  customSource?: (token: TokenNormalized) => string | undefined;
  customPreviewValue?: (token: TokenNormalized) => Value;
  subtype?: Subtype;
}

// TODO: document all interfaces.
