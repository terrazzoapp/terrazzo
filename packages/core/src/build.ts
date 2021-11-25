import type { Config } from './config';
import type { GroupNode, TokenSchema, RawSchemaNode, RawTokenSchema, SchemaNode, TokenValue } from './parse';
import fs from 'fs';

export interface Plugin {
  name: string;
  /** (optional) load config */
  config?: (config: Config) => void;
  /** main build fn */
  build(options: { schema: TokenSchema; rawSchema: RawTokenSchema }): Promise<BuildResult[]>;
}

export interface BuildResult {
  /** File to output inside config.outDir (ex: ./tokens.sass) */
  fileName: string;
  /** File contents */
  contents: string | Buffer;
}

export class Builder {
  config: Config;
  schema: RawTokenSchema;

  constructor({ config, schema }: { config: Config; schema: RawTokenSchema }) {
    this.config = config;
    this.schema = schema;
  }

  public async build(): Promise<void> {
    function formatNode({ group, id, localID, node }: { group?: GroupNode; id: string; localID: string; node: RawSchemaNode }): SchemaNode {
      const schemaNode: SchemaNode = { ...(node as any), id, localID };
      if (!schemaNode.type) schemaNode.type = 'token';
      if (group) schemaNode.group = group;

      switch (schemaNode.type) {
        case 'group': {
          for (const k of Object.keys(schemaNode.tokens)) {
            schemaNode.tokens[k] = formatNode({ id: [id, k].join('.'), localID: k, node: schemaNode.tokens[k], group: schemaNode });
          }
          break;
        }
        default: {
          if (Array.isArray(schemaNode.value)) {
            const modeValues: TokenValue = { default: schemaNode.value[0] };
            if (group && group.modes) {
              let n = 1;
              for (const mode of group.modes) {
                modeValues[mode] = schemaNode.value[n] || schemaNode.value[0];
                n++;
              }
            }
            schemaNode.value = modeValues;
          } else if (typeof schemaNode.value !== 'object') {
            schemaNode.value = { default: schemaNode.value };
          }
          break;
        }
      }

      return schemaNode;
    }

    // turn RawTokenSchema into TokenSchema
    const schema: TokenSchema = { ...this.schema, tokens: {} };
    for (const k of Object.keys(this.schema.tokens)) {
      schema.tokens[k] = formatNode({ id: k, localID: k, node: this.schema.tokens[k] });
    }

    for (const plugin of this.config.plugins) {
      try {
        // config()
        if (plugin.config) plugin.config(this.config);

        // build()
        const results = await plugin.build({ schema, rawSchema: this.schema });
        for (const { fileName, contents } of results) {
          const filePath = new URL(fileName.replace(/^\//, '').replace(/^(\.\.\/)+/, ''), this.config.outDir);
          fs.mkdirSync(new URL('./', filePath), { recursive: true });
          fs.writeFileSync(filePath, contents);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error(`[${plugin.name}] ${err}`);
        throw err;
      }
    }
  }
}
