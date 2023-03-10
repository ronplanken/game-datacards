import { DeleteFilled } from "@ant-design/icons";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { Button, Card, Col, Empty, Popconfirm, Row, Select, Space, Switch, Typography } from "antd";
import React, { useState } from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { v4 as uuidv4 } from "uuid";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";

const { Option } = Select;



export function UnitPowers() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { selectedFaction } = useDataSourceStorage();
  const [selectedPowerIndex, setSelectedPowerIndex] = useState(undefined);
  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };
  return (
    <>
      <Row>
        <Col span={22}>
          <Select
            placeholder={"Add a psychic power"}
            size={"middle"}
            value={selectedPowerIndex}
            onChange={(index) => setSelectedPowerIndex(index)}
            style={{
              width: "100%",
              marginBottom: 8,
            }}
            notFoundContent={
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={"No psyhic powers could be found."} />
            }>
            {selectedFaction?.psychicpowers?.map((power, index) => (
              <Option value={index} key={`${power?.name}-${index}`}>
                {power?.name}
              </Option>
            ))}
          </Select>
        </Col>
        <Col span={2}>
          <Button
            disabled={selectedPowerIndex === undefined}
            onClick={() => {
              updateActiveCard(() => {
                const newPowers = [...activeCard.powers || []];
                const power = selectedFaction?.psychicpowers[selectedPowerIndex];
                newPowers.push({
                  name: power.name,
                  description: power.description,
                  warpcharge: extractWarpChargeValue(power.description),
                  powerType: power.type,
                  custom: true,
                  showPower: true,
                  showWarpCharge: true,
                  showDescription: false,
                  type: "powers",
                  id: uuidv4(),
                });
                return { ...activeCard, powers: newPowers };
              });
              setSelectedPowerIndex(undefined);
            }}>
            Add
          </Button>
        </Col>
      </Row>

      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }

          const newPowers = reorder(activeCard.powers, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, powers: newPowers });
        }}>
        <Droppable droppableId="droppable-powers">
          {(provided, snapshot) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeCard?.powers?.map((power, index) => {
                  return (
                    <Draggable
                      key={`power-${power.id}-${index}`}
                      draggableId={`power-${power.id}-${index}`}
                      index={index}>
                      {(drag) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          key={`power-${power.id}-${index}`}>
                          <Card
                            type={"inner"}
                            size={"small"}
                            title={
                              <Typography.Text
                                ellipsis={{ rows: 1 }}
                                editable={{
                                  onChange: (value) => {
                                    const newPowers = [...activeCard.powers];
                                    newPowers[index]["name"] = value;
                                    updateActiveCard({
                                      ...activeCard,
                                      powers: newPowers,
                                    });
                                  },
                                }}>
                                {power.name}
                              </Typography.Text>
                            }
                            bodyStyle={{ padding: 0 }}
                            style={{ marginBottom: "16px" }}
                            extra={
                              <Space>
                                <Popconfirm
                                  title={"Are you sure you want to delete this power?"}
                                  placement="topRight"
                                  onConfirm={(value) =>
                                    updateActiveCard(() => {
                                      const newPowers = [...activeCard.powers];
                                      newPowers.splice(index, 1);
                                      return { ...activeCard, powers: newPowers };
                                    })
                                  }>
                                  <Button type="icon" shape="circle" size="small" icon={<DeleteFilled />}></Button>
                                </Popconfirm>
                                <Switch
                                  checked={power.showAbility}
                                  onChange={(value) => {
                                    updateActiveCard(() => {
                                      const newPowers = [...activeCard.powers];
                                      newPowers[index]["showPower"] = value;
                                      return { ...activeCard, powers: newPowers };
                                    });
                                  }}
                                />
                              </Space>
                            }>
                            {power.showPower && (
                              <Row justify="space-between" align="middle">
                                <Col span={2} justify="center" style={{ textAlign: "center" }}>
                                  <Switch
                                    checked={power.showDescription}
                                    onChange={(value) => {
                                      updateActiveCard(() => {
                                        const newPowers = [...activeCard.powers];
                                        newPowers[index]["showDescription"] = value;
                                        return { ...activeCard, powers: newPowers };
                                      });
                                    }}
                                  />
                                </Col>
                                <Col span={22}>
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
                                    value={power.description}
                                    onChange={(value) => {
                                      updateActiveCard(() => {
                                        const newPowers = [...activeCard.powers];
                                        newPowers[index]["description"] = value;
                                        return { ...activeCard, powers: newPowers };
                                      });
                                    }}
                                  />
                                </Col>
                              </Row>
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
    </>
  );
}
