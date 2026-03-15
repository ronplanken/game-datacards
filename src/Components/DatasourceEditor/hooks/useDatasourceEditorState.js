import { useState, useCallback, useEffect } from "react";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import {
  createBlankCardFromSchema,
  getTargetArray,
  countDatasourceCards,
} from "../../../Helpers/customDatasource.helpers";

const CARD_ARRAY_NAMES = [
  "datasheets",
  "stratagems",
  "enhancements",
  "warscrolls",
  "manifestationLores",
  "psychicpowers",
  "secondaries",
  "rules",
];

const COOKIE_NAME = "gdc-ds-selection";

function saveSelection(params) {
  try {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(params))}; path=/; SameSite=Lax`;
  } catch {}
}

function loadSelection() {
  try {
    const match = document.cookie.match(new RegExp(`(?:^|; )${COOKIE_NAME}=([^;]*)`));
    return match ? JSON.parse(decodeURIComponent(match[1])) : null;
  } catch {
    return null;
  }
}

function clearSelection() {
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`;
}

function findCardInDatasource(datasource, cardId) {
  if (!datasource?.data) return null;
  for (const faction of datasource.data) {
    for (const arrayName of CARD_ARRAY_NAMES) {
      const cards = faction[arrayName];
      if (Array.isArray(cards)) {
        const card = cards.find((c) => c.id === cardId);
        if (card) return card;
      }
    }
  }
  return null;
}

/**
 * State management hook for the Datasource Editor page.
 * Manages selected item, active datasource, and datasource list.
 * Persists selection state in a session cookie.
 */
