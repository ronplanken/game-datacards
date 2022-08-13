import { MarkdownDisplay } from "../MarkdownDisplay";

export const StratagemCard = ({ stratagem, cardStyle, paddingTop = "32px" }) => {
  return (
    <div
      style={{
        paddingTop,
        justifyContent: "center",
        justifyItems: "center",
        display: "flex",
      }}>
      <div className={`page ${stratagem.variant || "card"}`} style={cardStyle}>
        <div className="frame">
          <div className={stratagem.subfaction_id ? stratagem.subfaction_id : stratagem.faction_id}>
            <div className="stratagem_header">
              <div className="stratagem_type">{stratagem.type.split("–")[1] || stratagem.type}</div>
              <div className="stratagem_name">{stratagem.name}</div>
            </div>
            <div className="stratagem_description">
              <MarkdownDisplay content={stratagem.description} />
            </div>
            <div className="stratagem_footer">{stratagem.cp_cost} COMMAND POINT(S)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
