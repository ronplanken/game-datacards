import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";

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

  useEffect(() => {
    localStorage.setItem("lists", JSON.stringify(storedLists));
  }, [storedLists]);

  const [selectedList, setSelectedList] = React.useState(0);

  const addDatacard = (datacard, points, enhancement, isWarlord) => {
    if (!datacard) {
      return;
    }
    const newDatacard = { ...datacard };
    setStoredLists((lists) => {
      const newLists = [...lists];
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

  const context = {
    lists: storedLists,
    selectedList,
    setSelectedList,
    addDatacard,
    removeDatacard,
  };

  return <MobileListContext.Provider value={context}>{props.children}</MobileListContext.Provider>;
};
