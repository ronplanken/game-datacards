import { Trash2 } from "lucide-react";
import { Button, Card, Form, Segmented, Select, Typography } from "antd";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
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

export function UnitLeader() {
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
  const normalizedUnits = React.useMemo(() => {
    return activeCard?.leads?.units?.map(normalizeEntry) || [];
  }, [activeCard?.leads?.units]);

  const updateUnit = (index, newEntry) => {
    const newUnits = [...normalizedUnits];
    newUnits[index] = newEntry;
    updateActiveCard({
      ...activeCard,
      leads: {
        ...activeCard.leads,
        units: newUnits,
      },
    });
  };

  const deleteUnit = (index) => {
    const newUnits = [...normalizedUnits];
    newUnits.splice(index, 1);
    updateActiveCard({
      ...activeCard,
      leads: {
        ...activeCard.leads,
        units: newUnits,
      },
    });
  };

  const addUnit = () => {
    const newUnits = [...normalizedUnits];
    newUnits.push({ type: "official", name: `Unit ${newUnits.length + 1}` });
    updateActiveCard({
      ...activeCard,
      leads: {
        ...activeCard.leads,
        units: newUnits,
      },
    });
  };

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }

          const newUnits = reorder(normalizedUnits, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, leads: { ...activeCard.leads, units: newUnits } });
        }}>
        <Card
          type={"inner"}
          size={"small"}
          title={<Typography.Text>Leader</Typography.Text>}
          style={{ marginBottom: "16px" }}>
          <div className="keywords_container" style={{ paddingBottom: "4px", paddingTop: "4px" }}>
            <Droppable droppableId={`droppable-leads`}>
              {(provided, snapshot) => {
                return (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {normalizedUnits.map((entry, index) => {
                      return (
                        <Draggable
                          key={`leads.units-${index}-${entry.uuid || entry.name}`}
                          draggableId={`leads-${index}`}
                          index={index}>
                          {(drag) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              key={`leads.units-${index}`}>
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
                                        updateUnit(index, {
                                          type: "custom",
                                          uuid: allUserCards[0]?.value || "",
                                          name: allUserCards[0]?.label || "Select a card",
                                        });
                                      } else {
                                        updateUnit(index, { type: "official", name: entry.name || "Unit" });
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
                                          updateUnit(index, {
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
                                            updateUnit(index, { type: "official", name: value });
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
                                    onClick={() => deleteUnit(index)}
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
          <Button type="dashed" style={{ width: "100%" }} onClick={addUnit}>
            Add unit
          </Button>
        </Card>
      </DragDropContext>
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
    </>
  );
}
