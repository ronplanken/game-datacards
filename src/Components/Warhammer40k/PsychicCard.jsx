import { MarkdownDisplay } from "../MarkdownDisplay";

export const PsychicCard = ({ power, cardStyle, paddingTop = "32px" }) => {
  return (
    <div
      style={{
        paddingTop,
        justifyContent: "center",
        justifyItems: "center",
        display: "flex",
      }}>
      <div className={`power ${power.variant || "card"}`} style={cardStyle}>
        <div className="frame">
          <div className={power.faction_id ? power.faction_id : "basic"}>
            <div className="power_header">
              <div className="power_type">{power.type}</div>
              <div className="power_name">{power.name}</div>
            </div>
            <div className="power_description">
              <MarkdownDisplay content={power.description} />
            </div>
            <div className="power_footer">{power.extra || "Psychic Power"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
