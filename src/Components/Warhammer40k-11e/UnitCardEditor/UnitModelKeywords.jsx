import { Trash2 } from "lucide-react";
import { Button, Card, Typography } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize, setLocalizedArrayItem, setLocalizedField } from "../../../Helpers/localization.helpers";
import { withModelKeywords } from "../../../Helpers/unitKeywords.helpers";

export function UnitModelKeywords() {
  const { activeCard, updateActiveCard } = useCardStorage();
  const { settings } = useSettingsStorage();
  const lang = settings.language;
  const models = Array.isArray(activeCard.modelKeywords) ? activeCard.modelKeywords : [];

  const save = (next) =>
    updateActiveCard({ ...activeCard, ...withModelKeywords(activeCard.keywords, activeCard.modelKeywords, next) });

  const updateModel = (index, changes) =>
    save(models.map((model, i) => (i === index ? { ...model, ...changes } : model)));

  return (
    <Card
      type={"inner"}
      size={"small"}
      title={<Typography.Text>Model keywords</Typography.Text>}
      style={{ marginBottom: "16px" }}>
      {models.map((model, index) => {
        const keywords = model.keywords || [];
        return (
          <div key={`model-keywords-${index}`} className="keywords_container" style={{ marginBottom: "12px" }}>
            <div className="keyword_container">
              <Typography.Text
                strong
                editable={{
                  onChange: (value) => updateModel(index, { name: setLocalizedField(model.name, lang, value) }),
                }}>
                {localize(model.name, lang)}
              </Typography.Text>
              <Button
                type="text"
                size="small"
                aria-label={`Remove ${localize(model.name, lang)}`}
                icon={<Trash2 size={14} />}
                onClick={() => save(models.filter((_, i) => i !== index))}></Button>
            </div>
            <div style={{ paddingLeft: "16px" }}>
              {keywords.map((keyword, keywordIndex) => (
                <div key={`model-keyword-${index}-${keywordIndex}`} className="keyword_container">
                  <Typography.Text
                    editable={{
                      onChange: (value) =>
                        updateModel(index, { keywords: setLocalizedArrayItem(keywords, keywordIndex, lang, value) }),
                    }}>
                    {localize(keyword, lang)}
                  </Typography.Text>
                  <Button
                    type="text"
                    size="small"
                    aria-label={`Remove ${localize(keyword, lang)}`}
                    icon={<Trash2 size={14} />}
                    onClick={() =>
                      updateModel(index, { keywords: keywords.filter((_, i) => i !== keywordIndex) })
                    }></Button>
                </div>
              ))}
              <Button
                type="dashed"
                size="small"
                style={{ width: "100%" }}
                onClick={() =>
                  updateModel(index, { keywords: [...keywords, { [lang]: `New keyword ${keywords.length + 1}` }] })
                }>
                Add keyword
              </Button>
            </div>
          </div>
        );
      })}
      <Button
        type="dashed"
        style={{ width: "100%" }}
        onClick={() => save([...models, { name: { [lang]: `Model ${models.length + 1}` }, keywords: [] }])}>
        Add model
      </Button>
    </Card>
  );
}
