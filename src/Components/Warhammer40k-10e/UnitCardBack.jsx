import { UnitFactions } from "./UnitCard/UnitFactions";
import { UnitFactionSymbol } from "./UnitCard/UnitFactionSymbol";
import { UnitKeywords } from "./UnitCard/UnitKeywords";
import { UnitLoadout } from "./UnitCard/UnitLoadout";
import { UnitName } from "./UnitCard/UnitName";
import { UnitWargear } from "./UnitCard/UnitWargear";

export const UnitCardBack = ({ unit, cardStyle, paddingTop = "32px", className }) => {
  return (
    <div
      className={className}
      style={{
        ...cardStyle,
        justifyContent: "center",
        justifyItems: "center",
        display: "flex",
      }}>
      <div className={`unit back`} data-name={unit.name} data-fullname={`${unit.name} ${unit.subname}`}>
        <div className={"header back"}>
          <UnitName name={unit.name} subname={unit.subname} />
        </div>
        <div className="data_container ">
          <div className="data back">
            <UnitWargear unit={unit} />
            <UnitLoadout unit={unit} />
          </div>
        </div>
        <div className="footer">
          <UnitKeywords keywords={unit.keywords} />
          <UnitFactions factions={unit.factions} />
        </div>
        <UnitFactionSymbol unit={unit} />
      </div>
    </div>
  );
};
