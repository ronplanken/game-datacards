import { DeleteFilled } from "@ant-design/icons";
import { Button, Card, Form, Input, Popconfirm, Space, Switch } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";

export function UnitPoints() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }

          const newPoints = reorder(activeCard.points, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, points: newPoints });
        }}>
        <Droppable droppableId={`droppable-points`}>
          {(provided, snapshot) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeCard?.points?.map((point, index) => {
                  return (
                    <Draggable key={`point-${index}`} draggableId={`point-${index}`} index={index}>
                      {(drag) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          key={`point-${index}`}>
                          <Card
                            key={`points-${index}`}
                            type={"inner"}
                            size={"small"}
                            title={"Points"}
                            bodyStyle={{ padding: point.active ? 8 : 0 }}
                            style={{ marginBottom: "16px" }}
                            extra={
                              <Space>
                                <Popconfirm
                                  title={"Are you sure you want to delete these points?"}
                                  placement="topRight"
                                  onConfirm={(value) =>
                                    updateActiveCard(() => {
                                      const newPoints = [...activeCard.points];
                                      newPoints.splice(index, 1);
                                      return { ...activeCard, points: newPoints };
                                    })
                                  }>
                                  <Button type="icon" shape="circle" size="small" icon={<DeleteFilled />}></Button>
                                </Popconfirm>
                                <Switch
                                  checked={point.active}
                                  onChange={(value) =>
                                    updateActiveCard(() => {
                                      const newPoints = [...activeCard.points];
                                      newPoints[index]["active"] = value;
                                      return { ...activeCard, points: newPoints };
                                    })
                                  }
                                />
                              </Space>
                            }>
                            {point.active && (
                              <Form size="small">
                                <Form.Item label={"Models"}>
                                  <Input
                                    type={"text"}
                                    value={point.models}
                                    onChange={(e) => {
                                      updateActiveCard(() => {
                                        const newPoints = [...activeCard.points];
                                        newPoints[index]["models"] = e.target.value;
                                        return { ...activeCard, points: newPoints };
                                      });
                                    }}
                                  />
                                </Form.Item>
                                <Form.Item label={"Cost"}>
                                  <Input
                                    type={"text"}
                                    value={point.cost}
                                    onChange={(e) => {
                                      updateActiveCard(() => {
                                        const newPoints = [...activeCard.points];
                                        newPoints[index]["cost"] = e.target.value;
                                        return { ...activeCard, points: newPoints };
                                      });
                                    }}
                                  />
                                </Form.Item>
                                <Form.Item label={"Keyword"}>
                                  <Input
                                    type={"text"}
                                    value={point.keyword}
                                    onChange={(e) => {
                                      updateActiveCard(() => {
                                        const newPoints = [...activeCard.points];
                                        newPoints[index]["keyword"] = e.target.value;
                                        return { ...activeCard, points: newPoints };
                                      });
                                    }}
                                  />
                                </Form.Item>
                              </Form>
                            )}
                          </Card>
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
      <Button
        type="dashed"
        style={{ width: "100%" }}
        onClick={() =>
          updateActiveCard(() => {
            if (activeCard?.points) {
              const newPoints = [...activeCard?.points];
              newPoints.push({ active: true, models: 0, cost: 0 });
              return { ...activeCard, points: newPoints };
            }
            return { ...activeCard, points: [{ active: true, models: 0, cost: 0 }] };
          })
        }>
        Add points
      </Button>
    </>
  );
}
