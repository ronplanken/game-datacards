import { Button } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { UnitWeapon } from "./UnitWeapon";

export function UnitWeapons({ type }) {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const weapons = activeCard[type] || [];

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }
          const newWeapons = reorder(weapons, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, [type]: newWeapons });
        }}>
        <Droppable droppableId="droppable-weapons">
          {(provided) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {weapons.map((weapon, index) => {
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
              const newWeapons = [...weapons];
              newWeapons.push({
                profiles: [
                  {
                    name: { [settings.language]: `Weapon ${newWeapons.length + 1}` },
                    range: "",
                    attacks: "",
                    skill: "",
                    strength: "",
                    ap: "",
                    damage: "",
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
