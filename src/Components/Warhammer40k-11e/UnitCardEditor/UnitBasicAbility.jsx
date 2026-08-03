import { Trash2 } from "lucide-react";
import { Button, Card, Typography } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize, setLocalizedField } from "../../../Helpers/localization.helpers";

// 11th edition core / faction abilities are name-only entries: { name: {lang} }.
// They render as a joined list, so only the language-keyed name is editable here.
export function UnitBasicAbility({ type }) {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const lang = settings.language;
  const typeTitle = type.charAt(0).toUpperCase() + type.slice(1);
  const abilities = activeCard.abilities?.[type] || [];

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }
          const newAbilities = reorder(abilities, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, abilities: { ...activeCard.abilities, [type]: newAbilities } });
        }}>
        <Card
          type={"inner"}
          size={"small"}
          title={<Typography.Text>{typeTitle} abilities</Typography.Text>}
          style={{ marginBottom: "16px" }}>
          <div className="keywords_container" style={{ paddingBottom: "4px", paddingTop: "4px" }}>
            <Droppable droppableId={`droppable-abilities-${type}`}>
              {(provided) => {
                return (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {abilities.map((ability, index) => {
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
                                      const newAbilities = [...abilities];
                                      newAbilities[index] = {
                                        ...newAbilities[index],
                                        name: setLocalizedField(newAbilities[index].name, lang, value),
                                      };
                                      updateActiveCard({
                                        ...activeCard,
                                        abilities: { ...activeCard.abilities, [type]: newAbilities },
                                      });
                                    },
                                  }}>
                                  {localize(ability.name, lang)}
                                </Typography.Text>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<Trash2 size={14} />}
                                  onClick={() =>
                                    updateActiveCard(() => {
                                      const newAbilities = [...abilities];
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
                const newAbilities = [...abilities];
                newAbilities.push({ name: { [lang]: `New ability ${newAbilities.length + 1}` } });
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
