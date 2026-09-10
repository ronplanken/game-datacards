import { Trash2 } from "lucide-react";
import { Button, Card, Form, Popconfirm, Space, Typography } from "antd";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { reorder } from "../../../Helpers/generic.helpers";
import { localize, setLocalizedField } from "../../../Helpers/localization.helpers";

// 11th edition "other" abilities carry a language-keyed name and description.
// There are no per-ability show flags, so both fields are always editable.
export function UnitExtendedAbilities({ type }) {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const lang = settings.language;
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
        <Droppable droppableId={`droppable-${type}-abilities`}>
          {(provided) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {abilities.map((ability, index) => {
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
                            }
                            style={{ marginBottom: "16px" }}
                            bodyStyle={{ padding: 8 }}
                            extra={
                              <Space>
                                <Popconfirm
                                  title={"Are you sure you want to delete this ability?"}
                                  placement="topRight"
                                  onConfirm={() =>
                                    updateActiveCard(() => {
                                      const newAbilities = [...abilities];
                                      newAbilities.splice(index, 1);
                                      return {
                                        ...activeCard,
                                        abilities: { ...activeCard.abilities, [type]: newAbilities },
                                      };
                                    })
                                  }>
                                  <Button type="icon" shape="circle" size="small" icon={<Trash2 size={14} />}></Button>
                                </Popconfirm>
                              </Space>
                            }>
                            <Form size="small">
                              <Form.Item label={"Description"}>
                                <CustomMarkdownEditor
                                  value={localize(ability.description, lang)}
                                  onChange={(value) => {
                                    updateActiveCard(() => {
                                      const newAbilities = [...abilities];
                                      newAbilities[index] = {
                                        ...newAbilities[index],
                                        description: setLocalizedField(
                                          newAbilities[index].description,
                                          lang,
                                          value || "",
                                        ),
                                      };
                                      return {
                                        ...activeCard,
                                        abilities: { ...activeCard.abilities, [type]: newAbilities },
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
            const newAbilities = [...abilities];
            newAbilities.push({
              name: { [lang]: `New ability ${newAbilities.length + 1}` },
              description: { [lang]: "" },
            });
            return { ...activeCard, abilities: { ...activeCard.abilities, [type]: newAbilities } };
          })
        }>
        Add ability
      </Button>
    </>
  );
}
