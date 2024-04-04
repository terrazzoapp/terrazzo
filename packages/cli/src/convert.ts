import type { ParsedToken } from '@cobalt-ui/core';
import { isAlias, getLocalID, getAliasID } from '@cobalt-ui/utils';
import { parse } from 'culori';

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface ConvertResult {
  errors?: string[];
  warnings?: string[];
  result: any;
}

const DURATION_RE = /^[0-9]+(\.[0-9]+)?(s|ms)$/;

/** Convert a Style Dictionary format into DTCG. Or die trying. */
export default function convert(input: any): ConvertResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const result: ConvertResult = { result: {} };
  const parsedTokens: { id: string; $type: ParsedToken['$type']; $value: string | number }[] = [];
  const aliasedTokens: { id: string; $value: string }[] = [];

  function walk(node: any, ctx: { path: string[] }): void {
    if (!node || typeof node !== 'object') {
      return;
    }

    if ('value' in node) {
      let type: ParsedToken['$type'] | undefined = undefined;

      if (typeof node.value === 'string') {
        if (isAlias(node.value)) {
          aliasedTokens.push({ id: ctx.path.join('.'), $value: node.value });
          return;
        }
        if (!type && String(Number(node.value)) === node.value) {
          type = 'number';
        }
        if (!type && !Number.isNaN(Number.parseFloat(node.value))) {
          type = DURATION_RE.test(node.value) ? 'duration' : 'dimension';
        }
        if (!type && parse(node.value)) {
          type = 'color'; // note: parse() is heavy and pulls in all colorspaces, but we actually need that
        }
        if (!type && node.value.length) {
          type = 'fontFamily';
        }
        // TODO: handle other types?
      } else if (typeof node.value === 'number') {
        type = 'number';
      }
      if (type) {
        parsedTokens.push({
          id: ctx.path.join('.'),
          $type: type,
          $value: node.value,
        });
      }
    } else {
      for (const k in node) {
        walk(node[k], { path: [...ctx.path, k] });
      }
    }
  }

  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    errors.push(
      `Unexpected format for Style Dictionary, expected object, received ${
        Array.isArray(input) ? 'array' : typeof input
      }`,
    );
  } else {
    // build base tokens
    walk(input, { path: [] });
  }

  // only add errors/warnings if there were any
  if (errors.length) {
    result.errors = errors;
  }
  if (warnings.length) {
    result.warnings = warnings;
  }

  // build core tokens
  for (const token of parsedTokens) {
    let node = result.result;
    const idParts = token.id.split('.');
    for (let i = 0; i < idParts.length; i++) {
      const idPart = idParts[i]!;
      if (!node[idPart]) {
        node[idPart] = {};
      }
      if (i === idParts.length - 1) {
        node[idPart].$type = token.$type;
        node[idPart].$value = token.$value;
      }
      node = node[idPart]!;
    }
  }
  // build aliases
  for (const alias of aliasedTokens) {
    // try and resolve
    const allLookups = new Set<string>();
    let nextLookup = alias.$value;
    let resolvedToken: (typeof parsedTokens)[0] | undefined = undefined;
    while (!resolvedToken) {
      // note: rather than error and exit here, since we’re parsing Style Dictionary
      // we’ll just report a warning and move on. that way users get _something_
      if (allLookups.has(nextLookup)) {
        warnings.push(`"${alias.$value}" is a circular reference`);
        break;
      }
      allLookups.add(nextLookup);
      const maybeID = getAliasID(nextLookup);
      // note: in Style Dictionary, the alias may point to the last segment
      // of the ID (local ID) rather than the full ID.
      // Allow those matches, but only if a full match isn’t found.
      let resolved = parsedTokens.find((t) => t.id === maybeID);
      if (!resolved) {
        resolved = parsedTokens.find((t) => getLocalID(t.id) === maybeID);
      }
      if (resolved) {
        resolvedToken = resolved;
        break;
      }
      let nextAlias = aliasedTokens.find((t) => t.id === maybeID);
      if (!nextAlias) {
        nextAlias = aliasedTokens.find((t) => getLocalID(t.id) === maybeID);
      }
      if (nextAlias) {
        nextLookup = nextAlias.$value; // the search continues!
        continue;
      }
      warnings.push(`Couldn’t resolve "${alias.$value}" to a token`);
      break;
    }

    // if base token found, add to result
    if (resolvedToken) {
      let node = result.result;
      const idParts = alias.id.split('.');
      for (let i = 0; i < idParts.length; i++) {
        const idPart = idParts[i]!;
        if (!node[idPart]) {
          node[idPart] = {};
        }
        if (i === idParts.length - 1) {
          node[idPart].$type = resolvedToken.$type;
          node[idPart].$value = `{${resolvedToken.id}}`; // use the correct alias (in case this was a partial before)
        }
        node = node[idPart]!;
      }
    }
  }

  // return
  return result;
}
