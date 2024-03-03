import { DeleteFilled } from "@ant-design/icons";
import { Button, Card, Select, Typography } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function UnitKeywords({ type }) {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }

          const newKeywords = reorder(activeCard[type], result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, [type]: newKeywords });
        }}>
        <Card
          type={"inner"}
          size={"small"}
          title={<Typography.Text>{type} keywords</Typography.Text>}
          style={{ marginBottom: "16px" }}>
          <div className="keywords_container" style={{ paddingBottom: "4px", paddingTop: "4px" }}>
            <Droppable droppableId={`droppable-keywords-${type}`}>
              {(provided, snapshot) => {
                return (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {activeCard[type].map((ability, index) => {
                      return (
                        <Draggable
                          key={`keyword-${type}-${index}`}
                          draggableId={`keyword-${type}-${index}`}
                          index={index}>
                          {(drag) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              key={`keyword-${type}-${index}`}>
                              <div className="keyword_container">
                                <Typography.Text
                                  editable={{
                                    onChange: (value) => {
                                      const newKeywords = [...activeCard[type]];
                                      newKeywords[index] = value;
                                      updateActiveCard({
                                        ...activeCard,
                                        [type]: newKeywords,
                                      });
                                    },
                                  }}>
                                  {ability}
                                </Typography.Text>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<DeleteFilled />}
                                  onClick={(value) =>
                                    updateActiveCard(() => {
                                      const newKeywords = [...activeCard[type]];
                                      newKeywords.splice(index, 1);
                                      return {
                                        ...activeCard,
                                        [type]: newKeywords,
                                      };
                                    })
                                  }></Button>
                              </div>
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
          </div>
          <Button
            type="dashed"
            style={{ width: "100%" }}
            onClick={() =>
              updateActiveCard(() => {
                const newKeywords = [...activeCard[type]];
                newKeywords.push(`New keyword ${newKeywords.length + 1}`);
                return { ...activeCard, [type]: newKeywords };
              })
            }>
            Add keyword
          </Button>
        </Card>
      </DragDropContext>
    </>
  );
}
