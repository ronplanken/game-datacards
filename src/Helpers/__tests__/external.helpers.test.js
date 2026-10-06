import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getStarcraftData } from "../external.helpers";

describe("getStarcraftData", () => {
  let originalFetch;

  beforeEach(() => {
    originalFetch = global.fetch;
    vi.stubEnv("VITE_DATASOURCE_STARCRAFT_URL", "https://example.test/sc");
    vi.stubEnv("VITE_VERSION", "9.9.9");
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.unstubAllEnvs();
  });

  it("fetches starcraft-tmg.json and stamps version + lastCheckedForUpdate", async () => {
    const remotePayload = {
      id: "starcraft-tmg",
      name: "Starcraft TMG",
      schema: { baseSystem: "starcraft-tmg" },
      data: [{ id: "terran", name: "Terran" }],
    };
    global.fetch = vi.fn(async () => ({
      ok: true,
      text: async () => JSON.stringify(remotePayload),
    }));

    const result = await getStarcraftData();

    expect(global.fetch).toHaveBeenCalledTimes(1);
    const url = global.fetch.mock.calls[0][0];
    expect(url).toMatch(/^https:\/\/example\.test\/sc\/starcraft-tmg\.json\?\d+$/);
    expect(result.name).toBe("Starcraft TMG");
    expect(result.data).toEqual(remotePayload.data);
    expect(result.version).toBe("9.9.9");
    expect(typeof result.lastCheckedForUpdate).toBe("string");
    expect(() => new Date(result.lastCheckedForUpdate).toISOString()).not.toThrow();
  });
});
