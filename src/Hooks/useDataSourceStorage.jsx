import localForage from "localforage";
import React, { useEffect } from "react";
import { get40KData, getBasicData, getNecromundaBasicData } from "../Helpers/external.helpers";
import { useFirebase } from './useFirebase';
import { useSettingsStorage } from "./useSettingsStorage";

const DataSourceStorageContext = React.createContext(undefined);

export function useDataSourceStorage() {
  const context = React.useContext(DataSourceStorageContext);
  if (context === undefined) {
    throw new Error(
      "`useDataSourceStorage` must be used with an `DataSourceStorageProvider`"
    );
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
  const [selectedFactionIndex, setSelectedFactionIndex] = React.useState(0);

  useEffect(() => {
    const fetch = async () => {
      if (!dataStore) {
        return;
      }
      logLocalEvent("select_datasource", { dataSource: settings.selectedDataSource });
      if (settings.selectedDataSource === "40k") {
        const storedData = await dataStore.getItem("40k");
        if (storedData) {
          setDataSource(storedData);
          setSelectedFaction(storedData.data[settings.selectedFactionIndex]);
          return;
        }

        const dataFactions = await get40KData();

        dataStore.setItem("40k", dataFactions);

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
    };
    fetch();
  }, [settings]);

  useEffect(() => {
    setSelectedFactionIndex(
      dataSource?.data?.findIndex(
        (faction) => faction?.id === selectedFaction?.id
      )
    );
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
  };

  useEffect(() => {
    setSelectedFactionIndex(
      dataSource?.data?.findIndex(
        (faction) => faction?.id === selectedFaction?.id
      )
    );
  }, [dataSource, selectedFaction]);

  const updateSelectedFaction = (faction) => {
    logLocalEvent("select_faction", { faction: faction.name, dataSource: settings.selectedDataSource });
    setSelectedFaction(faction);
    updateSettings({
      ...settings,
      selectedFactionIndex: dataSource?.data?.findIndex(
        (f) => f?.id === faction?.id
      ),
    });
  };
  const updateSelectedFactionWithIndex = (index) => {
    setSelectedFaction(dataSource.data[index]);
  };

  const clearData = () => {
    dataStore.clear();
    updateSettings({
      ...settings,
      selectedDataSource: "basic",
      selectedFactionIndex: 0,
    });
    localStorage.setItem("storage", undefined);
  };

  const context = {
    dataSource,
    setDataSource,
    selectedFactionIndex,
    selectedFaction,
    updateSelectedFaction,
    updateSelectedFactionWithIndex,
    checkForUpdate,
    clearData,
  };

  return (
    <DataSourceStorageContext.Provider value={context}>
      {props.children}
    </DataSourceStorageContext.Provider>
  );
};
