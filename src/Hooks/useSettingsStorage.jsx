import { message } from "antd";
import React from "react";

const SettingsStorageContext = React.createContext(undefined);

const defaultSettings = {
  version: process.env.REACT_APP_VERSION,
  selectedDataSource: undefined,
  // Per-datasource selected faction index
  selectedFactionIndex: {
    "40k-10e": 0,
    aos: 0,
  },
  // Tracks whether user has explicitly selected a faction (per datasource)
  hasFactionSelected: {
    "40k-10e": false,
    aos: false,
  },
  ignoredSubFactions: [],
  mobile: {
    closedFactions: [],
    gameSystemSelected: false,
  },
  wizardCompleted: "0.0.0",
  lastMajorWizardVersion: "0.0.0",
  serviceMessage: 0,
  printSettings: {
    pageSize: "A4",
    pageOrientation: "portrait",
    cardAlignment: "space-evenly",
    customSize: { height: "15cm", width: "15cm" },
    verticalAlignment: "flex-start",
  },
  showCardsAsDoubleSided: false,
  autoFitEnabled: true,
  zoom: 100,
  useFancyFonts: true,
  showGenericManifestations: false,
  aosStatDisplayMode: "wheel", // "wheel" | "badges"
  // Custom datasources registry - stores metadata for user-imported datasources
  // Full data is stored in localForage with key pattern: custom-{uuid}
  customDatasources: [], // Array of { id, name, displayFormat, sourceType, sourceUrl?, version, lastUpdated }
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
        const merged = { ...defaultSettings, ...parsedSettings };

        // Migrate old selectedFactionIndex (number) to new format (object)
        if (typeof merged.selectedFactionIndex === "number") {
          merged.selectedFactionIndex = {
            "40k-10e": merged.selectedFactionIndex,
            aos: 0,
          };
        }

        return merged;
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
