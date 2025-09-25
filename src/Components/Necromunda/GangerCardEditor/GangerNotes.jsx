import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import { Col, Row } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";

export function GangerNotes() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <Row justify="space-between" align="middle">
      <Col span={24}>
        <CustomMarkdownEditor
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
