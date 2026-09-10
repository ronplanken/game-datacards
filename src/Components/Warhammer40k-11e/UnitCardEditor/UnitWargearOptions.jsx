import { Trash2 } from "lucide-react";
import { Button, Card, Form, Input, Popconfirm, Space } from "antd";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize, setLocalizedArrayItem, setLocalizedField } from "../../../Helpers/localization.helpers";

// A card's wargear lives in two fields, and the panel only ever edits the one
// the card actually renders (see UnitCard/UnitWargear):
//
//   `wargearOptions` — the structured groups the card back and the list builder
//                      read: an instruction plus the swaps it offers, each with
//                      a points cost (WargearGroups). These win when present.
//   `wargear`        — free-form language-keyed markdown sentences
//                      (WargearText), the fallback for cards without groups.
//
// Showing both at once meant editing the same wargear in two places, where only
// one of them reached the card. Costs stay strings, the shape the source
// datasource uses; the points helpers coerce them.

// The free-form sentences, edited only while a card has no structured groups.
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

// Shared look for the small captions that stand in for form labels.
const CAPTION = { fontSize: 12, opacity: 0.65, paddingBottom: 4 };

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
          {/* Captions above the fields rather than antd's horizontal form
              labels: the side editor is narrow enough that a label column left
              the instruction one character wide. Instructions run to a full
              sentence, so the box also grows with them instead of hiding them
              behind a scrollbar. */}
          <div style={CAPTION} className="wargear-caption">
            Instruction
          </div>
          <Input.TextArea
            size="small"
            style={{ marginBottom: 12 }}
            autoSize={{ minRows: 2, maxRows: 6 }}
            value={localize(group?.instruction, lang)}
            onChange={(e) =>
              updateGroups((next) => {
                next[groupIndex].instruction = setLocalizedField(next[groupIndex].instruction, lang, e.target.value);
              })
            }
          />
          {/* The options are a two-column list rather than labelled form rows.
              A per-row "Option N" label plus an addon-suffixed cost field left
              only a sliver for either input; column headers carry the same
              meaning and cost nothing per row. */}
          <div style={{ ...CAPTION, display: "flex", gap: 8 }}>
            <span style={{ flex: "1 1 auto" }}>Options</span>
            <span style={{ flex: "0 0 64px" }}>Points</span>
            <span style={{ flex: "0 0 24px" }} />
          </div>
          {(group?.options || []).map((option, optionIndex) => (
            <div
              key={`wargear-group-${groupIndex}-option-${optionIndex}`}
              aria-label={`Option ${optionIndex + 1}`}
              style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
              <Input
                size="small"
                type={"text"}
                style={{ flex: "1 1 auto", minWidth: 0 }}
                placeholder={`Option ${optionIndex + 1}`}
                value={localize(option?.name, lang)}
                onChange={(e) =>
                  updateOption(groupIndex, optionIndex, {
                    name: setLocalizedField(option?.name, lang, e.target.value),
                  })
                }
              />
              <Input
                size="small"
                type={"text"}
                inputMode="numeric"
                style={{ flex: "0 0 64px", width: 64 }}
                placeholder="0"
                value={option?.cost ?? ""}
                onChange={(e) => updateOption(groupIndex, optionIndex, { cost: e.target.value })}
              />
              <Button
                type="icon"
                shape="circle"
                size="small"
                style={{ flex: "0 0 24px" }}
                icon={<Trash2 size={14} />}
                onClick={() => updateGroups((next) => next[groupIndex].options.splice(optionIndex, 1))}
              />
            </div>
          ))}
          <Button
            type="dashed"
            size="small"
            style={{ width: "100%" }}
            onClick={() => updateGroups((next) => next[groupIndex].options.push({ name: { [lang]: "" }, cost: "0" }))}>
            Add option
          </Button>
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

// Groups are what the card renders once it has any, so they are the only thing
// shown then. A card without groups edits its sentences instead, and keeps the
// "Add wargear option" button so it can move up to structured options —
// deleting the last group brings the sentences back.
export function UnitWargearOptions() {
  const { activeCard } = useCardStorage();
  const hasGroups = (activeCard?.wargearOptions || []).length > 0;

  if (hasGroups) {
    return <WargearGroups />;
  }

  return (
    <>
      <Card type={"inner"} size={"small"} title="Wargear text" bodyStyle={{ padding: 8 }} style={{ marginBottom: 16 }}>
        <WargearText />
      </Card>
      <WargearGroups />
    </>
  );
}
