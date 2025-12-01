import { Trash2 } from "lucide-react";
import { Button, Card, Select, Typography } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function UnitLedBy() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }

          const newLeadBy = reorder(activeCard.leadBy, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, leadBy: newLeadBy });
        }}>
        <Card
          type={"inner"}
          size={"small"}
          title={<Typography.Text>Led by</Typography.Text>}
          style={{ marginBottom: "16px" }}>
          <div className="keywords_container" style={{ paddingBottom: "4px", paddingTop: "4px" }}>
            <Droppable droppableId={`droppable-ledby`}>
              {(provided, snapshot) => {
                return (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {activeCard?.leadBy?.map((leadBy, index) => {
                      return (
                        <Draggable key={`leadBy-${leadBy}`} draggableId={`keyword-${leadBy}`} index={index}>
                          {(drag) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              key={`leadBy-${leadBy}`}>
                              <div className="keyword_container">
                                <Typography.Text
                                  editable={{
                                    onChange: (value) => {
                                      const newLeadBy = [...activeCard.leadBy];
                                      newLeadBy[index] = value;
                                      updateActiveCard({
                                        ...activeCard,
                                        leadBy: newLeadBy,
                                      });
                                    },
                                  }}>
                                  {leadBy}
                                </Typography.Text>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<Trash2 size={14} />}
                                  onClick={(value) =>
                                    updateActiveCard(() => {
                                      const newLeadBy = [...activeCard.leadBy];
                                      newLeadBy.splice(index, 1);
                                      return {
                                        ...activeCard,
                                        leadBy: newLeadBy,
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
                const newLeadBy = [...(activeCard.leadBy || [])];
                newLeadBy.push(`Unit ${newLeadBy.length + 1}`);
                return { ...activeCard, leadBy: newLeadBy };
              })
            }>
            Add leader
          </Button>
        </Card>
      </DragDropContext>
    </>
  );
}
