import { describe, it, expect } from "vitest";
import {
  LATEST_DATA_VERSION,
  build11eDataVersionOptions,
  get11eDataVersionValue,
  get11eVersionsManifestUrl,
  parse11eVersionsManifest,
  resolve11eDataVersion,
} from "../dataVersion11e.helpers";

const v946 = { version: 946, url: "https://example.test/sha946/11th/gdc" };
const v931 = { version: 931, url: "https://example.test/sha931/11th/gdc" };

describe("get11eVersionsManifestUrl", () => {
  it("points at versions.json one level above the gdc folder", () => {
    expect(
      get11eVersionsManifestUrl("https://raw.githubusercontent.com/game-datacards/datasources/main/11th/gdc"),
    ).toBe("https://raw.githubusercontent.com/game-datacards/datasources/main/11th/versions.json");
  });

  it("handles a trailing slash", () => {
    expect(get11eVersionsManifestUrl("https://example.test/11th/gdc/")).toBe("https://example.test/11th/versions.json");
  });

  it("returns undefined without a base url", () => {
    expect(get11eVersionsManifestUrl(undefined)).toBeUndefined();
  });
});

describe("parse11eVersionsManifest", () => {
  it("keeps valid entries sorted newest first and trims trailing slashes", () => {
    const result = parse11eVersionsManifest({
      versions: [v931, { version: 946, url: "https://example.test/sha946/11th/gdc/" }],
    });
    expect(result).toEqual([v946, v931]);
  });

  it("drops malformed entries", () => {
    const result = parse11eVersionsManifest({
      versions: [v946, { version: "925", url: "x" }, { version: 913 }, { version: 912, url: "" }, null],
    });
    expect(result).toEqual([v946]);
  });

  it("returns an empty list for a missing or invalid manifest", () => {
    expect(parse11eVersionsManifest(undefined)).toEqual([]);
    expect(parse11eVersionsManifest({ versions: "nope" })).toEqual([]);
  });
});

describe("build11eDataVersionOptions", () => {
  it("starts with Latest followed by each version", () => {
    expect(build11eDataVersionOptions([v946, v931])).toEqual([
      { value: LATEST_DATA_VERSION, label: "Latest" },
      { value: "946", label: "Data version 946" },
      { value: "931", label: "Data version 931" },
    ]);
  });

  it("keeps the pinned version listed when the manifest does not include it", () => {
    const options = build11eDataVersionOptions([], v946);
    expect(options.map((o) => o.value)).toEqual([LATEST_DATA_VERSION, "946"]);
  });

  it("does not duplicate a pinned version that is in the manifest", () => {
    const options = build11eDataVersionOptions([v946, v931], v931);
    expect(options).toHaveLength(3);
  });
});

describe("resolve11eDataVersion", () => {
  it("returns null for Latest", () => {
    expect(resolve11eDataVersion(LATEST_DATA_VERSION, [v946], v946)).toBeNull();
  });

  it("returns the manifest entry for a version", () => {
    expect(resolve11eDataVersion("931", [v946, v931], null)).toEqual(v931);
  });

  it("falls back to the pinned entry when the manifest is unavailable", () => {
    expect(resolve11eDataVersion("946", [], v946)).toEqual(v946);
  });

  it("returns null for an unknown version", () => {
    expect(resolve11eDataVersion("100", [v946], null)).toBeNull();
  });
});

describe("get11eDataVersionValue", () => {
  it("maps no selection to Latest and a pinned entry to its version", () => {
    expect(get11eDataVersionValue(null)).toBe(LATEST_DATA_VERSION);
    expect(get11eDataVersionValue(v946)).toBe("946");
  });
});
