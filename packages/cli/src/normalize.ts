import fs from 'node:fs';
import path from 'node:path';
import { type MemberNode, type ObjectNode, type StringNode, parse as parseJSON, print } from '@humanwhocodes/momoa';
import { type Logger, defineConfig, getObjMembers, parse, traverse } from '@terrazzo/parser';
import { isAlias } from '@terrazzo/token-tools';
import { cwd, printError } from './shared.js';

export interface NormalizeOptions {
  logger: Logger;
  output: URL;
}

function findMember(name: string) {
  return function (member: MemberNode) {
    return member.name.type === 'String' && member.name.value === name;
  };
}

export async function normalizeCmd(filename: string, { logger, output }: NormalizeOptions) {
  try {
    if (!filename) {
      logger.error({ message: 'Expected input: `tz normalize <tokens.json> -o output.json`' });
      return;
    }
    const sourceLoc = new URL(filename, cwd);
    if (!fs.existsSync(sourceLoc)) {
      logger.error({ message: `Couldn’t find ${path.relative(cwd.href, sourceLoc.href)}. Does it exist?` });
    }
    const sourceData = fs.readFileSync(sourceLoc, 'utf8');
    const document = parseJSON(sourceData);
    const { tokens } = await parse([{ src: sourceData, filename: sourceLoc }], {
      config: defineConfig({}, { cwd }),
      logger,
    });

    traverse(document, {
      enter(node, _parent, nodePath) {
        const token = tokens[nodePath.join('.')];

        if (!token || token.aliasOf || node.type !== 'Member' || node.value.type !== 'Object') {
          return;
        }
        const $valueI = node.value.members.findIndex(findMember('$value'));

        switch (token.$type) {
          case 'color':
          case 'dimension':
          case 'duration': {
            if (node.value.members[$valueI]!.value.type === 'String') {
              const newValueContainer = parseJSON(JSON.stringify({ $value: token.$value })).body as ObjectNode;
              const newValueNode = newValueContainer.members.find(findMember('$value'))!;
              node.value.members[$valueI] = newValueNode;

              const { $extensions } = getObjMembers(node.value);
              if ($extensions?.type === 'Object') {
                const { mode } = getObjMembers($extensions);
                if (mode?.type === 'Object') {
                  for (let i = 0; i < mode.members.length; i++) {
                    const modeName = (mode.members[i]!.name as StringNode).value;
                    if (isAlias(token.mode[modeName]!)) {
                      continue;
                    }
                    const newModeValueContainer = parseJSON(
                      JSON.stringify({ [modeName]: token.mode[modeName]!.$value }),
                    ).body as ObjectNode;
                    const newModeValueNode = newModeValueContainer.members.find(findMember(modeName))!;
                    mode.members[i] = newModeValueNode;
                  }
                }
              }
            }
            break;
          }
        }
      },
    });

    const outputLoc = new URL(output, cwd);
    fs.mkdirSync(new URL('.', outputLoc), { recursive: true });
    fs.writeFileSync(outputLoc, print(document, { indent: 2 }));
  } catch (err) {
    printError((err as Error).message);
    process.exit(1);
  }
}
