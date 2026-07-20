import { describe, it, expect } from "vitest";
import { PRIMARY_MOBILE_SYSTEMS } from "../mobileGameSystems";

describe("PRIMARY_MOBILE_SYSTEMS", () => {
  it("lists 11th edition first so it is the mobile default", () => {
    expect(PRIMARY_MOBILE_SYSTEMS[0].id).toBe("40k-11e");
  });

  it("still offers 10th edition", () => {
    expect(PRIMARY_MOBILE_SYSTEMS.some((s) => s.id === "40k-10e")).toBe(true);
  });
});
