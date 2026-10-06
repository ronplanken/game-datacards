/**
 * Shared helpers for reading/writing weapon arrays across 40k/aos/custom formats.
 */

export function getWeaponsArray(card, weaponTypeKey, format) {
  if (format === "40k") return card[weaponTypeKey] || [];
  if (format === "aos") return card.weapons?.[weaponTypeKey] || [];
  return card.weapons?.[weaponTypeKey] || card[weaponTypeKey] || [];
}

export function setWeaponsOnCard(card, weaponTypeKey, weapons, format) {
  if (format === "40k") {
    return { ...card, [weaponTypeKey]: weapons };
  }
  if (format === "aos") {
    return { ...card, weapons: { ...card.weapons, [weaponTypeKey]: weapons } };
  }
  // Custom: prefer weapons object if it exists
  if (card.weapons?.[weaponTypeKey] !== undefined) {
    return { ...card, weapons: { ...card.weapons, [weaponTypeKey]: weapons } };
  }
  return { ...card, [weaponTypeKey]: weapons };
}