export function useDatasourceEditorState() {
  const { settings, updateSettings } = useSettingsStorage();
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
          saveSelection({ ds: registryEntry.id });
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
  const selectDatasource = useCallback(() => {
    setSelectedItem({ type: "datasource" });
    if (activeDatasource) {
      saveSelection({ ds: activeDatasource.id });
    }
  }, [activeDatasource]);

  /**
   * Select a card type node (shows schema editor for that type).
   */
  const selectCardType = useCallback(
    (cardType) => {
      setSelectedItem({ type: "cardType", key: cardType.key, data: cardType });
      if (activeDatasource) {
        saveSelection({ ds: activeDatasource.id, type: cardType.key });
      }
    },
    [activeDatasource],
  );

  /**
   * Update the active datasource in-memory and persist to localForage.
   */
  const updateDatasource = useCallback(
    async (updatedDatasource) => {
      // If sync is enabled, mark as pending and bump editVersion so auto-sync picks it up
      if (updatedDatasource.syncEnabled) {
        updatedDatasource = {
          ...updatedDatasource,
          syncStatus: "pending",
          syncError: null,
          editVersion: (updatedDatasource.editVersion || 0) + 1,
        };
      }
      setActiveDatasource(updatedDatasource);

      // Keep selectedItem.data in sync if a card type is selected
      if (selectedItem?.type === "cardType" && selectedItem?.key) {
        const updatedCardType = updatedDatasource.schema?.cardTypes?.find((ct) => ct.key === selectedItem.key);
        if (updatedCardType) {
          setSelectedItem({ type: "cardType", key: updatedCardType.key, data: updatedCardType });
        }
      }

      // Sync card count and name to registry so settings/selector stay accurate
      const newCount = countDatasourceCards(updatedDatasource);
      const currentRegistry = settings.customDatasources || [];
      const entry = currentRegistry.find((ds) => ds.id === updatedDatasource.id);
      if (entry && (entry.cardCount !== newCount || entry.name !== updatedDatasource.name)) {
        updateSettings({
          ...settings,
          customDatasources: currentRegistry.map((ds) =>
            ds.id === updatedDatasource.id ? { ...ds, cardCount: newCount, name: updatedDatasource.name } : ds,
          ),
        });
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
    [selectedItem, settings, updateSettings],
  );

  /**
   * Set the active datasource after wizard creation (receives full datasource object).
   */
  const setCreatedDatasource = useCallback((datasource) => {
    setActiveDatasource(datasource);
    setSelectedItem({ type: "datasource" });
    saveSelection({ ds: datasource.id });
  }, []);

  /**
   * Select a card (shows card preview in center + card editor in right panel).
   */
  const selectCard = useCallback(
    (card) => {
      setSelectedItem({ type: "card", data: card });
      if (activeDatasource) {
        const params = { ds: activeDatasource.id };
        if (card.cardType) params.type = card.cardType;
        params.card = card.id;
        saveSelection(params);
      }
    },
    [activeDatasource],
  );

  /**
   * Add a blank card to the first faction in the active datasource.
   */
  const addCard = useCallback(
    async (cardTypeDef) => {
      if (!activeDatasource?.data?.[0]) return;
      const faction = activeDatasource.data[0];
      const card = createBlankCardFromSchema(cardTypeDef, faction.id, activeDatasource.id);
      const targetArray = getTargetArray(cardTypeDef.key);

      const updatedFaction = {
        ...faction,
        [targetArray]: [...(faction[targetArray] || []), card],
      };
      const updatedDatasource = {
        ...activeDatasource,
        data: [updatedFaction, ...activeDatasource.data.slice(1)],
      };
      await updateDatasource(updatedDatasource);
      setSelectedItem({ type: "card", data: card });
      saveSelection({ ds: activeDatasource.id, type: cardTypeDef.key, card: card.id });
    },
    [activeDatasource, updateDatasource],
  );

  /**
   * Update a card by ID in the first faction of the active datasource.
   */
  const updateCard = useCallback(
    async (updatedCard) => {
      if (!activeDatasource?.data?.[0]) return;
      const faction = activeDatasource.data[0];
      const targetArray = getTargetArray(updatedCard.cardType);
      const cards = faction[targetArray] || [];

      const updatedFaction = {
        ...faction,
        [targetArray]: cards.map((c) => (c.id === updatedCard.id ? updatedCard : c)),
      };
      const updatedDatasource = {
        ...activeDatasource,
        data: [updatedFaction, ...activeDatasource.data.slice(1)],
      };
      await updateDatasource(updatedDatasource);
      // Keep selected card in sync
      if (selectedItem?.type === "card" && selectedItem?.data?.id === updatedCard.id) {
        setSelectedItem({ type: "card", data: updatedCard });
      }
    },
    [activeDatasource, updateDatasource, selectedItem],
  );

  /**
   * Delete a card by ID from the first faction.
   */
  const deleteCard = useCallback(
    async (cardId, cardType) => {
      if (!activeDatasource?.data?.[0]) return;
      const faction = activeDatasource.data[0];
      const targetArray = getTargetArray(cardType);
      const cards = faction[targetArray] || [];

      const updatedFaction = {
        ...faction,
        [targetArray]: cards.filter((c) => c.id !== cardId),
      };
      const updatedDatasource = {
        ...activeDatasource,
        data: [updatedFaction, ...activeDatasource.data.slice(1)],
      };
      await updateDatasource(updatedDatasource);
      // Clear selection if deleted card was selected
      if (selectedItem?.type === "card" && selectedItem?.data?.id === cardId) {
        setSelectedItem({ type: "datasource" });
        saveSelection({ ds: activeDatasource.id });
      }
    },
    [activeDatasource, updateDatasource, selectedItem],
  );

  // If the active datasource is removed from the registry, clear it
  useEffect(() => {
    if (activeDatasource && !datasources.some((ds) => ds.id === activeDatasource.id)) {
      setActiveDatasource(null);
      setSelectedItem(null);
      clearSelection();
    }
  }, [datasources, activeDatasource]);

  // Restore selection from session cookie on mount
  useEffect(() => {
    const saved = loadSelection();
    if (!saved?.ds) return;
    if (!datasources.some((ds) => ds.id === saved.ds)) {
      clearSelection();
      return;
    }

    setIsLoading(true);
    getCustomDatasourceData(saved.ds)
      .then((data) => {
        if (!data) {
          clearSelection();
          return;
        }
        setActiveDatasource(data);

        if (saved.card) {
          const card = findCardInDatasource(data, saved.card);
          if (card) {
            setSelectedItem({ type: "card", data: card });
            return;
          }
        }
        if (saved.type) {
          const cardType = data.schema?.cardTypes?.find((ct) => ct.key === saved.type);
          if (cardType) {
            setSelectedItem({ type: "cardType", key: cardType.key, data: cardType });
            return;
          }
        }
        setSelectedItem({ type: "datasource" });
      })
      .catch(() => clearSelection())
      .finally(() => setIsLoading(false));
  }, []);

  return {
    datasources,
    activeDatasource,
    selectedItem,
    isLoading,
    openDatasource,
    selectDatasource,
    selectCardType,
    selectCard,
    addCard,
    updateCard,
    deleteCard,
    updateDatasource,
    setCreatedDatasource,
  };
}
