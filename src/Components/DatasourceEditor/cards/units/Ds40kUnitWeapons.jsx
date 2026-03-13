import { UnitWeapon } from "../../../Warhammer40k-10e/UnitCard/UnitWeapon";
import { UnitAbilityDescription } from "../../../Warhammer40k-10e/UnitCard/UnitAbilityDescription";
import { WeaponTypeIcon } from "../../../Icons/WeaponTypeIcon";

/**
 * Schema-driven weapon type section using native 40K CSS structure.
 * Reads column headers from schema weapon type definition.
 */
const Ds40kWeaponType = ({ weaponTypeDef, weapons }) => {
  const columns = weaponTypeDef.columns || [];
  const iconType = weaponTypeDef.key === "melee" ? "melee" : "ranged";
  const skillColumn = columns.find((c) => c.key === "skill");

  return (
    <div className={weaponTypeDef.key}>
      <div className="weapon-type-icon">
        <WeaponTypeIcon type={iconType} color="white" />
      </div>
      <div className="heading">
        <div className="title">{weaponTypeDef.label}</div>
        {columns.map((col) => (
          <div className="title center" key={col.key}>
            {col.label}
          </div>
        ))}
      </div>
      {weapons?.map((weapon, index) => (
        <Ds40kWeaponProfiles weapon={weapon} columns={columns} key={`weapon-${index}`} />
      ))}
      {/* Primarch-style weapon abilities */}
      {weapons?.some((w) => w.abilities?.length > 0) &&
        weapons
          .filter((w) => w.abilities?.length > 0)
          .map((weapon) =>
            weapon.abilities
              ?.filter((ability) => ability.showAbility)
              ?.map((ability, i) => (
                <div className="special" key={`weapon-ability-${ability.name}-${i}`}>
                  <div className="heading">
                    <div className="title">{ability.name}</div>
                  </div>
                  {ability.showDescription && (
                    <UnitAbilityDescription
                      name={ability.name}
                      description={ability.description}
                      showDescription={ability.showDescription}
                    />
                  )}
                </div>
              )),
          )}
    </div>
  );
};

/**
 * Renders weapon profiles using schema-defined columns.
 * Adapts the native UnitWeapon structure for dynamic columns.
 */
const Ds40kWeaponProfiles = ({ weapon, columns }) => {
  return (
    <>
      {weapon.profiles
        ?.filter((profile) => profile.active !== false)
        ?.map((profile, index, profiles) => (
          <div
            className={`weapon${profiles.length > 1 ? " multi-line" : ""}`}
            key={`weapon-profile-${index}`}
            data-name={profile.name}>
            <div className="line">
              <div className="value" style={{ display: "flex", flexWrap: "wrap" }}>
                <span>{profile.name}</span>
                {profile.keywords?.length > 0 && (
                  <span style={{ paddingLeft: "4px" }}>
                    [<span className="weapon-keywords">{profile.keywords.join(", ")}</span>]
                  </span>
                )}
              </div>
              {columns.map((col) => (
                <div className="value center" key={col.key}>
                  {profile[col.key] || "-"}
                </div>
              ))}
            </div>
          </div>
        ))}
    </>
  );
};

/**
 * Schema-driven weapons renderer using native 40K CSS structure.
 * Reads weapon types from schema.weaponTypes.types[] instead of hardcoded ranged/melee.
 *
 * @param {Object} props
 * @param {Object} props.unit - The card data
 * @param {Object} props.weaponTypes - The weaponTypes schema definition
 */
export const Ds40kUnitWeapons = ({ unit, weaponTypes }) => {
  if (!weaponTypes?.types?.length) {
    return null;
  }

  return (
    <div className="weapons">
      {weaponTypes.types.map((weaponTypeDef) => {
        const weapons =
          unit.weapons?.[weaponTypeDef.key] || unit[weaponTypeDef.key] || unit[`${weaponTypeDef.key}Weapons`] || [];

        if (!weapons.length || unit.showWeapons?.[weaponTypeDef.key] === false) {
          return null;
        }

        return <Ds40kWeaponType weaponTypeDef={weaponTypeDef} weapons={weapons} key={weaponTypeDef.key} />;
      })}
    </div>
  );
};
