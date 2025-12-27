import classNames from "classnames";
import { ReactFitty } from "react-fitty";
import { MarkdownDisplay } from "../MarkdownDisplay";

// Helper to convert single newlines to markdown line breaks
const formatRuleText = (text) => {
  return text?.replace(/\n/g, "\n\n").replace(/\n\n\n\n/g, "\n\n") || "";
};

// Rule content component for rendering rule parts with different types
const RuleContentRenderer = ({ rules }) => (
  <div className="rule-parts">
    {[...rules]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((part, index) => {
        // Skip examples (quote and textItalic types)
        if (part.type === "quote" || part.type === "textItalic") {
          return null;
        }
        const formattedText = formatRuleText(part.text);
        switch (part.type) {
          case "header":
            return (
              <h4 key={index} className="rule-part-header">
                {part.text}
              </h4>
            );
          case "accordion":
            return (
              <div key={index} className="rule-part-accordion">
                {part.title && <h5 className="rule-part-accordion-title">{part.title}</h5>}
                <MarkdownDisplay content={formattedText} />
              </div>
            );
          default:
            return (
              <div key={index} className="rule-part-text">
                <MarkdownDisplay content={formattedText} />
              </div>
            );
        }
      })}
  </div>
);

export const RuleCard = ({ rule, cardStyle, paddingTop = "32px", className = "rule-card", containerClass = "" }) => {
  const ruleTypeLabel =
    rule.ruleType === "army" ? "Army Rule" : `Detachment Rule${rule.detachment ? ` - ${rule.detachment}` : ""}`;

  // Determine if auto-height should be used (default to true for new cards)
  const useAutoHeight = rule.styling?.autoHeight !== false;

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
              {rule.name}
            </ReactFitty>
          </div>
          <div className="type">
            <ReactFitty maxSize={11} minSize={7}>
              {ruleTypeLabel}
            </ReactFitty>
          </div>
          <div className="content" style={{ fontSize: rule?.styling?.textSize ?? 14 }}>
            {rule.rules && <RuleContentRenderer rules={rule.rules} />}
          </div>
          <div className="containers">
            <div className="rule-type-indicator">
              <div className={classNames("faction-icon", rule.faction_id)}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
