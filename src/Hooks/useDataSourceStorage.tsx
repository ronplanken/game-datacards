import localForage from "localforage";
import React, { useEffect } from "react";
import {
  get40KData,
  get40k10eData,
  get40k10eCombatPatrolData,
  getAoSData,
  getBasicData,
  getNecromundaBasicData,
} from "../Helpers/external.helpers";
import { useFirebase } from "./useFirebase";
import { useSettingsStorage } from "./useSettingsStorage";
import { BasicData, DataSourceStorageContextType } from "../types/types";

const DataSourceStorageContext = React.createContext<DataSourceStorageContextType>(undefined);

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

  // Helper to get faction index for current datasource
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
        const storedData = await dataStore.getItem<BasicData>("40k");
        if (storedData) {
          setDataSource(storedData);
          setSelectedFaction(storedData.data[factionIndex]);
          return;
        }

        const dataFactions = await get40KData();

        dataStore.setItem<BasicData>("40k", dataFactions);

        setDataSource(dataFactions);
      }
      if (settings.selectedDataSource === "40k-10e") {
        const storedData = await dataStore.getItem<BasicData>("40k-10e");
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
        const storedData = await dataStore.getItem<BasicData>("40k-10e-cp");
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
        const storedData = await dataStore.getItem<BasicData>("aos");
        if (storedData) {
          setDataSource(storedData);
          setSelectedFaction(storedData.data[factionIndex]);
          return;
        }
        const dataFactions = await getAoSData();

        dataStore.setItem("aos", dataFactions);
        setDataSource(dataFactions);
      }
    };
    fetch();
  }, [settings.selectedDataSource]);

  useEffect(() => {
    setSelectedFactionIndex(dataSource?.data?.findIndex((faction) => faction?.id === selectedFaction?.id));
  }, [dataSource, selectedFaction]);

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

  // Clear faction state without updating settings (preserves last faction for "continue to" feature)
  const clearSelectedFaction = () => {
    setSelectedFaction(null);
  };

  const updateSelectedFactionWithIndex = (index) => {
    setSelectedFaction(dataSource.data[index]);
  };

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
    localStorage.setItem("storage", undefined);
  };

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
  };

  return <DataSourceStorageContext.Provider value={context}>{props.children}</DataSourceStorageContext.Provider>;
};
