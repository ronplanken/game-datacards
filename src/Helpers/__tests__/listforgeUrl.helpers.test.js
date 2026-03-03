import { describe, it, expect } from "vitest";
import { compressSync, strToU8 } from "fflate";
import { isListForgeHash, decodeListForgeUrlPayload, resolveDataSourceFromPayload } from "../listforgeUrl.helpers";

// Helper: encode a JS object into the same format ListForge would produce
const encodePayload = (obj) => {
  const jsonStr = JSON.stringify(obj);
  const compressed = compressSync(strToU8(jsonStr));
  // Convert Uint8Array to base64
  let binary = "";
  for (let i = 0; i < compressed.length; i++) {
    binary += String.fromCharCode(compressed[i]);
  }
  return btoa(binary);
};

const VALID_ROSTER = {
  id: "roster-1",
  name: "Test Roster",
  generatedBy: "List Forge",
  gameSystemId: "sys-40k",
  gameSystemName: "Warhammer 40,000",
  roster: {
    name: "My Roster",
    costs: [{ name: "pts", typeId: "points", value: 1000 }],
    forces: [
      {
        id: "force-1",
        name: "Test Force",
        entryId: "force-1",
        catalogueId: "cat-1",
        catalogueName: "Test Faction",
        selections: [],
      },
    ],
  },
};

describe("isListForgeHash", () => {
  it("returns true for a valid ListForge hash", () => {
    const payload = encodePayload(VALID_ROSTER);
    expect(isListForgeHash(`#/listforge/${payload}`)).toBe(true);
  });

  it("returns false for an empty string", () => {
    expect(isListForgeHash("")).toBe(false);
  });

  it("returns false for null/undefined", () => {
    expect(isListForgeHash(null)).toBe(false);
    expect(isListForgeHash(undefined)).toBe(false);
  });

  it("returns false for a hash without the listforge prefix", () => {
    expect(isListForgeHash("#/other/data")).toBe(false);
  });

  it("returns false for a hash with prefix but no payload", () => {
    expect(isListForgeHash("#/listforge/")).toBe(false);
  });

  it("returns false for a hash with non-gzip base64 payload", () => {
    // base64 of "hello" - not gzip-compressed, doesn't start with H4sI
    expect(isListForgeHash("#/listforge/aGVsbG8=")).toBe(false);
  });
});

describe("decodeListForgeUrlPayload", () => {
  it("decodes a valid gzip-compressed base64 payload", () => {
    const payload = encodePayload(VALID_ROSTER);
    const hash = `#/listforge/${payload}`;

    const result = decodeListForgeUrlPayload(hash);

    expect(result.error).toBeNull();
    expect(result.data).toEqual(VALID_ROSTER);
  });

  it("returns null data for a hash without the listforge prefix", () => {
    const result = decodeListForgeUrlPayload("#/other/data");
    expect(result.data).toBeNull();
    expect(result.error).toBeNull();
  });

  it("returns null data for null/undefined hash", () => {
    expect(decodeListForgeUrlPayload(null)).toEqual({ data: null, error: null });
    expect(decodeListForgeUrlPayload(undefined)).toEqual({ data: null, error: null });
  });

  it("returns error for empty payload", () => {
    const result = decodeListForgeUrlPayload("#/listforge/");
    expect(result.data).toBeNull();
    expect(result.error).toBe("Empty payload");
  });

  it("returns error for non-gzip payload", () => {
    const result = decodeListForgeUrlPayload("#/listforge/aGVsbG8=");
    expect(result.data).toBeNull();
    expect(result.error).toBe("Invalid payload: not a gzip-compressed stream");
  });

  it("returns error for invalid base64", () => {
    // Starts with gzip prefix but contains invalid base64 characters
    const result = decodeListForgeUrlPayload("#/listforge/H4sIAAAAAAAAA!!!invalid!!!");
    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
  });

  it("returns error for valid gzip but invalid JSON content", () => {
    // Compress a non-JSON string
    const notJson = "this is not json {{{";
    const compressed = compressSync(strToU8(notJson));
    let binary = "";
    for (let i = 0; i < compressed.length; i++) {
      binary += String.fromCharCode(compressed[i]);
    }
    const payload = btoa(binary);
    const hash = `#/listforge/${payload}`;

    const result = decodeListForgeUrlPayload(hash);
    expect(result.data).toBeNull();
    expect(result.error).toBeTruthy();
  });

  it("preserves all fields in the decoded roster", () => {
    const roster = {
      ...VALID_ROSTER,
      roster: {
        ...VALID_ROSTER.roster,
        forces: [
          {
            ...VALID_ROSTER.roster.forces[0],
            selections: [
              {
                id: "sel-1",
                name: "Intercessor Squad",
                type: "unit",
                costs: [{ name: "pts", typeId: "points", value: 160 }],
              },
            ],
          },
        ],
      },
    };

    const payload = encodePayload(roster);
    const result = decodeListForgeUrlPayload(`#/listforge/${payload}`);

    expect(result.data.roster.forces[0].selections).toHaveLength(1);
    expect(result.data.roster.forces[0].selections[0].name).toBe("Intercessor Squad");
  });
});

describe("resolveDataSourceFromPayload", () => {
  it("resolves Warhammer 40,000 to 40k-10e", () => {
    const result = resolveDataSourceFromPayload({ gameSystemName: "Warhammer 40,000" });
    expect(result.dataSourceId).toBe("40k-10e");
    expect(result.label).toBe("Warhammer 40k (10th Edition)");
  });

  it("resolves Age of Sigmar to aos", () => {
    const result = resolveDataSourceFromPayload({ gameSystemName: "Age of Sigmar" });
    expect(result.dataSourceId).toBe("aos");
    expect(result.label).toBe("Age of Sigmar");
  });

  it("is case-insensitive", () => {
    const result = resolveDataSourceFromPayload({ gameSystemName: "WARHAMMER 40,000" });
    expect(result.dataSourceId).toBe("40k-10e");
  });

  it("returns null for unknown game system", () => {
    const result = resolveDataSourceFromPayload({ gameSystemName: "Unknown Game" });
    expect(result.dataSourceId).toBeNull();
    expect(result.label).toBeNull();
  });

  it("returns null when gameSystemName is missing", () => {
    const result = resolveDataSourceFromPayload({});
    expect(result.dataSourceId).toBeNull();
    expect(result.label).toBeNull();
  });

  it("returns null for null/undefined data", () => {
    expect(resolveDataSourceFromPayload(null)).toEqual({ dataSourceId: null, label: null });
    expect(resolveDataSourceFromPayload(undefined)).toEqual({ dataSourceId: null, label: null });
  });
});
