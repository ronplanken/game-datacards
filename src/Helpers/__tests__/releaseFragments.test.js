import { describe, it, expect } from "vitest";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

// Issue-to-PR PRs drop a release fragment in changes/unreleased/<issue>.json;
// the post-merge Release workflow consumes it (bump version + append a
// notification entry). A malformed fragment would break that release, so this
// test validates every fragment on the branch. On main the directory is
// normally empty (fragments are deleted on release), so the per-file checks
// simply do not run.
const FRAGMENT_DIR = resolve(process.cwd(), "changes/unreleased");
const ALLOWED_SEVERITY = ["info", "success", "warning", "error"];

const fragmentFiles = existsSync(FRAGMENT_DIR)
  ? readdirSync(FRAGMENT_DIR).filter((file) => file.endsWith(".json"))
  : [];

describe("release fragments (changes/unreleased)", () => {
  it("has the fragments directory", () => {
    expect(existsSync(FRAGMENT_DIR)).toBe(true);
  });

  it.each(fragmentFiles)("%s is a valid release fragment", (file) => {
    const raw = readFileSync(resolve(FRAGMENT_DIR, file), "utf8");

    let parsed;
    expect(() => {
      parsed = JSON.parse(raw);
    }, `${file} must be valid JSON`).not.toThrow();

    expect(typeof parsed.title, `${file} needs a string "title"`).toBe("string");
    expect(parsed.title.trim().length).toBeGreaterThan(0);
    expect(typeof parsed.body, `${file} needs a string "body"`).toBe("string");
    expect(parsed.body.trim().length).toBeGreaterThan(0);

    if (parsed.severity !== undefined) {
      expect(ALLOWED_SEVERITY, `${file} severity must be one of ${ALLOWED_SEVERITY.join(", ")}`).toContain(
        parsed.severity,
      );
    }

    // version and timestamp are assigned by the release workflow, not the PR.
    expect(parsed.version, `${file} must not set "version"`).toBeUndefined();
    expect(parsed.timestamp, `${file} must not set "timestamp"`).toBeUndefined();
  });
});
