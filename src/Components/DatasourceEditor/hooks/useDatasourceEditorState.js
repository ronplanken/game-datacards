import { useState, useCallback, useEffect } from "react";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";
import {
  createBlankCardFromSchema,
  getTargetArray,
  countDatasourceCards,
  FACTION_CARD_COLLECTION_KEYS,
} from "../../../Helpers/customDatasource.helpers";
import { migrateLegacyKeywordGlossary } from "../../../Helpers/customSchema.helpers";

/**
 * Applies in-memory migrations to a freshly loaded datasource.
 * Today this only renames the legacy `weaponKeywordGlossary` field on the
 * schema; cheap to call on every load.
 */
function migrateDatasourceOnLoad(datasource) {
  if (!datasource?.schema) return datasource;
  const migratedSchema = migrateLegacyKeywordGlossary(datasource.schema);
  if (migratedSchema === datasource.schema) return datasource;
  return { ...datasource, schema: migratedSchema };
}

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
    for (const arrayName of FACTION_CARD_COLLECTION_KEYS) {
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
  const { getCustomDatasourceData, updateDatasourceSyncState } = useDataSourceStorage();

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
          setActiveDatasource(migrateDatasourceOnLoad(data));
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
      // If sync is enabled, mark as pending so auto-sync picks it up
      // editVersion is only incremented when the sync actually happens (in useSync)
      if (updatedDatasource.syncEnabled) {
        updatedDatasource = {
          ...updatedDatasource,
          syncStatus: "pending",
          syncError: null,
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

      // Persist to localForage (and bump sync trigger if sync-enabled)
      try {
        await updateDatasourceSyncState(updatedDatasource.id, updatedDatasource);
      } catch {
        // Storage failure is non-fatal for the editor session
      }
    },
    [selectedItem, settings, updateSettings, updateDatasourceSyncState],
  );

  /**
   * Set the active datasource after wizard creation (receives full datasource object).
   */
  const setCreatedDatasource = useCallback((datasource) => {
    const migrated = migrateDatasourceOnLoad(datasource);
    setActiveDatasource(migrated);
    setSelectedItem({ type: "datasource" });
    saveSelection({ ds: migrated.id });
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
   * Add a blank card to a specific faction (or the first one if no factionId).
   */
  const addCard = useCallback(
    async (cardTypeDef, factionId) => {
      if (!activeDatasource?.data?.length) return;
      const factions = activeDatasource.data;
      const targetIndex = factionId ? factions.findIndex((f) => f.id === factionId) : 0;
      const faction = targetIndex >= 0 ? factions[targetIndex] : factions[0];
      const realIndex = targetIndex >= 0 ? targetIndex : 0;
      if (!faction) return;
      const card = createBlankCardFromSchema(cardTypeDef, faction.id, activeDatasource.id);
      const targetArray = getTargetArray(cardTypeDef.key);

      const updatedFaction = {
        ...faction,
        [targetArray]: [...(faction[targetArray] || []), card],
      };
      const updatedData = factions.map((f, i) => (i === realIndex ? updatedFaction : f));
      const updatedDatasource = { ...activeDatasource, data: updatedData };
      await updateDatasource(updatedDatasource);
      setSelectedItem({ type: "card", data: card });
      saveSelection({ ds: activeDatasource.id, type: cardTypeDef.key, card: card.id });
    },
    [activeDatasource, updateDatasource],
  );

  /**
   * Update a card by ID — searches every faction for the matching card.
   * If the updated card's `faction_id` no longer matches the faction it lives
   * in, physically move it from the source faction's collection array into the
   * target faction's collection array. This is what makes the card editor's
   * Faction dropdown actually re-faction a card (not just re-skin its colour
   * theme).
  /**
   * Update a card by ID — searches every faction for the matching card.
   */
  const updateCard = useCallback(
    async (updatedCard) => {
      if (!activeDatasource?.data?.length) return;
      const targetArray = getTargetArray(updatedCard.cardType);
      const factions = activeDatasource.data;
      const sourceFaction = factions.find((f) => (f[targetArray] || []).some((c) => c.id === updatedCard.id));
      if (!sourceFaction) return;

      const desiredFactionId = updatedCard.faction_id;
      const desiredFaction = desiredFactionId != null ? factions.find((f) => f.id === desiredFactionId) : null;
      const isMoving = !!desiredFaction && desiredFaction.id !== sourceFaction.id;

      const updatedData = factions.map((faction) => {
        if (isMoving && faction.id === sourceFaction.id) {
          return {
            ...faction,
            [targetArray]: (faction[targetArray] || []).filter((c) => c.id !== updatedCard.id),
          };
        }
        if (isMoving && faction.id === desiredFaction.id) {
          return {
            ...faction,
            [targetArray]: [...(faction[targetArray] || []), updatedCard],
          };
        }
        if (!isMoving && faction.id === sourceFaction.id) {
          return {
            ...faction,
            [targetArray]: (faction[targetArray] || []).map((c) => (c.id === updatedCard.id ? updatedCard : c)),
          };
        }
        return faction;
      });

      const updatedDatasource = { ...activeDatasource, data: updatedData };
      // Keep selected card in sync synchronously, before any await. Awaiting
      // here would split this state update into a separate React batch and
      // some controlled editors (notably @uiw/react-md-editor) will see a
      // stale `value` prop in the interim render, snap their internal state
      // back to the old value, then re-sync and reset the textarea — which
      // jumps the caret to the end after the first keystroke.
      if (selectedItem?.type === "card" && selectedItem?.data?.id === updatedCard.id) {
        setSelectedItem({ type: "card", data: updatedCard });
      }
      await updateDatasource(updatedDatasource);
    },
    [activeDatasource, updateDatasource, selectedItem],
  );

  /**
   * Delete a card by ID — searches every faction for the matching card.
   */
  const deleteCard = useCallback(
    async (cardId, cardType) => {
      if (!activeDatasource?.data?.length) return;
      const targetArray = getTargetArray(cardType);
      let touched = false;
      const updatedData = activeDatasource.data.map((faction) => {
        const cards = faction[targetArray] || [];
        if (!cards.some((c) => c.id === cardId)) return faction;
        touched = true;
        return { ...faction, [targetArray]: cards.filter((c) => c.id !== cardId) };
      });
      if (!touched) return;
      const updatedDatasource = { ...activeDatasource, data: updatedData };
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

  // Refresh activeDatasource sync fields when trigger changes (e.g. after sync completes)
  useEffect(() => {
    if (!activeDatasource) return;
    let cancelled = false;
    getCustomDatasourceData(activeDatasource.id).then((data) => {
      if (cancelled || !data) return;
      // Only update sync-related fields to avoid overwriting in-progress edits
      if (
        data.syncStatus !== activeDatasource.syncStatus ||
        data.lastSyncedAt !== activeDatasource.lastSyncedAt ||
        data.syncEnabled !== activeDatasource.syncEnabled
      ) {
        setActiveDatasource((prev) => ({
          ...prev,
          syncEnabled: data.syncEnabled,
          syncStatus: data.syncStatus,
          syncError: data.syncError,
          lastSyncedAt: data.lastSyncedAt,
          editVersion: data.editVersion,
          isUploaded: data.isUploaded,
          cloudId: data.cloudId,
        }));
      }
    });
    return () => {
      cancelled = true;
    };
  }, [settings.datasourceSyncTrigger]);

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
        const migrated = migrateDatasourceOnLoad(data);
        setActiveDatasource(migrated);
        // Replace `data` below with `migrated` so card-by-id lookup uses
        // the post-migration object — schema-level migrations don't touch
        // cards today, but keeping the references consistent avoids
        // surprises if that changes.
        data = migrated;

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
