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
      <div className={`secondary`} style={cardStyle}>
        <div className={`page secondary`} style={style}>
          <div className="frame">
            <div
              className={`secondary_icon_${battle_rule.faction_id ? battle_rule.faction_id : "basic"}`}
              style={{ position: "absolute", width: 35, height: 35, top: 10, right: 12 }}
            />
            <div className={`${battle_rule.faction_id ? battle_rule.faction_id : "basic"} background`}>
              <div className={`battle_rule`}>
                <div className="header">
                  <div className="type">
                    <ReactFitty maxSize={10} minSize={8}>
                      {battle_rule.rule_type} {battle_rule.rule_subtype && "-" + battle_rule.rule_subtype}
                    </ReactFitty>
                  </div>
                  <div className="name">
                    <ReactFitty maxSize={16} minSize={10}>
                      {battle_rule.name}
                    </ReactFitty>
                  </div>
                </div>
                <div className="content">
                  {battle_rule.flavor_text && (
                    <div className="section">
                      <span className="text">
                        <MarkdownSpanDisplay content={battle_rule.flavor_text} />
                      </span>
                    </div>
                  )}
                  {battle_rule.main_desc && (
                    <div className="section">
                      <span className="text">
                        <MarkdownSpanDisplay content={battle_rule.main_desc} />
                      </span>
                    </div>
                  )}
                  {battle_rule.extra_description &&
                    battle_rule.extra_description.map((item) => (
                      <div className="section" key={item.id}>
                        <span className="callout_text">
                          <MarkdownSpanDisplay content={item.callout} />
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
        </div>
      </div>
    </div>
  );
};
