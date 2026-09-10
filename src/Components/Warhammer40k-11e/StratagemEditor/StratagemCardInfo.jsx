import { Card, Col, Form, Row } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { CustomMarkdownEditor } from "../../CustomMarkdownEditor";
import {
  isLocalizedFieldEmpty,
  localize,
  setLocalizedField,
  setLocalizedFieldSeeded,
} from "../../../Helpers/localization.helpers";

// 11th edition stratagem when / target / effect / restrictions are language-keyed
// markdown.
export function StratagemCardInfo() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const lang = settings.language;

  // when / target / effect are on every stratagem: edit the active language in
  // place and leave the field itself alone, whatever it is cleared to.
  const updateField = (field, value) => {
    updateActiveCard(() => {
      return { ...activeCard, [field]: setLocalizedField(activeCard[field], lang, value || "") };
    });
  };

  // Only some stratagems carry restrictions (Insane Bravery, Rapid Ingress, …),
  // so the field is seeded as a language-keyed object on first edit and removed
  // again once it is empty in every language — matching the datasource, which
  // omits it on the stratagems that have none.
  const updateRestrictions = (value) => {
    updateActiveCard(() => {
      const text = value || "";
      if (!text && activeCard.restrictions == null) {
        return activeCard;
      }
      const updated = setLocalizedFieldSeeded(activeCard.restrictions, lang, text);
      if (isLocalizedFieldEmpty(updated)) {
        const { restrictions: _cleared, ...rest } = activeCard;
        return rest;
      }
      return { ...activeCard, restrictions: updated };
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
              onChange={(value) => updateRestrictions(value)}
            />
          </Col>
        </Row>
      </Card>
    </Form>
  );
}
