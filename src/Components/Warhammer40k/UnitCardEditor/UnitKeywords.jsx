import { Button, Checkbox, Col, Row, Typography } from "antd";
import React from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useCardStorage } from "../../../Hooks/useCardStorage";

import { v4 as uuidv4 } from "uuid";

export function UnitKeywords() {
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

          const newKeywords = reorder(activeCard.keywords, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, keywords: newKeywords });
        }}>
        <Droppable droppableId="droppable-keywords">
          {(provided, snapshot) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeCard.keywords.map((keyword, index) => {
                  return (
                    <Draggable
                      key={`ability-${keyword.keyword}-${index}`}
                      draggableId={`ability-${keyword.keyword}-${index}`}
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
                              checked={keyword.active}
                              onChange={(e) => {
                                updateActiveCard(() => {
                                  const newKeywords = [...activeCard.keywords];
                                  newKeywords[index]["active"] = e.target.checked;
                                  return {
                                    ...activeCard,
                                    keywords: newKeywords,
                                  };
                                });
                              }}>
                              <Typography.Text
                                editable={{
                                  onChange: (value) => {
                                    const newKeywords = [...activeCard.keywords];
                                    newKeywords[index]["keyword"] = value;
                                    updateActiveCard({
                                      ...activeCard,
                                      keywords: newKeywords,
                                    });
                                  },
                                }}>
                                {keyword.keyword}
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
            const newKeywords = [...activeCard.keywords];
            newKeywords.push({
              keyword: `New keyword ${newKeywords.length + 1}`,
              custom: true,
              active: true,
              is_faction_keyword: false,
              model: "",
              id: uuidv4(),
            });
            return { ...activeCard, keywords: newKeywords };
          })
        }>
        Add new keyword
      </Button>
    </>
  );
}
