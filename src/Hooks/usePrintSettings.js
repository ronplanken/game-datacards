import { useState, useCallback } from "react";

/**
 * Custom hook to manage print settings state and persistence.
 * Extracts all print-related state management from Print.jsx.
 */
export const usePrintSettings = (settings, updateSettings) => {
  const ps = settings.printSettings || {};

  // Page settings
  const [pageSize, setPageSizeState] = useState(ps.pageSize || "A4");
  const [pageOrientation, setPageOrientationState] = useState(ps.pageOrientation || "portrait");
  const [pagePadding, setPagePaddingState] = useState(ps.pagePadding || 0);
  const [customSize, setCustomSizeState] = useState(ps.customSize || { height: "15cm", width: "15cm" });

  // Card settings
  const [cardsPerPage, setCardsPerPageState] = useState(ps.cardsPerPage || 1);
  const [cardScaling, setCardScalingState] = useState(ps.cardScaling || 100);
  const [cardAlignment, setCardAlignmentState] = useState(ps.cardAlignment || "space-evenly");
  const [verticalAlignment, setVerticalAlignmentState] = useState(ps.verticalAlignment || "flex-start");
  const [rowGap, setRowGapState] = useState(ps.rowGap || 0);
  const [columnGap, setColumnGapState] = useState(ps.columnGap || 0);

  // Other settings
  const [backgrounds, setBackgroundsState] = useState(ps.backgrounds || "standard");
  const [print_side, setPrintSideState] = useState(ps.print_side || "front");
  const [force_print_side, setForcePrintSideState] = useState(ps.force_print_side || false);

  // Helper to update a single setting and persist it
  const updatePrintSetting = useCallback(
    (key, value) => {
      updateSettings({
        ...settings,
        printSettings: { ...settings.printSettings, [key]: value },
      });
    },
    [settings, updateSettings],
  );

  // Page settings handlers
  const setPageSize = useCallback(
    (val) => {
      setPageSizeState(val);
      updatePrintSetting("pageSize", val);
    },
    [updatePrintSetting],
  );

  const setPageOrientation = useCallback(
    (val) => {
      setPageOrientationState(val);
      updatePrintSetting("pageOrientation", val);
    },
    [updatePrintSetting],
  );

  const setPagePadding = useCallback(
    (val) => {
      setPagePaddingState(val);
      updatePrintSetting("pagePadding", val);
    },
    [updatePrintSetting],
  );

  const setCustomSize = useCallback(
    (val) => {
      setCustomSizeState(val);
      updateSettings({
        ...settings,
        printSettings: { ...settings.printSettings, customSize: val },
      });
    },
    [settings, updateSettings],
  );

  // Card settings handlers
  const setCardsPerPage = useCallback(
    (val) => {
      setCardsPerPageState(val);
      updatePrintSetting("cardsPerPage", val);
    },
    [updatePrintSetting],
  );

  const setCardScaling = useCallback(
    (val) => {
      setCardScalingState(val);
      updatePrintSetting("cardScaling", val);
    },
    [updatePrintSetting],
  );

  const setCardAlignment = useCallback(
    (val) => {
      setCardAlignmentState(val);
      updatePrintSetting("cardAlignment", val);
    },
    [updatePrintSetting],
  );

  const setVerticalAlignment = useCallback(
    (val) => {
      setVerticalAlignmentState(val);
      updatePrintSetting("verticalAlignment", val);
    },
    [updatePrintSetting],
  );

  const setRowGap = useCallback(
    (val) => {
      setRowGapState(val);
      updatePrintSetting("rowGap", val);
    },
    [updatePrintSetting],
  );

  const setColumnGap = useCallback(
    (val) => {
      setColumnGapState(val);
      updatePrintSetting("columnGap", val);
    },
    [updatePrintSetting],
  );

  // Other settings handlers
  const setBackgrounds = useCallback(
    (val) => {
      setBackgroundsState(val);
      updatePrintSetting("backgrounds", val);
    },
    [updatePrintSetting],
  );

  const setPrintSide = useCallback(
    (val) => {
      setPrintSideState(val);
      updatePrintSetting("print_side", val);
    },
    [updatePrintSetting],
  );

  const setForcePrintSide = useCallback(
    (val) => {
      setForcePrintSideState(val);
      updatePrintSetting("force_print_side", val);
    },
    [updatePrintSetting],
  );

  return {
    // Page settings
    pageSize,
    setPageSize,
    pageOrientation,
    setPageOrientation,
    pagePadding,
    setPagePadding,
    customSize,
    setCustomSize,

    // Card settings
    cardsPerPage,
    setCardsPerPage,
    cardScaling,
    setCardScaling,
    cardAlignment,
    setCardAlignment,
    verticalAlignment,
    setVerticalAlignment,
    rowGap,
    setRowGap,
    columnGap,
    setColumnGap,

    // Other settings
    backgrounds,
    setBackgrounds,
    print_side,
    setPrintSide,
    force_print_side,
    setForcePrintSide,
  };
};
