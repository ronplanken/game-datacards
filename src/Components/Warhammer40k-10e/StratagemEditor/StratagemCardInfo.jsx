import MDEditor, { commands } from "@uiw/react-md-editor";
import { Card, Col, Form, Input, Row, Select } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { FactionSelect } from "../FactionSelect";

const { Option } = Select;

export function StratagemCardInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <Form>
      <Card type={"inner"} size={"small"} title={"When"} bodyStyle={{ padding: 0 }}>
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
              value={activeCard.when}
              onChange={(value) =>
                updateActiveCard(() => {
                  return { ...activeCard, when: value };
                })
              }
            />
          </Col>
        </Row>
      </Card>
      <Card type={"inner"} size={"small"} title={"Target"} bodyStyle={{ padding: 0 }}>
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
              value={activeCard.target}
              onChange={(value) =>
                updateActiveCard(() => {
                  return { ...activeCard, target: value };
                })
              }
            />
          </Col>
        </Row>
      </Card>
      <Card type={"inner"} size={"small"} title={"Effect"} bodyStyle={{ padding: 0 }}>
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
              value={activeCard.effect}
              onChange={(value) =>
                updateActiveCard(() => {
                  return { ...activeCard, effect: value };
                })
              }
            />
          </Col>
        </Row>
      </Card>
      <Card type={"inner"} size={"small"} title={"Restrictions"} bodyStyle={{ padding: 0 }}>
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
              value={activeCard.restrictions}
              onChange={(value) =>
                updateActiveCard(() => {
                  return { ...activeCard, restrictions: value };
                })
              }
            />
          </Col>
        </Row>
      </Card>
    </Form>
  );
}
