import { Trash2 } from "lucide-react";
import { Button, Card, Segmented, Select, Typography } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";

/**
 * Helper to normalize entry to object format.
 * Handles legacy string entries by converting them to the object format.
 */
export const normalizeEntry = (entry) => {
  if (typeof entry === "string") {
    return { type: "official", name: entry };
  }
  return entry;
};

/**
 * Reusable draggable unit list component.
 *
 * Used by UnitLeads (for units this card leads) and UnitLedBy (for leaders of this unit).
 *
 * @param {Object} props
 * @param {string} props.title - Card title (e.g., "Leader", "Led by")
 * @param {string} props.addButtonText - Text for the add button (e.g., "Add unit", "Add leader")
 * @param {string} props.droppableId - Unique ID for the droppable area
 * @param {string} props.itemPrefix - Prefix for draggable item keys (e.g., "leads", "ledby")
 * @param {Array} props.items - Array of unit entries (normalized to objects)
 * @param {Function} props.onItemsChange - Callback when items array changes
 * @param {React.ReactNode} props.children - Optional additional content to render below the list
 */
export function DraggableUnitList({ title, addButtonText, droppableId, itemPrefix, items, onItemsChange, children }) {
  const { cardStorage, activeCard } = useCardStorage();

  // Get all DataCard type cards from user's storage for the dropdown
  const allUserCards = React.useMemo(() => {
    const cards = [];
    cardStorage?.categories?.forEach((category) => {
      category.cards?.forEach((card) => {
        if (card.cardType === "DataCard" && card.uuid !== activeCard?.uuid) {
          cards.push({
            label: card.name,
            value: card.uuid,
            category: category.name,
          });
        }
      });
    });
    return cards;
  }, [cardStorage, activeCard?.uuid]);

  const updateItem = (index, newEntry) => {
    const newItems = [...items];
    newItems[index] = newEntry;
    onItemsChange(newItems);
  };

  const deleteItem = (index) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    onItemsChange(newItems);
  };

  const addItem = () => {
    const newItems = [...items];
    newItems.push({ type: "official", name: `Unit ${newItems.length + 1}` });
    onItemsChange(newItems);
  };

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }
          const newItems = reorder(items, result.source.index, result.destination.index);
          onItemsChange(newItems);
        }}>
        <Card
          type={"inner"}
          size={"small"}
          title={<Typography.Text>{title}</Typography.Text>}
          style={{ marginBottom: "16px" }}>
          <div className="keywords_container" style={{ paddingBottom: "4px", paddingTop: "4px" }}>
            <Droppable droppableId={droppableId}>
              {(provided) => {
                return (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {items.map((entry, index) => {
                      return (
                        <Draggable
                          key={`${itemPrefix}-${index}-${entry.uuid || entry.name}`}
                          draggableId={`${itemPrefix}-${index}`}
                          index={index}>
                          {(drag) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              key={`${itemPrefix}-${index}`}>
                              <div
                                className="keyword_container"
                                style={{ flexDirection: "column", alignItems: "stretch", gap: "8px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  <Segmented
                                    size="small"
                                    options={[
                                      { label: "Official", value: "official" },
                                      { label: "Custom", value: "custom" },
                                    ]}
                                    value={entry.type || "official"}
                                    onChange={(value) => {
                                      if (value === "custom") {
                                        updateItem(index, {
                                          type: "custom",
                                          uuid: allUserCards[0]?.value || "",
                                          name: allUserCards[0]?.label || "Select a card",
                                        });
                                      } else {
                                        updateItem(index, { type: "official", name: entry.name || "Unit" });
                                      }
                                    }}
                                  />
                                  <div style={{ flex: 1 }}>
                                    {entry.type === "custom" ? (
                                      <Select
                                        size="small"
                                        style={{ width: "100%" }}
                                        placeholder="Select a card"
                                        value={entry.uuid}
                                        onChange={(value) => {
                                          const selectedCard = allUserCards.find((c) => c.value === value);
                                          updateItem(index, {
                                            type: "custom",
                                            uuid: value,
                                            name: selectedCard?.label || "",
                                          });
                                        }}
                                        options={allUserCards.map((card) => ({
                                          label: `${card.label} (${card.category})`,
                                          value: card.value,
                                        }))}
                                        showSearch
                                        filterOption={(input, option) =>
                                          option?.label?.toLowerCase().includes(input.toLowerCase())
                                        }
                                      />
                                    ) : (
                                      <Typography.Text
                                        editable={{
                                          onChange: (value) => {
                                            updateItem(index, { type: "official", name: value });
                                          },
                                        }}>
                                        {entry.name}
                                      </Typography.Text>
                                    )}
                                  </div>
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<Trash2 size={14} />}
                                    onClick={() => deleteItem(index)}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      );
                    })}
                    {provided.placeholder}
                  </div>
                );
              }}
            </Droppable>
          </div>
          <Button type="dashed" style={{ width: "100%" }} onClick={addItem}>
            {addButtonText}
          </Button>
        </Card>
      </DragDropContext>
      {children}
    </>
  );
}
