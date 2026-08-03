import { UnitFactions } from "./UnitCard/UnitFactions";
import { UnitFactionSymbol } from "./UnitCard/UnitFactionSymbol";
import { UnitKeywords } from "./UnitCard/UnitKeywords";
import { UnitLoadout } from "./UnitCard/UnitLoadout";
import { UnitName } from "./UnitCard/UnitName";
import { UnitWargear } from "./UnitCard/UnitWargear";

export const UnitCardBack = ({ unit, cardStyle, paddingTop = "32px", className }) => {
  const fullName = unit.subname ? `${unit.name} ${unit.subname}` : unit.name;
  return (
    <div
      className={`unit-card-back-wrapper ${className || ""}`}
      style={{
        ...cardStyle,
      }}>
      <div className={`unit back`} data-name={unit.name} data-fullname={fullName}>
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
