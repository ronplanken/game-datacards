import { WeaponTypeIcon } from "../Icons/WeaponTypeIcon";

/**
 * Renders a single weapon's profiles with schema-defined columns.
 *
 * @param {Object} props
 * @param {Object} props.weapon - Weapon data with profiles array
 * @param {Array} props.columns - Column definitions from schema weaponType
 * @param {boolean} props.hasKeywords - Whether to show weapon keywords
 * @param {string} props.columnTemplate - CSS grid-template-columns value matching the heading
 */
const CustomWeaponProfiles = ({ weapon, columns, hasKeywords, columnTemplate }) => {
  return (
    <>
      {weapon.profiles
        ?.filter((profile) => profile.active !== false)
        ?.map((profile, index, profiles) => (
          <div
            className={`weapon${profiles.length > 1 ? " multi-line" : ""}`}
            key={`weapon-profile-${index}`}
            data-name={profile.name}>
            <div className="line" style={{ gridTemplateColumns: columnTemplate }}>
              <div className="value" style={{ display: "flex", flexWrap: "wrap" }}>
                <span>{profile.name}</span>
                {hasKeywords && profile.keywords?.length > 0 && (
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
      {weapon?.abilities?.length > 0 && (
        <div className="special">
          {weapon.abilities
            ?.filter((ability) => ability.showAbility !== false)
            ?.map((ability) => (
              <div
                className="ability"
                style={{ paddingLeft: 30, paddingRight: 8 }}
                key={`weapon-ability-${ability.name}`}>
                <span className="name">{ability.name}</span>
                {ability.showDescription !== false && ability.description && (
                  <span className="description">{ability.description}</span>
                )}
              </div>
            ))}
        </div>
      )}
    </>
  );
};

/**
 * Renders a weapon type section with heading and weapon list.
 *
 * @param {Object} props
 * @param {Object} props.weaponTypeDef - Schema weapon type definition (key, label, columns, hasKeywords, hasProfiles)
 * @param {Array} props.weapons - Array of weapon data for this type
 */
const CustomWeaponType = ({ weaponTypeDef, weapons }) => {
  const columns = weaponTypeDef.columns || [];
  const hasKeywords = weaponTypeDef.hasKeywords !== false;
  const iconType = weaponTypeDef.key === "melee" ? "melee" : "ranged";

  // Grid columns: name (7fr) + dynamic columns (each 1fr, first gets 2fr for wider content like Range)
  // This template is shared between heading and weapon lines for consistent column alignment
  const columnTemplate = `7fr ${columns.map((_, i) => (i === 0 ? "2fr" : "1fr")).join(" ")}`;

  return (
    <div className={weaponTypeDef.key} data-testid={`custom-weapon-type-${weaponTypeDef.key}`}>
      <div className="weapon-type-icon">
        <WeaponTypeIcon type={iconType} color="white" />
      </div>
      <div className="heading" style={{ gridTemplateColumns: columnTemplate }}>
        <div className="title">{weaponTypeDef.label}</div>
        {columns.map((col) => (
          <div className="title center" key={col.key}>
            {col.label}
          </div>
        ))}
      </div>
      {weapons?.map((weapon, index) => (
        <CustomWeaponProfiles
          weapon={weapon}
          columns={columns}
          hasKeywords={hasKeywords}
          columnTemplate={columnTemplate}
          key={`weapon-${index}`}
        />
      ))}
    </div>
  );
};

/**
 * CustomCardWeapons - Renders weapon tables per weapon type with schema-defined columns.
 * Unlike the hardcoded 40K weapon tables (ranged/melee with fixed Range/A/BS/S/AP/D columns),
 * this iterates schema.weaponTypes.types to render dynamic weapon sections.
 *
 * @param {Object} props
 * @param {Object} props.unit - The card data containing weapon arrays keyed by weapon type key
 * @param {Object} props.weaponTypes - The weaponTypes schema definition
 */
export const CustomCardWeapons = ({ unit, weaponTypes }) => {
  if (!weaponTypes?.types?.length) {
    return null;
  }

  return (
    <>
      {weaponTypes.types.map((weaponTypeDef) => {
        // Look up weapons on the card data by the weapon type key
        // Support both direct key (e.g. unit.ranged) and suffixed (e.g. unit.rangedWeapons)
        const weapons = unit[weaponTypeDef.key] || unit[`${weaponTypeDef.key}Weapons`] || [];

        if (!weapons.length) {
          return null;
        }

        return <CustomWeaponType weaponTypeDef={weaponTypeDef} weapons={weapons} key={weaponTypeDef.key} />;
      })}
    </>
  );
};
