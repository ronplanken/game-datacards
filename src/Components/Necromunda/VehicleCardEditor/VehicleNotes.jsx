import MDEditor, { commands } from "@uiw/react-md-editor";
import { Col, Row } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

export function VehicleNotes() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
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
          value={activeCard.notes}
          onChange={(e) =>
            updateActiveCard(() => {
              return { ...activeCard, notes: e };
            })
          }
        />
      </Col>
    </Row>
  );
}
