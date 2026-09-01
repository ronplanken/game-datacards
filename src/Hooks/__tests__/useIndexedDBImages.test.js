import { describe, it, expect } from "vitest";
import { FACTION_SYMBOL_PREFIX, toFactionSymbolEntries } from "../useIndexedDBImages";

const record = (id, overrides = {}) => ({
  id,
  image: `blob-${id}`,
  filename: "symbol.svg",
  size: 512,
  type: "image/svg+xml",
  uploadedAt: "2026-01-01T00:00:00.000Z",
  ...overrides,
});

describe("toFactionSymbolEntries", () => {
  it("keeps only faction symbols, not the card artwork sharing the store", () => {
    const entries = toFactionSymbolEntries([record(`${FACTION_SYMBOL_PREFIX}card-1`), record("card-1")]);
    expect(entries).toHaveLength(1);
    expect(entries[0].id).toBe("faction-card-1");
  });

  it("tags each symbol with the card it was uploaded for", () => {
    const entries = toFactionSymbolEntries([record(`${FACTION_SYMBOL_PREFIX}card-9`)]);
    expect(entries[0].cardUuid).toBe("card-9");
    expect(entries[0].filename).toBe("symbol.svg");
    expect(entries[0].image).toBe("blob-faction-card-9");
  });

  it("returns the newest upload first, with undated entries last", () => {
    const entries = toFactionSymbolEntries([
      record(`${FACTION_SYMBOL_PREFIX}a`, { uploadedAt: "2026-01-01T00:00:00.000Z" }),
      record(`${FACTION_SYMBOL_PREFIX}b`, { uploadedAt: undefined }),
      record(`${FACTION_SYMBOL_PREFIX}c`, { uploadedAt: "2026-06-01T00:00:00.000Z" }),
    ]);
    expect(entries.map((entry) => entry.cardUuid)).toEqual(["c", "a", "b"]);
  });

  it("survives a missing or malformed store result", () => {
    expect(toFactionSymbolEntries(undefined)).toEqual([]);
    expect(toFactionSymbolEntries([null, { id: 42 }])).toEqual([]);
  });
});
