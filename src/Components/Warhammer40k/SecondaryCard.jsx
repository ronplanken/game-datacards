import { MarkdownDisplay } from "../MarkdownDisplay";

export const SecondaryCard = ({ secondary, cardStyle, paddingTop = "32px" }) => {
  return (
    <div
      style={{
        paddingTop,
        justifyContent: "center",
        justifyItems: "center",
        display: "flex",
      }}>
      <div className={`secondary ${secondary.variant || "card"}`} style={cardStyle}>
        <div className="frame">
          <div className={secondary.faction_id ? secondary.faction_id : "basic"}>
            <div className="secondary_header">
              <div className="secondary_type">{secondary.category}</div>
              <div className="secondary_name">{secondary.name}</div>
            </div>
            <div className="secondary_description">
              <MarkdownDisplay content={secondary.description} />
            </div>
            <div className="secondary_footer">{secondary.type || "Secondary"}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
