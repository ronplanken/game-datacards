import localForage from "localforage";
import React, { useEffect, useCallback } from "react";
import {
  get40KData,
  get40k10eData,
  get40k10eCombatPatrolData,
  getAoSData,
  getBasicData,
  getNecromundaBasicData,
} from "../Helpers/external.helpers";
import {
  validateCustomDatasource,
  prepareDatasourceForImport,
  createRegistryEntry,
  compareVersions,
} from "../Helpers/customDatasource.helpers";
import { useFirebase } from "./useFirebase";
import { useSettingsStorage } from "./useSettingsStorage";

const DataSourceStorageContext = React.createContext(undefined);

export function useDataSourceStorage() {
  const context = React.useContext(DataSourceStorageContext);
  if (context === undefined) {
    throw new Error("`useDataSourceStorage` must be used with an `DataSourceStorageProvider`");
  }
  return context;
}

var dataStore = localForage.createInstance({
  name: "data",
});

export const DataSourceStorageProviderComponent = (props) => {
  const { settings, updateSettings } = useSettingsStorage();

  const { logLocalEvent } = useFirebase();

  const [dataSource, setDataSource] = React.useState(getBasicData());
  const [selectedFaction, setSelectedFaction] = React.useState(null);
  const [selectedSubFactions, setSelectedSubFactions] = React.useState([]);
  const [selectedFactionIndex, setSelectedFactionIndex] = React.useState(0);

  /**
   * Get the saved faction index for a specific datasource
   * Handles migration from old format (number) to new format (object)
   * @param {string} ds - Datasource identifier
   * @returns {number} Faction index for the datasource
   */
  const getFactionIndexForDataSource = (ds) => {
    const index = settings.selectedFactionIndex?.[ds];
    // Handle migration from old format (number) to new format (object)
    if (typeof settings.selectedFactionIndex === "number") {
      return settings.selectedFactionIndex;
    }
    return typeof index === "number" ? index : 0;
  };

  useEffect(() => {
    const fetch = async () => {
      if (!dataStore) {
        return;
      }
      logLocalEvent("select_datasource", { dataSource: settings.selectedDataSource });
      const factionIndex = getFactionIndexForDataSource(settings.selectedDataSource);

      if (settings.selectedDataSource === "40k") {
        const storedData = await dataStore.getItem("40k");
        if (storedData) {
          setDataSource(storedData);
          setSelectedFaction(storedData.data[factionIndex]);
          return;
        }

        const dataFactions = await get40KData();

        dataStore.setItem("40k", dataFactions);

        setDataSource(dataFactions);
      }
      if (settings.selectedDataSource === "40k-10e") {
        const storedData = await dataStore.getItem("40k-10e");
        if (storedData) {
          setDataSource(storedData);
          setSelectedFaction(storedData.data[factionIndex]);
          return;
        }
        const dataFactions = await get40k10eData();

        dataStore.setItem("40k-10e", dataFactions);
        setDataSource(dataFactions);
      }
      if (settings.selectedDataSource === "40k-10e-cp") {
        const storedData = await dataStore.getItem("40k-10e-cp");
        if (storedData) {
          setDataSource(storedData);
          setSelectedFaction(storedData.data[factionIndex]);
          return;
        }
        const dataFactions = await get40k10eCombatPatrolData();

        dataStore.setItem("40k-10e-cp", dataFactions);
        setDataSource(dataFactions);
      }
      if (settings.selectedDataSource === "basic") {
        const basicData = getBasicData();
        setDataSource(basicData);
        setSelectedFaction(basicData.data[0]);
      }
      if (settings.selectedDataSource === "necromunda") {
        const basicData = getNecromundaBasicData();
        setDataSource(basicData);
        setSelectedFaction(basicData.data[0]);
      }
      if (settings.selectedDataSource === "aos") {
        const storedData = await dataStore.getItem("aos");
        if (storedData) {
          setDataSource(storedData);
          setSelectedFaction(storedData.data[factionIndex]);
          return;
        }
        const dataFactions = await getAoSData();

        dataStore.setItem("aos", dataFactions);
        setDataSource(dataFactions);
      }

      // Handle custom datasources (prefixed with "custom-")
      if (settings.selectedDataSource?.startsWith("custom-")) {
        const storedData = await dataStore.getItem(settings.selectedDataSource);
        if (storedData) {
          setDataSource(storedData);
          setSelectedFaction(storedData.data[factionIndex] || storedData.data[0]);
        }
      }
    };
    fetch();
  }, [settings.selectedDataSource]);

  /**
   * Check for updates and refresh the currently selected datasource
   * Fetches fresh data from the source and updates local storage
   * @returns {Promise<void>}
   */
  const checkForUpdate = async () => {
    if (!dataStore) {
      return;
    }
    if (settings.selectedDataSource === "40k") {
      const dataFactions = await get40KData();

      dataStore.setItem("40k", dataFactions);

      setDataSource(dataFactions);
    }
    if (settings.selectedDataSource === "40k-10e") {
      const dataFactions = await get40k10eData();
      dataStore.setItem("40k-10e", dataFactions);

      setDataSource(dataFactions);
    }
    if (settings.selectedDataSource === "40k-10e-cp") {
      const dataFactions = await get40k10eCombatPatrolData();
      dataStore.setItem("40k-10e-cp", dataFactions);

      setDataSource(dataFactions);
    }
    if (settings.selectedDataSource === "basic") {
      const basicData = getBasicData();
      setDataSource(basicData);
      setSelectedFaction(basicData.data[0]);
    }
    if (settings.selectedDataSource === "necromunda") {
      const basicData = getNecromundaBasicData();
      setDataSource(basicData);
      setSelectedFaction(basicData.data[0]);
    }
    if (settings.selectedDataSource === "aos") {
      const dataFactions = await getAoSData();
      dataStore.setItem("aos", dataFactions);

      setDataSource(dataFactions);
    }
  };

  useEffect(() => {
    setSelectedFactionIndex(dataSource?.data?.findIndex((faction) => faction?.id === selectedFaction?.id));
  }, [dataSource, selectedFaction]);

  /**
   * Update the selected faction and persist the selection in settings
   * @param {Object} faction - The faction object to select
   */
  const updateSelectedFaction = (faction) => {
    logLocalEvent("select_faction", { faction: faction?.name, dataSource: settings.selectedDataSource });
    setSelectedFaction(faction);
    const newIndex = dataSource?.data?.findIndex((f) => f?.id === faction?.id);
    // Update the per-datasource faction index
    const currentFactionIndexes =
      typeof settings.selectedFactionIndex === "object" ? settings.selectedFactionIndex : {};
    const currentHasFactionSelected =
      typeof settings.hasFactionSelected === "object" ? settings.hasFactionSelected : {};
    updateSettings({
      ...settings,
      selectedFactionIndex: {
        ...currentFactionIndexes,
        [settings.selectedDataSource]: newIndex,
      },
      hasFactionSelected: {
        ...currentHasFactionSelected,
        [settings.selectedDataSource]: true,
      },
    });
  };

  /**
   * Clear the selected faction state without updating settings
   * Preserves the last faction selection for "continue to" feature
   */
  const clearSelectedFaction = () => {
    setSelectedFaction(null);
  };

  /**
   * Update the selected faction by index in the datasource data array
   * @param {number} index - Index of the faction in dataSource.data
   */
  const updateSelectedFactionWithIndex = (index) => {
    setSelectedFaction(dataSource.data[index]);
  };

  /**
   * Clear all cached data and reset to default datasource
   * Removes all stored data from localForage and localStorage
   */
  const clearData = () => {
    dataStore.clear();
    updateSettings({
      ...settings,
      selectedDataSource: "basic",
      selectedFactionIndex: {
        "40k-10e": 0,
        aos: 0,
      },
    });
    localStorage.removeItem("storage");
  };

  // ==========================================
  // Custom Datasource Management Functions
  // ==========================================

  /**
   * Import a custom datasource from parsed JSON data
   * @param {Object} datasourceData - The parsed datasource JSON
   * @param {string} sourceType - "url" or "local"
   * @param {string} sourceUrl - The source URL (for URL imports)
   * @returns {Promise<{success: boolean, id?: string, error?: string}>}
   */
  const importCustomDatasource = useCallback(
    async (datasourceData, sourceType, sourceUrl = null) => {
      // Validate the datasource
      const validation = validateCustomDatasource(datasourceData);
      if (!validation.isValid) {
        return { success: false, error: validation.errors.join(", ") };
      }

      // Prepare for import (generates storage ID, updates card sources)
      const preparedDatasource = prepareDatasourceForImport(datasourceData, sourceType, sourceUrl);

      // Store in localForage
      await dataStore.setItem(preparedDatasource.id, preparedDatasource);

      // Create registry entry and update settings
      const registryEntry = createRegistryEntry(preparedDatasource);
      const currentCustomDatasources = settings.customDatasources || [];

      updateSettings({
        ...settings,
        customDatasources: [...currentCustomDatasources, registryEntry],
      });

      logLocalEvent("import_custom_datasource", {
        name: preparedDatasource.name,
        displayFormat: preparedDatasource.displayFormat,
        sourceType,
      });

      return { success: true, id: preparedDatasource.id };
    },
    [settings, updateSettings, logLocalEvent]
  );

  /**
   * Remove a custom datasource
   * @param {string} datasourceId - The datasource ID to remove
   */
  const removeCustomDatasource = useCallback(
    async (datasourceId) => {
      // Remove from localForage
      await dataStore.removeItem(datasourceId);

      // Remove from settings registry
      const currentCustomDatasources = settings.customDatasources || [];
      const updatedCustomDatasources = currentCustomDatasources.filter((ds) => ds.id !== datasourceId);

      // If this was the active datasource, switch to basic
      const newSelectedDataSource =
        settings.selectedDataSource === datasourceId ? "basic" : settings.selectedDataSource;

      updateSettings({
        ...settings,
        customDatasources: updatedCustomDatasources,
        selectedDataSource: newSelectedDataSource,
      });

      // If we switched datasources, update the view
      if (newSelectedDataSource === "basic") {
        const basicData = getBasicData();
        setDataSource(basicData);
        setSelectedFaction(basicData.data[0]);
      }

      logLocalEvent("remove_custom_datasource", { datasourceId });
    },
    [settings, updateSettings, logLocalEvent]
  );

  /**
   * Check for updates on a URL-sourced custom datasource
   * @param {string} datasourceId - The datasource ID to check
   * @returns {Promise<{hasUpdate: boolean, newVersion?: string, newData?: Object, error?: string}>}
   */
  const checkCustomDatasourceUpdate = useCallback(
    async (datasourceId) => {
      const entry = (settings.customDatasources || []).find((ds) => ds.id === datasourceId);

      if (!entry) {
        return { hasUpdate: false, error: "Datasource not found" };
      }

      if (entry.sourceType !== "url" || !entry.sourceUrl) {
        return { hasUpdate: false, error: "Not a URL datasource" };
      }

      try {
        const response = await fetch(entry.sourceUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch: ${response.status}`);
        }

        const newData = await response.json();

        // Validate the fetched data
        const validation = validateCustomDatasource(newData);
        if (!validation.isValid) {
          return { hasUpdate: false, error: "Invalid datasource format at URL" };
        }

        // Compare versions
        const hasUpdate = compareVersions(newData.version, entry.version) > 0;

        // Update lastCheckedForUpdate in settings
        const updatedCustomDatasources = (settings.customDatasources || []).map((ds) =>
          ds.id === datasourceId ? { ...ds, lastCheckedForUpdate: new Date().toISOString() } : ds
        );

        updateSettings({
          ...settings,
          customDatasources: updatedCustomDatasources,
        });

        if (hasUpdate) {
          return { hasUpdate: true, newVersion: newData.version, newData };
        }

        return { hasUpdate: false };
      } catch (error) {
        return { hasUpdate: false, error: error.message };
      }
    },
    [settings, updateSettings]
  );

  /**
   * Apply an update to a custom datasource
   * @param {string} datasourceId - The datasource ID to update
   * @param {Object} newData - The new datasource data
   */
  const applyCustomDatasourceUpdate = useCallback(
    async (datasourceId, newData) => {
      const entry = (settings.customDatasources || []).find((ds) => ds.id === datasourceId);

      if (!entry) {
        return { success: false, error: "Datasource not found" };
      }

      // Prepare the new data (preserving the existing ID and source info)
      const preparedDatasource = {
        ...prepareDatasourceForImport(newData, entry.sourceType, entry.sourceUrl),
        id: datasourceId, // Keep the same ID
      };

      // Store in localForage
      await dataStore.setItem(datasourceId, preparedDatasource);

      // Update registry entry
      const updatedCustomDatasources = (settings.customDatasources || []).map((ds) =>
        ds.id === datasourceId
          ? {
              ...ds,
              version: newData.version,
              lastUpdated: newData.lastUpdated || new Date().toISOString(),
              lastCheckedForUpdate: new Date().toISOString(),
            }
          : ds
      );

      updateSettings({
        ...settings,
        customDatasources: updatedCustomDatasources,
      });

      // If this is the active datasource, reload it
      if (settings.selectedDataSource === datasourceId) {
        setDataSource(preparedDatasource);
        setSelectedFaction(preparedDatasource.data[0]);
      }

      logLocalEvent("update_custom_datasource", {
        datasourceId,
        newVersion: newData.version,
      });

      return { success: true };
    },
    [settings, updateSettings, logLocalEvent]
  );

  /**
   * Get the full data for a custom datasource
   * @param {string} datasourceId - The datasource ID
   * @returns {Promise<Object|null>}
   */
  const getCustomDatasourceData = useCallback(async (datasourceId) => {
    return await dataStore.getItem(datasourceId);
  }, []);

  const context = {
    dataSource,
    setDataSource,
    selectedFactionIndex,
    selectedFaction,
    updateSelectedFaction,
    clearSelectedFaction,
    selectedSubFactions,
    setSelectedSubFactions,
    updateSelectedFactionWithIndex,
    checkForUpdate,
    clearData,
    // Custom datasource functions
    importCustomDatasource,
    removeCustomDatasource,
    checkCustomDatasourceUpdate,
    applyCustomDatasourceUpdate,
    getCustomDatasourceData,
  };

  return <DataSourceStorageContext.Provider value={context}>{props.children}</DataSourceStorageContext.Provider>;
};
