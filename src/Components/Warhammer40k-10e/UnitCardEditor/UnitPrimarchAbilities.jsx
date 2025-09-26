import { DeleteFilled } from "@ant-design/icons";
import { Button, Card, Form, Popconfirm, Select, Space, Switch, Typography } from "antd";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function UnitPrimarchAbilities() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }

          const newAbilities = reorder(activeCard.abilities.primarch, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, abilities: { ...activeCard.abilities, primarch: newAbilities } });
        }}>
        <Droppable droppableId={`droppable-primarch-abilities`}>
          {(provided, snapshot) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeCard.abilities.primarch.map((primarchAbility, index) => {
                  return (
                    <Draggable
                      key={`ability-primarch-${index}`}
                      draggableId={`ability-primarch-${index}`}
                      index={index}>
                      {(drag) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          key={`ability-primarch-${index}`}>
                          <Card
                            type={"inner"}
                            size={"small"}
                            title={
                              <Typography.Text
                                ellipsis={{ rows: 1 }}
                                editable={{
                                  onChange: (value) => {
                                    const newAbilities = [...activeCard.abilities.primarch];
                                    newAbilities[index]["name"] = value;
                                    updateActiveCard({
                                      ...activeCard,
                                      abilities: { ...activeCard.abilities, primarch: newAbilities },
                                    });
                                  },
                                }}>
                                {primarchAbility.name}
                              </Typography.Text>
                            }
                            style={{ marginBottom: "16px" }}
                            bodyStyle={{ padding: primarchAbility.showAbility ? 8 : 0 }}
                            extra={
                              <Space>
                                <Popconfirm
                                  title={"Are you sure you want to delete this ability?"}
                                  placement="topRight"
                                  onConfirm={(value) =>
                                    updateActiveCard(() => {
                                      const newAbilities = [...activeCard.abilities.primarch];
                                      newAbilities.splice(index, 1);
                                      return {
                                        ...activeCard,
                                        abilities: { ...activeCard.abilities, primarch: newAbilities },
                                      };
                                    })
                                  }>
                                  <Button type="icon" shape="circle" size="small" icon={<DeleteFilled />}></Button>
                                </Popconfirm>
                                <Switch
                                  checked={primarchAbility.showAbility}
                                  onChange={(value) => {
                                    updateActiveCard(() => {
                                      const newAbilities = [...activeCard.abilities.primarch];
                                      newAbilities[index]["showAbility"] = value;
                                      return {
                                        ...activeCard,
                                        abilities: { ...activeCard.abilities, primarch: newAbilities },
                                      };
                                    });
                                  }}
                                />
                              </Space>
                            }>
                            {primarchAbility.showAbility &&
                              primarchAbility.abilities.map((ability, aIndex) => {
                                return (
                                  <Card
                                    type={"inner"}
                                    size={"small"}
                                    key={`ability-primarch-${index}-${aIndex}`}
                                    title={
                                      <Typography.Text
                                        ellipsis={{ rows: 1 }}
                                        editable={{
                                          onChange: (value) => {
                                            const newAbilities = [...activeCard.abilities.primarch];
                                            newAbilities[index].abilities[aIndex]["name"] = value;
                                            updateActiveCard({
                                              ...activeCard,
                                              abilities: { ...activeCard.abilities, primarch: newAbilities },
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
                                              const newAbilities = [...activeCard.abilities.primarch];
                                              newAbilities[index].abilities.splice(aIndex, 1);
                                              return {
                                                ...activeCard,
                                                abilities: { ...activeCard.abilities, primarch: newAbilities },
                                              };
                                            })
                                          }>
                                          <Button
                                            type="icon"
                                            shape="circle"
                                            size="small"
                                            icon={<DeleteFilled />}></Button>
                                        </Popconfirm>
                                        <Switch
                                          checked={ability.showAbility}
                                          onChange={(value) => {
                                            updateActiveCard(() => {
                                              const newAbilities = [...activeCard.abilities.primarch];
                                              newAbilities[index].abilities[aIndex]["showAbility"] = value;
                                              return {
                                                ...activeCard,
                                                abilities: { ...activeCard.abilities, primarch: newAbilities },
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
                                                const newAbilities = [...activeCard.abilities.primarch];
                                                newAbilities[index].abilities[aIndex]["showDescription"] = value;
                                                return {
                                                  ...activeCard,
                                                  abilities: { ...activeCard.abilities, primarch: newAbilities },
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
                                                const newAbilities = [...activeCard.abilities.primarch];
                                                newAbilities[index].abilities[aIndex]["description"] = value;
                                                return {
                                                  ...activeCard,
                                                  abilities: { ...activeCard.abilities, primarch: newAbilities },
                                                };
                                              });
                                            }}
                                          />
                                        </Form.Item>
                                      </Form>
                                    )}
                                  </Card>
                                );
                              })}
                            <Button
                              type="dashed"
                              style={{ width: "100%" }}
                              size="small"
                              onClick={() =>
                                updateActiveCard(() => {
                                  const newAbilities = [...activeCard.abilities.primarch];
                                  newAbilities[index].abilities.push({
                                    name: `New ability ${newAbilities[index].abilities.length + 1}`,
                                    description: "",
                                    showAbility: true,
                                  });
                                  return {
                                    ...activeCard,
                                    abilities: { ...activeCard.abilities, primarch: newAbilities },
                                  };
                                })
                              }>
                              Add ability
                            </Button>
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
            const newAbilities = [...activeCard.abilities.primarch];
            newAbilities.push({
              name: `New Primarch ability ${newAbilities.length + 1}`,
              showAbility: true,
              abilities: [],
            });
            return { ...activeCard, abilities: { ...activeCard.abilities, primarch: newAbilities } };
          })
        }>
        Add Primarch ability
      </Button>
    </>
  );
}
