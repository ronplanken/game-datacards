import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useIndexedDBImages } from "../../Hooks/useIndexedDBImages";
import { useDataSourceStorage } from "../../Hooks/useDataSourceStorage";
import { UnitWeaponKeywords } from "./UnitCard/UnitWeaponKeyword";
import { replaceKeywords } from "./UnitCard/UnitAbilityDescription";
import { FactionIcon } from "../Icons/FactionIcon";

const BasicCardContainer = styled.div`
  &:before {
    content: " ";
    position: absolute;
    right: ${(props) => (props.imagepositionx ? `calc(8px - ${props.imagepositionx}px)` : "8px")};
    top: ${(props) => (props.imagepositiony ? `calc(8px + ${props.imagepositiony}px)` : "8px")};
    width: 150px;
    height: 150px;
    background-color: transparent;
    background: top right no-repeat;
    background-size: contain;
    background-image: url(${(props) => props.imageurl});
    z-index: ${(props) => (props.imagezindex === "onTop" ? 100 : 1)};
    border-radius: 8px;
  }
`;

export const UnitCardBasic10e = ({ unit, cardStyle, paddingTop = "32px", className }) => {
  const { getImageUrl, isReady } = useIndexedDBImages();
  const { dataSource } = useDataSourceStorage();
  const [localImageUrl, setLocalImageUrl] = useState(null);

  useEffect(() => {
    let isMounted = true;
    let objectUrl = null;

    const loadLocalImage = async () => {
      if (unit?.hasLocalImage && unit?.uuid && isReady) {
        try {
          const url = await getImageUrl(unit.uuid);
          if (isMounted && url) {
            objectUrl = url;
            setLocalImageUrl(objectUrl);
          }
        } catch (error) {
          // Failed to load local image
        }
      } else {
        if (isMounted) {
          setLocalImageUrl(null);
        }
      }
    };

    loadLocalImage();

    return () => {
      isMounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [unit?.uuid, unit?.hasLocalImage, isReady]);

  const imageUrl = localImageUrl || unit.externalImage;
  const hasInvul = unit.abilities?.invul?.showInvulnerableSave;
  const statHeaders = hasInvul ? ["M", "T", "SV", "INV", "W", "LD", "OC"] : ["M", "T", "SV", "W", "LD", "OC"];
  const statKeys = ["m", "t", "sv", "w", "ld", "oc"];

  // Get faction colours when enabled
  const cardFaction = dataSource?.data?.find((faction) => faction.id === unit.faction_id);
  const colourStyles = {
    ...(unit.useFactionColours && {
      "--basic-banner-colour": unit.useCustomColours
        ? unit.customBannerColour || cardFaction?.colours?.banner
        : cardFaction?.colours?.banner,
      "--basic-header-colour": unit.useCustomColours
        ? unit.customHeaderColour || cardFaction?.colours?.header
        : cardFaction?.colours?.header,
    }),
    ...(unit.useCustomTextColours && {
      "--basic-text-colour": unit.customTextColour || "#000000",
      "--basic-keyword-colour": unit.customKeywordColour || "#666666",
    }),
  };

  return (
    <div className={`unit-card-basic-10e-wrapper ${className || ""}`} style={{ paddingTop }}>
      <div className="basic_unit_10e" style={{ ...cardStyle, ...colourStyles }}>
        <BasicCardContainer
          className="page card"
          imageurl={imageUrl}
          imagezindex={unit.imageZIndex}
          imagepositionx={unit.imagePositionX}
          imagepositiony={unit.imagePositionY}>
          <div className="frame">
            <div className="content">
              {/* Header with name and points */}
              <div className="header">
                <div className="faction-icon">
                  <FactionIcon factionId={unit.faction_id} />
                </div>
                <div className="name-container">
                  <div className="name">{unit.name}</div>
                  {unit.subname && <div className="subname">{unit.subname}</div>}
                </div>
                {unit.points && unit.points.length > 0 && (
                  <div className="points">
                    {unit.points
                      .filter((p) => p.active !== false)
                      .map((p, i) => (
                        <span key={i}>
                          {p.cost}
                          {unit.showPointsModels && p.models && <span className="models">/{p.models}</span>}
                          {i < unit.points.filter((p) => p.active !== false).length - 1 && ", "}
                        </span>
                      ))}
                    <span className="pts-label">pts</span>
                  </div>
                )}
              </div>

              {/* Stats */}
              {unit.stats && unit.stats.filter((s) => s.active).length > 0 && (
                <div className="stats-section">
                  <div className={`stats-header ${hasInvul ? "with-invul" : ""}`}>
                    {statHeaders.map((h) => (
                      <div className="stat-label" key={h}>
                        {h}
                      </div>
                    ))}
                  </div>
                  {unit.stats
                    .filter((s) => s.active)
                    .map((stat, idx) => (
                      <div className={`stats-row ${hasInvul ? "with-invul" : ""}`} key={idx}>
                        <div className="stat-value">{stat.m}</div>
                        <div className="stat-value">{stat.t}</div>
                        <div className="stat-value">{stat.sv}</div>
                        {hasInvul && <div className="stat-value">{unit.abilities.invul.value}+</div>}
                        <div className="stat-value">{stat.w}</div>
                        <div className="stat-value">{stat.ld}</div>
                        <div className="stat-value">{stat.oc}</div>
                        {stat.showName && <div className="stat-name">{stat.name}</div>}
                      </div>
                    ))}
                </div>
              )}

              {/* Invulnerable Save info (only shown if there's special text) */}
              {unit.abilities?.invul?.showInvulnerableSave && unit.abilities?.invul?.info && (
                <div className="invul-info-box">
                  <span className="invul-info-text">{unit.abilities.invul.info}</span>
                </div>
              )}

              {/* Ranged Weapons */}
              {unit.showWeapons?.["rangedWeapons"] !== false && unit.rangedWeapons && unit.rangedWeapons.length > 0 && (
                <div className="weapons-section ranged">
                  <div className="weapons-header">
                    <div className="weapon-title">Ranged weapons</div>
                    <div className="weapon-stat">Range</div>
                    <div className="weapon-stat">A</div>
                    <div className="weapon-stat">BS</div>
                    <div className="weapon-stat">S</div>
                    <div className="weapon-stat">AP</div>
                    <div className="weapon-stat">D</div>
                  </div>
                  {unit.rangedWeapons.map((weapon, wIdx) => (
                    <React.Fragment key={wIdx}>
                      {weapon.profiles
                        ?.filter((p) => p.active)
                        .map((profile, pIdx) => (
                          <div className={`weapon-row ${pIdx % 2 === 0 ? "even" : "odd"}`} key={`${wIdx}-${pIdx}`}>
                            <div className="weapon-name">
                              {profile.name}
                              {profile.keywords?.length > 0 && (
                                <span className="weapon-keywords">
                                  <UnitWeaponKeywords keywords={profile.keywords} />
                                </span>
                              )}
                            </div>
                            <div className="weapon-stat">{profile.range}</div>
                            <div className="weapon-stat">{profile.attacks}</div>
                            <div className="weapon-stat">{profile.skill}</div>
                            <div className="weapon-stat">{profile.strength}</div>
                            <div className="weapon-stat">{profile.ap}</div>
                            <div className="weapon-stat">{profile.damage}</div>
                          </div>
                        ))}
                      {weapon.abilities
                        ?.filter((a) => a.showAbility)
                        .map((ability, aIdx) => (
                          <div className="weapon-ability" key={`ability-${wIdx}-${aIdx}`}>
                            <span className="ability-name">{ability.name}</span>
                            {ability.showDescription && (
                              <span className="ability-desc">{replaceKeywords(ability.description)}</span>
                            )}
                          </div>
                        ))}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Melee Weapons */}
              {unit.showWeapons?.["meleeWeapons"] !== false && unit.meleeWeapons && unit.meleeWeapons.length > 0 && (
                <div className="weapons-section melee">
                  <div className="weapons-header">
                    <div className="weapon-title">Melee weapons</div>
                    <div className="weapon-stat">Range</div>
                    <div className="weapon-stat">A</div>
                    <div className="weapon-stat">WS</div>
                    <div className="weapon-stat">S</div>
                    <div className="weapon-stat">AP</div>
                    <div className="weapon-stat">D</div>
                  </div>
                  {unit.meleeWeapons.map((weapon, wIdx) => (
                    <React.Fragment key={wIdx}>
                      {weapon.profiles
                        ?.filter((p) => p.active)
                        .map((profile, pIdx) => (
                          <div className={`weapon-row ${pIdx % 2 === 0 ? "even" : "odd"}`} key={`${wIdx}-${pIdx}`}>
                            <div className="weapon-name">
                              {profile.name}
                              {profile.keywords?.length > 0 && (
                                <span className="weapon-keywords">
                                  <UnitWeaponKeywords keywords={profile.keywords} />
                                </span>
                              )}
                            </div>
                            <div className="weapon-stat">{profile.range}</div>
                            <div className="weapon-stat">{profile.attacks}</div>
                            <div className="weapon-stat">{profile.skill}</div>
                            <div className="weapon-stat">{profile.strength}</div>
                            <div className="weapon-stat">{profile.ap}</div>
                            <div className="weapon-stat">{profile.damage}</div>
                          </div>
                        ))}
                      {weapon.abilities
                        ?.filter((a) => a.showAbility)
                        .map((ability, aIdx) => (
                          <div className="weapon-ability" key={`ability-${wIdx}-${aIdx}`}>
                            <span className="ability-name">{ability.name}</span>
                            {ability.showDescription && (
                              <span className="ability-desc">{replaceKeywords(ability.description)}</span>
                            )}
                          </div>
                        ))}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Abilities Section */}
              {unit.showAbilities !== false && (
                <div className="abilities-section">
                  {/* Core and Faction Abilities */}
                  {(unit?.showAbilities?.["core"] !== false ||
                    unit?.showAbilities?.["faction"] !== false ||
                    unit?.showAbilities?.["other"] !== false) && (
                    <div className="abilities-block">
                      <div className="abilities-header">Abilities</div>
                      {unit?.showAbilities?.["core"] !== false && unit.abilities?.core?.length > 0 && (
                        <div className="ability-line">
                          <span className="ability-type">Core:</span>
                          <span className="ability-value">{unit.abilities.core.join(", ")}</span>
                        </div>
                      )}
                      {unit?.showAbilities?.["faction"] !== false && unit.abilities?.faction?.length > 0 && (
                        <div className="ability-line">
                          <span className="ability-type">Faction:</span>
                          <span className="ability-value">{unit.abilities.faction.join(", ")}</span>
                        </div>
                      )}
                      {unit?.showAbilities?.["other"] !== false &&
                        unit.abilities?.other
                          ?.filter((a) => a.showAbility)
                          .map((ability, idx) => (
                            <div className="ability-detail" key={idx}>
                              <span className="ability-name">{ability.name}</span>
                              {ability.showDescription && (
                                <span className="ability-desc">{replaceKeywords(ability.description)}</span>
                              )}
                            </div>
                          ))}
                    </div>
                  )}

                  {/* Wargear Abilities */}
                  {unit?.showAbilities?.["wargear"] !== false &&
                    unit.abilities?.wargear?.filter((a) => a.showAbility)?.length > 0 && (
                      <div className="abilities-block">
                        <div className="abilities-header">Wargear Abilities</div>
                        {unit.abilities.wargear
                          .filter((a) => a.showAbility)
                          .map((ability, idx) => (
                            <div className="ability-detail" key={idx}>
                              <span className="ability-name">{ability.name}</span>
                              {ability.showDescription && (
                                <span className="ability-desc">{replaceKeywords(ability.description)}</span>
                              )}
                            </div>
                          ))}
                      </div>
                    )}

                  {/* Damaged Profile */}
                  {unit.abilities?.damaged?.showDamagedAbility && (
                    <div className="damaged-block">
                      <div className="damaged-header">Damaged: {unit.abilities.damaged.range}</div>
                      {unit.abilities.damaged.showDescription && (
                        <div className="damaged-desc">{replaceKeywords(unit.abilities.damaged.description)}</div>
                      )}
                    </div>
                  )}

                  {/* Special Abilities */}
                  {unit?.showAbilities?.["special"] !== false &&
                    unit.abilities?.special
                      ?.filter((a) => a.showAbility)
                      .map((ability, idx) => (
                        <div className="special-block" key={idx}>
                          <div className="special-header">{ability.name}</div>
                          {ability.showDescription && (
                            <div className="special-desc">{replaceKeywords(ability.description)}</div>
                          )}
                        </div>
                      ))}

                  {/* Primarch Abilities */}
                  {unit.abilities?.primarch
                    ?.filter((p) => p.showAbility)
                    .map((primarch, pIdx) => (
                      <div className="primarch-block" key={pIdx}>
                        <div className="primarch-header">{primarch.name}</div>
                        {primarch.abilities
                          ?.filter((a) => a.showAbility)
                          .map((ability, aIdx) => (
                            <div className="ability-detail" key={aIdx}>
                              <span className="ability-name">{ability.name}</span>
                              {ability.showDescription && (
                                <span className="ability-desc">{replaceKeywords(ability.description)}</span>
                              )}
                            </div>
                          ))}
                      </div>
                    ))}
                </div>
              )}

              {/* Keywords Footer */}
              <div className="keywords-footer">
                {unit.keywords && unit.keywords.length > 0 && (
                  <div className="keywords-line">
                    <span className="keywords-title">Keywords:</span>
                    <span className="keywords-value">{unit.keywords.join(", ")}</span>
                  </div>
                )}
                {unit.factions && unit.factions.length > 0 && (
                  <div className="factions-line">
                    <span className="factions-title">Faction:</span>
                    <span className="factions-value">{unit.factions.join(", ")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </BasicCardContainer>
      </div>
    </div>
  );
};
