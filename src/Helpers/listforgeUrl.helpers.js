import { decompressSync } from "fflate";

const LISTFORGE_HASH_PREFIX = "#/listforge/";

// Gzip magic number + deflate method as base64 (bytes 1f 8b 08)
const GZIP_BASE64_PREFIX = "H4sI";

/**
 * Check whether a location hash looks like a ListForge URL payload.
 * @param {string} hash - window.location.hash
 * @returns {boolean}
 */
export const isListForgeHash = (hash) => {
  if (!hash || !hash.startsWith(LISTFORGE_HASH_PREFIX)) return false;
  const payload = hash.slice(LISTFORGE_HASH_PREFIX.length);
  return payload.length > 0 && payload.startsWith(GZIP_BASE64_PREFIX);
};

/**
 * Decode a ListForge URL payload from the location hash.
 *
 * Pipeline: base64 string -> Uint8Array -> gzip decompress -> UTF-8 string -> JSON parse
 *
 * @param {string} hash - window.location.hash (e.g. "#/listforge/H4sIAAAAAAAAA...")
 * @returns {{ data: Object|null, error: string|null }}
 */
export const decodeListForgeUrlPayload = (hash) => {
  if (!hash || !hash.startsWith(LISTFORGE_HASH_PREFIX)) {
    return { data: null, error: null };
  }

  const payload = hash.slice(LISTFORGE_HASH_PREFIX.length);

  if (!payload) {
    return { data: null, error: "Empty payload" };
  }

  if (!payload.startsWith(GZIP_BASE64_PREFIX)) {
    return { data: null, error: "Invalid payload: not a gzip-compressed stream" };
  }

  try {
    // Base64 decode to Uint8Array
    const binaryString = atob(payload);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // Gzip decompress
    const decompressed = decompressSync(bytes);

    // UTF-8 decode
    const jsonString = new TextDecoder().decode(decompressed);

    // JSON parse
    const data = JSON.parse(jsonString);

    return { data, error: null };
  } catch (err) {
    if (err instanceof DOMException || err?.name === "InvalidCharacterError") {
      return { data: null, error: "Invalid payload: malformed base64" };
    }
    if (err?.message?.includes("invalid") || err?.code) {
      return { data: null, error: "Invalid payload: decompression failed" };
    }
    if (err instanceof SyntaxError) {
      return { data: null, error: "Invalid payload: malformed JSON" };
    }
    return { data: null, error: `Failed to decode payload: ${err.message}` };
  }
};

/**
 * Remove the ListForge hash from the URL without triggering navigation.
 */
export const cleanListForgeHash = () => {
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
};

/**
 * Map from ListForge gameSystemName values to internal datasource IDs.
 * Keys are lowercase for case-insensitive matching.
 */
const GAME_SYSTEM_TO_DATASOURCE = {
  "warhammer 40,000": "40k-10e",
  "warhammer 40k": "40k-10e",
  "age of sigmar": "aos",
};

/**
 * Human-readable labels for datasource IDs, used in toast messages.
 */
const DATASOURCE_LABELS = {
  "40k-10e": "Warhammer 40k (10th Edition)",
  aos: "Age of Sigmar",
};

/**
 * Resolve which internal datasource a ListForge payload requires,
 * based on the gameSystemName field.
 *
 * @param {Object} data - Decoded ListForge payload
 * @returns {{ dataSourceId: string|null, label: string|null }}
 */
export const resolveDataSourceFromPayload = (data) => {
  const gameSystem = data?.gameSystemName;
  if (!gameSystem) return { dataSourceId: null, label: null };

  const dataSourceId = GAME_SYSTEM_TO_DATASOURCE[gameSystem.toLowerCase()] || null;
  const label = dataSourceId ? DATASOURCE_LABELS[dataSourceId] || dataSourceId : null;

  return { dataSourceId, label };
};
