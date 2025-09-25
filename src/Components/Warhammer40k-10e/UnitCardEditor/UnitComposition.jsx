import { DeleteFilled } from "@ant-design/icons";
import { Button, Card, Form, Popconfirm, Select, Space, Switch } from "antd";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function UnitComposition() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <Card
        type={"inner"}
        size={"small"}
        title={`Unit Composition section visibility`}
        style={{ marginBottom: "16px" }}
        bodyStyle={{ padding: 0 }}
        extra={
          <Space>
            <Switch
              checked={activeCard.showComposition !== false}
              onChange={(value) => {
                updateActiveCard(() => {
                  return {
                    ...activeCard,
                    showComposition: value,
                  };
                });
              }}
            />
          </Space>
        }></Card>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }

          const newComposition = reorder(activeCard.composition, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, composition: newComposition });
        }}>
        <Droppable droppableId={`droppable-composition-options`}>
          {(provided, snapshot) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeCard.composition.map((compositionOption, index) => {
                  return (
                    <Draggable key={`composition-${index}`} draggableId={`composition-${index}`} index={index}>
                      {(drag) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          key={`composition-${index}`}>
                          <Card
                            type={"inner"}
                            size={"small"}
                            title={`Composition option ${index + 1}`}
                            style={{ marginBottom: "16px" }}
                            extra={
                              <Space>
                                <Popconfirm
                                  title={"Are you sure you want to delete this composition option?"}
                                  placement="topRight"
                                  onConfirm={(value) =>
                                    updateActiveCard(() => {
                                      const newComposition = [...activeCard.composition];
                                      newComposition.splice(index, 1);
                                      return {
                                        ...activeCard,
                                        composition: newComposition,
                                      };
                                    })
                                  }>
                                  <Button type="icon" shape="circle" size="small" icon={<DeleteFilled />}></Button>
                                </Popconfirm>
                              </Space>
                            }>
                            <Form size="small">
                              <Form.Item>
                                <CustomMarkdownEditor
                                  value={compositionOption}
                                  onChange={(value) => {
                                    updateActiveCard(() => {
                                      const newComposition = [...activeCard.composition];
                                      newComposition[index] = value;
                                      return {
                                        ...activeCard,
                                        composition: newComposition,
                                      };
                                    });
                                  }}
                                />
                              </Form.Item>
                            </Form>
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
            const newComposition = [...activeCard.composition];
            newComposition.push("");
            return { ...activeCard, composition: newComposition };
          })
        }>
        Add composition option
      </Button>
    </>
  );
}
