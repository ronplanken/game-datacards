import classNames from "classnames";
import { ReactFitty } from "react-fitty";
import { MarkdownSpanDisplay } from "../MarkdownSpanDisplay";

export const BattleRuleCard = ({ battle_rule, cardStyle, paddingTop = "32px", className }) => {
  const style =
    battle_rule.variant === "custom" ? { height: `${battle_rule.height}cm`, width: `${battle_rule.width}cm` } : {};
  return (
    <div
      className={className}
      style={{
        ...cardStyle,
        justifyContent: "center",
        justifyItems: "center",
        display: "flex",
        paddingTop: paddingTop,
      }}>
      <div
        className={classNames(
          {
            battlerule: true,
          },
          battle_rule.faction_id,
          battle_rule.colour || "generic"
        )}>
        <div className={`border`}>
          <div className="background-side-bar"></div>
          <div className="background-header-bar"></div>
          <div className="header">
            <ReactFitty maxSize={16} minSize={10}>
              {battle_rule.name}
            </ReactFitty>
          </div>
          <div className="type">
            <ReactFitty maxSize={14} minSize={6}>
              {battle_rule.rule_type} {battle_rule.rule_subtype && " - " + battle_rule.rule_subtype}
            </ReactFitty>
          </div>
          <div className="content">
            {battle_rule.main_desc && (
              <div className="section">
                <span className="text">
                  <MarkdownSpanDisplay content={battle_rule.main_desc} />
                </span>
              </div>
            )}
            {battle_rule.callouts?.map((item) => (
              <div className="section" key={item.id}>
                <span className="title">
                  <MarkdownSpanDisplay content={item.callout_text} />
                </span>
                <span className="text">
                  <MarkdownSpanDisplay content={item.detail} />
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
