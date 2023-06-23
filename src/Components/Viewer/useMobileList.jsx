import React from "react";

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
  const [storedLists, setStoredLists] = React.useState(() => {
    try {
      const settings = localStorage.getItem("lists");
      if (settings) {
        return JSON.parse(settings);
      }
      return [{ name: "Default", datacards: [] }];
    } catch (e) {
      message.error("An error occored while trying to load your lists.");
      return [{ name: "Default", datacards: [] }];
    }
  });

  const [selectedList, setSelectedList] = React.useState(0);

  const addDatacard = (datacard, points) => {
    if (!datacard) {
      return;
    }
    const newDatacard = { ...datacard };
    setStoredLists((lists) => {
      const newLists = [...lists];
      newLists[selectedList].datacards.push({ card: newDatacard, points: points });
      return newLists;
    });
  };

  const removeDatacard = (index) => {
    if (index < 0) {
      return;
    }
    setStoredLists((lists) => {
      const newLists = [...lists];
      newLists[selectedList].datacards.splice(index, 1);
      return newLists;
    });
  };

  const context = {
    lists: storedLists,
    selectedList,
    setSelectedList,
    addDatacard,
    removeDatacard,
  };

  return <MobileListContext.Provider value={context}>{props.children}</MobileListContext.Provider>;
};
