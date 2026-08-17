import { Card, Col, Form, Row } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import { isLocalizedFieldEmpty, localize, setLocalizedFieldSeeded } from "../../../Helpers/localization.helpers";

// 11th edition stratagem when / target / effect / restrictions are language-keyed
// markdown. Only some stratagems carry restrictions (Insane Bravery, Rapid
// Ingress, …), so that field is seeded as a language-keyed object on first edit
// and removed again once it is emptied — matching the datasource, which omits it
// on the stratagems that have none.
export function StratagemCardInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const lang = settings.language;

  const updateField = (field, value) => {
    updateActiveCard(() => {
      const text = value || "";
      if (!text && activeCard[field] == null) {
        return activeCard;
      }
      const updated = setLocalizedFieldSeeded(activeCard[field], lang, text);
      if (isLocalizedFieldEmpty(updated)) {
        const { [field]: _cleared, ...rest } = activeCard;
        return rest;
      }
      return { ...activeCard, [field]: updated };
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
      <Card type={"inner"} size={"small"} title={"Restrictions"} bodyStyle={{ padding: 0 }}>
        <Row justify="space-between" align="middle">
          <Col span={24}>
            <CustomMarkdownEditor
              value={localize(activeCard.restrictions, lang)}
              onChange={(value) => updateField("restrictions", value)}
            />
          </Col>
        </Row>
      </Card>
    </Form>
  );
}
