import { describe, it, expect } from "vitest";
import { PRIMARY_MOBILE_SYSTEMS } from "../mobileGameSystems";

describe("PRIMARY_MOBILE_SYSTEMS", () => {
  it("lists 11th edition first so it is the mobile default", () => {
    expect(PRIMARY_MOBILE_SYSTEMS[0].id).toBe("40k-11e");
  });

  it("still offers 10th edition", () => {
    expect(PRIMARY_MOBILE_SYSTEMS.some((s) => s.id === "40k-10e")).toBe(true);
  });

  it("lists 10th edition last, flagged as legacy", () => {
    const last = PRIMARY_MOBILE_SYSTEMS[PRIMARY_MOBILE_SYSTEMS.length - 1];
    expect(last.id).toBe("40k-10e");
    expect(last.legacy).toBe(true);
  });

  it("flags no current-edition system as legacy", () => {
    const legacy = PRIMARY_MOBILE_SYSTEMS.filter((s) => s.legacy).map((s) => s.id);
    expect(legacy).toEqual(["40k-10e"]);
  });
});
