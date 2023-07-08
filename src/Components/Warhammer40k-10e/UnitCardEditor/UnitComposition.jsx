import { DeleteFilled } from "@ant-design/icons";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { Button, Card, Form, Popconfirm, Select, Space } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function UnitComposition() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
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
                                <MDEditor
                                  preview="edit"
                                  commands={[
                                    commands.bold,
                                    commands.italic,
                                    commands.strikethrough,
                                    commands.hr,
                                    commands.divider,
                                    commands.unorderedListCommand,
                                    commands.orderedListCommand,
                                    commands.divider,
                                  ]}
                                  extraCommands={[]}
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
