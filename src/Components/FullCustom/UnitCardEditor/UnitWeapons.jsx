import { Button } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { UnitWeapon } from "./UnitWeapon";

export function UnitWeapons({ type }) {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }
          const newWeapons = reorder(activeCard[type], result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, [type]: newWeapons });
        }}>
        <Droppable droppableId="droppable-weapons">
          {(provided, snapshot) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeCard[type]?.map((weapon, index) => {
                  return (
                    <Draggable key={`weapon-${index}`} draggableId={`weapon-${index}`} index={index}>
                      {(drag) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          key={`weapon-line-${index}`}>
                          <UnitWeapon index={index} weapon={weapon} type={type} key={index} />
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
      <div style={{ paddingTop: "16px" }}>
        <Button
          type="dashed"
          style={{ width: "100%" }}
          onClick={() =>
            updateActiveCard(() => {
              const newWeapons = [...activeCard[type]];
              newWeapons.push({
                active: true,
                profiles: [
                  {
                    active: true,
                    range: "",
                    attacks: "",
                    skill: "",
                    strength: "",
                    ap: "",
                    damage: "",
                    name: `Weapon ${newWeapons.length + 1}`,
                    keywords: [],
                  },
                ],
              });
              return { ...activeCard, [type]: newWeapons };
            })
          }>
          Add weapon
        </Button>
      </div>
    </>
  );
}
