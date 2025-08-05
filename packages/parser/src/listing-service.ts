import { Logger } from "@terrazzo/parser";

export interface AnnotationEntry {
  name: string;
  mode: string;
  pluginId: string;
  tokenId: string;
}

export default class ListingService {
  #logger?: Logger;

  // Flat structure for all pluginId, tokenId, mode combinations
  #annotationStore = new Map<string, AnnotationEntry>();

  // Index for quick lookup of all annotations for a tokenId
  #tokenIndex = new Map<string, AnnotationEntry[]>();

  constructor(options?: { logger?: Logger }) {
    this.#logger = options?.logger;
    this.#annotationStore.clear();
    this.#tokenIndex.clear();
    this.#logger?.debug({
      group: 'plugin',
      label: `listing > initAnnotations`,
      message: `Initialising annotation store.`,
    });
  }

  #getAnnotationUUID(pluginId: string, tokenId: string, mode: string): string {
    const normalizedMode = mode === '.' ? undefined : mode;
    return `${pluginId}...${tokenId}...${normalizedMode}`;
  }

  #setAnnotation(uuid: string, tokenId: string, entry: AnnotationEntry) {
    this.#annotationStore.set(uuid, entry);

    const indexedEntries = this.#tokenIndex.get(tokenId) ?? []
    indexedEntries.push(entry);
    this.#tokenIndex.set(tokenId, indexedEntries);
  }

  listBuiltToken({ mode, name, pluginId, tokenId }: {pluginId: string, tokenId: string, mode: string, name: string}) {
    const uuid = this.#getAnnotationUUID(pluginId, tokenId, mode);
    const existing = this.#annotationStore.get(uuid);
    if (existing) {
      if (existing.name !== name) {
        this.#logger?.warn({
          group: 'plugin',
          label: `listing > annotateToken > ${pluginId}`,
          message: `Token "${tokenId}" annotation name changed from "${existing.name}" to "${name}".`,
        });
      }
      existing.name = name ?? existing.name;
    } else {
      this.#setAnnotation(uuid, tokenId, {
        name,
        mode,
        pluginId,
        tokenId,
      });
    }
  }

  getAnnotationsForToken(tokenId: string, mode?: string): AnnotationEntry[] {
    const tokenMap = this.#tokenIndex.get(tokenId) ?? []

    return tokenMap.filter((entry) => mode === undefined || entry.mode === mode)
  }
}
