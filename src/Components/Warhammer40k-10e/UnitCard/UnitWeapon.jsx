import { UnitWeaponKeywords } from "./UnitWeaponKeyword";

export const UnitWeapon = ({ weapon }) => {
  return (
    <>
      {weapon.profiles
        ?.filter((line) => line.active)
        ?.map((line, index) => (
          <div className="weapon" key={`weapon-line-${index}`}>
            <div className="line">
              <div className="value">
                {line.name}
                {line.keywords?.length > 0 && <UnitWeaponKeywords keywords={line.keywords} />}
              </div>
              <div className="value center">{line.range}</div>
              <div className="value center">{line.attacks}</div>
              <div className="value center">{line.skill}</div>
              <div className="value center">{line.strength}</div>
              <div className="value center">{line.ap}</div>
              <div className="value center">{line.damage}</div>
            </div>
          </div>
        ))}
    </>
  );
};
