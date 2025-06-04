import classNames from "classnames";
import { ReactFitty } from "react-fitty";
import { MarkdownSpanDisplay } from "../MarkdownSpanDisplay";

export const EnhancementCard = ({
  enhancement,
  cardStyle,
  paddingTop = "32px",
  className = "enhancement",
  containerClass = "",
}) => {
  return (
    <div
      style={{
        ...cardStyle,
        "--width": `${enhancement.styling?.width ?? "260"}px`,
        "--height": `${enhancement.styling?.height ?? "458"}px`,
        justifyContent: "center",
        justifyItems: "center",
        display: "flex",
        paddingTop: paddingTop,
      }}
      className={containerClass}>
      <div className={`own ${className} ${enhancement.faction_id}`}>
        <div className={`border`}>
          <div className="background-side-bar"></div>
          <div className="background-header-bar"></div>
          <div className="header">
            <ReactFitty maxSize={16} minSize={10}>
              {enhancement.name}
            </ReactFitty>
          </div>
          <div className="type">
            <ReactFitty maxSize={10} minSize={2}>
              {enhancement.detachment}
            </ReactFitty>
          </div>
          <div className="content" style={{ fontSize: enhancement?.styling?.textSize ?? 16 }}>
            {enhancement.description && (
              <div className="section" style={{ lineHeight: `${enhancement.styling?.lineHeight ?? "1"}rem` }}>
                <MarkdownSpanDisplay content={enhancement.description} />
              </div>
            )}
          </div>
          <div className="containers">
            <div className="cost-container">
              <div className="value">
                <ReactFitty maxSize={18} minSize={10}>
                  {enhancement.cost}
                </ReactFitty>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
