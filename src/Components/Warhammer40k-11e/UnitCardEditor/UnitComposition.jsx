import { Trash2 } from "lucide-react";
import { Button, Card, Form, Popconfirm, Space } from "antd";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize, setLocalizedArrayItem } from "../../../Helpers/localization.helpers";

// 11th edition unit composition is an array of language-keyed markdown lines.
export function UnitComposition() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const lang = settings.language;
  const composition = activeCard.composition || [];

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }
          const newComposition = reorder(composition, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, composition: newComposition });
        }}>
        <Droppable droppableId={`droppable-composition-options`}>
          {(provided) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {composition.map((entry, index) => {
                  return (
                    <Draggable key={`composition-${index}`} draggableId={`composition-${index}`} index={index}>
                      {(drag) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          key={`composition-${index}`}>
                          <Card
                            type={"inner"}
                            size={"small"}
                            title={`Composition option ${index + 1}`}
                            style={{ marginBottom: "16px" }}
                            extra={
                              <Space>
                                <Popconfirm
                                  title={"Are you sure you want to delete this composition option?"}
                                  placement="topRight"
                                  onConfirm={() =>
                                    updateActiveCard(() => {
                                      const newComposition = [...composition];
                                      newComposition.splice(index, 1);
                                      return { ...activeCard, composition: newComposition };
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
                                      const newComposition = setLocalizedArrayItem(
                                        composition,
                                        index,
                                        lang,
                                        value || "",
                                      );
                                      return { ...activeCard, composition: newComposition };
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
            const newComposition = [...composition];
            newComposition.push({ [lang]: "" });
            return { ...activeCard, composition: newComposition };
          })
        }>
        Add composition option
      </Button>
    </>
  );
}
