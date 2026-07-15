import { Trash2 } from "lucide-react";
import { Button, Card, Form, Input, Popconfirm, Space, Switch } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { reorder } from "../../../Helpers/generic.helpers";
import { localize, setLocalizedField } from "../../../Helpers/localization.helpers";

// 11th edition points have no active/primary flags: the first entry is the
// primary cost and the rest are listed when "Show All Points" is on. Models and
// cost are plain values; keyword may be language-keyed in the source data, so it
// is shown in the active card language and edits merge into just that language
// (like the other 11e field editors). `additionalCost` is the per-datasheet
// roster surcharge ({ cost, afterSelections }).
export function UnitPoints() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const language = settings.language || "en";
  const points = activeCard.points || [];
  const additionalCost = activeCard.additionalCost || null;

  const updatePoint = (index, field, value) => {
    updateActiveCard(() => {
      const newPoints = [...points];
      newPoints[index] = { ...newPoints[index], [field]: value };
      return { ...activeCard, points: newPoints };
    });
  };

  const updateAdditionalCost = (field, value) => {
    updateActiveCard(() => {
      const next = { cost: "", afterSelections: 1, ...(additionalCost || {}), [field]: value };
      // Clearing the cost removes the surcharge entirely.
      if (field === "cost" && String(value).trim() === "") {
        const { additionalCost: _removed, ...rest } = activeCard;
        return rest;
      }
      return { ...activeCard, additionalCost: next };
    });
  };

  return (
    <>
      <Card
        type={"inner"}
        title="Display Options"
        size="small"
        bodyStyle={{ padding: 16 }}
        style={{ marginBottom: 16 }}>
        <Form size="small">
          <Form.Item label={"Show All Points"}>
            <Switch
              checked={activeCard.showAllPoints || false}
              onChange={(value) => updateActiveCard({ ...activeCard, showAllPoints: value })}
            />
          </Form.Item>
          <Form.Item label={"Show Models Count"} style={{ marginBottom: 0 }}>
            <Switch
              checked={activeCard.showPointsModels || false}
              onChange={(value) => updateActiveCard({ ...activeCard, showPointsModels: value })}
            />
          </Form.Item>
        </Form>
      </Card>
      <DragDropContext
        onDragEnd={(result) => {
          if (!result.destination) {
            return;
          }
          const newPoints = reorder(points, result.source.index, result.destination.index);
          updateActiveCard({ ...activeCard, points: newPoints });
        }}>
        <Droppable droppableId={`droppable-points`}>
          {(provided) => {
            return (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {points.map((point, index) => {
                  return (
                    <Draggable key={`point-${index}`} draggableId={`point-${index}`} index={index}>
                      {(drag) => (
                        <div
                          ref={drag.innerRef}
                          {...drag.draggableProps}
                          {...drag.dragHandleProps}
                          key={`point-${index}`}>
                          <Card
                            key={`points-${index}`}
                            type={"inner"}
                            size={"small"}
                            title={index === 0 ? "Points (primary)" : "Points"}
                            bodyStyle={{ padding: 8 }}
                            style={{ marginBottom: "16px" }}
                            extra={
                              <Space>
                                <Popconfirm
                                  title={"Are you sure you want to delete these points?"}
                                  placement="topRight"
                                  onConfirm={() =>
                                    updateActiveCard(() => {
                                      const newPoints = [...points];
                                      newPoints.splice(index, 1);
                                      return { ...activeCard, points: newPoints };
                                    })
                                  }>
                                  <Button type="icon" shape="circle" size="small" icon={<Trash2 size={14} />}></Button>
                                </Popconfirm>
                              </Space>
                            }>
                            <Form size="small">
                              <Form.Item label={"Models"}>
                                <Input
                                  type={"text"}
                                  value={point.models}
                                  onChange={(e) => updatePoint(index, "models", e.target.value)}
                                />
                              </Form.Item>
                              <Form.Item label={"Cost"}>
                                <Input
                                  type={"text"}
                                  value={point.cost}
                                  onChange={(e) => updatePoint(index, "cost", e.target.value)}
                                />
                              </Form.Item>
                              <Form.Item label={"Keyword"} style={{ marginBottom: 0 }}>
                                <Input
                                  type={"text"}
                                  value={localize(point.keyword, language)}
                                  onChange={(e) =>
                                    updatePoint(
                                      index,
                                      "keyword",
                                      setLocalizedField(point.keyword, language, e.target.value),
                                    )
                                  }
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
            const newPoints = [...points];
            newPoints.push({ models: "", cost: "", keyword: "" });
            return { ...activeCard, points: newPoints };
          })
        }>
        Add points
      </Button>
      <Card
        type={"inner"}
        title="Additional selection cost"
        size="small"
        bodyStyle={{ padding: 16 }}
        style={{ marginTop: 16 }}>
        <Form size="small">
          <Form.Item label={"Cost"} help="Points added per copy of this datasheet beyond the included selections.">
            <Input
              type={"text"}
              value={additionalCost?.cost ?? ""}
              onChange={(e) => updateAdditionalCost("cost", e.target.value)}
            />
          </Form.Item>
          <Form.Item label={"Included selections"} style={{ marginBottom: 0 }}>
            <Input
              type={"number"}
              value={additionalCost?.afterSelections ?? ""}
              disabled={!additionalCost}
              onChange={(e) => updateAdditionalCost("afterSelections", Number(e.target.value) || 0)}
            />
          </Form.Item>
        </Form>
      </Card>
    </>
  );
}
