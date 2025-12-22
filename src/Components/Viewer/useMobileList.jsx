import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";

const MobileListContext = React.createContext(undefined);

const defaultSettings = {
  lists: [],
  selectedList: -1,
  setSelectedList: () => {},
  addDatacard: () => {},
  removeDatacard: () => {},
};

export function useMobileList() {
  const context = React.useContext(MobileListContext);
  if (context === undefined) {
    throw new Error("`useMobileList` must be used with an `MobileListProvider`");
  }
  return context;
}

export const MobileListProvider = (props) => {
  const { settings } = useSettingsStorage();
  const dataSource = settings.selectedDataSource || "basic";

  // Store all lists per datasource
  const [allLists, setAllLists] = React.useState(() => {
    try {
      const stored = localStorage.getItem("lists");
      if (stored) {
        const parsed = JSON.parse(stored);
        // Handle migration from old format (array) to new format (object)
        if (Array.isArray(parsed)) {
          // Migrate old array format to 40k-10e (the original datasource)
          return { "40k-10e": parsed };
        } else if (typeof parsed === "object" && parsed !== null) {
          return parsed;
        }
      }
      return {};
    } catch (e) {
      console.error("An error occurred while trying to load your lists.");
      return {};
    }
  });

  // Selected list index per datasource
  const [selectedListPerDS, setSelectedListPerDS] = React.useState({});

  useEffect(() => {
    localStorage.setItem("lists", JSON.stringify(allLists));
  }, [allLists]);

  // Get lists for current datasource
  const storedLists = allLists[dataSource] || [{ name: "Default", datacards: [] }];
  const selectedList = selectedListPerDS[dataSource] ?? 0;

  const setSelectedList = (index) => {
    setSelectedListPerDS((prev) => ({
      ...prev,
      [dataSource]: index,
    }));
  };

  const setStoredLists = (updater) => {
    setAllLists((prev) => {
      const currentLists = prev[dataSource] || [{ name: "Default", datacards: [] }];
      const newLists = typeof updater === "function" ? updater(currentLists) : updater;
      return {
        ...prev,
        [dataSource]: newLists,
      };
    });
  };

  const addDatacard = (datacard, points, enhancement, isWarlord) => {
    if (!datacard) {
      return;
    }
    const newDatacard = { ...datacard };
    setStoredLists((lists) => {
      const newLists = [...lists];
      // Ensure default list exists
      if (!newLists[selectedList]) {
        newLists[0] = { name: "Default", datacards: [] };
      }
      newLists[selectedList].datacards.push({
        card: newDatacard,
        points: points,
        enhancement,
        warlord: isWarlord,
        id: uuidv4(),
      });
      return newLists;
    });
  };

  const removeDatacard = (id) => {
    if (!id) {
      return;
    }
    setStoredLists((lists) => {
      const newLists = [...lists];
      const cardIndex = newLists[selectedList].datacards.findIndex((val) => val.id === id);
      newLists[selectedList].datacards.splice(cardIndex, 1);
      return newLists;
    });
  };

  // Create a new list with the given name
  const createList = (name) => {
    const listName = name?.trim() || "New List";
    setStoredLists((lists) => {
      const newLists = [...lists, { name: listName, datacards: [] }];
      return newLists;
    });
    // Select the newly created list
    setSelectedListPerDS((prev) => ({
      ...prev,
      [dataSource]: storedLists.length, // Index of the new list
    }));
  };

  // Rename an existing list
  const renameList = (index, newName) => {
    if (index < 0 || !newName?.trim()) {
      return;
    }
    setStoredLists((lists) => {
      const newLists = [...lists];
      if (newLists[index]) {
        newLists[index] = { ...newLists[index], name: newName.trim() };
      }
      return newLists;
    });
  };

  // Delete a list (prevents deleting the last list)
  const deleteList = (index) => {
    if (storedLists.length <= 1) {
      // Can't delete the last list
      return false;
    }
    if (index < 0 || index >= storedLists.length) {
      return false;
    }

    setStoredLists((lists) => {
      const newLists = [...lists];
      newLists.splice(index, 1);
      return newLists;
    });

    // Adjust selected list index if needed
    if (selectedList >= index) {
      setSelectedListPerDS((prev) => ({
        ...prev,
        [dataSource]: Math.max(0, selectedList - 1),
      }));
    }

    return true;
  };

  // Calculate total points for a list
  const getListPoints = (listIndex) => {
    const list = storedLists[listIndex];
    if (!list?.datacards) return 0;
    return list.datacards.reduce((acc, val) => {
      let cost = acc + Number(val.points?.cost || 0);
      if (val.enhancement) {
        cost = cost + Number(val.enhancement.cost || 0);
      }
      return cost;
    }, 0);
  };

  const context = {
    lists: storedLists,
    selectedList,
    setSelectedList,
    addDatacard,
    removeDatacard,
    createList,
    renameList,
    deleteList,
    getListPoints,
  };

  return <MobileListContext.Provider value={context}>{props.children}</MobileListContext.Provider>;
};
