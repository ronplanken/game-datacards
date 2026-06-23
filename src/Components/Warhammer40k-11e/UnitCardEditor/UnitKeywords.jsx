import { Trash2 } from "lucide-react";
import { Button, Card, Typography } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize, setLocalizedArrayItem } from "../../../Helpers/localization.helpers";

// 11th edition keywords are language-keyed (rendered via localize); factions are
// plain strings (rendered with a plain join). The `localized` flag selects the
// correct read/write behaviour per entry.
export function UnitKeywords({ type, localized = false }) {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const lang = settings.language;
  const entries = activeCard[type] || [];

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }
          const newEntries = reorder(entries, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, [type]: newEntries });
        }}>
        <Card
          type={"inner"}
          size={"small"}
          title={<Typography.Text>{type} keywords</Typography.Text>}
          style={{ marginBottom: "16px" }}>
          <div className="keywords_container" style={{ paddingBottom: "4px", paddingTop: "4px" }}>
            <Droppable droppableId={`droppable-keywords-${type}`}>
              {(provided) => {
                return (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {entries.map((entry, index) => {
                      return (
                        <Draggable
                          key={`keyword-${type}-${index}`}
                          draggableId={`keyword-${type}-${index}`}
                          index={index}>
                          {(drag) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              key={`keyword-${type}-${index}`}>
                              <div className="keyword_container">
                                <Typography.Text
                                  editable={{
                                    onChange: (value) => {
                                      const newEntries = localized
                                        ? setLocalizedArrayItem(entries, index, lang, value)
                                        : [...entries];
                                      if (!localized) {
                                        newEntries[index] = value;
                                      }
                                      updateActiveCard({ ...activeCard, [type]: newEntries });
                                    },
                                  }}>
                                  {localized ? localize(entry, lang) : entry}
                                </Typography.Text>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<Trash2 size={14} />}
                                  onClick={() =>
                                    updateActiveCard(() => {
                                      const newEntries = [...entries];
                                      newEntries.splice(index, 1);
                                      return { ...activeCard, [type]: newEntries };
                                    })
                                  }></Button>
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
          <Button
            type="dashed"
            style={{ width: "100%" }}
            onClick={() =>
              updateActiveCard(() => {
                const newEntries = [...entries];
                const label = `New keyword ${newEntries.length + 1}`;
                newEntries.push(localized ? { [lang]: label } : label);
                return { ...activeCard, [type]: newEntries };
              })
            }>
            Add keyword
          </Button>
        </Card>
      </DragDropContext>
    </>
  );
}
