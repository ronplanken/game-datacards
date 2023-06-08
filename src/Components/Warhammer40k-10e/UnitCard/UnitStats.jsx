import { UnitStat } from "./UnitStat";

export const UnitStats = ({ stats }) => {
  return (
    <>
      <div className="stats_container">
        <div className="stat">
          <div className="caption">M</div>
        </div>
        <div className="stat">
          <div className="caption">T</div>
        </div>
        <div className="stat">
          <div className="caption">SV</div>
        </div>
        <div className="stat">
          <div className="caption">W</div>
        </div>
        <div className="stat">
          <div className="caption">LD</div>
        </div>
        <div className="stat">
          <div className="caption">OC</div>
        </div>
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
