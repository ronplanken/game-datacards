import { useEffect, useMemo, useState } from "react";
import { CARD_UPDATE_STATUS, buildDatasourceCardIndex, checkCardsForUpdates } from "../../Helpers/cardUpdates.helpers";

const toggleIn = (setter) => (uuid) =>
  setter((prev) => {
    const next = new Set(prev);
    if (next.has(uuid)) next.delete(uuid);
    else next.add(uuid);
    return next;
  });

export const useDatasourceUpdates = ({ isOpen, cards, dataSource, selectedDataSource, language = "en" }) => {
  const results = useMemo(() => {
    if (!isOpen) return [];
    return checkCardsForUpdates(cards || [], buildDatasourceCardIndex(dataSource, selectedDataSource), language);
  }, [isOpen, cards, dataSource, selectedDataSource, language]);

  const changed = results.filter((result) => result.status === CARD_UPDATE_STATUS.CHANGED);
  const notFound = results.filter((result) => result.status === CARD_UPDATE_STATUS.NOT_FOUND);
  const unavailable = results.filter((result) => result.status === CARD_UPDATE_STATUS.UNAVAILABLE);
  const upToDate = results.filter((result) => result.status === CARD_UPDATE_STATUS.UP_TO_DATE);

  const initialSelection = () => new Set(changed.map((result) => result.card.uuid));
  const initialExpanded = () => (changed.length === 1 ? new Set([changed[0].card.uuid]) : new Set());
  const [selected, setSelected] = useState(initialSelection);
  const [expanded, setExpanded] = useState(initialExpanded);

  useEffect(() => {
    if (!isOpen) return;
    setSelected(initialSelection());
    setExpanded(initialExpanded());
  }, [isOpen]);

  const allSelected = changed.length > 0 && changed.every((result) => selected.has(result.card.uuid));
  const selectedUuids = changed.filter((result) => selected.has(result.card.uuid)).map((result) => result.card.uuid);

  return {
    results,
    changed,
    notFound,
    unavailable,
    upToDate,
    selected,
    expanded,
    allSelected,
    selectedUuids,
    toggleSelected: toggleIn(setSelected),
    toggleExpanded: toggleIn(setExpanded),
    toggleAll: () => setSelected(allSelected ? new Set() : new Set(changed.map((result) => result.card.uuid))),
  };
};
