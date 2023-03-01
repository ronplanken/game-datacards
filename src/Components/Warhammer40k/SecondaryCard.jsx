import { MarkdownDisplay } from "../MarkdownDisplay";

export const SecondaryCard = ({ secondary, cardStyle, paddingTop = "32px" }) => {
  const style = secondary.variant === "custom" ? { height: `${secondary.height}cm`, width: `${secondary.width}cm` } : {};
  return (
    <div
      style={{
        paddingTop,
        justifyContent: "center",
        justifyItems: "center",
        display: "flex",
      }}>
      <div className={`secondary`} style={cardStyle}>
        <div className={`page ${secondary.variant || "secondary"}`}>
          <div className="frame">
            <div className={`${secondary.faction_id ? secondary.faction_id : "basic"} background`}>
              <div className="header">
                <div className="type">{secondary.category}</div>
                <div className="name">{secondary.name}</div>
              </div>
              <div className="description">
                <MarkdownDisplay content={secondary.description} />
              </div>
              <div className="footer">{secondary.type || "Secondary"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
