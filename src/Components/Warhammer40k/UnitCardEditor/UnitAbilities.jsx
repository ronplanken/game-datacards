import { Trash2 } from "lucide-react";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { Button, Card, Col, Empty, Form, Popconfirm, Row, Select, Space, Switch, Typography } from "antd";
import React, { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";

const { Option } = Select;

export function UnitAbilities() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { selectedFaction } = useDataSourceStorage();
  const [selectedTraitIndex, setSelectedTraitIndex] = useState(undefined);
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };
  return (
    <>
      <Row>
        <Col span={24}>
          <Space.Compact block>
            <Select
              placeholder={"Add a warlord trait"}
              size={"middle"}
              value={selectedTraitIndex}
              onChange={(index) => setSelectedTraitIndex(index)}
              style={{
                width: "100%",
                marginBottom: 8,
              }}
              notFoundContent={
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={"No warlord traits could be found."} />
              }>
              {selectedFaction?.traits?.map((trait, index) => (
                <Option value={index} key={`${trait?.name}-${index}`}>
                  {trait?.name}
                </Option>
              ))}
            </Select>
            <Button
              disabled={selectedTraitIndex === undefined}
              onClick={() => {
                updateActiveCard(() => {
                  const newAbilities = [...activeCard.abilities];
                  newAbilities.push({
                    name: selectedFaction?.traits[selectedTraitIndex].name,
                    description: selectedFaction?.traits[selectedTraitIndex].description,
                    custom: true,
                    showAbility: true,
                    showDescription: false,
                    type: "Abilities",
                    id: uuidv4(),
                  });
                  return { ...activeCard, abilities: newAbilities };
                });
                setSelectedTraitIndex(undefined);
              }}>
              Add
            </Button>
          </Space.Compact>
        </Col>
      </Row>

      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }

          const newAbilities = reorder(activeCard.abilities, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, abilities: newAbilities });
        }}>
        <Droppable droppableId="droppable-abilities">
          {(provided, snapshot) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeCard.abilities.map((ability, index) => {
                  return (
                    <Draggable
                      key={`ability-${ability.id}-${index}`}
                      draggableId={`ability-${ability.id}-${index}`}
                      index={index}>
                      {(drag) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          key={`ability-${ability.id}-${index}`}>
                          <Card
                            type={"inner"}
                            size={"small"}
                            title={
                              <Typography.Text
                                ellipsis={{ rows: 1 }}
                                editable={{
                                  onChange: (value) => {
                                    const newAbilities = [...activeCard.abilities];
                                    newAbilities[index]["name"] = value;
                                    updateActiveCard({
                                      ...activeCard,
                                      abilities: newAbilities,
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
                                      const newAbilities = [...activeCard.abilities];
                                      newAbilities.splice(index, 1);
                                      return { ...activeCard, abilities: newAbilities };
                                    })
                                  }>
                                  <Button type="icon" shape="circle" size="small" icon={<Trash2 size={14} />}></Button>
                                </Popconfirm>
                                <Switch
                                  checked={ability.showAbility}
                                  onChange={(value) => {
                                    updateActiveCard(() => {
                                      const newAbilities = [...activeCard.abilities];
                                      newAbilities[index]["showAbility"] = value;
                                      return { ...activeCard, abilities: newAbilities };
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
                                        const newAbilities = [...activeCard.abilities];
                                        newAbilities[index]["showDescription"] = value;
                                        return { ...activeCard, abilities: newAbilities };
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
                                        const newAbilities = [...activeCard.abilities];
                                        newAbilities[index]["description"] = value;
                                        return { ...activeCard, abilities: newAbilities };
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
            const newAbilities = [...activeCard.abilities];
            newAbilities.push({
              name: `New ability ${newAbilities.length + 1}`,
              custom: true,
              showAbility: true,
              showDescription: false,
              type: "Abilities",

              id: uuidv4(),
            });
            return { ...activeCard, abilities: newAbilities };
          })
        }>
        Add empty ability
      </Button>
    </>
  );
}
