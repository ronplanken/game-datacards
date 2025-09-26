import { DeleteFilled } from "@ant-design/icons";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import { Button, Card, Col, Popconfirm, Row, Space, Switch, Typography } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import { useCardStorage } from "../../../Hooks/useCardStorage";

export function GangerWargear() {
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

          const newWargear = reorder(activeCard.wargear, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, wargear: newWargear });
        }}>
        <Droppable droppableId="droppable-wargear">
          {(provided, snapshot) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeCard.wargear.map((gear, index) => {
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
                                  const newWargear = [...activeCard.wargear];
                                  newWargear[index]["name"] = value;
                                  updateActiveCard({
                                    ...activeCard,
                                    wargear: newWargear,
                                  });
                                },
                              }}>
                              {gear.name}
                            </Typography.Text>
                          }
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          bodyStyle={{ padding: 0, paddingBottom: "8px" }}
                          extra={
                            <Space>
                              <Popconfirm
                                title={"Are you sure you want to delete this wargear?"}
                                placement="topRight"
                                onConfirm={() =>
                                  updateActiveCard(() => {
                                    const newWargear = [...activeCard.wargear];
                                    newWargear.splice(index, 1);
                                    return { ...activeCard, wargear: newWargear };
                                  })
                                }>
                                <Button type="icon" shape="circle" size="small" icon={<DeleteFilled />}></Button>
                              </Popconfirm>
                              <Switch
                                checked={gear.active}
                                onChange={(value) => {
                                  updateActiveCard(() => {
                                    const newWargear = [...activeCard.wargear];
                                    newWargear[index]["active"] = value;
                                    return {
                                      ...activeCard,
                                      wargear: newWargear,
                                    };
                                  });
                                }}
                              />
                            </Space>
                          }>
                          {gear.active && (
                            <Row justify="space-between" align="middle">
                              <Col span={24}>
                                <CustomMarkdownEditor
                                  extraCommands={[]}
                                  value={gear.description}
                                  onChange={(value) => {
                                    const newWargear = [...activeCard.wargear];
                                    newWargear[index]["description"] = value;
                                    updateActiveCard({
                                      ...activeCard,
                                      wargear: newWargear,
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
            const newWargear = [...activeCard.wargear];
            newWargear.push({
              name: `New wargear ${newWargear.length + 1}`,
              description: `description`,
              custom: true,
              active: true,
              id: uuidv4(),
            });
            return { ...activeCard, wargear: newWargear };
          })
        }>
        Add new wargear
      </Button>
    </>
  );
}
