import { DeleteFilled } from "@ant-design/icons";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { Button, Card, Form, Popconfirm, Select, Space, Switch, Typography } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function UnitExtendedAbilities() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }

          const newAbilities = reorder(activeCard.abilities.other, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, abilities: { ...activeCard.abilities, other: newAbilities } });
        }}>
        <Droppable droppableId="droppable-other-abilities">
          {(provided, snapshot) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeCard.abilities.other.map((ability, index) => {
                  return (
                    <Draggable key={`ability-other-${index}`} draggableId={`ability-other-${index}`} index={index}>
                      {(drag) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          key={`ability-other-${index}`}>
                          <Card
                            type={"inner"}
                            size={"small"}
                            title={
                              <Typography.Text
                                ellipsis={{ rows: 1 }}
                                editable={{
                                  onChange: (value) => {
                                    const newAbilities = [...activeCard.abilities.other];
                                    newAbilities[index]["name"] = value;
                                    updateActiveCard({
                                      ...activeCard,
                                      abilities: { ...activeCard.abilities, other: newAbilities },
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
                                      const newAbilities = [...activeCard.abilities.other];
                                      newAbilities.splice(index, 1);
                                      return {
                                        ...activeCard,
                                        abilities: { ...activeCard.abilities, other: newAbilities },
                                      };
                                    })
                                  }>
                                  <Button type="icon" shape="circle" size="small" icon={<DeleteFilled />}></Button>
                                </Popconfirm>
                                <Switch
                                  checked={ability.showAbility}
                                  onChange={(value) => {
                                    updateActiveCard(() => {
                                      const newAbilities = [...activeCard.abilities.other];
                                      newAbilities[index]["showAbility"] = value;
                                      return {
                                        ...activeCard,
                                        abilities: { ...activeCard.abilities, other: newAbilities },
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
                                        const newAbilities = [...activeCard.abilities.other];
                                        newAbilities[index]["showDescription"] = value;
                                        return {
                                          ...activeCard,
                                          abilities: { ...activeCard.abilities, other: newAbilities },
                                        };
                                      });
                                    }}
                                  />
                                </Form.Item>
                                <Form.Item label={"Description"}>
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
                                    value={ability.description}
                                    onChange={(value) => {
                                      updateActiveCard(() => {
                                        const newAbilities = [...activeCard.abilities.other];
                                        newAbilities[index]["description"] = value;
                                        return {
                                          ...activeCard,
                                          abilities: { ...activeCard.abilities, other: newAbilities },
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
            const newAbilities = [...activeCard.abilities.other];
            newAbilities.push({
              name: `New ability ${newAbilities.length + 1}`,
              showAbility: true,
              showDescription: false,
            });
            return { ...activeCard, abilities: { ...activeCard.abilities, other: newAbilities } };
          })
        }>
        Add ability
      </Button>
    </>
  );
}
