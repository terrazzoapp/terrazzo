import type { Config } from "./config";
import type { GroupNode, TokenSchema, RawTokenSchema, RawTokenNode, SchemaNode } from "./parse";
import fs from "fs";

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
    function formatNode({ group, id, localID, node }: { group?: GroupNode; id: string; localID: string; node: RawTokenNode }): SchemaNode {
      const schemaNode: SchemaNode = { ...(node as any), id, localID };
      if (group) schemaNode.group = group;

      if (!(schemaNode as any).type || typeof (schemaNode as any).type != "string") {
        const groupNode = schemaNode as GroupNode;
        for (const k of Object.keys(groupNode)) {
          if (k == "modes") continue;
          if (!groupNode.tokens) groupNode.tokens = {};
          groupNode.tokens[k] = formatNode({ id: [id, k].join("."), localID: k, node: (groupNode as any)[k], group: groupNode });
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
          const filePath = new URL(fileName.replace(/^\//, "").replace(/^(\.\.\/)+/, ""), this.config.outDir);
          fs.mkdirSync(new URL("./", filePath), { recursive: true });
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
