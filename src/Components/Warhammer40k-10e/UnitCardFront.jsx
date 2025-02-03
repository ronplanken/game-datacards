import { UnitExtra } from "./UnitCard/UnitExtra";
import { UnitFactions } from "./UnitCard/UnitFactions";
import { UnitInvulTop } from "./UnitCard/UnitInvulTop";
import { UnitKeywords } from "./UnitCard/UnitKeywords";
import { UnitName } from "./UnitCard/UnitName";
import { UnitStats } from "./UnitCard/UnitStats";
import { UnitWeapons } from "./UnitCard/UnitWeapons";

export const UnitCardFront = ({ unit, cardStyle, paddingTop = "32px", className }) => {
  return (
    <div
      className={className}
      style={{
        ...cardStyle,
        justifyContent: "center",
        justifyItems: "center",
        display: "flex",
      }}>
      <div className={`unit front`}>
        <div className={"header"}>
          <UnitName
            name={unit.name}
            subname={unit.subname}
            points={unit.points}
            legends={unit.legends}
            combatPatrol={unit.combatPatrol}
          />
          <UnitStats stats={unit.stats} />
          <div className="stats_container" key={`stat-line-invul`}>
            {unit.abilities?.invul?.showInvulnerableSave && unit.abilities?.invul?.showAtTop && (
              <UnitInvulTop invul={unit.abilities?.invul} />
            )}
          </div>
        </div>
        <div className="data_container">
          <div className="data">
            <UnitWeapons unit={unit} />
            <UnitExtra unit={unit} />
          </div>
        </div>
        <div className="footer">
          <UnitKeywords keywords={unit.keywords} />
          <UnitFactions factions={unit.factions} />
        </div>
        <div className="faction">
          <div className={unit.faction_id}></div>
        </div>
      </div>
    </div>
  );
};
