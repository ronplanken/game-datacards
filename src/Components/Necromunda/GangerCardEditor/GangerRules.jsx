import { DeleteFilled } from "@ant-design/icons";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { Button, Card, Col, Popconfirm, Row, Space, Switch, Typography } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import { useCardStorage } from "../../../Hooks/useCardStorage";

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

          const newRules = reorder(activeCard.rules, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, rules: newRules });
        }}>
        <Droppable droppableId="droppable-rules">
          {(provided, snapshot) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeCard.rules.map((gear, index) => {
                  return (
                    <Draggable
                      key={`ability-${gear.name}-${index}`}
                      draggableId={`ability-${gear.name}-${index}`}
                      index={index}>
                      {(drag) => (
                        <Card
                          type={"inner"}
                          size={"small"}
                          title={
                            <Typography.Text
                              editable={{
                                onChange: (value) => {
                                  const newRules = [...activeCard.rules];
                                  newRules[index]["name"] = value;
                                  updateActiveCard({
                                    ...activeCard,
                                    rules: newRules,
                                  });
                                },
                              }}>
                              {gear.name}
                            </Typography.Text>
                          }
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          bodyStyle={{ padding: 0 }}
                          extra={
                            <Space>
                              <Popconfirm
                                title={"Are you sure you want to delete this rules?"}
                                placement="topRight"
                                onConfirm={() =>
                                  updateActiveCard(() => {
                                    const newRules = [...activeCard.rules];
                                    newRules.splice(index, 1);
                                    return { ...activeCard, rules: newRules };
                                  })
                                }>
                                <Button type="icon" shape="circle" size="small" icon={<DeleteFilled />}></Button>
                              </Popconfirm>
                              <Switch
                                checked={gear.active}
                                onChange={(value) => {
                                  updateActiveCard(() => {
                                    const newRules = [...activeCard.rules];
                                    newRules[index]["active"] = value;
                                    return {
                                      ...activeCard,
                                      rules: newRules,
                                    };
                                  });
                                }}
                              />
                            </Space>
                          }>
                          {gear.active && (
                            <Row justify="space-between" align="middle">
                              <Col span={24}>
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
                                  value={gear.description}
                                  onChange={(value) => {
                                    const newRules = [...activeCard.rules];
                                    newRules[index]["description"] = value;
                                    updateActiveCard({
                                      ...activeCard,
                                      rules: newRules,
                                    });
                                  }}
                                />
                              </Col>
                            </Row>
                          )}
                        </Card>
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
              name: `New rule ${newRules.length + 1}`,
              description: `description`,
              custom: true,
              active: true,
              id: uuidv4(),
            });
            return { ...activeCard, rules: newRules };
          })
        }>
        Add new rule
      </Button>
    </>
  );
}
