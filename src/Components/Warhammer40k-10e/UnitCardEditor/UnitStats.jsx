import { Button } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { UnitStatLine } from "./UnitStatLine";

export function UnitStats() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }
          const newStats = reorder(activeCard.stats, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, stats: newStats });
        }}>
        <Droppable droppableId="droppable-stats">
          {(provided, snapshot) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeCard.stats.map((line, index) => {
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
            const newStats = [...activeCard.stats];
            newStats.push({
              name: `Stats line ${newStats.length + 1}`,
              active: true,
            });
            return { ...activeCard, stats: newStats };
          })
        }>
        Add datasheet
      </Button>
    </>
  );
}
