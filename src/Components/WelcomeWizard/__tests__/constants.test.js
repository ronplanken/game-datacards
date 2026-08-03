import { describe, it, expect } from "vitest";
import { GAME_SYSTEMS } from "../constants";

describe("WelcomeWizard GAME_SYSTEMS", () => {
  it("features 11th edition first as a primary game system", () => {
    expect(GAME_SYSTEMS[0].id).toBe("40k-11e");
    expect(GAME_SYSTEMS[0].tier).toBe("primary");
  });

  it("moves 10th edition into the legacy (secondary) options", () => {
    const tenth = GAME_SYSTEMS.find((s) => s.id === "40k-10e");
    expect(tenth).toBeDefined();
    expect(tenth.tier).toBe("secondary");
    expect(tenth.tag).toBe("Legacy");
  });
});
