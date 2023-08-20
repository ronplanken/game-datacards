import { ReactFitty } from "react-fitty";
import { UnitStat } from "./UnitStat";

export const UnitStats = ({ stats }) => {
  const statHeaders = [
    { text: "M", value: "m" },
    { text: "T", value: "t" },
    { text: "SV", value: "sv" },
    { text: "W", value: "w" },
    { text: "LD", value: "ld" },
    { text: "OC", value: "oc" },
  ];
  // statHeaders.forEach((header, index) => {
  //   stats
  //     ?.filter((stat) => stat.active)
  //     ?.map((stat) => {
  //       if (stat?.[header.value] && stat?.[header.value].length >= 3) {
  //         statHeaders[index].width = "60px";
  //       }
  //     });
  // });
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
      {stats
        ?.filter((stat) => stat.active)
        ?.map((stat, index) => {
          return (
            <div className="stats_container" key={`stat-line-${index}`}>
              <UnitStat value={stat.m} />
              <UnitStat value={stat.t} />
              <UnitStat value={stat.sv} />
              <UnitStat value={stat.w} showDamagedMarker={stat.showDamagedMarker} />
              <UnitStat value={stat.ld} />
              <UnitStat value={stat.oc} />
              {stat.showName && (
                <div className="name">
                  <ReactFitty maxSize={16} minSize={10}>
                    {stat.name}
                  </ReactFitty>
                </div>
              )}
            </div>
          );
        })}
    </>
  );
};
