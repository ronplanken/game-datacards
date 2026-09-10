import { Card, Col, Form, Row } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import { localize, setLocalizedField } from "../../../Helpers/localization.helpers";

// 11th edition enhancement description is language-keyed markdown.
export function EnhancementCardInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const lang = settings.language;

  return (
    <Form>
      <Card type={"inner"} size={"small"} title={"Description"} bodyStyle={{ padding: 0 }}>
        <Row justify="space-between" align="middle">
          <Col span={24}>
            <CustomMarkdownEditor
              value={localize(activeCard.description, lang)}
              onChange={(value) =>
                updateActiveCard(() => {
                  return { ...activeCard, description: setLocalizedField(activeCard.description, lang, value || "") };
                })
              }
            />
          </Col>
        </Row>
      </Card>
    </Form>
  );
}
