import { describe, it, expect } from "vitest";
import {
  LATEST_DATA_VERSION,
  build11eDataVersionOptions,
  get11eDataVersionValue,
  get11eVersionsManifestUrl,
  is11eDataVersionUrlAllowed,
  parse11eVersionsManifest,
  resolve11eDataVersion,
} from "../dataVersion11e.helpers";

const v946 = { version: 946, url: "https://example.test/sha946/11th/gdc" };
const v931 = { version: 931, url: "https://example.test/sha931/11th/gdc" };
const BASE = "https://example.test/main/11th/gdc";

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

describe("is11eDataVersionUrlAllowed", () => {
  it("accepts a url on the same origin as the datasource", () => {
    expect(is11eDataVersionUrlAllowed(v946.url, BASE)).toBe(true);
  });

  it("rejects another host, another protocol and invalid urls", () => {
    expect(is11eDataVersionUrlAllowed("https://evil.test/11th/gdc", BASE)).toBe(false);
    expect(is11eDataVersionUrlAllowed("http://example.test/11th/gdc", BASE)).toBe(false);
    expect(is11eDataVersionUrlAllowed("not a url", BASE)).toBe(false);
    expect(is11eDataVersionUrlAllowed(undefined, BASE)).toBe(false);
    expect(is11eDataVersionUrlAllowed(v946.url, undefined)).toBe(false);
  });
});

describe("parse11eVersionsManifest", () => {
  it("keeps valid entries sorted newest first and trims trailing slashes", () => {
    const result = parse11eVersionsManifest(
      { versions: [v931, { version: 946, url: "https://example.test/sha946/11th/gdc/" }] },
      BASE,
    );
    expect(result).toEqual([v946, v931]);
  });

  it("drops malformed entries", () => {
    const result = parse11eVersionsManifest(
      { versions: [v946, { version: "925", url: "x" }, { version: 913 }, { version: 912, url: "" }, null] },
      BASE,
    );
    expect(result).toEqual([v946]);
  });

  it("drops entries that point to another origin", () => {
    const result = parse11eVersionsManifest(
      {
        versions: [
          v946,
          { version: 931, url: "https://evil.test/sha931/11th/gdc" },
          { version: 925, url: "http://example.test/sha925/11th/gdc" },
        ],
      },
      BASE,
    );
    expect(result).toEqual([v946]);
  });

  it("drops every entry without a base url to compare against", () => {
    expect(parse11eVersionsManifest({ versions: [v946] })).toEqual([]);
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

  it("keeps a pinned version that the manifest no longer lists", () => {
    expect(resolve11eDataVersion("946", [v931], v946)).toEqual(v946);
    expect(build11eDataVersionOptions([v931], v946).map((o) => o.value)).toEqual([LATEST_DATA_VERSION, "946", "931"]);
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
