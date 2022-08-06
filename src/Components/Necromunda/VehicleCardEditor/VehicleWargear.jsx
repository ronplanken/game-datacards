import { Button, Checkbox, Col, Row, Typography } from "antd";
import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useCardStorage } from "../../../Hooks/useCardStorage";

import { v4 as uuidv4 } from "uuid";

export function VehicleWargear() {
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

          const newWargear = reorder(
            activeCard.wargear,
            result.source.index,
            result.destination.index
          );
          updateActiveCard({ ...activeCard, wargear: newWargear });
        }}
      >
        <Droppable droppableId="droppable-wargear">
          {(provided, snapshot) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeCard.wargear.map((gear, index) => {
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
                                  const newWargear = [...activeCard.wargear];
                                  newWargear[index]["active"] =
                                    e.target.checked;
                                  return {
                                    ...activeCard,
                                    wargear: newWargear,
                                  };
                                });
                              }}
                            >
                              <Typography.Text
                                editable={{
                                  onChange: (value) => {
                                    const newWargear = [
                                      ...activeCard.wargear,
                                    ];
                                    newWargear[index]["name"] = value;
                                    updateActiveCard({
                                      ...activeCard,
                                      wargear: newWargear,
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
            const newWargear = [...activeCard.wargear];
            newWargear.push({
              name: `New wargear ${newWargear.length + 1}`,
              custom: true,
              active: true,
              id: uuidv4(),
            });
            return { ...activeCard, wargear: newWargear };
          })
        }
      >
        Add new wargear
      </Button>
    </>
  );
}
