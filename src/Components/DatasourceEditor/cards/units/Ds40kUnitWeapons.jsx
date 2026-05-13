import { Button } from "antd";
import { UnitWeapon } from "../../../Warhammer40k-10e/UnitCard/UnitWeapon";
import { UnitAbilityDescription } from "../../../Warhammer40k-10e/UnitCard/UnitAbilityDescription";
import { UnitWeaponKeywords } from "../../../Warhammer40k-10e/UnitCard/UnitWeaponKeyword";
import { KeywordTooltip, tooltipProps as keywordTooltipProps } from "../../../Warhammer40k-10e/UnitCard/KeywordTooltip";
import { Tooltip } from "../../../Tooltip/Tooltip";
import { WeaponTypeIcon } from "../../../Icons/WeaponTypeIcon";
import { Ds40kUnitSections } from "./Ds40kUnitSections";
import { collectKeywordExplanations, resolveKeywordEntry } from "../../../../Helpers/customSchema.helpers";

/**
 * Inline weapon keyword tag renderer that consults the datasource glossary
 * for hover tooltips. Glossary entries with `displayMode: "tooltip"` show
 * their description on hover via antd Tooltip; everything else falls back
 * to the built-in KeywordTooltip dictionary (or a plain pill).
 *
 * Mirrors the .keyword > .keyword-button structure produced by
 * UnitWeaponKeywords so the existing 40k-10e CSS (uppercase + bracket
 * pseudo-elements) keeps working.
 */
const Ds40kWeaponKeywords = ({ keywords, glossary }) => (
  <span className="keyword">
    {keywords.map((keyword, index) => {
      const entry = resolveKeywordEntry(keyword, glossary, "weapons");
      if (entry?.displayMode === "tooltip" && entry.description) {
        return (
          <Tooltip key={`${keyword}-${index}`} {...keywordTooltipProps} content={entry.description}>
            <Button type="text" size="small" className="keyword-button">{`${keyword}`}</Button>
          </Tooltip>
        );
      }
      return <KeywordTooltip key={`${keyword}-${index}`} keyword={keyword} />;
    })}
  </span>
);

/**
 * Schema-driven weapon type section using native 40K CSS structure.
 * Reads column headers from schema weapon type definition.
 */
const Ds40kWeaponType = ({ weaponTypeDef, weapons, glossary }) => {
  const columns = weaponTypeDef.columns || [];
  const iconType = weaponTypeDef.key === "melee" ? "melee" : "ranged";
  const skillColumn = columns.find((c) => c.key === "skill");

  const glossaryExplanations = (() => {
    if (!Array.isArray(glossary) || glossary.length === 0 || !weapons?.length) return [];
    const allKeywords = [];
    weapons.forEach((weapon) => {
      weapon.profiles?.forEach((profile) => {
        if (profile.active === false) return;
        profile.keywords?.forEach((kw) => allKeywords.push(kw));
      });
    });
    // `displayMode: "tooltip"` entries are rendered as hover tooltips on the
    // inline keyword tag instead of an explanation row below the profile.
    return collectKeywordExplanations(allKeywords, glossary, "weapons").filter(
      (entry) => entry.displayMode !== "tooltip",
    );
  })();

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
        <Ds40kWeaponProfiles weapon={weapon} columns={columns} glossary={glossary} key={`weapon-${index}`} />
      ))}
      {/* Weapon abilities — glossary-driven explanations + per-weapon abilities,
          rendered as flat `.ability` rows inside a single `.special` block to match
          the built-in UnitWeapon CSS structure ("One Shot: …" compact rows). */}
      {(glossaryExplanations.length > 0 || weapons?.some((w) => w.abilities?.some((a) => a.showAbility))) && (
        <div className="special">
          {glossaryExplanations.map((entry) => (
            <UnitAbilityDescription
              key={`weapon-glossary-${entry.key}`}
              name={entry.name}
              description={entry.description}
              showDescription={true}
            />
          ))}
          {weapons?.flatMap((weapon, wIdx) =>
            (weapon.abilities || [])
              .filter((ability) => ability.showAbility)
              .map((ability, aIdx) => (
                <UnitAbilityDescription
                  key={`weapon-ability-${wIdx}-${aIdx}-${ability.name}`}
                  name={ability.name}
                  description={ability.description}
                  showDescription={ability.showDescription}
                />
              )),
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Renders weapon profiles using schema-defined columns.
 * Adapts the native UnitWeapon structure for dynamic columns.
 */
const Ds40kWeaponProfiles = ({ weapon, columns, glossary }) => {
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
                    {Array.isArray(glossary) && glossary.length > 0 ? (
                      <Ds40kWeaponKeywords keywords={profile.keywords} glossary={glossary} />
                    ) : (
                      <UnitWeaponKeywords keywords={profile.keywords} />
                    )}
                  </span>
                )}
              </div>
              {columns.map((col) => {
                const displayValue =
                  col.type === "boolean"
                    ? profile[col.key]
                      ? col.onValue || "Yes"
                      : col.offValue || "No"
                    : profile[col.key] || "-";
                return (
                  <div className="value center" key={col.key}>
                    {displayValue}
                  </div>
                );
              })}
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
 * @param {Object} [props.sectionsSchema] - The sections schema definition
 * @param {Array} [props.keywordGlossary] - Datasource-level keyword glossary; the weapons
 *   renderer consumes entries whose `appliesTo` includes "weapons".
 */
export const Ds40kUnitWeapons = ({ unit, weaponTypes, sectionsSchema, keywordGlossary }) => {
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

        return (
          <Ds40kWeaponType
            weaponTypeDef={weaponTypeDef}
            weapons={weapons}
            glossary={keywordGlossary}
            key={weaponTypeDef.key}
          />
        );
      })}
      {sectionsSchema && <Ds40kUnitSections unit={unit} sectionsSchema={sectionsSchema} />}
    </div>
  );
};
