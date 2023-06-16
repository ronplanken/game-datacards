import { DeleteFilled } from "@ant-design/icons";
import { Button, Card, Select, Typography } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function UnitBasicAbility({ type }) {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
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
          title={<Typography.Text>{type} abilities</Typography.Text>}
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
                                  icon={<DeleteFilled />}
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
