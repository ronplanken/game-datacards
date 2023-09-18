import { DeleteFilled } from "@ant-design/icons";
import MDEditor, { commands } from "@uiw/react-md-editor";
import { Button, Card, Form, Select, Typography } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";

const { Option } = Select;

export function UnitLeader() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }

          const newLeads = reorder(activeCard.leads.units, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, leads: { ...activeCard.leads, units: newLeads } });
        }}>
        <Card
          type={"inner"}
          size={"small"}
          title={<Typography.Text>Leader</Typography.Text>}
          style={{ marginBottom: "16px" }}>
          <div className="keywords_container" style={{ paddingBottom: "4px", paddingTop: "4px" }}>
            <Droppable droppableId={`droppable-ledby`}>
              {(provided, snapshot) => {
                return (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {activeCard?.leads?.units?.map((unit, index) => {
                      return (
                        <Draggable key={`leads.units-${unit}`} draggableId={`keyword-${unit}`} index={index}>
                          {(drag) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              key={`leads.units-${unit}`}>
                              <div className="keyword_container">
                                <Typography.Text
                                  editable={{
                                    onChange: (value) => {
                                      const newLeads = [...activeCard.leads.units];
                                      newLeads[index] = value;
                                      updateActiveCard({
                                        ...activeCard,
                                        leads: {
                                          ...activeCard.leads,
                                          units: newLeads,
                                        },
                                      });
                                    },
                                  }}>
                                  {unit}
                                </Typography.Text>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<DeleteFilled />}
                                  onClick={(value) =>
                                    updateActiveCard(() => {
                                      const newLeads = [...activeCard.leads.units];
                                      newLeads.splice(index, 1);
                                      return {
                                        ...activeCard,
                                        leads: {
                                          ...activeCard.leads,
                                          units: newLeads,
                                        },
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
                const newLeads = [...(activeCard.leads.units || [])];
                newLeads.push(`Unit ${newLeads.length + 1}`);
                return {
                  ...activeCard,
                  leads: {
                    ...activeCard.leads,
                    units: newLeads,
                  },
                };
              })
            }>
            Add unit
          </Button>
        </Card>
      </DragDropContext>
      <Form.Item>
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
          value={activeCard?.leads?.extra}
          onChange={(value) => {
            updateActiveCard(() => {
              return {
                ...activeCard,
                leads: {
                  ...activeCard.leads,
                  extra: value,
                },
              };
            });
          }}
        />
      </Form.Item>
    </>
  );
}
