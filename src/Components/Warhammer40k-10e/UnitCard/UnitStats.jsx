import { UnitStat } from "./UnitStat";

export const UnitStats = ({ stats }) => {
  const statHeaders = [
    { text: "M", value: "m", width: "44px" },
    { text: "T", value: "t", width: "44px" },
    { text: "SV", value: "sv", width: "44px" },
    { text: "W", value: "w", width: "44px" },
    { text: "LD", value: "ld", width: "44px" },
    { text: "OC", value: "oc", width: "44px" },
  ];
  statHeaders.forEach((header, index) => {
    stats
      ?.filter((stat) => stat.active)
      ?.map((stat) => {
        if (stat?.[header.value] && stat?.[header.value].length >= 3) {
          statHeaders[index].width = "60px";
        }
      });
  });
  return (
    <>
      <div className="stats_container">
        {statHeaders.map((header) => {
          return (
            <div className="stat" key={header.value}>
              <div className="caption" style={{ width: header.width }}>
                {header.text}
              </div>
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
              {stat.showName && <div className="name">{stat.name}</div>}
            </div>
          );
        })}
    </>
  );
};
