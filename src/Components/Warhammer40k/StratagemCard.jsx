import { MarkdownDisplay } from "../MarkdownDisplay";

export const StratagemCard = ({ stratagem, cardStyle, paddingTop = "32px" }) => {
  const style = stratagem.variant === "custom" ? { height: `${stratagem.height}cm`, width: `${stratagem.width}cm` } : {};
  return (
    <div
      style={{
        paddingTop,
        justifyContent: "center",
        justifyItems: "center",
        display: "flex",
      }}>
      <div className={`stratagem`} style={cardStyle}>
        <div className={`page ${stratagem.variant || "card"} `} style={style}>
          <div className="frame">
            <div className={`${stratagem.background || "NONE"} background`}>
              <div className={stratagem.subfaction_id ? stratagem.subfaction_id : stratagem.faction_id}>
                <div className="header">
                  <div className="type">{stratagem.type.split("–")[1] || stratagem.type}</div>
                  <div className="name">{stratagem.name}</div>
                </div>
                <div className="description">
                  <MarkdownDisplay content={stratagem.description} />
                </div>
                <div className="footer">{stratagem.cp_cost} COMMAND POINT(S)</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
