import { DeleteFilled } from "@ant-design/icons";
import { Button, Card, Form, Popconfirm, Select, Space, Switch, Typography } from "antd";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { reorder } from "../../../Helpers/generic.helpers";

const { Option } = Select;

export function UnitExtendedAbilities({ type }) {
  const { activeCard, updateActiveCard } = useCardStorage();
  const typeTitle = type.charAt(0).toUpperCase() + type.slice(1);
  return (
    <>
      <Card
        type={"inner"}
        size={"small"}
        title={`${typeTitle} section visibility`}
        style={{ marginBottom: "16px" }}
        bodyStyle={{ padding: 0 }}
        extra={
          <Space>
            <Switch
              checked={activeCard?.showAbilities?.[type] !== false}
              onChange={(value) => {
                updateActiveCard(() => {
                  return {
                    ...activeCard,
                    showAbilities: {
                      ...activeCard.showAbilities,
                      [type]: value,
                    },
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

          const newAbilities = reorder(activeCard.abilities[type], result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, abilities: { ...activeCard.abilities, [type]: newAbilities } });
        }}>
        <Droppable droppableId={`droppable-${type}-abilities`}>
          {(provided, snapshot) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeCard.abilities[type].map((ability, index) => {
                  return (
                    <Draggable key={`ability-${type}-${index}`} draggableId={`ability-${type}-${index}`} index={index}>
                      {(drag) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          key={`ability-${type}-${index}`}>
                          <Card
                            type={"inner"}
                            size={"small"}
                            title={
                              <Typography.Text
                                ellipsis={{ rows: 1 }}
                                editable={{
                                  onChange: (value) => {
                                    const newAbilities = [...activeCard.abilities[type]];
                                    newAbilities[index]["name"] = value;
                                    updateActiveCard({
                                      ...activeCard,
                                      abilities: { ...activeCard.abilities, [type]: newAbilities },
                                    });
                                  },
                                }}>
                                {ability.name}
                              </Typography.Text>
                            }
                            style={{ marginBottom: "16px" }}
                            bodyStyle={{ padding: ability.showAbility ? 8 : 0 }}
                            extra={
                              <Space>
                                <Popconfirm
                                  title={"Are you sure you want to delete this ability?"}
                                  placement="topRight"
                                  onConfirm={(value) =>
                                    updateActiveCard(() => {
                                      const newAbilities = [...activeCard.abilities[type]];
                                      newAbilities.splice(index, 1);
                                      return {
                                        ...activeCard,
                                        abilities: { ...activeCard.abilities, [type]: newAbilities },
                                      };
                                    })
                                  }>
                                  <Button type="icon" shape="circle" size="small" icon={<DeleteFilled />}></Button>
                                </Popconfirm>
                                <Switch
                                  checked={ability.showAbility}
                                  onChange={(value) => {
                                    updateActiveCard(() => {
                                      const newAbilities = [...activeCard.abilities[type]];
                                      newAbilities[index]["showAbility"] = value;
                                      return {
                                        ...activeCard,
                                        abilities: { ...activeCard.abilities, [type]: newAbilities },
                                      };
                                    });
                                  }}
                                />
                              </Space>
                            }>
                            {ability.showAbility && (
                              <Form size="small">
                                <Form.Item label={"Show Description"}>
                                  <Switch
                                    checked={ability.showDescription}
                                    onChange={(value) => {
                                      updateActiveCard(() => {
                                        const newAbilities = [...activeCard.abilities[type]];
                                        newAbilities[index]["showDescription"] = value;
                                        return {
                                          ...activeCard,
                                          abilities: { ...activeCard.abilities, [type]: newAbilities },
                                        };
                                      });
                                    }}
                                  />
                                </Form.Item>
                                <Form.Item label={"Description"}>
                                  <CustomMarkdownEditor
                                    value={ability.description}
                                    onChange={(value) => {
                                      updateActiveCard(() => {
                                        const newAbilities = [...activeCard.abilities[type]];
                                        newAbilities[index]["description"] = value;
                                        return {
                                          ...activeCard,
                                          abilities: { ...activeCard.abilities, [type]: newAbilities },
                                        };
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
            const newAbilities = [...activeCard.abilities[type]];
            newAbilities.push({
              name: `New ability ${newAbilities.length + 1}`,
              showAbility: true,
              showDescription: false,
            });
            return { ...activeCard, abilities: { ...activeCard.abilities, [type]: newAbilities } };
          })
        }>
        Add ability
      </Button>
    </>
  );
}
