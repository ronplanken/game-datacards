import classNames from "classnames";
import { ReactFitty } from "react-fitty";
import { Grid } from "antd";
import { PhaseIcon } from "../Icons/PhaseIcon";
import { MarkupText } from "./UnitCard/UnitAbilityDescription";
import { useSettingsStorage } from "../../Hooks/useSettingsStorage";
import { localize } from "../../Helpers/localization.helpers";

const { useBreakpoint } = Grid;

export const StratagemCard = ({
  stratagem,
  cardStyle,
  paddingTop = "32px",
  className = "stratagem",
  containerClass = "",
}) => {
  const screens = useBreakpoint();
  const { settings } = useSettingsStorage();
  const lang = settings.language;

  const when = localize(stratagem.when, lang);
  const target = localize(stratagem.target, lang);
  const effect = localize(stratagem.effect, lang);

  const lineHeight = screens.xs ? "default" : (`${stratagem?.styling?.lineHeight}rem` ?? "1rem");
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
          stratagem.faction_id,
        )}>
        <div className={`border`}>
          <div className="background-side-bar"></div>
          <div className="background-header-bar"></div>
          <div className="header">
            <ReactFitty maxSize={16} minSize={10}>
              {localize(stratagem.name, lang)}
            </ReactFitty>
          </div>
          <div className="type">
            <ReactFitty maxSize={14} minSize={2}>
              {stratagem.detachment} - {localize(stratagem.type, lang)}
            </ReactFitty>
          </div>
          <div className="content" style={{ fontSize: stratagem?.styling?.textSize ?? 16 }}>
            {when && (
              <div className="section" style={{ lineHeight: `${lineHeight}` }}>
                <span className="title">When:</span>
                <span className="text">
                  <MarkupText content={when} />
                </span>
              </div>
            )}
            {target && (
              <div className="section" style={{ lineHeight: `${lineHeight}` }}>
                <span className="title">target:</span>
                <span className="text">
                  <MarkupText content={target} />
                </span>
              </div>
            )}
            {effect && (
              <div className="section" style={{ lineHeight: `${lineHeight}` }}>
                <span className="title">effect:</span>
                <span className="text">
                  <MarkupText content={effect} />
                </span>
              </div>
            )}
          </div>
          <div className="containers">
            {stratagem.phase?.map((phase) => {
              return (
                <div className="type-container" key={phase}>
                  <div className="phase-icon-wrapper">
                    <PhaseIcon phase={phase} />
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
