/**
 * Inline SVG icons for Starcraft TMG phase section headings and triggered-ability
 * glyph. Glyphs match the Claude Design "SC2 Card" handoff: a right-pointing arrow
 * for movement, a star for assault, and a soldier silhouette for combat. All icons
 * inherit `currentColor` so they tint with the surrounding text colour.
 */

export const StarcraftPhaseMovementIcon = (props) => (
  <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" {...props}>
    <path d="M2 8 L11 8 L11 4 L14 8 L11 12 L11 9 L2 9 Z" />
  </svg>
);

export const StarcraftPhaseAssaultIcon = (props) => (
  <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" {...props}>
    <path d="M8 1 L10 6 L15 7 L11 11 L12 15 L8 13 L4 15 L5 11 L1 7 L6 6 Z" />
  </svg>
);

export const StarcraftPhaseCombatIcon = (props) => (
  <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" {...props}>
    <circle cx="8" cy="6" r="3" />
    <path d="M5 10 L11 10 L13 15 L3 15 Z" />
  </svg>
);

export const StarcraftSpecialIcon = (props) => (
  <svg viewBox="0 0 16 16" fill="currentColor" width="14" height="14" {...props}>
    <path d="M8 1 L10 6 L15 7 L11 11 L12 15 L8 13 L4 15 L5 11 L1 7 L6 6 Z" />
  </svg>
);

export const StarcraftTriggerArrow = (props) => (
  <svg viewBox="0 0 16 16" fill="currentColor" width="13" height="13" {...props}>
    <path d="M8 0 L16 8 L12 8 L12 16 L4 16 L4 8 L0 8 Z" />
  </svg>
);

export const resolveStarcraftPhaseIcon = (phaseStyle) => {
  switch (phaseStyle) {
    case "movement":
      return StarcraftPhaseMovementIcon;
    case "assault":
      return StarcraftPhaseAssaultIcon;
    case "combat":
      return StarcraftPhaseCombatIcon;
    case "special":
      return StarcraftSpecialIcon;
    default:
      return null;
  }
};
