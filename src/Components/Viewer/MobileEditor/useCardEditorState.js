import { useState, useCallback, useRef, useEffect } from "react";

/**
 * Hook for managing local card state with auto-save.
 * Maintains a mutable local copy for responsive UI,
 * calling onSave with the full updated card on every change.
 */
export function useCardEditorState(card, onSave) {
  const [localCard, setLocalCard] = useState(card);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    onSaveRef.current = onSave;
  }, [onSave]);

  // Sync local state when the source card changes (e.g., editor opens with new card)
  useEffect(() => {
    if (card) {
      setLocalCard(card);
    }
  }, [card?.uuid]);

  const updateField = useCallback((path, value) => {
    setLocalCard((prev) => {
      const updated = setNestedValue(prev, path, value);
      onSaveRef.current?.(updated);
      return updated;
    });
  }, []);

  const updateFields = useCallback((updates) => {
    setLocalCard((prev) => {
      let updated = prev;
      for (const [path, value] of Object.entries(updates)) {
        updated = setNestedValue(updated, path, value);
      }
      onSaveRef.current?.(updated);
      return updated;
    });
  }, []);

  const replaceCard = useCallback((updatedCard) => {
    setLocalCard(updatedCard);
    onSaveRef.current?.(updatedCard);
  }, []);

  return { localCard, updateField, updateFields, replaceCard };
}

/**
 * Immutably set a value at a dot-separated path.
 * Supports array indices: "stats.0.m" sets stats[0].m
 */
function setNestedValue(obj, path, value) {
  const keys = path.split(".");
  if (keys.length === 1) {
    return { ...obj, [keys[0]]: value };
  }

  const [head, ...rest] = keys;
  const index = Number(head);
  if (Array.isArray(obj) && !isNaN(index)) {
    const copy = [...obj];
    copy[index] = setNestedValue(copy[index], rest.join("."), value);
    return copy;
  }

  return {
    ...obj,
    [head]: setNestedValue(obj[head] ?? {}, rest.join("."), value),
  };
}
