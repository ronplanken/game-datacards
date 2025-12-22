import { Trash2 } from "lucide-react";
import { Button, Card, Form, Popconfirm, Select, Space, Switch } from "antd";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function UnitWargearOptions() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <Card
        type={"inner"}
        size={"small"}
        title={`Wargear options visibility`}
        style={{ marginBottom: "16px" }}
        extra={
          <Space>
            <Switch
              checked={activeCard.showWargear !== false}
              onChange={(value) => {
                updateActiveCard(() => {
                  return {
                    ...activeCard,
                    showWargear: value,
                  };
                });
              }}
            />
          </Space>
        }>
        <DragDropContext
          onDragEnd={(result) => {
            if (!result.destination) {
              return;
            }

            const newWargear = reorder(activeCard.wargear, result.source.index, result.destination.index);
            updateActiveCard({ ...activeCard, wargear: newWargear });
          }}>
          <Droppable droppableId={`droppable-wargear-options`}>
            {(provided, snapshot) => {
              return (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {activeCard.wargear.map((wargearOption, index) => {
                    return (
                      <Draggable key={`wargear-${index}`} draggableId={`wargear-${index}`} index={index}>
                        {(drag) => (
                          <div
                            ref={drag.innerRef}
                            {...drag.draggableProps}
                            {...drag.dragHandleProps}
                            key={`wargear-${index}`}>
                            <Card
                              type={"inner"}
                              size={"small"}
                              title={`Wargear option ${index + 1}`}
                              style={{ marginBottom: "16px" }}
                              extra={
                                <Space>
                                  <Popconfirm
                                    title={"Are you sure you want to delete this wargear option?"}
                                    placement="topRight"
                                    onConfirm={(value) =>
                                      updateActiveCard(() => {
                                        const newWargear = [...activeCard.wargear];
                                        newWargear.splice(index, 1);
                                        return {
                                          ...activeCard,
                                          wargear: newWargear,
                                        };
                                      })
                                    }>
                                    <Button
                                      type="icon"
                                      shape="circle"
                                      size="small"
                                      icon={<Trash2 size={14} />}></Button>
                                  </Popconfirm>
                                </Space>
                              }>
                              <Form size="small">
                                <Form.Item>
                                  <CustomMarkdownEditor
                                    value={wargearOption}
                                    onChange={(value) => {
                                      updateActiveCard(() => {
                                        const newWargear = [...activeCard.wargear];
                                        newWargear[index] = value;
                                        return {
                                          ...activeCard,
                                          wargear: newWargear,
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
              const newWargear = [...activeCard.wargear];
              newWargear.push("");
              return { ...activeCard, wargear: newWargear };
            })
          }>
          Add wargear option
        </Button>
      </Card>
    </>
  );
}
