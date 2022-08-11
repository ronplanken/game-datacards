import { DeleteFilled } from "@ant-design/icons";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { Button, Card, Col, Popconfirm, Row, Space, Switch, Typography } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import { useCardStorage } from "../../../Hooks/useCardStorage";

export function GangerSkills() {
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

          const newSkills = reorder(activeCard.skills, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, skills: newSkills });
        }}>
        <Droppable droppableId="droppable-skills">
          {(provided, snapshot) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeCard.skills.map((gear, index) => {
                  return (
                    <Draggable
                      key={`ability-${gear.name}-${index}`}
                      draggableId={`ability-${gear.name}-${index}`}
                      index={index}
                      >
                      {(drag) => (
                        <Card
                          type={"inner"}
                          size={"small"}
                          title={
                            <Typography.Text
                              editable={{
                                onChange: (value) => {
                                  const newSkills = [...activeCard.skills];
                                  newSkills[index]["name"] = value;
                                  updateActiveCard({
                                    ...activeCard,
                                    skills: newSkills,
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
                                title={"Are you sure you want to delete this skills?"}
                                placement="topRight"
                                onConfirm={() =>
                                  updateActiveCard(() => {
                                    const newSkills = [...activeCard.skills];
                                    newSkills.splice(index, 1);
                                    return { ...activeCard, skills: newSkills };
                                  })
                                }>
                                <Button type="icon" shape="circle" size="small" icon={<DeleteFilled />}></Button>
                              </Popconfirm>
                              <Switch
                                checked={gear.active}
                                onChange={(value) => {
                                  updateActiveCard(() => {
                                    const newSkills = [...activeCard.skills];
                                    newSkills[index]["active"] = value;
                                    return {
                                      ...activeCard,
                                      skills: newSkills,
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
                                    const newSkills = [...activeCard.skills];
                                    newSkills[index]["description"] = value;
                                    updateActiveCard({
                                      ...activeCard,
                                      skills: newSkills,
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
            const newSkills = [...activeCard.skills];
            newSkills.push({
              name: `New ability ${newSkills.length + 1}`,
              description: `description`,
              custom: true,
              active: true,
              id: uuidv4(),
            });
            return { ...activeCard, skills: newSkills };
          })
        }>
        Add new skills
      </Button>
    </>
  );
}
