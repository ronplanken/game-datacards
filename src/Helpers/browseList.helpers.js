import { cardHasKeyword } from "./listCategories.helpers";
import { localize } from "./localization.helpers";

// ===========================================
// Faction browser list building (40K)
// ===========================================
// Shared by the desktop editor's left panel (useDataSourceItems) and the
// viewer/mobile drawer (useDataSourceType), so both browsers group a faction's
// cards the same way.

/** 40K datasources whose factions browse as datasheets + stratagems. */
export const BROWSE_40K_SOURCES = ["40k-10e", "40k-10e-cp", "40k-11e"];

/**
 * True for the 40K datasources that use the faction/role grouped browser.
 * @param {string} source - a datasource id (settings.selectedDataSource)
 */
export const is40kBrowseSource = (source) => BROWSE_40K_SOURCES.includes(source);

/**
 * Role sections, in the order GW prints them on an army roster. Matched against
 * the canonical English keyword, so 10e string keywords and 11e language-keyed
 * object keywords both group (see cardHasKeyword).
 */
export const DATASHEET_ROLES = ["Character", "Battleline", "Dedicated Transport"];

/** Section holding everything that carries none of the role keywords. */
export const OTHER_ROLE = "Other";

/**
 * Split datasheets into collapsible role sections: Character, Battleline,
 * Dedicated Transport, Other. Structural rows (faction/allied separators) carry
 * no keywords and are dropped — roles replace them as the grouping.
 *
 * @param {Array} sheets - datasheets, possibly mixed with structural rows
 * @returns {Array} rows of `{ type: "role", name }` separators followed by their
 *   datasheets, each tagged with `role` so the list can collapse the section
 */
export const groupSheetsByRole = (sheets) => {
  const cards = (sheets || []).filter((sheet) => !sheet?.type);
  const rows = [];

  DATASHEET_ROLES.forEach((role) => {
    rows.push({ type: "role", name: role });
    cards.filter((sheet) => cardHasKeyword(sheet, role)).forEach((sheet) => rows.push({ ...sheet, role }));
  });

  rows.push({ type: "role", name: OTHER_ROLE });
  cards
    .filter((sheet) => DATASHEET_ROLES.every((role) => !cardHasKeyword(sheet, role)))
    .forEach((sheet) => rows.push({ ...sheet, role: OTHER_ROLE }));

  return rows;
};

/**
 * Split stratagems into collapsible sections per detachment, in the order the
 * datasource lists them. A faction ships six stratagems per detachment, so an
 * 11e faction browses as one 60+ item pile without this.
 *
 * @param {Array} stratagems - a faction's stratagems
 * @param {string} [language] - card language, for datasources whose detachment
 *   names are language-keyed objects
 * @returns {Array} rows of `{ type: "role", name }` separators followed by their
 *   stratagems, each tagged with `role` so the list can collapse the section
 */
export const groupStratagemsByDetachment = (stratagems, language = "en") => {
  const sections = new Map();

  (stratagems || []).forEach((stratagem) => {
    const name = localize(stratagem?.detachment, language) || OTHER_ROLE;
    if (!sections.has(name)) {
      sections.set(name, []);
    }
    sections.get(name).push({ ...stratagem, role: name });
  });

  // A nameless detachment sorts last, whatever order the data listed it in.
  const names = [...sections.keys()].filter((name) => name !== OTHER_ROLE);
  if (sections.has(OTHER_ROLE)) {
    names.push(OTHER_ROLE);
  }

  return names.flatMap((name) => [{ type: "role", name }, ...sections.get(name)]);
};

const isCardRow = (row) => Boolean(row) && !row.type;

/**
 * Drop separator rows a search has emptied, so filtering never leaves a role or
 * faction heading with nothing under it.
 *
 * @param {Array} rows - browser rows, separators mixed with cards
 * @returns {Array} the same rows minus the separators that head no cards
 */
const dropEmptySections = (rows) => rows.filter((row, index) => isCardRow(row) || isCardRow(rows[index + 1]));

/**
 * Build a 40K faction's datasheet list: the faction's own sheets plus any parent
 * and allied sheets the settings ask for, grouped by faction or by role, and
 * filtered by the search box.
 *
 * @param {Object} params
 * @param {Object} params.dataSource - the loaded datasource
 * @param {Object} params.selectedFaction - the faction being browsed
 * @param {Object} params.settings - user settings
 * @param {string} [params.searchText] - search box contents
 * @returns {Array} rows for the browser list
 */
export const buildFactionDatasheetList = ({ dataSource, selectedFaction, settings, searchText }) => {
  let filteredSheets = [
    { type: "category", name: selectedFaction.name, id: selectedFaction.id, closed: false },
    ...selectedFaction?.datasheets?.toSorted((a, b) => a.name.localeCompare(b.name)),
  ];

  if (selectedFaction.is_subfaction && settings.combineParentFactions) {
    const parentFaction = dataSource.data.find((faction) => faction.id === selectedFaction.parent_id);

    const parentDatasheets = parentFaction?.datasheets
      ?.filter((val) => val.factions.length === 1 && val.factions.includes(selectedFaction.parent_keyword))
      .map((val) => {
        return { ...val, nonBase: true };
      });

    filteredSheets = [
      ...filteredSheets,
      { type: "category", name: parentFaction.name, id: parentFaction.id, closed: true },
      ...parentDatasheets?.toSorted((a, b) => a.name.localeCompare(b.name)),
    ];
  }

  if (!settings?.showLegends) {
    filteredSheets = filteredSheets?.filter((sheet) => !sheet.legends);
  }
  if (!settings.groupByFaction) {
    filteredSheets = filteredSheets?.toSorted((a, b) => a.name.localeCompare(b.name));
  }
  if (settings.groupByRole) {
    filteredSheets = groupSheetsByRole(filteredSheets);
  }

  if (selectedFaction.allied_factions && selectedFaction.allied_factions.length > 0 && settings.combineAlliedFactions) {
    selectedFaction.allied_factions.forEach((alliedFactionId) => {
      const alliedFaction = dataSource.data.find((faction) => faction.id === alliedFactionId);

      const alliedFactionDatasheets = alliedFaction?.datasheets.map((val) => {
        return { ...val, nonBase: true, allied: true };
      });

      filteredSheets = [
        ...filteredSheets,
        { type: "allied", name: alliedFaction.name, id: alliedFaction.id, closed: true },
        ...alliedFactionDatasheets?.toSorted((a, b) => a.name.localeCompare(b.name)),
      ];
    });
  }

  if (!searchText) {
    return filteredSheets;
  }

  const matches = filteredSheets.filter((sheet) => {
    if (sheet.type) {
      return true;
    }
    return sheet.name.toLowerCase().includes(searchText.toLowerCase());
  });

  return dropEmptySections(matches);
};
