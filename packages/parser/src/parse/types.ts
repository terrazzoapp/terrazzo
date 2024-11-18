export interface ParseInput {
  /** Source filename (if read from disk) */
  filename?: URL;
  /** JSON/YAML string, or JSON-serializable object (if already in memory) */
  src: string | object;
}
