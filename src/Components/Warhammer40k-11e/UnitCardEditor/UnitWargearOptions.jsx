import { Trash2 } from "lucide-react";
import { Button, Card, Form, Input, Popconfirm, Space } from "antd";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize, setLocalizedArrayItem, setLocalizedField } from "../../../Helpers/localization.helpers";

// The wargear panel edits both halves of a card's wargear:
//
//   `wargear`        — free-form language-keyed markdown sentences (WargearText).
//   `wargearOptions` — the structured groups the card back and the list builder
//                      read: an instruction plus the swaps it offers, each with
//                      a points cost (WargearGroups).
//
// Costs stay strings, the shape the source datasource uses; the points helpers
// coerce them.

// The free-form sentences. In the 11e data this is usually just "None", so it is
// the structured groups below that carry the real content.
function WargearText() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const lang = settings.language;
  const wargear = activeCard.wargear || [];

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }
          const newWargear = reorder(wargear, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, wargear: newWargear });
        }}>
        <Droppable droppableId={`droppable-wargear-options`}>
          {(provided) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {wargear.map((entry, index) => {
                  return (
                    <Draggable key={`wargear-${index}`} draggableId={`wargear-${index}`} index={index}>
                      {(drag) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          key={`wargear-${index}`}>
                          <Card
                            type={"inner"}
                            size={"small"}
                            title={`Wargear text ${index + 1}`}
                            style={{ marginBottom: "16px" }}
                            extra={
                              <Space>
                                <Popconfirm
                                  title={"Are you sure you want to delete this wargear text?"}
                                  placement="topRight"
                                  onConfirm={() =>
                                    updateActiveCard(() => {
                                      const newWargear = [...wargear];
                                      newWargear.splice(index, 1);
                                      return { ...activeCard, wargear: newWargear };
                                    })
                                  }>
                                  <Button type="icon" shape="circle" size="small" icon={<Trash2 size={14} />}></Button>
                                </Popconfirm>
                              </Space>
                            }>
                            <Form size="small">
                              <Form.Item>
                                <CustomMarkdownEditor
                                  value={localize(entry, lang)}
                                  onChange={(value) => {
                                    updateActiveCard(() => {
                                      const newWargear = setLocalizedArrayItem(wargear, index, lang, value || "");
                                      return { ...activeCard, wargear: newWargear };
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
            const newWargear = [...wargear];
            newWargear.push({ [lang]: "" });
            return { ...activeCard, wargear: newWargear };
          })
        }>
        Add wargear text
      </Button>
    </>
  );
}

// The structured groups: what the card back lists and what the list builder
// charges points for.
function WargearGroups() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const lang = settings.language;
  const groups = activeCard.wargearOptions || [];

  // Every edit works on a fresh copy of the groups and of their option arrays,
  // so nothing stored on the card is mutated in place.
  const updateGroups = (mutate) =>
    updateActiveCard(() => {
      const next = groups.map((group) => ({ ...group, options: [...(group?.options || [])] }));
      mutate(next);
      return { ...activeCard, wargearOptions: next };
    });

  const updateOption = (groupIndex, optionIndex, changes) =>
    updateGroups((next) => {
      next[groupIndex].options[optionIndex] = { ...next[groupIndex].options[optionIndex], ...changes };
    });

  return (
    <>
      {groups.map((group, groupIndex) => (
        <Card
          key={`wargear-group-${groupIndex}`}
          type={"inner"}
          size={"small"}
          title={`Wargear option ${groupIndex + 1}`}
          style={{ marginBottom: "16px" }}
          extra={
            <Space>
              <Popconfirm
                title={"Are you sure you want to delete this wargear option?"}
                placement="topRight"
                onConfirm={() => updateGroups((next) => next.splice(groupIndex, 1))}>
                <Button type="icon" shape="circle" size="small" icon={<Trash2 size={14} />}></Button>
              </Popconfirm>
            </Space>
          }>
          <Form size="small">
            <Form.Item label={"Instruction"}>
              <Input.TextArea
                rows={2}
                value={localize(group?.instruction, lang)}
                onChange={(e) =>
                  updateGroups((next) => {
                    next[groupIndex].instruction = setLocalizedField(
                      next[groupIndex].instruction,
                      lang,
                      e.target.value,
                    );
                  })
                }
              />
            </Form.Item>
            {(group?.options || []).map((option, optionIndex) => (
              <Form.Item key={`wargear-group-${groupIndex}-option-${optionIndex}`} label={`Option ${optionIndex + 1}`}>
                <Space.Compact style={{ width: "100%" }}>
                  <Input
                    type={"text"}
                    placeholder="Name"
                    value={localize(option?.name, lang)}
                    onChange={(e) =>
                      updateOption(groupIndex, optionIndex, {
                        name: setLocalizedField(option?.name, lang, e.target.value),
                      })
                    }
                  />
                  <Input
                    type={"text"}
                    style={{ width: "90px" }}
                    placeholder="Cost"
                    addonAfter="pts"
                    value={option?.cost ?? ""}
                    onChange={(e) => updateOption(groupIndex, optionIndex, { cost: e.target.value })}
                  />
                  <Button
                    type="icon"
                    icon={<Trash2 size={14} />}
                    onClick={() => updateGroups((next) => next[groupIndex].options.splice(optionIndex, 1))}
                  />
                </Space.Compact>
              </Form.Item>
            ))}
            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="dashed"
                style={{ width: "100%" }}
                onClick={() =>
                  updateGroups((next) => next[groupIndex].options.push({ name: { [lang]: "" }, cost: "0" }))
                }>
                Add option
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ))}
      <Button
        type="dashed"
        style={{ width: "100%" }}
        onClick={() => updateGroups((next) => next.push({ instruction: { [lang]: "" }, options: [] }))}>
        Add wargear option
      </Button>
    </>
  );
}

export function UnitWargearOptions() {
  return (
    <>
      <WargearGroups />
      <Card type={"inner"} size={"small"} title="Wargear text" style={{ marginTop: "16px" }} bodyStyle={{ padding: 8 }}>
        <WargearText />
      </Card>
    </>
  );
}
