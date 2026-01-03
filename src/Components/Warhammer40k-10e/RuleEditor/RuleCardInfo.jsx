import { Button, Card, Col, Form, Input, Row, Select, Space, Typography } from "antd";
import { Trash2, Plus, GripVertical } from "lucide-react";
import React from "react";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import { reorder } from "../../../Helpers/generic.helpers";

const { Option } = Select;
const { Text } = Typography;

export function RuleCardInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();

  const rules = activeCard.rules || [];

  const handleAddRule = () => {
    const newRules = [
      ...rules,
      {
        type: "text",
        text: "New rule text",
        title: "",
        order: rules.length,
      },
    ];
    updateActiveCard({ ...activeCard, rules: newRules });
  };

  const handleRemoveRule = (index) => {
    const newRules = rules.filter((_, i) => i !== index);
    // Reorder remaining rules
    const reorderedRules = newRules.map((rule, i) => ({ ...rule, order: i }));
    updateActiveCard({ ...activeCard, rules: reorderedRules });
  };

  const handleUpdateRule = (index, field, value) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    updateActiveCard({ ...activeCard, rules: newRules });
  };

  const handleDragEnd = (result) => {
    if (!result.destination) {
      return;
    }

    const reorderedRules = reorder(rules, result.source.index, result.destination.index);
    // Update order values
    const updatedRules = reorderedRules.map((rule, i) => ({ ...rule, order: i }));
    updateActiveCard({ ...activeCard, rules: updatedRules });
  };

  return (
    <Form>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="rule-parts">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {rules
                .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                .map((rule, index) => (
                  <Draggable key={`rule-part-${index}`} draggableId={`rule-part-${index}`} index={index}>
                    {(drag) => (
                      <div
                        ref={drag.innerRef}
                        {...drag.draggableProps}
                        style={{ marginBottom: 8, ...drag.draggableProps.style }}>
                        <Card
                          type="inner"
                          size="small"
                          title={
                            <Space>
                              <span {...drag.dragHandleProps} style={{ cursor: "grab" }}>
                                <GripVertical size={14} />
                              </span>
                              <Text>Rule Part {index + 1}</Text>
                            </Space>
                          }
                          extra={
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<Trash2 size={14} />}
                              onClick={() => handleRemoveRule(index)}
                            />
                          }>
                          <Row gutter={[8, 8]}>
                            <Col span={24}>
                              <Form.Item label="Type" style={{ marginBottom: 8 }}>
                                <Select
                                  value={rule.type || "text"}
                                  onChange={(value) => handleUpdateRule(index, "type", value)}
                                  style={{ width: "100%" }}>
                                  <Option value="text">Text</Option>
                                  <Option value="header">Header</Option>
                                  <Option value="accordion">Accordion (bulleted)</Option>
                                </Select>
                              </Form.Item>
                            </Col>
                            {rule.type === "accordion" && (
                              <Col span={24}>
                                <Form.Item label="Title" style={{ marginBottom: 8 }}>
                                  <Input
                                    value={rule.title || ""}
                                    onChange={(e) => handleUpdateRule(index, "title", e.target.value)}
                                    placeholder="Accordion title"
                                  />
                                </Form.Item>
                              </Col>
                            )}
                            <Col span={24}>
                              <Form.Item label="Content" style={{ marginBottom: 0 }}>
                                {rule.type === "header" ? (
                                  <Input
                                    value={rule.text || ""}
                                    onChange={(e) => handleUpdateRule(index, "text", e.target.value)}
                                    placeholder="Header text"
                                  />
                                ) : (
                                  <CustomMarkdownEditor
                                    value={rule.text || ""}
                                    onChange={(value) => handleUpdateRule(index, "text", value)}
                                    height={100}
                                  />
                                )}
                              </Form.Item>
                            </Col>
                          </Row>
                        </Card>
                      </div>
                    )}
                  </Draggable>
                ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <Button type="dashed" style={{ width: "100%", marginTop: 8 }} onClick={handleAddRule} icon={<Plus size={14} />}>
        Add Rule Part
      </Button>
    </Form>
  );
}
