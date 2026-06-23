import { Button } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { UnitStatLine } from "./UnitStatLine";

export function UnitStats() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const stats = activeCard.stats || [];

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }
          const newStats = reorder(stats, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, stats: newStats });
        }}>
        <Droppable droppableId="droppable-stats">
          {(provided) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {stats.map((line, index) => {
                  return (
                    <Draggable key={`stat-${index}`} draggableId={`stat-${index}`} index={index}>
                      {(drag) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          key={`sheet-${index}`}>
                          <UnitStatLine sheet={line} index={index} />
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
      </DragDropContext>
      <Button
        type="dashed"
        style={{ width: "100%" }}
        onClick={() =>
          updateActiveCard(() => {
            const newStats = [...stats];
            newStats.push({
              name: { [settings.language]: `Stats line ${newStats.length + 1}` },
              m: "",
              t: "",
              sv: "",
              w: "",
              ld: "",
              oc: "",
            });
            return { ...activeCard, stats: newStats };
          })
        }>
        Add datasheet
      </Button>
    </>
  );
}
