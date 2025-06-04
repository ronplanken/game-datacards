import classNames from "classnames";
import { ReactFitty } from "react-fitty";
import { MarkdownSpanDisplay } from "../MarkdownSpanDisplay";
import { Grid } from "antd";

const { useBreakpoint } = Grid;

export const StratagemCard = ({
  stratagem,
  cardStyle,
  paddingTop = "32px",
  className = "stratagem",
  containerClass = "",
}) => {
  const screens = useBreakpoint();

  const lineHeight = screens.xs || screens.sm ? "default" : `${stratagem?.styling?.lineHeight}rem` ?? "1rem";
  const typeSize = screens.xs || screens.sm ? 12 : 10;

  return (
    <div
      style={{
        ...cardStyle,
        "--width": `${stratagem.styling?.width ?? "260"}px`,
        "--height": `${stratagem.styling?.height ?? "458"}px`,
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
            <ReactFitty maxSize={14} minSize={2}>
              {stratagem.detachment} - {stratagem.type}
            </ReactFitty>
          </div>
          <div className="content" style={{ fontSize: stratagem?.styling?.textSize ?? 16 }}>
            {stratagem.when && (
              <div className="section" style={{ lineHeight: `${lineHeight}` }}>
                <span className="title">When:</span>
                <span className="text">
                  <MarkdownSpanDisplay content={stratagem.when} />
                </span>
              </div>
            )}
            {stratagem.target && (
              <div className="section" style={{ lineHeight: `${lineHeight}` }}>
                <span className="title">target:</span>
                <span className="text">
                  <MarkdownSpanDisplay content={stratagem.target} />
                </span>
              </div>
            )}
            {stratagem.effect && (
              <div className="section" style={{ lineHeight: `${lineHeight}` }}>
                <span className="title">effect:</span>
                <span className="text">
                  <MarkdownSpanDisplay content={stratagem.effect} />
                </span>
              </div>
            )}
            {stratagem.restrictions && (
              <div className="section" style={{ lineHeight: `${lineHeight}` }}>
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
