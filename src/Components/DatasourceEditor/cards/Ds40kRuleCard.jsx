import classNames from "classnames";
import { ReactFitty } from "react-fitty";
import { MarkdownDisplay } from "../../MarkdownDisplay";
import { FactionIcon } from "../../Icons/FactionIcon";

const formatRuleText = (text) => {
  return text?.replace(/\n/g, "\n\n").replace(/\n\n\n\n/g, "\n\n") || "";
};

const RuleContentRenderer = ({ rules }) => (
  <div className="rule-parts">
    {[...rules]
      .filter((r) => r.active !== false)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((entry, index) => {
        const format = entry.format || "name-description";
        switch (format) {
          case "name-only":
            return (
              <h4 key={index} className="rule-part-header">
                {entry.title}
              </h4>
            );
          case "table":
            return (
              <div key={index} className="rule-part-accordion">
                {entry.title && <h5 className="rule-part-accordion-title">{entry.title}</h5>}
                <MarkdownDisplay content={formatRuleText(entry.description)} />
              </div>
            );
          default:
            return (
              <div key={index} className="rule-part-text">
                {entry.title && <h4 className="rule-part-header">{entry.title}</h4>}
                <MarkdownDisplay content={formatRuleText(entry.description)} />
              </div>
            );
        }
      })}
  </div>
);

/**
 * Datasource-native 40K Rule card renderer.
 * Uses the same CSS class structure as the built-in RuleCard
 * but reads field values from the schema definition.
 *
 * @param {Object} props
 * @param {Object} props.card - The card data
 * @param {Object} props.cardTypeDef - The card type definition from the schema
 * @param {Object} props.cardStyle - CSS variable overrides
 */
export const Ds40kRuleCard = ({ card, cardTypeDef, cardStyle, isMobile }) => {
  const schema = cardTypeDef?.schema || {};
  const fields = schema.fields || [];

  const getFieldValue = (fieldKey) => card[fieldKey] || "";

  const nameField = fields.find((f) => f.key === "name") || fields[0];
  const cardName = (nameField ? getFieldValue(nameField.key) : card.name) || "Untitled Rule";

  const ruleTypeField = fields.find((f) => f.key === "ruleType");
  const ruleTypeValue = ruleTypeField ? getFieldValue(ruleTypeField.key) : card.ruleType;

  const detachmentField = fields.find((f) => f.key === "detachment");
  const detachmentValue = detachmentField ? getFieldValue(detachmentField.key) : card.detachment;

  const ruleTypeLabel =
    ruleTypeValue === "army" ? "Army Rule" : `Detachment Rule${detachmentValue ? ` - ${detachmentValue}` : ""}`;

  const useAutoHeight = card.styling?.autoHeight !== false;

  return (
    <div className="data-40k-10e" data-testid="ds-40k-rule">
      <div
        className={isMobile ? "shared-rule" : ""}
        style={{
          "--width": `${card.styling?.width ?? 460}px`,
          "--height": useAutoHeight ? "auto" : `${card.styling?.height ?? 620}px`,
          justifyContent: "center",
          justifyItems: "center",
          alignItems: useAutoHeight ? "flex-start" : "center",
          display: "flex",
          paddingTop: "32px",
          ...cardStyle,
        }}>
        <div className={classNames("own rule-card", card.faction_id, { "auto-height": useAutoHeight })}>
          <div className="border">
            <div className="background-side-bar"></div>
            <div className="background-header-bar"></div>
            <div className="header">
              <ReactFitty maxSize={18} minSize={10}>
                {cardName}
              </ReactFitty>
            </div>
            <div className="type">
              <ReactFitty maxSize={11} minSize={7}>
                {ruleTypeLabel}
              </ReactFitty>
            </div>
            <div className="content" style={{ fontSize: card?.styling?.textSize ?? 14 }}>
              {card.rules && <RuleContentRenderer rules={card.rules} />}
            </div>
            <div className="containers">
              <div className="rule-type-indicator">
                <div className="faction-icon">
                  <FactionIcon factionId={card.faction_id} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
