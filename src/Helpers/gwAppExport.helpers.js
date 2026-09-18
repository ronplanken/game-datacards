import { capitalizeSentence } from "./external.helpers";
import { cardHasKeyword } from "./listCategories.helpers";
import { getCardDisplayCost, getCategoryPointsTotal } from "./listPoints.helpers";
import { getBattleSize, getDetachmentCost } from "./listRoster.helpers";
import { localize } from "./localization.helpers";

const SECTIONS = [
  { key: "characters", label: "CHARACTERS" },
  { key: "battleline", label: "BATTLELINE" },
  { key: "transports", label: "DEDICATED TRANSPORTS" },
  { key: "other", label: "OTHER DATASHEETS" },
  { key: "allied", label: "ALLIED UNITS" },
];

export const groupUnitsForExport = (cards, factionId) =>
  (cards || []).reduce(
    (sections, card) => {
      if (cardHasKeyword(card, "Character")) {
        sections.characters.push(card);
      } else if (cardHasKeyword(card, "Battleline")) {
        sections.battleline.push(card);
      } else if (cardHasKeyword(card, "Transport") || cardHasKeyword(card, "Dedicated Transport")) {
        sections.transports.push(card);
      } else if (card?.faction_id && card.faction_id !== factionId) {
        sections.allied.push(card);
      } else {
        sections.other.push(card);
      }
      return sections;
    },
    { characters: [], battleline: [], transports: [], other: [], allied: [] },
  );

const listBattleSize = (category, cards) => {
  if (category?.battleSize) return getBattleSize(category.battleSize);
  const source = category?.dataSource || cards?.[0]?.source;
  return source === "40k-11e" ? getBattleSize(undefined) : null;
};

const headerLines = (category, cards, language) => {
  const lines = [
    `${category.name} (${getCategoryPointsTotal(cards)} points)`,
    "",
    category.factionName || category.name,
  ];

  (category.detachments || []).forEach((detachment) => {
    const name = localize(detachment?.name, language);
    if (!name) return;
    lines.push(`${name} (${getDetachmentCost(detachment)} Detachment Points)`);
    const disposition = localize(detachment?.forceDisposition?.name, language);
    if (disposition) lines.push(`Force Dispositions: ${disposition}`);
  });

  const battleSize = listBattleSize(category, cards);
  if (battleSize) lines.push(`${battleSize.label} (${battleSize.points} Points)`);

  return lines;
};

const unitLines = (card, cards, language) => {
  const models = Number(card?.unitSize?.models) > 1 ? ` ${card.unitSize.models}x` : "";
  const displayCost = getCardDisplayCost(card, cards);
  const cost = Number.isFinite(displayCost) ? displayCost : "?";
  const lines = ["", `${card.name}${models} (${cost} pts)`];

  if (card.isWarlord) lines.push("   • Warlord");
  if (card.selectedEnhancement) {
    const name = capitalizeSentence(localize(card.selectedEnhancement?.name, language));
    lines.push(`   • Enhancements: ${name} (+${card.selectedEnhancement?.cost} pts)`);
  }
  (card.selectedWargear || []).forEach((entry) => {
    const name = localize(entry?.name, language);
    if (!name) return;
    const quantity = Number(entry?.quantity) > 1 ? `${entry.quantity}x ` : "";
    lines.push(`   • ${quantity}${name}`);
  });

  return lines;
};

export const buildGwAppListText = (category, cards, language = "en") => {
  if (!category) return "";
  const list = Array.isArray(cards) ? cards : [];
  const sections = groupUnitsForExport(list, category.factionId);
  const lines = headerLines(category, list, language);

  SECTIONS.forEach((section) => {
    const cardsInSection = sections[section.key];
    if (cardsInSection.length === 0) return;
    lines.push("", section.label);
    cardsInSection.forEach((card) => lines.push(...unitLines(card, list, language)));
  });

  lines.push("", "Created with https://game-datacards.eu");
  return lines.join("\n");
};
