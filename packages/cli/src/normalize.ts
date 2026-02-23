import fs from 'node:fs';
import path from 'node:path';
import * as momoa from '@humanwhocodes/momoa';
import { getObjMember, getObjMembers, traverse } from '@terrazzo/json-schema-tools';
import { defineConfig, type Logger, parse } from '@terrazzo/parser';
import { isAlias } from '@terrazzo/token-tools';
import yaml from 'yaml';
import yamlToMomoa from 'yaml-to-momoa';
import { cwd, printError } from './shared.js';

export interface NormalizeOptions {
  logger: Logger;
  output: URL;
}

function findMember(name: string) {
  return function (member: momoa.MemberNode) {
    return member.name.type === 'String' && member.name.value === name;
  };
}

export async function normalizeCmd(filename: string, { logger, output }: NormalizeOptions) {
  try {
    if (!filename) {
      logger.error({ group: 'config', message: 'Expected input: `tz normalize <tokens.json> -o output.json`' });
      return;
    }
    const sourceLoc = new URL(filename, cwd);
    if (!fs.existsSync(sourceLoc)) {
      logger.error({
        group: 'config',
        message: `Couldn’t find ${path.relative(cwd.href, sourceLoc.href)}. Does it exist?`,
      });
    }

    const sourceData = fs.readFileSync(sourceLoc, 'utf8');
    const isYaml = filename.endsWith('.yml') || filename.endsWith('.yaml') || !sourceData.startsWith('{');
    const document = isYaml ? yamlToMomoa(sourceData) : momoa.parse(sourceData, { mode: 'jsonc' });
    const { tokens } = await parse([{ src: sourceData, filename: sourceLoc }], {
      config: defineConfig(
        {
          lint: {
            rules: {
              'core/consistent-naming': 'off',
              'core/valid-color': 'off',
              'core/valid-dimension': 'off',
              'core/valid-duration': 'off',
              'core/valid-typography': 'off',
            },
          },
        },
        { cwd },
      ),
      logger,
      resolveAliases: false,
      yamlToMomoa,
    });

    traverse(document, {
      enter(node, _parent, nodePath) {
        const token = tokens[nodePath.join('.')];
        if (!token || token.aliasOf || node.type !== 'Member' || node.value.type !== 'Object') {
          return;
        }
        const $valueI = node.value.members.findIndex(findMember('$value'));

        switch (token.$type) {
          case 'color': {
            if (node.value.members[$valueI]!.value.type === 'String') {
              if (isAlias(node.value.members[$valueI]!.value.value)) {
                return;
              }
              const hex = (node.value.members[$valueI]!.value as momoa.StringNode).value;
              node.value.members[$valueI]!.value = momoa.parse(
                JSON.stringify({
                  ...token.$value,
                  hex: hex.startsWith('#') ? hex.slice(0, 7) : undefined,
                }),
              ).body;
              const $extensions = getObjMember(node.value, '$extensions');
              if ($extensions?.type === 'Object') {
                const mode = getObjMember($extensions, 'mode');
                if (mode?.type === 'Object') {
                  for (let i = 0; i < mode.members.length; i++) {
                    const modeName = (mode.members[i]!.name as momoa.StringNode).value;
                    const hex = (mode.members[i]!.value as momoa.StringNode).value;
                    mode.members[i]!.value = momoa.parse(
                      JSON.stringify({
                        ...token.mode[modeName]!.$value,
                        hex: hex.startsWith('#') ? hex.slice(0, 7) : undefined,
                      }),
                    ).body;
                  }
                }
              }
            }
            break;
          }
          case 'dimension':
          case 'duration': {
            if (node.value.members[$valueI]!.value.type === 'String') {
              if (isAlias(node.value.members[$valueI]!.value.value)) {
                return;
              }
              node.value.members[$valueI]!.value = normalizeDurationDimension(node.value.members[$valueI]!.value);
              const $extensions = getObjMember(node.value, '$extensions');
              if ($extensions?.type === 'Object') {
                const mode = getObjMember($extensions, 'mode');
                if (mode?.type === 'Object') {
                  for (let i = 0; i < mode.members.length; i++) {
                    mode.members[i]!.value = normalizeDurationDimension(node.value.members[$valueI]!.value);
                  }
                }
              }
            }
            break;
          }
          case 'typography': {
            if (node.value.members[$valueI]?.value.type !== 'Object') {
              return;
            }
            node.value.members[$valueI].value = normalizeTypography(node.value.members[$valueI].value);
            const $extensions = getObjMember(node.value, '$extensions');
            if ($extensions?.type === 'Object') {
              const mode = getObjMember($extensions, 'mode');
              if (mode?.type === 'Object') {
                for (let i = 0; i < mode.members.length; i++) {
                  mode.members[i]!.value = normalizeTypography(mode.members[i]!.value as momoa.ObjectNode);
                }
              }
            }
          }
        }
      },
    });

    const outputLoc = new URL(output, cwd);
    const contents = isYaml ? yaml.stringify(JSON.parse(momoa.print(document))) : momoa.print(document, { indent: 2 });
    fs.mkdirSync(new URL('.', outputLoc), { recursive: true });
    fs.writeFileSync(outputLoc, contents);
  } catch (err) {
    printError((err as Error).message);
    process.exit(1);
  }
}

function normalizeDurationDimension(node: momoa.StringNode) {
  const value = Number.parseFloat(node.value);
  if (!Number.isFinite(value)) {
    return node;
  }
  (node as any).type = 'Object';
  (node as any).members = (
    momoa.parse(JSON.stringify({ value, unit: node.value.replace(String(value), '') })).body as momoa.ObjectNode
  ).members;
  delete (node as any).value;
  return node;
}

function normalizeTypography(node: momoa.ObjectNode) {
  const { fontFamily, fontSize, fontWeight, letterSpacing, lineHeight } = getObjMembers(node);
  if (!fontFamily) {
    node.members.push((momoa.parse('{"fontFamily":["inherit"]}').body as momoa.ObjectNode).members[0]!);
  }
  if (!fontSize) {
    node.members.push((momoa.parse('{"fontSize":{"value":1,"unit":"rem"}}').body as momoa.ObjectNode).members[0]!);
  }
  if (!fontWeight) {
    node.members.push((momoa.parse('{"fontWeight":400}').body as momoa.ObjectNode).members[0]!);
  }
  if (!letterSpacing) {
    node.members.push((momoa.parse('{"letterSpacing":{"value":0,"unit":"rem"}}').body as momoa.ObjectNode).members[0]!);
  }
  if (!lineHeight) {
    node.members.push((momoa.parse('{"lineHeight":1}').body as momoa.ObjectNode).members[0]!);
  }
  return node;
}
