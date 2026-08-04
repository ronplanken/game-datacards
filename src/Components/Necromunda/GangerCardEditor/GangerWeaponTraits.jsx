import { Button, Checkbox, Col, Row, Typography } from "antd";
import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useCardStorage } from "../../../Hooks/useCardStorage";

import { v4 as uuidv4 } from "uuid";
import clone from "just-clone";

export function GangerWeaponTraits({ weaponIndex, profileIndex }) {
  const { activeCard, updateActiveCard } = useCardStorage();
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  return (
    <div style={{ padding: "16px", border: "1px solid #f0f0f0" }}>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }

          const newTraits = reorder(
            activeCard.weapons[weaponIndex].profiles[profileIndex].traits,
            result.source.index,
            result.destination.index,
          );
          const newWeapons = [...activeCard.weapons];
          newWeapons[weaponIndex].profiles[profileIndex].traits = newTraits;
          updateActiveCard({ ...activeCard, weapons: newWeapons });
        }}>
        <Droppable droppableId={`droppable-weapon-${weaponIndex}-profile-${profileIndex}-traits`}>
          {(provided, snapshot) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeCard.weapons[weaponIndex]?.profiles[profileIndex]?.traits?.map((trait, index) => {
                  return (
                    <Draggable
                      key={`trait-${trait.name}-${index}`}
                      draggableId={`trait-${trait.name}-${index}`}
                      index={index}>
                      {(drag) => (
                        <Row
                          justify="space-between"
                          align="middle"
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}>
                          <Col span={22} justify="center">
                            <Checkbox
                              checked={trait.active}
                              onChange={(e) => {
                                updateActiveCard(() => {
                                  const newWeapons = clone(activeCard.weapons);
                                  newWeapons[weaponIndex].profiles[profileIndex].traits[index].active =
                                    e.target.checked;
                                  return { ...activeCard, weapons: newWeapons };
                                });
                              }}>
                              <Typography.Text
                                editable={{
                                  onChange: (value) => {
                                    const newWeapons = clone(activeCard.weapons);
                                    newWeapons[weaponIndex].profiles[profileIndex].traits[index].name = value;
                                    updateActiveCard({ ...activeCard, weapons: newWeapons });
                                  },
                                }}>
                                {trait.name}
                              </Typography.Text>
                            </Checkbox>
                          </Col>
                        </Row>
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
        style={{
          width: "100%",
          marginTop: 4,
        }}
        onClick={() =>
          updateActiveCard(() => {
            const newWeapons = clone(activeCard.weapons);

            if (newWeapons[weaponIndex].profiles[profileIndex].traits) {
              newWeapons[weaponIndex].profiles[profileIndex].traits = [
                ...newWeapons[weaponIndex].profiles[profileIndex].traits,
                {
                  name: `New Trait ${newWeapons[weaponIndex].profiles[profileIndex].traits.length + 1}`,
                  custom: true,
                  active: true,
                  id: uuidv4(),
                },
              ];
            } else {
              newWeapons[weaponIndex].profiles[profileIndex].traits = [
                {
                  name: `New Trait`,
                  custom: true,
                  active: true,
                  id: uuidv4(),
                },
              ];
            }
            return { ...activeCard, weapons: newWeapons };
          })
        }>
        Add new trait
      </Button>
    </div>
  );
}
