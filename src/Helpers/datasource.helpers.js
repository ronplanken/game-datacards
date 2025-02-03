const filterDatasheets = (selectedFaction, settings, dataSource, searchText) => {
  if (!selectedFaction || (settings.selectedDataSource !== "40k-10e" && settings.selectedDataSource !== "40k-10e-cp")) {
    let filteredSheets = searchText
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

  let filteredSheets = [
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

  if (selectedFaction.allied_factions && selectedFaction.allied_factions.length > 0 && settings.combineAlliedFactions) {
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
};

const filterStratagems = (selectedFaction, settings, searchText) => {
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
      : selectedFaction.basicStratagems ?? [{ name: "Update your datasources" }];

    return [
      { type: "header", name: "Basic stratagems" },
      ...basicStratagems,
      { type: "header", name: "Faction stratagems" },
      ...mainStratagems,
    ];
  }
};

const filterSecondaries = (selectedFaction, settings, searchText) => {
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
      : selectedFaction.basicSecondaries ?? [{ name: "Update your datasources" }];

    return [
      { type: "header", name: "Basic secondaries" },
      ...basicSecondaries,
      { type: "header", name: "Faction secondaries" },
      ...filteredSecondaries,
    ];
  }
};

const filterPsychicPowers = (selectedFaction, settings, searchText) => {
  const filteredPowers = selectedFaction?.psychicpowers.filter((power) => {
    return !settings?.ignoredSubFactions?.includes(power.faction_id);
  });

  return searchText
    ? filteredPowers?.filter((power) => power.name.toLowerCase().includes(searchText.toLowerCase()))
    : filteredPowers;
};

export const getDataSourceType = (selectedContentType, selectedFaction, settings, dataSource, searchText) => {
  try {
    if (selectedContentType === "datasheets") {
      return filterDatasheets(selectedFaction, settings, dataSource, searchText);
    }
    if (selectedContentType === "stratagems") {
      return filterStratagems(selectedFaction, settings, searchText);
    }
    if (selectedContentType === "secondaries") {
      return filterSecondaries(selectedFaction, settings, searchText);
    }
    if (selectedContentType === "psychicpowers") {
      return filterPsychicPowers(selectedFaction, settings, searchText);
    }
    return []; // Default return if selectedContentType is not recognized
  } catch (error) {
    console.error("Error processing data source:", error);
    return []; // Return empty array in case of error
  }
};
