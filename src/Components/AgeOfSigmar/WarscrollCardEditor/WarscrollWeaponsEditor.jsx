import { Button } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { v4 as uuidv4 } from "uuid";
import { WarscrollWeapon } from "./WarscrollWeapon";

export function WarscrollWeaponsEditor({ type }) {
  const { activeCard, updateActiveCard } = useCardStorage();
  const isRanged = type === "ranged";
  const weapons = activeCard.weapons?.[type] || [];

  const addWeapon = () => {
    const newWeapon = {
      id: uuidv4(),
      name: "New Weapon",
      active: true,
      attacks: "1",
      hit: "4+",
      wound: "4+",
      rend: "-",
      damage: "1",
      keywords: [],
    };
    if (isRanged) {
      newWeapon.range = '12"';
    }
    updateActiveCard({
      ...activeCard,
      weapons: {
        ...activeCard.weapons,
        [type]: [...weapons, newWeapon],
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
          const newWeapons = reorder(weapons, result.source.index, result.destination.index);
          updateActiveCard({
            ...activeCard,
            weapons: {
              ...activeCard.weapons,
              [type]: newWeapons,
            },
          });
        }}>
        <Droppable droppableId={`droppable-weapons-${type}`}>
          {(provided) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {weapons.map((weapon, index) => {
                  return (
                    <Draggable
                      key={weapon.id || `weapon-${index}`}
                      draggableId={weapon.id || `weapon-${index}`}
                      index={index}>
                      {(drag) => (
                        <div ref={drag.innerRef} {...drag.draggableProps} {...drag.dragHandleProps}>
                          <WarscrollWeapon weapon={weapon} index={index} type={type} />
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
        <Button type={"dashed"} style={{ width: "100%" }} onClick={addWeapon}>
          Add weapon
        </Button>
      </div>
    </>
  );
}
