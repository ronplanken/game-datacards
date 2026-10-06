import { Trash2 } from "lucide-react";
import { Button, Card, Form, Switch, Typography } from "antd";
import React from "react";
import { useCardStorage } from "../../../Hooks/useCardStorage";
import { localize } from "../../../Helpers/localization.helpers";

// Which units may take an enhancement in the list builder
// (`isUnitEnhancementEligible` in listCategories.helpers.js):
//
// - `equipableByNonCharacter` marks the "(Upgrade)" entries, the only ones a
//   non-Character unit can take (and which may be taken up to three times).
// - `keywords` must match one of the unit's keywords or factions.
// - `excludes` must match none of them.
//
// The matcher compares against the **English** keyword, so these entries stay
// plain strings rather than becoming language-keyed like the enhancement's
// name/description. An entry that arrives language-keyed from an older card is
// shown in English and stays that shape until it is edited.
const EligibilityList = ({ title, field, addLabel, emptyHint }) => {
  const { activeCard, updateActiveCard } = useCardStorage();
  const entries = Array.isArray(activeCard[field]) ? activeCard[field] : [];

  const updateEntries = (mutate) => {
    updateActiveCard(() => {
      const next = mutate([...entries]);
      return { ...activeCard, [field]: next };
    });
  };

  return (
    <Card type={"inner"} size={"small"} title={<Typography.Text>{title}</Typography.Text>} style={{ marginBottom: 16 }}>
      <div className="keywords_container" style={{ paddingBottom: 4, paddingTop: 4 }}>
        {entries.length === 0 && (
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {emptyHint}
          </Typography.Text>
        )}
        {entries.map((entry, index) => (
          <div className="keyword_container" key={`${field}-${index}`}>
            <Typography.Text
              editable={{
                onChange: (value) =>
                  updateEntries((next) => {
                    next[index] = value;
                    return next;
                  }),
              }}>
              {localize(entry, "en")}
            </Typography.Text>
            <Button
              type="text"
              size="small"
              icon={<Trash2 size={14} />}
              onClick={() =>
                updateEntries((next) => {
                  next.splice(index, 1);
                  return next;
                })
              }></Button>
          </div>
        ))}
      </div>
      <Button
        type="dashed"
        style={{ width: "100%" }}
        onClick={() =>
          updateEntries((next) => {
            next.push(`New keyword ${next.length + 1}`);
            return next;
          })
        }>
        {addLabel}
      </Button>
    </Card>
  );
};

export function EnhancementEligibility() {
  const { activeCard, updateActiveCard } = useCardStorage();

  return (
    <Form size="small">
      <Form.Item label={"Upgrade (non-Characters can take it)"}>
        <Switch
          checked={Boolean(activeCard.equipableByNonCharacter)}
          onChange={(value) => updateActiveCard({ ...activeCard, equipableByNonCharacter: value })}
        />
      </Form.Item>
      <EligibilityList
        title="Required keywords"
        field="keywords"
        addLabel="Add required keyword"
        emptyHint="Without a keyword no unit can take this enhancement."
      />
      <EligibilityList
        title="Excluded keywords"
        field="excludes"
        addLabel="Add excluded keyword"
        emptyHint="No unit is excluded."
      />
    </Form>
  );
}
