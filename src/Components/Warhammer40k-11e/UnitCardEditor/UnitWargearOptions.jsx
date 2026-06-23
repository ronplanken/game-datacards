import { Trash2 } from "lucide-react";
import { Button, Card, Form, Popconfirm, Space } from "antd";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize, setLocalizedArrayItem } from "../../../Helpers/localization.helpers";

// 11th edition wargear options are an array of language-keyed markdown strings.
export function UnitWargearOptions() {
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
                            title={`Wargear option ${index + 1}`}
                            style={{ marginBottom: "16px" }}
                            extra={
                              <Space>
                                <Popconfirm
                                  title={"Are you sure you want to delete this wargear option?"}
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
        Add wargear option
      </Button>
    </>
  );
}
