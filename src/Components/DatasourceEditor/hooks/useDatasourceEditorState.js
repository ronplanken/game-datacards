import { useState, useCallback, useEffect } from "react";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";

/**
 * State management hook for the Datasource Editor page.
 * Manages selected item, active datasource, and datasource list.
 */
export function useDatasourceEditorState() {
  const { settings } = useSettingsStorage();
  const { getCustomDatasourceData } = useDataSourceStorage();

  const [activeDatasource, setActiveDatasource] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Registry of custom datasources from settings
  const datasources = settings.customDatasources || [];

  /**
   * Load a datasource's full data from localForage and set it as active.
   */
  const openDatasource = useCallback(
    async (registryEntry) => {
      setIsLoading(true);
      try {
        const data = await getCustomDatasourceData(registryEntry.id);
        if (data) {
          setActiveDatasource(data);
          setSelectedItem({ type: "datasource" });
        }
      } finally {
        setIsLoading(false);
      }
    },
    [getCustomDatasourceData],
  );

  /**
   * Select the datasource parent node (shows metadata editor).
   */
  const selectDatasource = useCallback((datasource) => {
    setSelectedItem({ type: "datasource" });
  }, []);

  /**
   * Select a card type node (shows schema editor for that type).
   */
  const selectCardType = useCallback((cardType) => {
    setSelectedItem({ type: "cardType", key: cardType.key, data: cardType });
  }, []);

  /**
   * Update the active datasource in-memory and persist to localForage.
   */
  const updateDatasource = useCallback(
    async (updatedDatasource) => {
      setActiveDatasource(updatedDatasource);

      // Keep selectedItem.data in sync if a card type is selected
      if (selectedItem?.type === "cardType" && selectedItem?.key) {
        const updatedCardType = updatedDatasource.schema?.cardTypes?.find((ct) => ct.key === selectedItem.key);
        if (updatedCardType) {
          setSelectedItem({ type: "cardType", key: updatedCardType.key, data: updatedCardType });
        }
      }

      // Persist to localForage
      try {
        const localForage = (await import("localforage")).default;
        const dataStore = localForage.createInstance({ name: "data" });
        await dataStore.setItem(updatedDatasource.id, updatedDatasource);
      } catch {
        // Storage failure is non-fatal for the editor session
      }
    },
    [selectedItem],
  );

  /**
   * Set the active datasource after wizard creation (receives full datasource object).
   */
  const setCreatedDatasource = useCallback((datasource) => {
    setActiveDatasource(datasource);
    setSelectedItem({ type: "datasource" });
  }, []);

  // If the active datasource is removed from the registry, clear it
  useEffect(() => {
    if (activeDatasource && !datasources.some((ds) => ds.id === activeDatasource.id)) {
      setActiveDatasource(null);
      setSelectedItem(null);
    }
  }, [datasources, activeDatasource]);

  return {
    datasources,
    activeDatasource,
    selectedItem,
    isLoading,
    openDatasource,
    selectDatasource,
    selectCardType,
    updateDatasource,
    setCreatedDatasource,
  };
}
