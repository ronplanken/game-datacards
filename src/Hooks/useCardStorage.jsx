import { message } from "../Components/Toast/message";
import clone from "just-clone";
import React, { useEffect } from "react";
import { v4 as uuidv4 } from "uuid";
import { parseStorageJson } from "../Helpers/cardstorage.helpers";
import { reorderWithSubCategories, reorderSubCategories, reorderDatasourceItems } from "../Helpers/treeview.helpers";

const CardStorageContext = React.createContext(undefined);

// Default sync fields for new categories
const defaultSyncFields = {
  syncEnabled: false,
  syncStatus: "local", // local | synced | pending | syncing | error | conflict
  lastSyncedAt: null,
  localVersion: 1,
  cloudVersion: null,
  syncError: null,
  syncedToUserId: null, // Track which user this category is synced to
};

// Default fields for local datasources
const defaultDatasourceFields = {
  datasourceId: null, // User-defined ID
  version: "1.0.0",
  author: null,
  displayFormat: null,
  colours: { header: "#1a1a1a", banner: "#4a4a4a" },
  // Cloud/publishing state
  cloudId: null, // Database UUID if uploaded
  isUploaded: false,
  isPublished: false,
  shareCode: null,
  publishedVersion: null,
};

// Helper to generate slug from name
const generateIdFromName = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .substring(0, 50);
};

export function useCardStorage() {
  const context = React.useContext(CardStorageContext);
  if (context === undefined) {
    throw new Error("`useCardStorage` must be used with an `CardStorageProvider`");
  }
  return context;
}

