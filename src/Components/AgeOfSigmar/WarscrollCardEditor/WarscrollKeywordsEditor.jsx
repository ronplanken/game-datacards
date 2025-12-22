import { Trash2 } from "lucide-react";
import { Button, Card, Typography } from "antd";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { useCardStorage } from "../../../Hooks/useCardStorage";

export function WarscrollKeywordsEditor() {
  const { activeCard, updateActiveCard } = useCardStorage();

  const renderKeywordSection = (type, title) => {
    const keywords = activeCard[type] || [];

    return (
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }
          const newKeywords = reorder(keywords, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, [type]: newKeywords });
        }}>
        <Card
          type={"inner"}
          size={"small"}
          title={<Typography.Text>{title}</Typography.Text>}
          style={{ marginBottom: "16px" }}>
          <div className="keywords_container" style={{ paddingBottom: "4px", paddingTop: "4px" }}>
            <Droppable droppableId={`droppable-keywords-${type}`}>
              {(provided) => {
                return (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {keywords.map((keyword, index) => {
                      return (
                        <Draggable
                          key={`keyword-${type}-${index}`}
                          draggableId={`keyword-${type}-${index}`}
                          index={index}>
                          {(drag) => (
                            <div
                              ref={drag.innerRef}
                              {...drag.draggableProps}
                              {...drag.dragHandleProps}
                              key={`keyword-${type}-${index}`}>
                              <div className="keyword_container">
                                <Typography.Text
                                  editable={{
                                    onChange: (value) => {
                                      const newKeywords = [...keywords];
                                      newKeywords[index] = value;
                                      updateActiveCard({
                                        ...activeCard,
                                        [type]: newKeywords,
                                      });
                                    },
                                  }}>
                                  {keyword}
                                </Typography.Text>
                                <Button
                                  type="text"
                                  size="small"
                                  icon={<Trash2 size={14} />}
                                  onClick={() =>
                                    updateActiveCard(() => {
                                      const newKeywords = [...keywords];
                                      newKeywords.splice(index, 1);
                                      return {
                                        ...activeCard,
                                        [type]: newKeywords,
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
                const newKeywords = [...keywords];
                newKeywords.push(`New keyword ${newKeywords.length + 1}`);
                return { ...activeCard, [type]: newKeywords };
              })
            }>
            Add keyword
          </Button>
        </Card>
      </DragDropContext>
    );
  };

  return (
    <>
      {renderKeywordSection("keywords", "Unit Keywords")}
      {renderKeywordSection("factionKeywords", "Faction Keywords")}
    </>
  );
}
