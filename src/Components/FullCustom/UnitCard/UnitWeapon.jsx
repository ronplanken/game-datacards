import { Grid } from "antd";
import { replaceKeywords } from "./UnitAbilityDescription";
import { UnitWeaponKeywords } from "./UnitWeaponKeyword";

const { useBreakpoint } = Grid;

export const UnitWeapon = ({ weapon }) => {
  const screens = useBreakpoint();

  return (
    <>
      {weapon.profiles
        ?.filter((line) => line.active)
        ?.map((line, index) => (
          <div className="weapon" key={`weapon-line-${index}`}>
            <div className="line">
              <div className="value" style={{ display: "flex", flexWrap: "wrap" }}>
                <span>{line.name}</span>
                {line.keywords?.length > 0 && !screens.xs && (
                  <span style={{ paddingLeft: "4px" }}>
                    <UnitWeaponKeywords keywords={line.keywords} />
                  </span>
                )}
              </div>
              <div className="value center">{line.range}</div>
              <div className="value center">{line.attacks}</div>
              <div className="value center">{line.skill}</div>
              <div className="value center">{line.strength}</div>
              <div className="value center">{line.ap}</div>
              <div className="value center">{line.damage}</div>
              {line.keywords?.length > 0 && screens.xs && <UnitWeaponKeywords keywords={line.keywords} />}
            </div>
          </div>
        ))}
      {weapon?.abilities && (
        <div className="special">
          {weapon.abilities
            ?.filter((line) => line.showAbility)
            ?.map((line, index) => (
              <div className="ability" style={{ paddingLeft: 30, paddingRight: 8 }} key={`weapon-ability-${line.name}`}>
                <span className="name">{line.name}</span>
                {line.showDescription && <span className="description">{replaceKeywords(line.description)}</span>}
              </div>
            ))}
        </div>
      )}
    </>
  );
};
