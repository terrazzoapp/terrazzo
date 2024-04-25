/** split a token ID into a local ID and group ID */
export function splitID(id: string): { local: string; group?: string } {
  const lastSeparatorI = id.lastIndexOf('.');
  if (lastSeparatorI === -1) {
    return { local: id };
  }
  return { local: id.substring(lastSeparatorI + 1), group: id.substring(0, lastSeparatorI) };
}
