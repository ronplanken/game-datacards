import { UnitWeapon } from "./UnitWeapon";
import { WeaponTypeIcon } from "../../Icons/WeaponTypeIcon";

export const UnitWeaponsType = ({ weapons, weaponType }) => {
  return (
    <div className={weaponType.class}>
      <div className="weapon-type-icon">
        <WeaponTypeIcon type={weaponType.class} color="white" />
      </div>
      <div className="heading">
        <div className="title">{weaponType.name}</div>
        <div className="title center">Range</div>
        <div className="title center">A</div>
        <div className="title center">{weaponType.skill}</div>
        <div className="title center">S</div>
        <div className="title center">AP</div>
        <div className="title center">D</div>
      </div>
      {weapons?.map((weapon, index) => (
        <UnitWeapon weapon={weapon} key={`weapon-${index}`} />
      ))}
    </div>
  );
};
