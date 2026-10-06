import { useState, useCallback, createContext, useContext } from "react";

const STORAGE_KEY = "gdc-ds-section-state";

const readFromStorage = () => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

const writeToStorage = (data) => {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage full or unavailable
  }
};

const SectionStateContext = createContext(null);

/**
 * Hook for managing collapsible section open/closed state per card type.
 * Persists state in sessionStorage so it survives page navigation within the session.
 *
 * @param {string} cardTypeKey - The card type key to scope section state to
 */
export const useSectionState = (cardTypeKey) => {
  const [state, setState] = useState(() => {
    if (!cardTypeKey) return {};
    const all = readFromStorage();
    return all[cardTypeKey] || {};
  });

  const isSectionOpen = useCallback(
    (sectionKey) => {
      return state[sectionKey] !== undefined ? state[sectionKey] : true;
    },
    [state],
  );

  const toggleSection = useCallback(
    (sectionKey, isOpen) => {
      setState((prev) => {
        const next = { ...prev, [sectionKey]: isOpen };
        if (cardTypeKey) {
          const all = readFromStorage();
          all[cardTypeKey] = next;
          writeToStorage(all);
        }
        return next;
      });
    },
    [cardTypeKey],
  );

  return { isSectionOpen, toggleSection };
};

export { SectionStateContext };

/**
 * Hook for child components to consume section state from context.
 * Returns null if no provider is present (uncontrolled mode).
 */
export const useSectionStateContext = () => {
  return useContext(SectionStateContext);
};
