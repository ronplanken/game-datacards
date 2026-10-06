import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { DraggableUnitList, normalizeEntry } from "./DraggableUnitList";

export function UnitLedBy() {
  const { activeCard, updateActiveCard } = useCardStorage();

  // Normalize all entries to object format
  const normalizedLeadBy = React.useMemo(() => {
    return activeCard?.leadBy?.map(normalizeEntry) || [];
  }, [activeCard?.leadBy]);

  const handleLeadByChange = (newLeadBy) => {
    updateActiveCard({
      ...activeCard,
      leadBy: newLeadBy,
    });
  };

  return (
    <DraggableUnitList
      title="Led by"
      addButtonText="Add leader"
      droppableId="droppable-ledby"
      itemPrefix="ledby"
      items={normalizedLeadBy}
      onItemsChange={handleLeadByChange}
    />
  );
}
