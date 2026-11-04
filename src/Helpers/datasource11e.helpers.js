import { localize } from "./localization.helpers";

export const DATASOURCE_11E_CACHE_VERSION = 2;

export const validate11eIndex = (index) => {
  if (index?.schemaVersion !== 1 || index.source !== "40k-11e") {
    throw new Error("Unsupported 11th-edition datasource index");
  }
  for (const key of ["factions", "legends", "combatPatrol"]) {
    if (!Array.isArray(index[key])) throw new Error(`Missing ${key} in datasource index`);
    const prefix = { factions: "", legends: "legends/", combatPatrol: "combatpatrol/" }[key];
    const files = new Set();
    const ids = new Set();
    for (const entry of index[key]) {
      // Index paths are relative JSON files within this datasource only.
      if (
        !entry.id ||
        !entry.file?.startsWith(prefix) ||
        !/^[a-z0-9_]+\.json$/.test(entry.file.slice(prefix.length)) ||
        files.has(entry.file) ||
        ids.has(entry.id)
      ) {
        throw new Error(`Invalid ${key} datasource entry`);
      }
      files.add(entry.file);
      ids.add(entry.id);
    }
  }
  return index;
};

export const merge11eLegends = (factions, legends) => {
  const byFaction = new Map(legends.map((f) => [f.id, f]));
  for (const f of legends) {
    if (!factions.some((normal) => normal.id === f.id)) throw new Error(`Unknown Legends faction: ${f.name}`);
  }
  return factions.map((faction) => {
    const companion = byFaction.get(faction.id);
    const units = (companion?.datasheets || []).map((unit) => ({ ...unit, isLegends: true, legends: true }));
    const datasheets = [...(faction.datasheets || []), ...units];
    if (new Set(datasheets.map((u) => u.id)).size !== datasheets.length)
      throw new Error(`Duplicate datasheet ID in ${faction.name}`);
    return { ...faction, datasheets, legendsRules: companion?.rules };
  });
};

// Each patrol becomes one selectable browse entry. Ordinary faction units,
// detachments and core stratagems must not leak into that entry.
export const expand11ePatrols = (factions, language) =>
  factions
    .flatMap((faction) => {
      if (!Array.isArray(faction.patrols)) throw new Error(`Missing patrol rosters for ${faction.name}`);
      return faction.patrols.map((patrol) => {
        const units = new Map((faction.datasheets || []).map((unit) => [unit.id, unit]));
        const resolve = (items, ids, key = "id") =>
          (ids || []).map((id) => {
            const item = (items || []).find((candidate) => candidate[key] === id);
            if (!item) throw new Error(`Unresolved patrol reference: ${id}`);
            return { ...item, faction_id: patrol.id };
          });
        return {
          ...faction,
          id: patrol.id,
          name: `${faction.name} - ${localize(patrol.name, language)}`,
          patrolName: localize(patrol.name, language),
          sourceFactionId: faction.id,
          sourceFactionName: faction.name,
          allied_factions: [],
          parent_id: null,
          parent_name: null,
          is_subfaction: false,
          isCombatPatrol: true,
          patrolRoster: patrol.roster,
          datasheets: patrol.roster.map((entry) => {
            const unit = units.get(entry.datasheetId);
            if (!unit || !Number.isInteger(entry.count) || entry.count < 1)
              throw new Error(`Invalid roster in ${localize(patrol.name, language)}`);
            return {
              ...unit,
              faction_id: patrol.id,
              isCombatPatrol: true,
              patrolCount: entry.count,
              isWarlord: entry.isWarlord,
            };
          }),
          detachments: resolve(faction.detachments, [patrol.detachmentId]),
          stratagems: resolve(faction.stratagems, patrol.stratagemIds),
          enhancements: resolve(faction.enhancements, patrol.enhancementIds),
          rules: {
            army: [],
            detachment: resolve(faction.rules?.detachment, patrol.detachmentRuleIds, "detachment_id"),
          },
        };
      });
    })
    .sort((a, b) => a.name.localeCompare(b.name));

export const patrolRosterLabel = (card) =>
  card?.isCombatPatrol && card?.patrolCount
    ? `${card.patrolCount} ${card.patrolCount === 1 ? "unit" : "units"}${card.isWarlord ? " · Warlord" : ""}`
    : null;

export const patrolRouteQuery = (card) => (card?.isCombatPatrol ? `?cardId=${encodeURIComponent(card.id)}` : "");
export const resolveUnitRoute = (units, slug, search) => {
  const id = new URLSearchParams(search).get("cardId");
  return id
    ? units.find((unit) => unit.id === id)
    : units.find((unit) => unit.name.replaceAll(" ", "-").toLowerCase() === slug);
};
