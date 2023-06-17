export const UnitLoadout = ({ unit }) => {
  console.log(unit);
  const unitLoadouts = unit.loadout.split(".").filter((val) => val);
  return (
    <div className="extra">
      <div className="composition_container">
        <div className="heading">
          <div className="title">Unit Composition</div>
        </div>
        {unit.composition?.map((composition, index) => {
          return (
            <div className="composition" key={`composition-${index}`}>
              <span className="description">{composition}</span>
            </div>
          );
        })}
        {unitLoadouts.map((loadout, index) => {
          const line = loadout.split(":");
          return (
            <div className="loadout" key={`loadout-${index}`}>
              <span className="name">{line[0]}</span>
              <span className="description">{line[1]}.</span>
            </div>
          );
        })}
        {unit.leader && (
          <>
            <div className="heading">
              <div className="title">Leader</div>
            </div>
            <div className="leader">
              <span className="description">{unit.leader.replaceAll("■", "\n\r ■")}</span>
            </div>
          </>
        )}
        {unit.transport && (
          <>
            <div className="heading">
              <div className="title">Transport</div>
            </div>
            <div className="transport">
              <span className="description">{unit.transport}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
