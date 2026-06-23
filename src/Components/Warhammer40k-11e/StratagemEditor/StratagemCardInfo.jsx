import { Card, Col, Form, Row } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import { localize, setLocalizedField } from "../../../Helpers/localization.helpers";

// 11th edition stratagem when / target / effect are language-keyed markdown.
export function StratagemCardInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const lang = settings.language;

  const updateField = (field, value) => {
    updateActiveCard(() => {
      return { ...activeCard, [field]: setLocalizedField(activeCard[field], lang, value || "") };
    });
  };

  return (
    <Form>
      <Card type={"inner"} size={"small"} title={"When"} bodyStyle={{ padding: 0 }}>
        <Row justify="space-between" align="middle">
          <Col span={24}>
            <CustomMarkdownEditor
              value={localize(activeCard.when, lang)}
              onChange={(value) => updateField("when", value)}
            />
          </Col>
        </Row>
      </Card>
      <Card type={"inner"} size={"small"} title={"Target"} bodyStyle={{ padding: 0 }}>
        <Row justify="space-between" align="middle">
          <Col span={24}>
            <CustomMarkdownEditor
              value={localize(activeCard.target, lang)}
              onChange={(value) => updateField("target", value)}
            />
          </Col>
        </Row>
      </Card>
      <Card type={"inner"} size={"small"} title={"Effect"} bodyStyle={{ padding: 0 }}>
        <Row justify="space-between" align="middle">
          <Col span={24}>
            <CustomMarkdownEditor
              value={localize(activeCard.effect, lang)}
              onChange={(value) => updateField("effect", value)}
            />
          </Col>
        </Row>
      </Card>
    </Form>
  );
}
