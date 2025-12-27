import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";

// Group warscrolls by keywords (same as mobile/viewer)
const groupWarscrollsByRole = (warscrolls) => {
  return (warscrolls || []).reduce(
    (groups, unit) => {
      const keywords = unit.keywords || [];
      const hasKeyword = (kw) => keywords.some((k) => k.toLowerCase().includes(kw));

      if (hasKeyword("hero")) {
        groups.heroes.push(unit);
      } else if (hasKeyword("battleline")) {
        groups.battleline.push(unit);
      } else if (hasKeyword("monster")) {
        groups.monsters.push(unit);
      } else if (hasKeyword("cavalry")) {
        groups.cavalry.push(unit);
      } else if (hasKeyword("infantry")) {
        groups.infantry.push(unit);
      } else if (hasKeyword("war machine")) {
        groups.warMachines.push(unit);
      } else if (hasKeyword("faction terrain")) {
        groups.factionTerrain.push(unit);
      } else if (hasKeyword("manifestation")) {
        groups.manifestations.push(unit);
      } else {
        groups.other.push(unit);
      }
      return groups;
    },
    {
      heroes: [],
      battleline: [],
      monsters: [],
      cavalry: [],
      infantry: [],
      warMachines: [],
      factionTerrain: [],
      manifestations: [],
      other: [],
    }
  );
};

const WARSCROLL_ROLE_ORDER = [
  { key: "heroes", label: "Heroes" },
  { key: "battleline", label: "Battleline" },
  { key: "monsters", label: "Monsters" },
  { key: "cavalry", label: "Cavalry" },
  { key: "infantry", label: "Infantry" },
  { key: "warMachines", label: "War Machines" },
  { key: "factionTerrain", label: "Faction Terrain" },
  { key: "manifestations", label: "Manifestations" },
  { key: "other", label: "Other" },
];

