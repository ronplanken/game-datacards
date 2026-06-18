import classNames from "classnames";
import { ReactFitty } from "react-fitty";
import { FactionIcon } from "../Icons/FactionIcon";
import { MarkupText } from "./UnitCard/UnitAbilityDescription";
import { resolveFactionCode } from "./UnitCard/UnitFactionSymbol";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { localize } from "../../Helpers/localization.helpers";

// Rule parts carry { order, type, text:{lang}, title? }. Localise each part and
// render via the 11e markup engine (handles markdown, <k> keywords and ■ bullets).
const RuleContentRenderer = ({ rules, lang }) => (
  <div className="rule-parts">
    {[...rules]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((part, index) => {
        // Skip examples (quote and textItalic types)
        if (part.type === "quote" || part.type === "textItalic") {
          return null;
        }
        const text = localize(part.text, lang);
        switch (part.type) {
          case "header":
            return (
              <h4 key={index} className="rule-part-header">
                {text}
              </h4>
            );
          case "accordion":
            return (
              <div key={index} className="rule-part-accordion">
                {part.title && <h5 className="rule-part-accordion-title">{localize(part.title, lang)}</h5>}
                <MarkupText content={text} />
              </div>
            );
          default:
            return (
              <div key={index} className="rule-part-text">
                <MarkupText content={text} />
              </div>
            );
        }
      })}
  </div>
);

export const RuleCard = ({ rule, cardStyle, paddingTop = "32px", className = "rule-card", containerClass = "" }) => {
  const { settings } = useSettingsStorage();
  const { dataSource } = useDataSourceStorage();
  const lang = settings.language;

  const ruleTypeLabel =
    rule.ruleType === "army" ? "Army Rule" : `Detachment Rule${rule.detachment ? ` - ${rule.detachment}` : ""}`;

  // Determine if auto-height should be used (default to true for new cards)
  const useAutoHeight = rule.styling?.autoHeight !== false;

  const faction = dataSource?.data?.find((f) => f.id === rule.faction_id);
  const factionCode = resolveFactionCode([faction?.name]);

  return (
    <div
      style={{
        "--width": `${rule.styling?.width ?? "460"}px`,
        "--height": useAutoHeight ? "auto" : `${rule.styling?.height ?? "620"}px`,
        justifyContent: "center",
        justifyItems: "center",
        alignItems: useAutoHeight ? "flex-start" : "center",
        display: "flex",
        paddingTop: paddingTop,
        ...cardStyle,
      }}
      className={containerClass}>
      <div className={classNames(`own ${className}`, rule.faction_id, { "auto-height": useAutoHeight })}>
        <div className="border">
          <div className="background-side-bar"></div>
          <div className="background-header-bar"></div>
          <div className="header">
            <ReactFitty maxSize={18} minSize={10}>
              {localize(rule.name, lang)}
            </ReactFitty>
          </div>
          <div className="type">
            <ReactFitty maxSize={11} minSize={7}>
              {ruleTypeLabel}
            </ReactFitty>
          </div>
          <div className="content" style={{ fontSize: rule?.styling?.textSize ?? 14 }}>
            {rule.rules && <RuleContentRenderer rules={rule.rules} lang={lang} />}
          </div>
          <div className="containers">
            <div className="rule-type-indicator">
              <div className="faction-icon">{factionCode && <FactionIcon factionId={factionCode} />}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
