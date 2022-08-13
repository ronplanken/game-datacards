import { MarkdownDisplay } from "../MarkdownDisplay";
import { UnitStatline } from "./UnitCard/UnitStatline";
import { UnitType } from "./UnitCard/UnitType";
import { WeaponStatline } from "./UnitCard/WeaponStatline";

export const UnitCard = ({ unit, cardStyle, paddingTop = "32px" }) => {
  return (
    <div
      style={{
        paddingTop,
        justifyContent: "center",
        justifyItems: "center",
        display: "flex",
      }}>
      <div className={`page ${unit.variant || "card"}`} style={cardStyle}>
        <div className="frame">
          <div className={unit.background || "NONE"}>
            <div className="header">
              <div className="role">
                <UnitType type={unit.role} />
              </div>
              <div className="name">{unit.name}</div>
            </div>
            {unit.datasheet?.filter((sheet) => sheet.active).length > 0 && (
              <div className="labels heading">
                <div className="center label">
                  <div className="movement icon" title="Movement" alt-text="Movement"></div>
                </div>
                <div className="center label">
                  <div className="weaponskill icon" title="Weapon Skill" alt-text="Weapon Skill"></div>
                </div>
                <div className="center label">
                  <div className="ballisticskill icon" title="Ballistic Skill" alt-text="Ballistic Skill"></div>
                </div>
                <div className="center label">
                  <div className="strength icon" title="Strength" alt-text="Strength"></div>
                </div>
                <div className="center label">
                  <div className="toughness icon" title="Toughness" alt-text="Toughness"></div>
                </div>
                <div className="center label">
                  <div className="wounds icon" title="Wounds" alt-text="Wounds"></div>
                </div>
                <div className="center label">
                  <div className="attacks icon" title="Attacks" alt-text="Attacks"></div>
                </div>
                <div className="center label">
                  <div className="leadership icon" title="Leadership" alt-text="Leadership"></div>
                </div>
                <div className="center label">
                  <div className="save icon" title="Save" alt-text="Save"></div>
                </div>
                <div className="center label">
                  <div className="inv icon" title="Invulnerable" alt-text="Save"></div>
                </div>
              </div>
            )}
            <div className="profile">
              {unit.datasheet?.map((datasheet, index) => {
                if (datasheet.active) {
                  return <UnitStatline statline={datasheet} key={`datasheet-${index}`} />;
                } else {
                  return <></>;
                }
              })}
            </div>
            {unit.unit_composition_active && (
              <div className="description">
                <MarkdownDisplay content={unit.unit_composition} />
              </div>
            )}
            {unit.wargear?.filter((sheet) => sheet.active).length > 0 && (
              <div className="weapons heading">
                <div className="left label">WEAPON</div>
                <div className="center label">
                  <div className="range icon" title="Range" alt-text="Range"></div>
                </div>
                <div className="center label">
                  <div className="type icon" title="Type" alt-text="Type"></div>
                </div>
                <div className="center label">
                  <div className="strength icon" title="Type" alt-text="Type"></div>
                </div>
                <div className="center label">
                  <div className="ap icon" title="Type" alt-text="Type"></div>
                </div>
                <div className="center label">
                  <div className="dmg icon" title="Type" alt-text="Type"></div>
                </div>
              </div>
            )}
            <div className="profile">
              {unit.wargear?.map((wargear, index) => {
                if (!wargear.active) {
                  return <></>;
                }
                if (wargear.profiles.length > 1) {
                  return (
                    <>
                      <div className="description" key={`profile-${index}-description`}>
                        {wargear.name}
                      </div>
                      {wargear.profiles.map((profile, pindex) => {
                        return (
                          <WeaponStatline
                            profile={profile}
                            key={`profile-${index}-${pindex}`}
                            type={unit.variant || "card"}
                          />
                        );
                      })}
                    </>
                  );
                }
                return (
                  <WeaponStatline
                    profile={wargear.profiles[0]}
                    key={`profile-${index}`}
                    type={unit.variant || "card"}
                  />
                );
              })}
            </div>
            <div className="abilities">
              {unit.abilities?.map((ability, index) => {
                return (
                  ability.showAbility && (
                    <div className="description" key={`ability-${ability.name}-description-${index}`}>
                      {!ability.showDescription && <b>{ability.name}</b>}
                      {ability.showDescription && (
                        <MarkdownDisplay content={`**${ability.name}** : ${ability.description}`} />
                      )}
                    </div>
                  )
                );
              })}
            </div>
            <div className="footer">
              {unit.keywords
                ?.filter((keyword) => keyword.active)
                .map((keyword) => keyword.keyword)
                .join(", ")}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