export const CardStorageProviderComponent = (props) => {
  const [cardStorage, setCardStorage] = React.useState(() => {
    try {
      const oldStorage = localStorage.getItem("cards");
      const newStorage = localStorage.getItem("storage");
      if (oldStorage && !newStorage) {
        return parseStorageJson(oldStorage);
      }
      return parseStorageJson(newStorage);
    } catch (e) {
      message.error("An error occored while trying to load your cards.");
      return [];
    }
  });

  const [activeCard, setActiveCard] = React.useState(null);
  const [cardUpdated, setCardUpdated] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState(null);

  useEffect(() => {
    const version = import.meta.env.VITE_VERSION;
    localStorage.setItem("storage", JSON.stringify({ ...cardStorage, version }));
  }, [cardStorage]);

  const updateActiveCard = (card, noUpdate = false) => {
    if (!card) {
      return;
    }
    const copiedCard = clone(card);
    if (!noUpdate) {
      setCardUpdated(true);
    }
    setActiveCard(copiedCard);
  };

  const changeActiveCard = (card) => {
    setActiveCard((prev) => {
      // Only update if the card is actually different
      if (prev?.id === card?.id && prev?.uuid === card?.uuid) {
        return prev;
      }
      setCardUpdated(false);
      return card;
    });
  };

  const saveActiveCard = () => {
    if (!activeCard) {
      return;
    }
    setCardUpdated(false);
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      const categoryIndex = newStorage.categories.findIndex((cat) => cat.uuid === activeCategory.uuid);
      const category = newStorage.categories[categoryIndex];
      const newCards = category.cards;
      newCards[newCards.findIndex((card) => card.uuid === activeCard.uuid)] = activeCard;
      newStorage.categories[categoryIndex] = {
        ...category,
        cards: newCards,
        // Mark as pending if sync is enabled
        ...(category.syncEnabled
          ? {
              localVersion: (category.localVersion || 1) + 1,
              syncStatus: "pending",
              syncError: null,
            }
          : {}),
      };
      return newStorage;
    });
  };

  const saveCard = (updatedCard, category) => {
    if (!updatedCard || !category) {
      return;
    }
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      const categoryIndex = newStorage.categories.findIndex((cat) => cat.uuid === category.uuid);
      const cat = newStorage.categories[categoryIndex];
      const newCards = cat.cards;
      newCards[newCards.findIndex((card) => card.uuid === updatedCard.uuid)] = updatedCard;
      newStorage.categories[categoryIndex] = {
        ...cat,
        cards: newCards,
        // Mark as pending if sync is enabled
        ...(cat.syncEnabled
          ? {
              localVersion: (cat.localVersion || 1) + 1,
              syncStatus: "pending",
              syncError: null,
            }
          : {}),
      };
      return newStorage;
    });
  };

  const addCardToCategory = (card, categoryId) => {
    if (!card) {
      return;
    }
    const copiedCard = clone(card);
    if (!categoryId) {
      setCardStorage((prevStorage) => {
        const newStorage = clone(prevStorage);
        const cat = newStorage.categories[0];
        cat.cards.push(copiedCard);
        newStorage.categories[0] = {
          ...cat,
          closed: false,
          // Mark as pending if sync is enabled
          ...(cat.syncEnabled
            ? {
                localVersion: (cat.localVersion || 1) + 1,
                syncStatus: "pending",
                syncError: null,
              }
            : {}),
        };
        return {
          ...newStorage,
        };
      });
    } else {
      setCardStorage((prevStorage) => {
        const newStorage = clone(prevStorage);
        const catIndex = newStorage.categories.findIndex((cat) => cat.uuid === categoryId);
        const cat = newStorage.categories[catIndex];
        cat.cards.push(copiedCard);
        newStorage.categories[catIndex] = {
          ...cat,
          closed: false,
          // Mark as pending if sync is enabled
          ...(cat.syncEnabled
            ? {
                localVersion: (cat.localVersion || 1) + 1,
                syncStatus: "pending",
                syncError: null,
              }
            : {}),
        };
        return {
          ...newStorage,
        };
      });
    }
  };

  const importCategory = (category, subCategories = []) => {
    if (!category) {
      return;
    }
    if (!category.cards) {
      return;
    }
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      // Add the parent category with sync fields (imported categories start as local)
      newStorage.categories.push({
        ...category,
        ...defaultSyncFields,
      });
      // Add sub-categories with parentId set to the imported category's uuid
      subCategories.forEach((sub) => {
        newStorage.categories.push({
          ...sub,
          parentId: category.uuid,
          ...defaultSyncFields,
        });
      });
      return {
        ...newStorage,
      };
    });
  };
  const addCategory = (categoryName, type = "category", dataSource) => {
    if (!categoryName) {
      return;
    }
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      const category = {
        uuid: uuidv4(),
        name: categoryName,
        type,
        cards: [],
        ...defaultSyncFields,
      };
      if (dataSource) {
        category.dataSource = dataSource;
      }
      newStorage.categories.push(category);
      return {
        ...newStorage,
      };
    });
  };

  const addSubCategory = (categoryName, parentId) => {
    if (!categoryName || !parentId) {
      return;
    }
    // Verify parent exists and is not itself a sub-category
    const parentCategory = cardStorage.categories.find((cat) => cat.uuid === parentId);
    if (!parentCategory || parentCategory.parentId || parentCategory.type === "list") {
      return;
    }
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      newStorage.categories.push({
        uuid: uuidv4(),
        name: categoryName,
        type: "category",
        cards: [],
        parentId,
        ...defaultSyncFields,
      });
      return {
        ...newStorage,
      };
    });
  };

  const renameCategory = (categoryId, newCategoryName) => {
    if (!categoryId || !newCategoryName) {
      return;
    }
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      const index = newStorage.categories.findIndex((cat) => cat.uuid === categoryId);
      const cat = newStorage.categories[index];
      newStorage.categories[index] = {
        ...cat,
        name: newCategoryName,
        // Mark as pending if sync is enabled
        ...(cat.syncEnabled
          ? {
              localVersion: (cat.localVersion || 1) + 1,
              syncStatus: "pending",
              syncError: null,
            }
          : {}),
      };
      return {
        ...newStorage,
      };
    });
  };

  const removeCardFromCategory = (cardId, categoryId) => {
    if (!cardId) {
      return;
    }
    if (!categoryId) {
      setCardStorage((prevStorage) => {
        const newStorage = clone(prevStorage);
        const cat = newStorage.categories[0];
        const newCards = cat.cards.filter((card) => card.uuid !== cardId);
        newStorage.categories[0] = {
          ...cat,
          cards: newCards,
          // Mark as pending if sync is enabled
          ...(cat.syncEnabled
            ? {
                localVersion: (cat.localVersion || 1) + 1,
                syncStatus: "pending",
                syncError: null,
              }
            : {}),
        };
        return {
          ...newStorage,
          categories: [...newStorage.categories],
        };
      });
    } else {
      setCardStorage((prevStorage) => {
        const newStorage = clone(prevStorage);
        const catIndex = newStorage.categories.findIndex((cat) => cat.uuid === categoryId);
        const cat = newStorage.categories[catIndex];
        const newCards = cat.cards.filter((card) => card.uuid !== cardId);
        newStorage.categories[catIndex] = {
          ...cat,
          cards: newCards,
          // Mark as pending if sync is enabled
          ...(cat.syncEnabled
            ? {
                localVersion: (cat.localVersion || 1) + 1,
                syncStatus: "pending",
                syncError: null,
              }
            : {}),
        };
        return newStorage;
      });
    }
  };
  const removeCategory = (categoryId) => {
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      // Also remove any sub-categories that have this category as parent
      const newCategories = newStorage.categories.filter(
        (cat) => cat.uuid !== categoryId && cat.parentId !== categoryId,
      );
      return {
        ...newStorage,
        categories: [...newCategories],
      };
    });
  };

  // Helper to get sub-categories of a parent
  const getSubCategories = (parentId) => {
    return cardStorage.categories.filter((cat) => cat.parentId === parentId);
  };

  const updateCategory = (category, uuid) => {
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      const newCategories = newStorage.categories;
      newCategories[newStorage.categories.findIndex((cat) => cat.uuid === uuid)] = category;
      return {
        ...newStorage,
        categories: [...newCategories],
      };
    });
  };

  // Mark a category as having pending changes (increments version, sets status to pending)
  const markCategoryPending = (categoryUuid) => {
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      const catIndex = newStorage.categories.findIndex((cat) => cat.uuid === categoryUuid);
      if (catIndex === -1) return prevStorage;

      const category = newStorage.categories[catIndex];
      // Only mark as pending if sync is enabled
      if (category.syncEnabled) {
        newStorage.categories[catIndex] = {
          ...category,
          localVersion: (category.localVersion || 1) + 1,
          syncStatus: "pending",
          syncError: null,
        };
      }
      return newStorage;
    });
  };

  // Update sync status for a category (used by useSync hook)
  const updateCategorySyncStatus = (categoryUuid, syncStatus, additionalFields = {}) => {
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      const catIndex = newStorage.categories.findIndex((cat) => cat.uuid === categoryUuid);
      if (catIndex === -1) return prevStorage;

      newStorage.categories[catIndex] = {
        ...newStorage.categories[catIndex],
        syncStatus,
        ...additionalFields,
      };
      return newStorage;
    });
  };

  // Enable or disable sync for a category
  // userId is optional - when enabling sync, pass the user ID to track which user it's synced to
  const setCategorySyncEnabled = (categoryUuid, enabled, userId = null) => {
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      const catIndex = newStorage.categories.findIndex((cat) => cat.uuid === categoryUuid);
      if (catIndex === -1) return prevStorage;

      newStorage.categories[catIndex] = {
        ...newStorage.categories[catIndex],
        syncEnabled: enabled,
        syncStatus: enabled ? "pending" : "local",
        syncError: null,
        // Set syncedToUserId when enabling sync, clear when disabling
        syncedToUserId: enabled ? userId : null,
      };
      return newStorage;
    });
  };

  // Bulk update categories (used for importing from cloud)
  const bulkUpdateCategories = (cloudCategories) => {
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);

      cloudCategories.forEach((cloudCat) => {
        // Infer dataSource from first card if not set on category
        const catWithDataSource =
          cloudCat.type === "list" && !cloudCat.dataSource && cloudCat.cards?.length > 0
            ? { ...cloudCat, dataSource: cloudCat.cards[0].source }
            : cloudCat;

        const existingIndex = newStorage.categories.findIndex((cat) => cat.uuid === catWithDataSource.uuid);
        if (existingIndex >= 0) {
          // Update existing category
          newStorage.categories[existingIndex] = {
            ...catWithDataSource,
            syncEnabled: true,
            syncStatus: "synced",
          };
        } else {
          // Add new category from cloud
          newStorage.categories.push({
            ...catWithDataSource,
            syncEnabled: true,
            syncStatus: "synced",
          });
        }
      });

      return newStorage;
    });
  };

  // =====================================================
  // Local Datasource Functions
  // =====================================================

  // Get all local datasources
  const getLocalDatasources = () => {
    return cardStorage.categories.filter((cat) => cat.type === "local-datasource");
  };

  // Convert a category to a local datasource
  // Returns null if category has sub-categories (not allowed)
  // Preserves sync state from original category
  const convertCategoryToDatasource = (categoryUuid, metadata) => {
    const category = cardStorage.categories.find((cat) => cat.uuid === categoryUuid);
    if (!category) {
      return { success: false, error: "Category not found" };
    }

    // Check if category has sub-categories
    const subCategories = cardStorage.categories.filter((cat) => cat.parentId === categoryUuid);
    if (subCategories.length > 0) {
      return { success: false, error: "Cannot convert category with sub-categories" };
    }

    // Infer display format from first card if not provided
    const displayFormat = metadata.displayFormat || category.cards?.[0]?.source || "basic";

    // Check if the category was synced (we'll need to delete it from cloud)
    const wasSynced = category.syncEnabled && category.cloudId;

    // Create new datasource entry, preserving sync state from original category
    const newDatasourceUuid = uuidv4();
    const datasource = {
      uuid: newDatasourceUuid,
      name: metadata.name || category.name,
      type: "local-datasource",
      cards: clone(category.cards || []),
      // Preserve sync state from category - if category was synced, datasource should be too
      syncEnabled: category.syncEnabled || false,
      syncStatus: category.syncEnabled ? "pending" : "local",
      lastSyncedAt: null,
      localVersion: 1,
      cloudVersion: null,
      syncError: null,
      syncedToUserId: category.syncedToUserId || null,
      // Datasource-specific fields
      ...defaultDatasourceFields,
      datasourceId: metadata.id || generateIdFromName(metadata.name || category.name),
      version: metadata.version || "1.0.0",
      author: metadata.author || null,
      displayFormat,
      colours: metadata.colours || { header: "#1a1a1a", banner: "#4a4a4a" },
    };

    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      // Remove the original category
      const newCategories = newStorage.categories.filter((cat) => cat.uuid !== categoryUuid);
      // Add the new datasource
      newCategories.push(datasource);
      return {
        ...newStorage,
        categories: newCategories,
      };
    });

    return {
      success: true,
      datasource,
      // Flag to indicate if the caller should delete the category from cloud
      shouldDeleteFromCloud: wasSynced,
      categoryCloudId: wasSynced ? category.cloudId : null,
    };
  };

  // Update metadata for a local datasource
  const updateDatasourceMetadata = (datasourceUuid, metadata) => {
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      const dsIndex = newStorage.categories.findIndex(
        (cat) => cat.uuid === datasourceUuid && cat.type === "local-datasource",
      );
      if (dsIndex === -1) return prevStorage;

      const ds = newStorage.categories[dsIndex];
      newStorage.categories[dsIndex] = {
        ...ds,
        name: metadata.name !== undefined ? metadata.name : ds.name,
        datasourceId: metadata.id !== undefined ? metadata.id : ds.datasourceId,
        version: metadata.version !== undefined ? metadata.version : ds.version,
        author: metadata.author !== undefined ? metadata.author : ds.author,
        displayFormat: metadata.displayFormat !== undefined ? metadata.displayFormat : ds.displayFormat,
        colours: metadata.colours !== undefined ? metadata.colours : ds.colours,
        // Mark as pending if sync is enabled
        ...(ds.syncEnabled
          ? {
              localVersion: (ds.localVersion || 1) + 1,
              syncStatus: "pending",
              syncError: null,
            }
          : {}),
      };
      return newStorage;
    });
  };

  // Remove a local datasource
  const removeLocalDatasource = (datasourceUuid) => {
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      const newCategories = newStorage.categories.filter((cat) => cat.uuid !== datasourceUuid);
      return {
        ...newStorage,
        categories: newCategories,
      };
    });
  };

  // Update cloud/publishing state for a local datasource
  const updateDatasourceCloudState = (datasourceUuid, cloudState) => {
    setCardStorage((prevStorage) => {
      const newStorage = clone(prevStorage);
      const dsIndex = newStorage.categories.findIndex(
        (cat) => cat.uuid === datasourceUuid && cat.type === "local-datasource",
      );
      if (dsIndex === -1) return prevStorage;

      newStorage.categories[dsIndex] = {
        ...newStorage.categories[dsIndex],
        ...cloudState,
      };
      return newStorage;
    });
  };

  const reorderCategories = (startIndex, endIndex) => {
    setCardStorage((prev) => ({
      ...prev,
      categories: reorderWithSubCategories(clone(prev.categories), startIndex, endIndex),
    }));
  };

  const reorderDatasources = (startIndex, endIndex) => {
    setCardStorage((prev) => ({
      ...prev,
      categories: reorderDatasourceItems(clone(prev.categories), startIndex, endIndex),
    }));
  };

  const reorderChildCategories = (parentUuid, startIndex, endIndex) => {
    setCardStorage((prev) => ({
      ...prev,
      categories: reorderSubCategories(clone(prev.categories), parentUuid, startIndex, endIndex),
    }));
  };

  const context = {
    cardStorage,
    activeCard,
    updateActiveCard,
    setActiveCard: changeActiveCard,
    activeCategory,
    cardUpdated,
    saveActiveCard,
    setActiveCategory,
    addCardToCategory,
    removeCardFromCategory,
    importCategory,
    renameCategory,
    removeCategory,
    addCategory,
    addSubCategory,
    getSubCategories,
    updateCategory,
    saveCard,
    // Sync-related functions
    markCategoryPending,
    updateCategorySyncStatus,
    setCategorySyncEnabled,
    bulkUpdateCategories,
    // Reorder functions
    reorderCategories,
    reorderDatasources,
    reorderChildCategories,
    // Local datasource functions
    getLocalDatasources,
    convertCategoryToDatasource,
    updateDatasourceMetadata,
    removeLocalDatasource,
    updateDatasourceCloudState,
  };

  return <CardStorageContext.Provider value={context}>{props.children}</CardStorageContext.Provider>;
};
