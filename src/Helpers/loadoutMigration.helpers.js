/**
 * Converts legacy period-delimited loadout text to markdown format.
 *
 * Old format: "Every model is equipped with: bolt rifle. Leader has: plasma pistol."
 * New format: "**Every model is equipped with:** bolt rifle.\n**Leader has:** plasma pistol."
 *
 * Skips text that already contains markdown bold syntax.
 */
export function migrateLoadoutToMarkdown(loadout) {
  if (!loadout) return loadout;
  if (loadout.includes("**")) return loadout;

  const sanitized = loadout.replace(/\\n|\n/g, "");
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
