/**
 * Resolves the view the middle panel should actually render. Guards against
 * impossible states: the glossary view only renders when it was explicitly
 * opened, the active datasource has a glossary, and no card is selected.
 * Anything else falls back to the card view.
 *
 * @param {string} middleView - The requested view ("card" | "glossary")
 * @param {object|null|undefined} activeCard - The currently selected card
 * @param {boolean} hasGlossary - Whether the active datasource has glossary entries
 * @returns {"card" | "glossary"}
 */
export const getEffectiveMiddleView = (middleView, activeCard, hasGlossary) =>
  middleView === "glossary" && hasGlossary && !activeCard ? "glossary" : "card";
