import { ReactFitty } from "react-fitty";
import { MarkdownSpanDisplay } from "../MarkdownSpanDisplay";

export const BattleRuleCard = ({ battle_rule, cardStyle, paddingTop = "32px", className }) => {
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
      <div className={`battle_rule`}>
        <div className="background-side-bar"></div>
        <div className="background-header-bar"></div>
        <div className="header">
          <ReactFitty maxSize={16} minSize={10}>
            {battle_rule.name}
          </ReactFitty>
        </div>
        <div className="type">
          <ReactFitty maxSize={10} minSize={8}>
            {battle_rule.detachment} - {battle_rule.rule_type}
          </ReactFitty>
        </div>
        <div className="content">
          {battle_rule.rule_type && (
            <div className="section">
              <span className="title">When:</span>
              <span className="text">
                <MarkdownSpanDisplay content={battle_rule.rule_type} />
              </span>
            </div>
          )}
          {battle_rule.flavor_text && (
            <div className="section">
              <span className="title">target:</span>
              <span className="text">
                <MarkdownSpanDisplay content={battle_rule.flavor_text} />
              </span>
            </div>
          )}
          {battle_rule.main_desc && (
            <div className="section">
              <span className="title">effect:</span>
              <span className="text">
                <MarkdownSpanDisplay content={battle_rule.main_desc} />
              </span>
            </div>
          )}
        </div>
        <div className="type-container"></div>
        <div className="cp-container">
          <div className="value">
            <ReactFitty maxSize={18} minSize={10}>
              {battle_rule.cost} CP
            </ReactFitty>
          </div>
        </div>
      </div>
    </div>
  );
};
