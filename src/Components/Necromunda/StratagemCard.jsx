import { MarkdownDisplay } from "../MarkdownDisplay";

export const StratagemCard = ({ stratagem, cardStyle, paddingTop = "32px" }) => {
  return (
    <div
      style={{
        paddingTop,
        justifyContent: "center",
        justifyItems: "center",
        display: "flex",
      }}
      className="stratagem">
      <div className={`page ${stratagem.variant || "card"}`} style={cardStyle}>
        <div className="frame">
          <div className={`${stratagem.faction}`}>
            <div className="stratagem_header">
              <div className="stratagem_type">{stratagem.type}</div>
              <div className="stratagem_name">{stratagem.name}</div>
            </div>
            <div className="stratagem_description">
              <MarkdownDisplay content={stratagem.description} />
            </div>
            <div className="stratagem_footer">{stratagem.cost}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
