import fs from 'fs';
import type { Config } from './config';
import type { GroupNode, TokenSchema, RawSchemaNode, RawTokenSchema, SchemaNode } from './parse';

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

  /** Build all the tokens */
  public async build(): Promise<void> {
    /** add additional token properties */
    function formatNode({ group, id, localID, node }: { group?: GroupNode; id: string; localID: string; node: RawSchemaNode }): SchemaNode {
      const schemaNode: SchemaNode = { ...(node as any), id, localID };
      if (!schemaNode.type) schemaNode.type = 'token';
      if (group) schemaNode.group = group;
      if (schemaNode.type === 'group') {
        for (const k of Object.keys(schemaNode.tokens)) {
          schemaNode.tokens[k] = formatNode({ id: [id, k].join('.'), localID: k, node: schemaNode.tokens[k], group: schemaNode });
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
