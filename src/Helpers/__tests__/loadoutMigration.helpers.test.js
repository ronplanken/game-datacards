import { describe, it, expect } from "vitest";
import { migrateLoadoutToMarkdown } from "../loadoutMigration.helpers";

describe("migrateLoadoutToMarkdown", () => {
  it("returns null/undefined/empty unchanged", () => {
    expect(migrateLoadoutToMarkdown(null)).toBe(null);
    expect(migrateLoadoutToMarkdown(undefined)).toBe(undefined);
    expect(migrateLoadoutToMarkdown("")).toBe("");
  });

  it("skips text that already contains markdown bold", () => {
    const md = "**Already bold:** some text.";
    expect(migrateLoadoutToMarkdown(md)).toBe(md);
  });

  it("converts single colon-delimited entry", () => {
    expect(migrateLoadoutToMarkdown("Every model is equipped with: bolt rifle.")).toBe(
      "**Every model is equipped with:** bolt rifle.",
    );
  });

  it("converts multiple period-delimited entries with colons", () => {
    const input = "Every model is equipped with: bolt rifle. Leader has: plasma pistol.";
    const expected = "**Every model is equipped with:** bolt rifle.\n**Leader has:** plasma pistol.";
    expect(migrateLoadoutToMarkdown(input)).toBe(expected);
  });

  it("handles entries without colons", () => {
    const input = "Bolt rifle. Grenades. Combat knife.";
    const expected = "Bolt rifle.\nGrenades.\nCombat knife.";
    expect(migrateLoadoutToMarkdown(input)).toBe(expected);
  });

  it("handles mix of colon and non-colon entries", () => {
    const input = "Every model is equipped with: bolt rifle. Grenades.";
    const expected = "**Every model is equipped with:** bolt rifle.\nGrenades.";
    expect(migrateLoadoutToMarkdown(input)).toBe(expected);
  });

  it("strips escaped newlines from legacy data", () => {
    const input = "Every model is equipped with: bolt rifle.\\nLeader has: plasma pistol.";
    const expected = "**Every model is equipped with:** bolt rifle.\n**Leader has:** plasma pistol.";
    expect(migrateLoadoutToMarkdown(input)).toBe(expected);
  });

  it("handles trailing period without extra empty line", () => {
    const input = "Equipped with: bolter.";
    expect(migrateLoadoutToMarkdown(input)).toBe("**Equipped with:** bolter.");
  });

  it("handles whitespace around segments", () => {
    const input = "  Name: value .  Other: thing . ";
    const expected = "**Name:** value.\n**Other:** thing.";
    expect(migrateLoadoutToMarkdown(input)).toBe(expected);
  });
});
