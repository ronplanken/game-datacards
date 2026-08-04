import { Trash2 } from "lucide-react";
import { Button, Card, Form, Popconfirm, Space, Typography } from "antd";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { reorder } from "../../../Helpers/generic.helpers";
import { localize, setLocalizedField } from "../../../Helpers/localization.helpers";

// 11th edition primarch abilities are groups of sub-abilities, all carrying
// language-keyed names and descriptions. Like the other 11e ability editors
// there are no per-ability show flags; the panel switch toggles the whole block.
export function UnitPrimarchAbilities() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const lang = settings.language;
  const groups = activeCard.abilities?.primarch || [];

  const updateGroups = (mutate) =>
    updateActiveCard(() => {
      const newGroups = groups.map((group) => ({ ...group, abilities: [...(group.abilities || [])] }));
      mutate(newGroups);
      return { ...activeCard, abilities: { ...activeCard.abilities, primarch: newGroups } };
    });

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }
          const newGroups = reorder(groups, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, abilities: { ...activeCard.abilities, primarch: newGroups } });
        }}>
        <Droppable droppableId={`droppable-primarch-abilities`}>
          {(provided) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {groups.map((group, index) => {
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
                                  onChange: (value) =>
                                    updateGroups((newGroups) => {
                                      newGroups[index].name = setLocalizedField(newGroups[index].name, lang, value);
                                    }),
                                }}>
                                {localize(group.name, lang)}
                              </Typography.Text>
                            }
                            style={{ marginBottom: "16px" }}
                            bodyStyle={{ padding: 8 }}
                            extra={
                              <Space>
                                <Popconfirm
                                  title={"Are you sure you want to delete this ability?"}
                                  placement="topRight"
                                  onConfirm={() => updateGroups((newGroups) => newGroups.splice(index, 1))}>
                                  <Button type="icon" shape="circle" size="small" icon={<Trash2 size={14} />}></Button>
                                </Popconfirm>
                              </Space>
                            }>
                            {(group.abilities || []).map((ability, aIndex) => {
                              return (
                                <Card
                                  type={"inner"}
                                  size={"small"}
                                  key={`ability-primarch-${index}-${aIndex}`}
                                  title={
                                    <Typography.Text
                                      ellipsis={{ rows: 1 }}
                                      editable={{
                                        onChange: (value) =>
                                          updateGroups((newGroups) => {
                                            newGroups[index].abilities[aIndex] = {
                                              ...newGroups[index].abilities[aIndex],
                                              name: setLocalizedField(
                                                newGroups[index].abilities[aIndex].name,
                                                lang,
                                                value,
                                              ),
                                            };
                                          }),
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
                                          updateGroups((newGroups) => newGroups[index].abilities.splice(aIndex, 1))
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
                                    <Form.Item label={"Description"}>
                                      <CustomMarkdownEditor
                                        value={localize(ability.description, lang)}
                                        onChange={(value) =>
                                          updateGroups((newGroups) => {
                                            newGroups[index].abilities[aIndex] = {
                                              ...newGroups[index].abilities[aIndex],
                                              description: setLocalizedField(
                                                newGroups[index].abilities[aIndex].description,
                                                lang,
                                                value || "",
                                              ),
                                            };
                                          })
                                        }
                                      />
                                    </Form.Item>
                                  </Form>
                                </Card>
                              );
                            })}
                            <Button
                              type="dashed"
                              style={{ width: "100%" }}
                              size="small"
                              onClick={() =>
                                updateGroups((newGroups) => {
                                  newGroups[index].abilities.push({
                                    name: { [lang]: `New ability ${newGroups[index].abilities.length + 1}` },
                                    description: { [lang]: "" },
                                  });
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
          updateGroups((newGroups) => {
            newGroups.push({
              name: { [lang]: `New Primarch ability ${newGroups.length + 1}` },
              abilities: [],
            });
          })
        }>
        Add Primarch ability
      </Button>
    </>
  );
}
