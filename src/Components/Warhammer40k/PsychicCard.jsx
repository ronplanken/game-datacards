import { MarkdownDisplay } from "../MarkdownDisplay";

export const PsychicCard = ({ power, cardStyle, paddingTop = "32px" }) => {
  const style = power.variant === "custom" ? { height: `${power.height}cm`, width: `${power.width}cm` } : {};
  return (
    <div
      style={{
        paddingTop,
        justifyContent: "center",
        justifyItems: "center",
        display: "flex",
      }}>
      <div className={`power`}>
        <div className={`page ${power.variant || "card"}`} style={cardStyle}>
          <div className="frame">
            <div className={`${power.faction_id || "basic"} background`} style={style}>
              <div className="header">
                <div className="type">{power.type}</div>
                <div className="name">{power.name}</div>
              </div>
              <div className="description">
                <MarkdownDisplay content={power.description} />
              </div>
              <div className="footer">{power.extra || "Psychic Power"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
