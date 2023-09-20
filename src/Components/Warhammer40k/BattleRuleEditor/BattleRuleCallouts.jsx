import { DeleteFilled } from "@ant-design/icons";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { Button, Card, Form, Popconfirm, Select, Space, Switch, Typography } from "antd";
import React from "react";
import { reorder } from "../../../Helpers/generic.helpers";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function BattleRuleCallouts({ type }) {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }

          const newCallouts = reorder(activeCard.callouts, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, callouts: newCallouts });
        }}>
        <Droppable droppableId={`droppable-${type}-callouts`}>
          {(provided, snapshot) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeCard.callouts?.map((callout, index) => {
                  return (
                    <Draggable key={`callout-${type}-${index}`} draggableId={`callout-${type}-${index}`} index={index}>
                      {(drag) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          key={`callout-${type}-${index}`}>
                          <Card
                            type={"inner"}
                            size={"small"}
                            title={
                              <Typography.Text
                                ellipsis={{ rows: 1 }}
                                editable={{
                                  onChange: (value) => {
                                    const newCallouts = [...activeCard.callouts];
                                    newCallouts[index]["callout_text"] = value;
                                    updateActiveCard({
                                      ...activeCard,
                                      callouts: newCallouts,
                                    });
                                  },
                                }}>
                                {callout.callout_text}
                              </Typography.Text>
                            }
                            style={{ marginBottom: "16px" }}
                            bodyStyle={{ padding: 8 }}
                            extra={
                              <Space>
                                <Popconfirm
                                  title={"Are you sure you want to delete this callout?"}
                                  placement="topRight"
                                  onConfirm={(value) =>
                                    updateActiveCard(() => {
                                      const newCallouts = [...activeCard.callouts];
                                      newCallouts.splice(index, 1);
                                      return {
                                        ...activeCard,
                                        callouts: newCallouts,
                                      };
                                    })
                                  }>
                                  <Button type="icon" shape="circle" size="small" icon={<DeleteFilled />}></Button>
                                </Popconfirm>
                              </Space>
                            }>
                            <Form size="small">
                              <Form.Item label={"Detail"}>
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
                                  value={callout.description}
                                  onChange={(value) => {
                                    updateActiveCard(() => {
                                      const newCallouts = [...activeCard.callouts];
                                      newCallouts[index]["description"] = value;
                                      return {
                                        ...activeCard,
                                        callouts: newCallouts,
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
            const newCallouts = [...activeCard.callouts];
            newCallouts.push({
              name: `New callout ${newCallouts.length + 1}`,
              showAbility: true,
              showDescription: false,
            });
            return { ...activeCard, callouts: newCallouts };
          })
        }>
        Add callout
      </Button>
    </>
  );
}
