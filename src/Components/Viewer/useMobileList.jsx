import React, { useEffect, useMemo, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { useCardStorage } from "../../Hooks/useCardStorage";
import { migrateListsToCategories } from "../../Helpers/listMigration.helpers";

const MobileListContext = React.createContext(undefined);

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
  const { cardStorage, importCategory, updateCategory, removeCategory, renameCategory, markCategoryPending } =
    useCardStorage();

  const migrationDone = useRef(false);

  // One-time migration from old localStorage("lists") format
  useEffect(() => {
    if (migrationDone.current) return;
    if (localStorage.getItem("lists_migrated")) {
      migrationDone.current = true;
      return;
    }

    const oldData = localStorage.getItem("lists");
    if (oldData) {
      try {
        const parsed = JSON.parse(oldData);
        const categories = migrateListsToCategories(parsed);
        categories.forEach((cat) => importCategory(cat));
      } catch {
        // Malformed data — skip migration
      }
    }

    localStorage.setItem("lists_migrated", "true");
    localStorage.removeItem("lists");
    migrationDone.current = true;
  }, []);

  // Derive lists from cardStorage (categories with type "list" for current datasource)
  const lists = useMemo(() => {
    if (!cardStorage?.categories) return [];
    return cardStorage.categories.filter((cat) => cat.type === "list" && cat.dataSource === dataSource);
  }, [cardStorage?.categories, dataSource]);

  // Create default list if none exist for current datasource
  const defaultCreated = useRef({});
  useEffect(() => {
    if (!migrationDone.current) return;
    if (lists.length === 0 && !defaultCreated.current[dataSource]) {
      defaultCreated.current[dataSource] = true;
      importCategory({
        uuid: uuidv4(),
        name: "Default",
        type: "list",
        dataSource,
        cards: [],
      });
    }
  }, [lists.length, dataSource, importCategory]);

  // Selected list index per datasource
  const [selectedListPerDS, setSelectedListPerDS] = React.useState(() => {
    try {
      const stored = localStorage.getItem("selectedListPerDS");
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  // Persist selected list index to localStorage
  useEffect(() => {
    if (Object.keys(selectedListPerDS).length > 0) {
      localStorage.setItem("selectedListPerDS", JSON.stringify(selectedListPerDS));
    } else {
      localStorage.removeItem("selectedListPerDS");
    }
  }, [selectedListPerDS]);

  // Selected cloud category UUID (for browsing desktop categories on mobile)
  const [selectedCloudCategoryId, setSelectedCloudCategoryId] = React.useState(() => {
    try {
      const stored = localStorage.getItem("selectedCloudCategoryId");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  // Persist selected cloud category to localStorage
  useEffect(() => {
    if (selectedCloudCategoryId) {
      localStorage.setItem("selectedCloudCategoryId", JSON.stringify(selectedCloudCategoryId));
    } else {
      localStorage.removeItem("selectedCloudCategoryId");
    }
  }, [selectedCloudCategoryId]);

  const selectedList = selectedListPerDS[dataSource] ?? 0;

  const setSelectedList = (index) => {
    setSelectedCloudCategoryId(null);
    setSelectedListPerDS((prev) => ({
      ...prev,
      [dataSource]: index,
    }));
  };

  const selectCloudCategory = (categoryUuid) => {
    setSelectedCloudCategoryId(categoryUuid);
  };

  const clearCloudCategory = () => {
    setSelectedCloudCategoryId(null);
  };

  const addDatacard = (datacard, points, enhancement, isWarlord) => {
    if (!datacard) return;
    const category = lists[selectedList];
    if (!category) return;

    const updatedCards = [
      ...category.cards,
      {
        ...datacard,
        unitSize: points,
        selectedEnhancement: enhancement,
        isWarlord,
        uuid: uuidv4(),
        isCustom: true,
      },
    ];
    updateCategory({ ...category, cards: updatedCards }, category.uuid);
    markCategoryPending(category.uuid);
  };

  const removeDatacard = (uuid) => {
    if (!uuid) return;
    const category = lists[selectedList];
    if (!category) return;

    const updatedCards = category.cards.filter((val) => val.uuid !== uuid);
    updateCategory({ ...category, cards: updatedCards }, category.uuid);
    markCategoryPending(category.uuid);
  };

  const updateDatacard = (uuid, unitSize, enhancement, isWarlord) => {
    if (!uuid) return;
    const category = lists[selectedList];
    if (!category) return;
    const updatedCards = category.cards.map((card) =>
      card.uuid !== uuid ? card : { ...card, unitSize, selectedEnhancement: enhancement, isWarlord },
    );
    updateCategory({ ...category, cards: updatedCards }, category.uuid);
    markCategoryPending(category.uuid);
  };

  const createList = (name) => {
    const listName = name?.trim() || "New List";
    importCategory({
      uuid: uuidv4(),
      name: listName,
      type: "list",
      dataSource,
      cards: [],
    });
    // Select the newly created list (it will be appended at the end)
    setSelectedListPerDS((prev) => ({
      ...prev,
      [dataSource]: lists.length,
    }));
  };

  const createListWithCards = (name, cards) => {
    const listName = name?.trim() || "New List";
    importCategory({
      uuid: uuidv4(),
      name: listName,
      type: "list",
      dataSource,
      cards: cards.map((cardData) => ({
        ...cardData.card,
        unitSize: cardData.points,
        selectedEnhancement: cardData.enhancement,
        isWarlord: cardData.isWarlord,
        uuid: uuidv4(),
        isCustom: true,
      })),
    });
    // Select the newly created list
    setSelectedListPerDS((prev) => ({
      ...prev,
      [dataSource]: lists.length,
    }));
  };

  const renameList = (index, newName) => {
    if (index < 0 || !newName?.trim()) return;
    const category = lists[index];
    if (!category) return;
    renameCategory(category.uuid, newName.trim());
  };

  const deleteList = (index) => {
    if (lists.length <= 1) return false;
    if (index < 0 || index >= lists.length) return false;

    const category = lists[index];
    removeCategory(category.uuid);

    // Adjust selected list index if needed
    if (selectedList >= index) {
      setSelectedListPerDS((prev) => ({
        ...prev,
        [dataSource]: Math.max(0, selectedList - 1),
      }));
    }

    return true;
  };

  const getListPoints = (listIndex) => {
    const list = lists[listIndex];
    if (!list?.cards) return 0;
    return list.cards.reduce((acc, val) => {
      let cost = acc + Number(val.unitSize?.cost || 0);
      if (val.selectedEnhancement) {
        cost = cost + Number(val.selectedEnhancement.cost || 0);
      }
      return cost;
    }, 0);
  };

  const context = {
    lists,
    selectedList,
    setSelectedList,
    addDatacard,
    removeDatacard,
    updateDatacard,
    createList,
    createListWithCards,
    renameList,
    deleteList,
    getListPoints,
    // Cloud category selection (by UUID for realtime updates)
    selectedCloudCategoryId,
    selectCloudCategory,
    clearCloudCategory,
  };

  return <MobileListContext.Provider value={context}>{props.children}</MobileListContext.Provider>;
};
