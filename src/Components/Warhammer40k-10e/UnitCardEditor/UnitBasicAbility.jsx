import { Trash2 } from "lucide-react";
import { Button, Card, Select, Typography, Space, Switch } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function UnitBasicAbility({ type }) {
  const { activeCard, updateActiveCard } = useCardStorage();
  const typeTitle = type.charAt(0).toUpperCase() + type.slice(1);

  console.log("UnitBasicAbility", type, activeCard.showAbilities);
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
              checked={activeCard.showAbilities?.[type] !== false}
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
        <Card
          type={"inner"}
          size={"small"}
          title={<Typography.Text>{typeTitle} abilities</Typography.Text>}
          style={{ marginBottom: "16px" }}>
          <div className="keywords_container" style={{ paddingBottom: "4px", paddingTop: "4px" }}>
            <Droppable droppableId={`droppable-abilities-${type}`}>
              {(provided, snapshot) => {
                return (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {activeCard.abilities[type].map((ability, index) => {
                      return (
                        <Draggable
                          key={`ability-${type}-${index}`}
                          draggableId={`ability-${type}-${index}`}
                          index={index}>
                          {(drag) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              key={`ability-${type}-${index}`}>
                              <div className="keyword_container">
                                <Typography.Text
                                  editable={{
                                    onChange: (value) => {
                                      const newAbilities = [...activeCard.abilities[type]];
                                      newAbilities[index] = value;
                                      updateActiveCard({
                                        ...activeCard,
                                        abilities: { ...activeCard.abilities, [type]: newAbilities },
                                      });
                                    },
                                  }}>
                                  {ability}
                                </Typography.Text>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<Trash2 size={14} />}
                                  onClick={(value) =>
                                    updateActiveCard(() => {
                                      const newAbilities = [...activeCard.abilities[type]];
                                      newAbilities.splice(index, 1);
                                      return {
                                        ...activeCard,
                                        abilities: { ...activeCard.abilities, [type]: newAbilities },
                                      };
                                    })
                                  }></Button>
                              </div>
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
          </div>
          <Button
            type="dashed"
            style={{ width: "100%" }}
            onClick={() =>
              updateActiveCard(() => {
                const newAbilities = [...activeCard.abilities[type]];
                newAbilities.push(`New ability ${newAbilities.length + 1}`);
                return { ...activeCard, abilities: { ...activeCard.abilities, [type]: newAbilities } };
              })
            }>
            Add ability
          </Button>
        </Card>
      </DragDropContext>
    </>
  );
}
