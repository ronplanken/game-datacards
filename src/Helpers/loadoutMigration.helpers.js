/**
 * Converts legacy period-delimited loadout text to markdown format.
 *
 * Old format: "Every model is equipped with: bolt rifle. Leader has: plasma pistol."
 * New format: "**Every model is equipped with:** bolt rifle.\n**Leader has:** plasma pistol."
 *
 * Only transforms text that matches the legacy pattern (colon-delimited segments
 * separated by periods). Plain text and markdown content pass through unchanged.
 */
export function migrateLoadoutToMarkdown(loadout) {
  if (!loadout) return loadout;
  if (loadout.includes("**")) return loadout;
  if (!loadout.includes(":")) return loadout;

  // Strip escaped newline literals (\n as two chars) from legacy data
  const sanitized = loadout.replace(/\\n/g, "");
  const segments = sanitized.split(".").filter((s) => s.trim());

  if (segments.length === 0) return loadout;

  const lines = segments.map((segment) => {
    const colonIndex = segment.indexOf(":");
    if (colonIndex > 0) {
      const name = segment.slice(0, colonIndex).trim();
      const desc = segment.slice(colonIndex + 1).trim();
      return `**${name}:** ${desc}.`;
    }
    return `${segment.trim()}.`;
  });

  return lines.join("\n");
}
