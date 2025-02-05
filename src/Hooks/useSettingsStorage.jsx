import { message } from "antd";
import React from "react";

const SettingsStorageContext = React.createContext(undefined);

const defaultSettings = {
  version: process.env.REACT_APP_VERSION,
  selectedDataSource: undefined,
  selectedFactionIndex: 0,
  ignoredSubFactions: [],
  mobile: {
    closedFactions: [],
  },
  wizardCompleted: "0.0.0",
  serviceMessage: 0,
  printSettings: {
    pageSize: "A4",
    pageOrientation: "portrait",
    cardAlignment: "space-evenly",
    customSize: { height: "15cm", width: "15cm" },
    verticalAlignment: "flex-start",
  },
  showCardsAsDoubleSided: false,
};

export function useSettingsStorage() {
  const context = React.useContext(SettingsStorageContext);
  if (context === undefined) {
    throw new Error("`useSettingsStorage` must be used with an `SettingsStorageProvider`");
  }
  return context;
}

export const SettingsStorageProviderComponent = (props) => {
  const [localSettings, setLocalSettings] = React.useState(() => {
    try {
      const settings = localStorage.getItem("settings");
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        return { ...defaultSettings, ...parsedSettings };
      }
      return defaultSettings;
    } catch (e) {
      message.error("An error occored while trying to load your settings.");
      return defaultSettings;
    }
  });

  const updateSettings = (newSettings) => {
    setLocalSettings(newSettings);
    localStorage.setItem("settings", JSON.stringify(newSettings));
  };

  const context = {
    settings: localSettings,
    updateSettings,
  };

  return <SettingsStorageContext.Provider value={context}>{props.children}</SettingsStorageContext.Provider>;
};
