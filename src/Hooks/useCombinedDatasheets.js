import { useMemo } from "react";
import { useDataSourceStorage } from "./useDataSourceStorage";
import { useSettingsStorage } from "./useSettingsStorage";

/**
 * Hook to get combined datasheets based on settings.
 * Handles parent faction, allied faction, and legends filtering.
 *
 * @returns {Object} Object containing datasheets array and metadata
 */
export const useCombinedDatasheets = () => {
  const { settings } = useSettingsStorage();
  const { dataSource, selectedFaction } = useDataSourceStorage();

  const result = useMemo(() => {
    if (!selectedFaction) {
      return { datasheets: [], sections: [] };
    }

    // Start with base faction datasheets
    let baseDatesheets = [...(selectedFaction?.datasheets || [])];

    // Filter legends if setting is disabled
    if (!settings?.showLegends) {
      baseDatesheets = baseDatesheets.filter((sheet) => !sheet.legends);
    }

    // Build sections for grouped display
    const sections = [
      {
        id: selectedFaction.id,
        name: selectedFaction.name,
        datasheets: baseDatesheets.sort((a, b) => a.name.localeCompare(b.name)),
        isBase: true,
      },
    ];

    // Add parent faction datasheets if subfaction and setting enabled
    if (selectedFaction.is_subfaction && settings.combineParentFactions) {
      const parentFaction = dataSource.data.find((faction) => faction.id === selectedFaction.parent_id);

      if (parentFaction?.datasheets) {
        let parentDatasheets = parentFaction.datasheets
          .filter((val) => val.factions?.length === 1 && val.factions?.includes(selectedFaction.parent_keyword))
          .map((val) => ({ ...val, nonBase: true, parentFaction: true }));

        // Filter legends from parent
        if (!settings?.showLegends) {
          parentDatasheets = parentDatasheets.filter((sheet) => !sheet.legends);
        }

        if (parentDatasheets.length > 0) {
          sections.push({
            id: parentFaction.id,
            name: parentFaction.name,
            datasheets: parentDatasheets.sort((a, b) => a.name.localeCompare(b.name)),
            isParent: true,
          });
        }
      }
    }

    // Add allied faction datasheets if setting enabled
    if (
      selectedFaction.allied_factions &&
      selectedFaction.allied_factions.length > 0 &&
      settings.combineAlliedFactions
    ) {
      selectedFaction.allied_factions.forEach((alliedFactionId) => {
        const alliedFaction = dataSource.data.find((faction) => faction.id === alliedFactionId);

        if (alliedFaction?.datasheets) {
          let alliedDatasheets = alliedFaction.datasheets.map((val) => ({
            ...val,
            nonBase: true,
            allied: true,
          }));

          // Filter legends from allied
          if (!settings?.showLegends) {
            alliedDatasheets = alliedDatasheets.filter((sheet) => !sheet.legends);
          }

          if (alliedDatasheets.length > 0) {
            sections.push({
              id: alliedFaction.id,
              name: alliedFaction.name,
              datasheets: alliedDatasheets.sort((a, b) => a.name.localeCompare(b.name)),
              isAllied: true,
            });
          }
        }
      });
    }

    // Flatten all datasheets for simple list access
    const allDatasheets = sections.flatMap((section) => section.datasheets);

    return {
      datasheets: allDatasheets,
      sections,
    };
  }, [
    selectedFaction,
    dataSource,
    settings?.showLegends,
    settings?.combineParentFactions,
    settings?.combineAlliedFactions,
  ]);

  return result;
};
