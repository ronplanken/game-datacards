import classNames from "classnames";
import { ReactFitty } from "react-fitty";
import { Grid } from "antd";
import { MarkdownSpanWrapDisplay } from "../MarkdownSpanWrapDisplay";
import { PhaseIcon } from "../Icons/PhaseIcon";

const { useBreakpoint } = Grid;

export const StratagemCard = ({
  stratagem,
  cardStyle,
  paddingTop = "32px",
  className = "stratagem",
  containerClass = "",
}) => {
  const screens = useBreakpoint();

  const lineHeight = screens.xs ? "default" : `${stratagem?.styling?.lineHeight}rem` ?? "1rem";
  const typeSize = screens.xs ? 12 : 10;
  return (
    <div
      style={{
        "--width": `${stratagem.styling?.width ?? "260"}px`,
        "--height": `${stratagem.styling?.height ?? "458"}px`,
        justifyContent: "center",
        justifyItems: "center",
        display: "flex",
        paddingTop: paddingTop,
        ...cardStyle,
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
                  <MarkdownSpanWrapDisplay content={stratagem.when} />
                </span>
              </div>
            )}
            {stratagem.target && (
              <div className="section" style={{ lineHeight: `${lineHeight}` }}>
                <span className="title">target:</span>
                <span className="text">
                  <MarkdownSpanWrapDisplay content={stratagem.target} />
                </span>
              </div>
            )}
            {stratagem.effect && (
              <div className="section" style={{ lineHeight: `${lineHeight}` }}>
                <span className="title">effect:</span>
                <span className="text">
                  <MarkdownSpanWrapDisplay content={stratagem.effect} />
                </span>
              </div>
            )}
            {stratagem.restrictions && (
              <div className="section" style={{ lineHeight: `${lineHeight}` }}>
                <span className="title">restrictions:</span>
                <span className="text">
                  <MarkdownSpanWrapDisplay content={stratagem.restrictions} />
                </span>
              </div>
            )}
          </div>
          <div className="containers">
            {stratagem.phase?.map((phase) => {
              return (
                <div className="type-container" key={phase}>
                  <div className="phase-icon-wrapper">
                    <PhaseIcon phase={phase} color="var(--stratagem-colour)" />
                  </div>
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
