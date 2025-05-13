import MDEditor, { commands } from "@uiw/react-md-editor";
import { Card, Col, Form, Input, Row, Select } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { FactionSelect } from "../FactionSelect";

const { Option } = Select;

export function EnhancementCardInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <Form>
      <Card type={"inner"} size={"small"} title={"Description"} bodyStyle={{ padding: 0 }}>
        <Row justify="space-between" align="middle">
          <Col span={24}>
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
              value={activeCard.description}
              onChange={(value) =>
                updateActiveCard(() => {
                  return { ...activeCard, description: value };
                })
              }
            />
          </Col>
        </Row>
      </Card>
    </Form>
  );
}