export const useDataSourceItems = (selectedContentType, searchText) => {
  const { dataSource, selectedFaction } = useDataSourceStorage();
  const { settings } = useSettingsStorage();

  const getDataSourceItems = () => {
    if (selectedContentType === "datasheets") {
      let filteredSheets = [];
      if (
        selectedFaction &&
        (settings.selectedDataSource === "40k-10e" || settings.selectedDataSource === "40k-10e-cp")
      ) {
        try {
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
            filteredSheets = filteredSheets?.toSorted((a, b) => a.name.localeCompare(b.name));
          }
          if (settings.groupByRole) {
            const types = ["Battleline", "Character", "Dedicated Transport"];
            let byRole = [];

            types.map((role) => {
              byRole = [...byRole, { type: "role", name: role }];
              byRole = [
                ...byRole,
                ...filteredSheets
                  ?.filter((sheet) => sheet?.keywords?.includes(role))
                  .map((val) => {
                    return { ...val, role: role };
                  }),
              ];
            });

            byRole = [
              ...byRole,
              { type: "role", name: "Other" },
              ...filteredSheets
                ?.filter((sheet) => {
                  return types.every((t) => !sheet?.keywords?.includes(t));
                })
                .map((val) => {
                  return { ...val, role: "Other" };
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
                return { ...val, nonBase: true, allied: true };
              });

              filteredSheets = [
                ...filteredSheets,
                { type: "allied", name: alliedFaction.name, id: alliedFaction.id, closed: true },
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
        } catch (error) {
          console.error("An error occured", error);
          return [];
        }
      }

      filteredSheets = searchText
        ? selectedFaction?.datasheets.filter((sheet) => sheet.name.toLowerCase().includes(searchText.toLowerCase()))
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

    if (selectedContentType === "stratagems") {
      const filteredStratagems = selectedFaction?.stratagems.filter((stratagem) => {
        return !settings?.ignoredSubFactions?.includes(stratagem.subfaction_id);
      });
      const mainStratagems = searchText
        ? filteredStratagems?.filter((stratagem) => stratagem.name.toLowerCase().includes(searchText.toLowerCase()))
        : filteredStratagems;

      if (settings.hideBasicStratagems || settings?.noStratagemOptions) {
        return mainStratagems;
      } else {
        const basicStratagems = searchText
          ? selectedFaction.basicStratagems?.filter((stratagem) =>
              stratagem.name.toLowerCase().includes(searchText.toLowerCase())
            )
          : selectedFaction.basicStratagems ?? [];

        return [
          { type: "header", name: "Basic stratagems" },
          ...basicStratagems,
          { type: "header", name: "Faction stratagems" },
          ...mainStratagems,
        ];
      }
    }

    if (selectedContentType === "enhancements") {
      const filteredEnhancements = selectedFaction?.enhancements.map((enhancement) => {
        return { ...enhancement, cardType: "enhancement", source: "40k-10e" };
      });

      const mainEnhancements = searchText
        ? filteredEnhancements?.filter((enhancement) =>
            enhancement.name.toLowerCase().includes(searchText.toLowerCase())
          )
        : filteredEnhancements;
      return mainEnhancements;
    }

    if (selectedContentType === "secondaries") {
      const filteredSecondaries = selectedFaction?.secondaries.filter((secondary) => {
        return !settings?.ignoredSubFactions?.includes(secondary.faction_id);
      });
      if (settings.hideBasicSecondaries || settings?.noSecondaryOptions) {
        return filteredSecondaries;
      } else {
        const basicSecondaries = searchText
          ? selectedFaction.basicSecondaries?.filter((secondary) =>
              secondary.name.toLowerCase().includes(searchText.toLowerCase())
            )
          : selectedFaction.basicSecondaries ?? [];

        return [
          { type: "header", name: "Basic secondaries" },
          ...basicSecondaries,
          { type: "header", name: "Faction secondaries" },
          ...filteredSecondaries,
        ];
      }
    }

    if (selectedContentType === "psychicpowers") {
      const filteredPowers = selectedFaction?.psychicpowers.filter((power) => {
        return !settings?.ignoredSubFactions?.includes(power.faction_id);
      });

      return searchText
        ? filteredPowers?.filter((power) => power.name.toLowerCase().includes(searchText.toLowerCase()))
        : filteredPowers;
    }

    if (selectedContentType === "rules") {
      const armyRules = selectedFaction?.rules?.army || [];
      const detachmentRules = selectedFaction?.rules?.detachment || [];

      // Filter army rules by search
      const filteredArmyRules = searchText
        ? armyRules.filter((rule) => rule.name.toLowerCase().includes(searchText.toLowerCase()))
        : armyRules;

      // Filter detachment rules by search
      const filteredDetachmentRules = searchText
        ? detachmentRules.filter((rule) => rule.name?.toLowerCase().includes(searchText.toLowerCase()))
        : detachmentRules;

      // Transform rules into card-compatible objects
      const armyRuleCards = filteredArmyRules.map((rule) => ({
        ...rule,
        id: `army-rule-${rule.name}`,
        cardType: "rule",
        ruleType: "army",
        faction_id: selectedFaction.id,
        source: "40k-10e",
      }));

      // Flatten detachment rules - each detachment can have multiple rules
      const detachmentRuleCards = filteredDetachmentRules.flatMap((detachmentRule) => {
        if (detachmentRule.rules && Array.isArray(detachmentRule.rules)) {
          return detachmentRule.rules.map((rule) => ({
            ...rule,
            id: `detachment-rule-${detachmentRule.detachment}-${rule.name}`,
            cardType: "rule",
            ruleType: "detachment",
            detachment: detachmentRule.detachment,
            faction_id: selectedFaction.id,
            source: "40k-10e",
          }));
        }
        return [];
      });

      return [
        ...(armyRuleCards.length > 0 ? [{ type: "header", name: "Army Rules" }] : []),
        ...armyRuleCards,
        ...(detachmentRuleCards.length > 0 ? [{ type: "header", name: "Detachment Rules" }] : []),
        ...detachmentRuleCards,
      ];
    }

    if (selectedContentType === "warscrolls") {
      // Get generic data
      const genericData = dataSource?.genericData;
      const showGeneric = settings?.showGenericManifestations;

      // Combine faction + generic warscrolls when enabled
      const factionWarscrolls = selectedFaction?.warscrolls || [];
      const genericWarscrolls = (showGeneric && genericData?.warscrolls) || [];
      const allWarscrolls = [...factionWarscrolls, ...genericWarscrolls];

      const grouped = groupWarscrollsByRole(allWarscrolls);
      let result = [];

      WARSCROLL_ROLE_ORDER.forEach(({ key, label }) => {
        let units = grouped[key] || [];

        // Apply search filter
        if (searchText) {
          units = units.filter((w) => w.name.toLowerCase().includes(searchText.toLowerCase()));
        }

        // Filter out legends if setting is disabled
        if (!settings?.showLegends) {
          units = units.filter((w) => !w.isLegends);
        }

        // Sort alphabetically
        units = units.toSorted((a, b) => a.name.localeCompare(b.name));

        if (units.length > 0) {
          result.push({ type: "header", name: label });
          result.push(
            ...units.map((w) => ({
              ...w,
              cardType: "warscroll",
              source: "aos",
              faction_id: w.faction_id || selectedFaction.id,
            }))
          );
        }
      });

      return result;
    }

    if (selectedContentType === "manifestationLores") {
      // Get generic data
      const genericData = dataSource?.genericData;
      const showGeneric = settings?.showGenericManifestations;

      // Combine faction + generic manifestation lores when enabled
      const factionManifestationLores = selectedFaction?.manifestationLores || [];
      const genericManifestationLores = (showGeneric && genericData?.manifestationLores) || [];
      const lores = [...factionManifestationLores, ...genericManifestationLores];
      let result = [];

      lores.forEach((lore) => {
        let spells = lore.spells || [];

        // Apply search filter
        if (searchText) {
          spells = spells.filter((s) => s.name.toLowerCase().includes(searchText.toLowerCase()));
        }

        // Sort alphabetically
        spells = spells.toSorted((a, b) => a.name.localeCompare(b.name));

        if (spells.length > 0) {
          result.push({ type: "header", name: lore.name, isGeneric: lore.faction_id === "GENERIC" });
          result.push(
            ...spells.map((spell) => ({
              ...spell,
              cardType: "spell",
              spellType: "manifestation",
              loreName: lore.name,
              source: "aos",
              faction_id: lore.faction_id || selectedFaction.id,
            }))
          );
        }
      });

      return result;
    }

    if (selectedContentType === "spellLores") {
      const lores = selectedFaction?.lores || [];
      let result = [];

      lores.forEach((lore) => {
        let spells = lore.spells || [];

        // Apply search filter
        if (searchText) {
          spells = spells.filter((s) => s.name.toLowerCase().includes(searchText.toLowerCase()));
        }

        // Sort alphabetically
        spells = spells.toSorted((a, b) => a.name.localeCompare(b.name));

        if (spells.length > 0) {
          result.push({ type: "header", name: lore.name });
          result.push(
            ...spells.map((spell) => ({
              ...spell,
              cardType: "spell",
              spellType: "spell",
              loreName: lore.name,
              source: "aos",
              faction_id: selectedFaction.id,
            }))
          );
        }
      });

      return result;
    }

    return [];
  };

  return getDataSourceItems();
};
