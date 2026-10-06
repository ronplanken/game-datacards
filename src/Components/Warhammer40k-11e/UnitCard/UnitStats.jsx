import { ReactFitty } from "react-fitty";
import { UnitStat } from "./UnitStat";
import { useSettingsStorage } from "../../../Hooks/useSettingsStorage";
import { localize } from "../../../Helpers/localization.helpers";

// 11th edition stats are language-keyed and carry no `active`/`showName`
// defaults; render every stat line. Show the profile name when the data marks
// it (showName) or when there is more than one profile (multi-model unit).
export const UnitStats = ({ stats }) => {
  const { settings } = useSettingsStorage();
  const statHeaders = [
    { text: "M", value: "m" },
    { text: "T", value: "t" },
    { text: "SV", value: "sv" },
    { text: "W", value: "w" },
    { text: "LD", value: "ld" },
    { text: "OC", value: "oc" },
  ];
  const showNames = stats?.length > 1;
  return (
    <>
      <div className="stats_container">
        {statHeaders.map((header) => {
          return (
            <div className="stat" key={header.value}>
              <div className="caption">{header.text}</div>
            </div>
          );
        })}
      </div>
      {stats?.map((stat, index) => {
        return (
          <div className="stats_container" key={`stat-line-${index}`}>
            <UnitStat value={stat.m} />
            <UnitStat value={stat.t} />
            <UnitStat value={stat.sv} />
            <UnitStat value={stat.w} showDamagedMarker={stat.showDamagedMarker} />
            <UnitStat value={stat.ld} />
            <UnitStat value={stat.oc} />
            {(stat.showName || showNames) && (
              <div className="name">
                <ReactFitty maxSize={16} minSize={10}>
                  {localize(stat.name, settings.language)}
                </ReactFitty>
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};
