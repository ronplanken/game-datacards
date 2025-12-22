import { Trash2 } from "lucide-react";
import { Button, Card, Segmented, Select, Typography } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";

// Helper to normalize entry to object format
const normalizeEntry = (entry) => {
  if (typeof entry === "string") {
    return { type: "official", name: entry };
  }
  return entry;
};

export function UnitLedBy() {
  const { activeCard, updateActiveCard, cardStorage } = useCardStorage();

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

  // Normalize all entries to object format
  const normalizedLeadBy = React.useMemo(() => {
    return activeCard?.leadBy?.map(normalizeEntry) || [];
  }, [activeCard?.leadBy]);

  const updateEntry = (index, newEntry) => {
    const newLeadBy = [...normalizedLeadBy];
    newLeadBy[index] = newEntry;
    updateActiveCard({
      ...activeCard,
      leadBy: newLeadBy,
    });
  };

  const deleteEntry = (index) => {
    const newLeadBy = [...normalizedLeadBy];
    newLeadBy.splice(index, 1);
    updateActiveCard({
      ...activeCard,
      leadBy: newLeadBy,
    });
  };

  const addEntry = () => {
    const newLeadBy = [...normalizedLeadBy];
    newLeadBy.push({ type: "official", name: `Unit ${newLeadBy.length + 1}` });
    updateActiveCard({
      ...activeCard,
      leadBy: newLeadBy,
    });
  };

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }

          const newLeadBy = reorder(normalizedLeadBy, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, leadBy: newLeadBy });
        }}>
        <Card
          type={"inner"}
          size={"small"}
          title={<Typography.Text>Led by</Typography.Text>}
          style={{ marginBottom: "16px" }}>
          <div className="keywords_container" style={{ paddingBottom: "4px", paddingTop: "4px" }}>
            <Droppable droppableId={`droppable-ledby`}>
              {(provided, snapshot) => {
                return (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {normalizedLeadBy.map((entry, index) => {
                      return (
                        <Draggable
                          key={`leadBy-${index}-${entry.uuid || entry.name}`}
                          draggableId={`ledby-${index}`}
                          index={index}>
                          {(drag) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              key={`leadBy-${index}`}>
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
                                        updateEntry(index, {
                                          type: "custom",
                                          uuid: allUserCards[0]?.value || "",
                                          name: allUserCards[0]?.label || "Select a card",
                                        });
                                      } else {
                                        updateEntry(index, { type: "official", name: entry.name || "Unit" });
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
                                          updateEntry(index, {
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
                                            updateEntry(index, { type: "official", name: value });
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
                                    onClick={() => deleteEntry(index)}
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
          <Button type="dashed" style={{ width: "100%" }} onClick={addEntry}>
            Add leader
          </Button>
        </Card>
      </DragDropContext>
    </>
  );
}
