import classNames from "classnames";
import { ReactFitty } from "react-fitty";
import { MarkdownSpanDisplay } from "../MarkdownSpanDisplay";

export const StratagemCard = ({
  stratagem,
  cardStyle,
  paddingTop = "32px",
  className = "stratagem",
  containerClass = "",
}) => {
  return (
    <div
      style={{
        ...cardStyle,
        justifyContent: "center",
        justifyItems: "center",
        display: "flex",
        paddingTop: paddingTop,
      }}
      className={containerClass}>
      <div
        className={classNames(
          {
            [`${className}`]: true,
            other: stratagem.turn === "opponents",
            either: stratagem.turn === "either",
            own: stratagem.turn === "your",
          },
          stratagem.faction_id
        )}>
        <div className={`border`}>
          <div className="background-side-bar"></div>
          <div className="background-header-bar"></div>
          <div className="header">
            <ReactFitty maxSize={16} minSize={10}>
              {stratagem.name}
            </ReactFitty>
          </div>
          <div className="type">
            <ReactFitty maxSize={10} minSize={2}>
              {stratagem.detachment} - {stratagem.type}
            </ReactFitty>
          </div>
          <div className="content" style={{ fontSize: stratagem?.textSize ?? "16px" }}>
            {stratagem.when && (
              <div className="section">
                <span className="title">When:</span>
                <span className="text">
                  <MarkdownSpanDisplay content={stratagem.when} />
                </span>
              </div>
            )}
            {stratagem.target && (
              <div className="section">
                <span className="title">target:</span>
                <span className="text">
                  <MarkdownSpanDisplay content={stratagem.target} />
                </span>
              </div>
            )}
            {stratagem.effect && (
              <div className="section">
                <span className="title">effect:</span>
                <span className="text">
                  <MarkdownSpanDisplay content={stratagem.effect} />
                </span>
              </div>
            )}
            {stratagem.restrictions && (
              <div className="section">
                <span className="title">restrictions:</span>
                <span className="text">
                  <MarkdownSpanDisplay content={stratagem.restrictions} />
                </span>
              </div>
            )}
          </div>
          <div className="containers">
            {stratagem.phase?.map((phase) => {
              return (
                <div className="type-container" key={phase}>
                  <div className={phase}> </div>
                </div>
              );
            })}
            <div className="cp-container">
              <div className="value">
                <ReactFitty maxSize={18} minSize={10}>
                  {stratagem.cost} CP
                </ReactFitty>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
