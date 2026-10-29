import { describe, it, expect } from "vitest";
import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { VALID_BASE_SYSTEMS } from "../customSchema.helpers";
import { GAME_SYSTEMS } from "../sharing.helpers";

const MIGRATIONS_DIR = resolve(process.cwd(), "supabase/migrations");

const migrations = readdirSync(MIGRATIONS_DIR)
  .filter((file) => file.endsWith(".sql"))
  .sort()
  .map((file) => readFileSync(resolve(MIGRATIONS_DIR, file), "utf8"));

const latestAllowedValues = (constraintName) => {
  const pattern = new RegExp(
    `ADD CONSTRAINT ${constraintName}\\s+CHECK\\s*\\(\\s*game_system IS NULL OR game_system IN \\(([^)]*)\\)`,
    "g",
  );
  let latest = null;
  for (const sql of migrations) {
    for (const match of sql.matchAll(pattern)) {
      latest = [...match[1].matchAll(/'([^']+)'/g)].map((value) => value[1]);
    }
  }
  return latest;
};

const requiredValues = [...new Set([...VALID_BASE_SYSTEMS, ...GAME_SYSTEMS.map((gs) => gs.value)])];

describe.each(["valid_game_system", "valid_template_game_system"])("%s check constraint", (constraintName) => {
  it("is defined in the migrations", () => {
    expect(latestAllowedValues(constraintName)).not.toBeNull();
  });

  it.each(requiredValues)("allows %s", (value) => {
    expect(latestAllowedValues(constraintName)).toContain(value);
  });
});
