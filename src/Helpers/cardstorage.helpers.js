import { compare } from "compare-versions";
import { v4 as uuidv4 } from "uuid";
import { useDataSourceStorage } from "../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../Hooks/useSettingsStorage";

const defaultCategories = {
  version: process.env.REACT_APP_VERSION,
  categories: [
    {
      uuid: uuidv4(),
      name: "My Cards",
      cards: [],
    },
  ],
};

export const useDataSourceType = (searchText) => {
  const { settings } = useSettingsStorage();
  const { dataSource, selectedFaction } = useDataSourceStorage();

  let filteredSheets = [];
  if (selectedFaction && settings.selectedDataSource === "40k-10e") {
    filteredSheets = [
      { type: "category", name: selectedFaction.name, id: selectedFaction.id, closed: false },
      ...selectedFaction?.datasheets?.toSorted((a, b) => a.name.localeCompare(b.name)),
    ];
    if (selectedFaction.is_subfaction && settings.combineParentFactions) {
      let parentFaction = dataSource.data.find((faction) => faction.id === selectedFaction.parent_id);

      let parentDatasheets = parentFaction?.datasheets
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
      filteredSheets = filteredSheets.toSorted((a, b) => a.name.localeCompare(b.name));
    }
    if (settings.groupByRole) {
      const types = ["Battleline", "Character", "Dedicated Transport"];
      let byRole = [];

      types.map((role) => {
        byRole = [...byRole, { type: "header", name: role }];
        byRole = [...byRole, ...filteredSheets?.filter((sheet) => sheet?.keywords?.includes(role))];
      });

      byRole = [
        ...byRole,
        { type: "header", name: "Other" },
        ...filteredSheets?.filter((sheet) => {
          return types.every((t) => !sheet?.keywords?.includes(t));
        }),
      ];

      filteredSheets = byRole;
    }

    if (
      selectedFaction.allied_factions &&
      selectedFaction.allied_factions.length > 0 &&
      settings.combineAlliedFactions
    ) {
      selectedFaction.allied_factions.forEach((alliedFactionId) => {
        let alliedFaction = dataSource.data.find((faction) => faction.id === alliedFactionId);

        let alliedFactionDatasheets = alliedFaction?.datasheets.map((val) => {
          return { ...val, nonBase: true };
        });

        filteredSheets = [
          ...filteredSheets,
          { type: "category", name: alliedFaction.name, id: alliedFaction.id, closed: true },
          ...alliedFactionDatasheets?.toSorted((a, b) => a.name.localeCompare(b.name)),
        ];
      });
    }
    filteredSheets = searchText
      ? filteredSheets.filter((sheet) => {
          if (sheet.type === "category" || sheet.type === "header") {
            return true;
          }
          return sheet.name.toLowerCase().includes(searchText.toLowerCase());
        })
      : filteredSheets;

    return filteredSheets;
  }
  if (selectedFaction && settings.selectedDataSource !== "40k-10e") {
    filteredSheets = searchText
      ? selectedFaction?.datasheets?.filter((sheet) => sheet.name.toLowerCase().includes(searchText.toLowerCase()))
      : selectedFaction?.datasheets;
    if (!settings?.showLegends) {
      filteredSheets = filteredSheets?.filter((sheet) => !sheet.legends);
    }
    if (settings?.splitDatasheetsByRole && !settings?.noDatasheetOptions) {
      const types = [...new Set(filteredSheets?.map((item) => item.role))];
      let byRole = [];
      types.map((role) => {
        byRole = [...byRole, { type: "header", name: role }];
        byRole = [...byRole, ...filteredSheets?.filter((sheet) => sheet.role === role)];
      });
      return byRole;
    }
    return filteredSheets;
  }

  return [];
};

const upgradeStoredCards = (parsedJson) => {
  try {
    //If older then version 1.2.x
    if (compare(parsedJson.version, "1.2.0", "<")) {
      if (parsedJson.categories) {
        return parsedJson;
      }
      const newCards = parsedJson.map((card) => {
        return { ...card, uuid: uuidv4(), source: "40k" };
      });
      return {
        ...defaultCategories,
        categories: [{ ...defaultCategories.categories[0], cards: newCards }],
      };
    }
    //Check if cards were saved with the previous version and add the source option.
    if (compare(parsedJson.version, "1.2.0", "=")) {
      return {
        ...parsedJson,
        categories: parsedJson.categories.map((cat) => {
          return {
            ...cat,
            cards: cat.cards.map((card) => {
              return { ...card, source: "40k" };
            }),
          };
        }),
      };
    }
    if (compare(parsedJson.version, "1.4.2", "<=")) {
      return {
        ...parsedJson,
        categories: parsedJson.categories.map((cat) => {
          return {
            ...cat,
            cards: cat.cards.map((card) => {
              if (card.variant && card.variant.indexOf("no-icons") > -1) {
                card.icons = "no-icons";
                card.variant = card.variant.replaceAll("-no-icons", "");
              } else {
                card.icons = "icons";
              }
              return { ...card };
            }),
          };
        }),
      };
    }
  } catch (error) {
    console.error("Something went wrong while trying to upgrade your cards", error);
    return parsedJson;
  }
  return parsedJson;
};
export const parseStorageJson = (savedJson) => {
  if (!savedJson) {
    return defaultCategories;
  }

  try {
    const parsedJson = JSON.parse(savedJson);
    if (compare(parsedJson.version, "1.5.0", ">=")) {
      return parsedJson;
    }
    if (compare(parsedJson.version, "1.5.0", "<")) {
      return upgradeStoredCards(parsedJson);
    }
  } catch (e) {
    return defaultCategories;
  }
};
