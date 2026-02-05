import { Form } from "antd";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { DraggableUnitList, normalizeEntry } from "./DraggableUnitList";

export function UnitLeader() {
  const { activeCard, updateActiveCard } = useCardStorage();

  // Normalize all entries to object format
  const normalizedUnits = React.useMemo(() => {
    return activeCard?.leads?.units?.map(normalizeEntry) || [];
  }, [activeCard?.leads?.units]);

  const handleUnitsChange = (newUnits) => {
    updateActiveCard({
      ...activeCard,
      leads: {
        ...activeCard.leads,
        units: newUnits,
      },
    });
  };

  return (
    <DraggableUnitList
      title="Leader"
      addButtonText="Add unit"
      droppableId="droppable-leads"
      itemPrefix="leads"
      items={normalizedUnits}
      onItemsChange={handleUnitsChange}>
      <Form.Item>
        <CustomMarkdownEditor
          value={activeCard?.leads?.extra}
          onChange={(value) => {
            updateActiveCard(() => {
              return {
                ...activeCard,
                leads: {
                  ...activeCard.leads,
                  extra: value,
                },
              };
            });
          }}
        />
      </Form.Item>
    </DraggableUnitList>
  );
}
