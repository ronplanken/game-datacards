import { Button, Checkbox, Col, Row, Typography } from "antd";
import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useCardStorage } from "../../../Hooks/useCardStorage";

import { v4 as uuidv4 } from "uuid";

export function GangerRules() {
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

          const newRules = reorder(
            activeCard.rules,
            result.source.index,
            result.destination.index
          );
          updateActiveCard({ ...activeCard, rules: newRules });
        }}
      >
        <Droppable droppableId="droppable-rules">
          {(provided, snapshot) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeCard.rules.map((gear, index) => {
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
                                  const newRules = [...activeCard.rules];
                                  newRules[index]["active"] =
                                    e.target.checked;
                                  return {
                                    ...activeCard,
                                    rules: newRules,
                                  };
                                });
                              }}
                            >
                              <Typography.Text
                                editable={{
                                  onChange: (value) => {
                                    const newRules = [
                                      ...activeCard.rules,
                                    ];
                                    newRules[index]["name"] = value;
                                    updateActiveCard({
                                      ...activeCard,
                                      rules: newRules,
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
            const newRules = [...activeCard.rules];
            newRules.push({
              name: `New rules ${newRules.length + 1}`,
              custom: true,
              active: true,
              id: uuidv4(),
            });
            return { ...activeCard, rules: newRules };
          })
        }
      >
        Add new rules
      </Button>
    </>
  );
}
