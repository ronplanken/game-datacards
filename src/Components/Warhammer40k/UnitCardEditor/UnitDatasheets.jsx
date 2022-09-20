import { DeleteFilled, SettingOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Dropdown, Input, Menu, Popconfirm, Space, Switch, Typography } from "antd";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import React, { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { getByPlaceholderText } from "@testing-library/react";
import { UnitDatasheetLine } from "./UnitDatasheetLine";

export function UnitDatasheets() {
  const { activeCard, updateActiveCard } = useCardStorage();

  const reorder = (list, startIndex, endIndex) => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  return (
    <>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }

          const newDatasheets = reorder(activeCard.datasheet, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, datasheet: newDatasheets });
        }}>
        <Droppable droppableId="droppable-abilities">
          {(provided, snapshot) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {activeCard.datasheet.map((sheet, index) => {
                  return (
                    <Draggable
                      key={`sheet-${sheet.id}-${index}`}
                      draggableId={`sheet-${sheet.id}-${index}`}
                      index={index}>
                      {(drag) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          key={`sheet-${sheet.id}-${index}`}>
                          <UnitDatasheetLine sheet={sheet} index={index} />
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
            const newDatasheets = [...activeCard.datasheet];
            newDatasheets.push({
              name: `New sheet ${newDatasheets.length + 1}`,
              custom: true,
              active: true,
              id: uuidv4(),
            });
            return { ...activeCard, datasheet: newDatasheets };
          })
        }>
        Add empty datasheet
      </Button>
    </>
  );
}
