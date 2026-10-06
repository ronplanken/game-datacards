import { Grid } from "antd";
import { replaceKeywords } from "./UnitAbilityDescription";
import { UnitWeaponKeywords } from "./UnitWeaponKeyword";
import { normalizeKeywords } from "../../../Helpers/weaponProfile.helpers";

const { useBreakpoint } = Grid;

export const UnitWeapon = ({ weapon }) => {
  const screens = useBreakpoint();

  return (
    <>
      {weapon.profiles
        ?.filter((line) => line.active)
        ?.map((line, index, profiles) => {
          // Saved cards can carry a string here (see normalizeKeywords).
          const keywords = normalizeKeywords(line.keywords);
          return (
            <div
              className={`weapon${profiles.length > 1 ? " multi-line" : ""}`}
              key={`weapon-line-${index}`}
              data-name={line.name}>
              <div className="line">
                <div className="value" style={{ display: "flex", flexWrap: "wrap" }}>
                  <span>{line.name}</span>
                  {keywords.length > 0 && !screens.xs && (
                    <span style={{ paddingLeft: "4px" }}>
                      <UnitWeaponKeywords keywords={keywords} />
                    </span>
                  )}
                </div>
                <div className="value center">{line.range}</div>
                <div className="value center">{line.attacks}</div>
                <div className="value center">{line.skill}</div>
                <div className="value center">{line.strength}</div>
                <div className="value center">{line.ap}</div>
                <div className="value center">{line.damage}</div>
                {keywords.length > 0 && screens.xs && <UnitWeaponKeywords keywords={keywords} />}
              </div>
            </div>
          );
        })}
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
