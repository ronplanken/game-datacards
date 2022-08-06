import { Button, Checkbox, Col, Row, Typography } from "antd";
import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useCardStorage } from "../../../Hooks/useCardStorage";

import { v4 as uuidv4 } from "uuid";

export function VehicleSkills() {
  const { activeCard, updateActiveCard } = useCardStorage();

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }

          const newSkills = reorder(
            activeCard.skills,
            result.source.index,
            result.destination.index
          );
          updateActiveCard({ ...activeCard, skills: newSkills });
        }}
      >
        <Droppable droppableId="droppable-skills">
          {(provided, snapshot) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeCard.skills.map((gear, index) => {
                  return (
                    <Draggable
                      key={`ability-${gear.name}-${index}`}
                      draggableId={`ability-${gear.name}-${index}`}
                      index={index}
                    >
                      {(drag) => (
                        <Row
                          justify="space-between"
                          align="middle"
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                        >
                          <Col span={22} justify="center">
                            <Checkbox
                              checked={gear.active}
                              onChange={(e) => {
                                updateActiveCard(() => {
                                  const newSkills = [...activeCard.skills];
                                  newSkills[index]["active"] =
                                    e.target.checked;
                                  return {
                                    ...activeCard,
                                    skills: newSkills,
                                  };
                                });
                              }}
                            >
                              <Typography.Text
                                editable={{
                                  onChange: (value) => {
                                    const newSkills = [
                                      ...activeCard.skills,
                                    ];
                                    newSkills[index]["name"] = value;
                                    updateActiveCard({
                                      ...activeCard,
                                      skills: newSkills,
                                    });
                                  },
                                }}
                              >
                                {gear.name}
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
            const newSkills = [...activeCard.skills];
            newSkills.push({
              name: `New skills ${newSkills.length + 1}`,
              custom: true,
              active: true,
              id: uuidv4(),
            });
            return { ...activeCard, skills: newSkills };
          })
        }
      >
        Add new skills
      </Button>
    </>
  );
}
