import { Link } from "react-router-dom";
import { useDataSourceStorage } from "../../../Hooks/useDataSourceStorage";

export const UnitLoadout = ({ unit }) => {
  const { selectedFaction } = useDataSourceStorage();

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
        {unit.leads && (
          <>
            <div className="heading">
              <div className="title">Leader</div>
            </div>
            <div className="leader">
              <span className="description">This unit can lead the following units:</span>
              {unit?.leads?.units?.map((leader) => {
                return (
                  <div key={`leader-${leader}`}>
                    ■
                    <Link
                      to={`/viewer/${selectedFaction.name.toLowerCase().replaceAll(" ", "-")}/${leader
                        .replaceAll(" ", "-")
                        .toLowerCase()}`}>
                      <span className="value">{leader}</span>
                    </Link>
                  </div>
                );
              })}
              {unit?.leads?.extra && <span className="description">{unit?.leads?.extra}</span>}
            </div>
          </>
        )}
        {unit?.leadBy && (
          <>
            <div className="heading">
              <div className="title">Lead by</div>
            </div>
            <div className="ledBy">
              <span className="description">This unit can be lead by the following units:</span>
              {unit?.leadBy?.map((leader) => {
                return (
                  <div key={`leader-${leader}`}>
                    ■
                    <Link
                      to={`/viewer/${selectedFaction.name.toLowerCase().replaceAll(" ", "-")}/${leader
                        .replaceAll(" ", "-")
                        .toLowerCase()}`}>
                      <span className="value">{leader}</span>
                    </Link>
                  </div>
                );
              })}
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
