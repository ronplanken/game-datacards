import React from "react";
import { ArrowLeft } from "lucide-react";
import { StarcraftHeader } from "./starcraft/StarcraftHeader";
import { StarcraftAbility } from "./starcraft/StarcraftAbility";
import { StarcraftWeaponTable } from "./starcraft/StarcraftWeaponTable";
import { resolveStarcraftPhaseIcon } from "../../../Icons/StarcraftPhaseIcon";

/**
 * Group abilities by category key. Accepts both shapes used by the editor:
 *
 * - Legacy flat array: `[{ category: "assault", ... }, ...]`
 * - Native nested object: `{ assault: [...], combat: [...] }`
 *
 * Abilities with `showAbility === false` are filtered out so the per-ability
 * visibility toggle in the editor immediately affects rendering.
 */
const groupAbilitiesByCategory = (abilities) => {
  const visible = (a) => a && a.showAbility !== false;
  if (Array.isArray(abilities)) {
    const groups = {};
    abilities.forEach((ability) => {
      if (!ability?.category || !visible(ability)) return;
      if (!groups[ability.category]) groups[ability.category] = [];
      groups[ability.category].push(ability);
    });
    return groups;
  }
  if (abilities && typeof abilities === "object") {
    const groups = {};
    Object.entries(abilities).forEach(([key, list]) => {
      if (!Array.isArray(list)) return;
      groups[key] = list.filter(visible);
    });
    return groups;
  }
  return {};
};

const SectionHeading = ({ category, label }) => {
  const Icon = resolveStarcraftPhaseIcon(category?.phaseStyle);
  return (
    <div className="sc-section-heading">
      {Icon && (
        <span className="sc-phase-icon">
          <Icon />
        </span>
      )}
      <span>{label || category?.label}</span>
    </div>
  );
};

// Map a category.layout value to the ability-grid CSS class. Default is the
// single-column variant; named layouts produce 2 / 3 / 4-column grids that
// the LESS file styles via `.sc-ability-grid.{half,third,quarter}`.
const abilityGridClass = (category) => {
  switch (category?.layout) {
    case "half":
      return "sc-ability-grid half";
    case "third":
      return "sc-ability-grid third";
    case "quarter":
      return "sc-ability-grid quarter";
    default:
      return "sc-ability-grid single";
  }
};

// Plain ability section (Special Abilities, Movement-style ability lists with
// no weapons but with multiple ability cards arranged in a grid).
const AbilitySection = ({ category, abilities, glossary }) => {
  if (!abilities?.length) return null;
  return (
    <div className="sc-section" data-testid={`sc-section-${category.key}`}>
      <SectionHeading category={category} />
      <div className={abilityGridClass(category)}>
        {abilities.map((ability, idx) => (
          <StarcraftAbility
            key={`${ability.name || "ability"}-${idx}`}
            ability={ability}
            category={category}
            glossary={glossary}
          />
        ))}
      </div>
    </div>
  );
};

// Compact phase-row variant — used for movement-style phases that contain a
// single inline body (no weapon table, no ability grid). Header sits to the
// left of the body inside a thin bordered block.
const InlinePhaseRow = ({ category, abilities, glossary }) => {
  if (!abilities?.length) return null;
  return (
    <div className="sc-phase-row" data-testid={`sc-section-${category.key}`}>
      <SectionHeading category={category} />
      <div className="sc-section-body">
        {abilities.map((ability, idx) => (
          <React.Fragment key={`${ability.name || "ability"}-${idx}`}>
            {idx > 0 && " "}
            <StarcraftAbility ability={ability} category={category} glossary={glossary} inline />
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const WeaponSection = ({ category, weaponTypeDef, weapons, abilities, isMobile, glossary }) => {
  if (!weapons?.length && !abilities?.length) return null;
  const hasAbilities = abilities?.length > 0;
  return (
    <div className="sc-section" data-testid={`sc-section-${weaponTypeDef.key}`}>
      <SectionHeading category={category} label={weaponTypeDef.label} />
      <StarcraftWeaponTable
        weapons={weapons}
        weaponTypeDef={weaponTypeDef}
        isLast={!hasAbilities}
        isMobile={isMobile}
        glossary={glossary}
      />
      {hasAbilities && (
        <div className={abilityGridClass(category)}>
          {abilities.map((ability, idx) => (
            <StarcraftAbility
              key={`${ability.name || "ability"}-${idx}`}
              ability={ability}
              category={category}
              glossary={glossary}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Datasource-native Starcraft TMG Unit card renderer.
 *
 * Layout (matches the Claude Design "SC2 Card" handoff):
 * - Header (full-width, angled bottom-right): name + subtitle, hex-cut stat
 *   tiles, tiered Models/Supply cells, and faction emblem.
 * - Art rail (left, ~250px): dark patterned background with a dashed image
 *   placeholder, the faction tag pill, and the keyword tags line.
 * - Body (right): section blocks for movement, assault, combat, and special
 *   abilities — each in a faction-coloured frame with an angled bottom-right.
 */
export const DsStarcraftUnitCard = ({ card, cardTypeDef, cardStyle, faction, isMobile, onBack, keywordGlossary }) => {
  const schema = cardTypeDef?.schema || {};
  const statFields = schema.stats?.fields || [];
  const abilityCategories = schema.abilities?.categories || [];
  const weaponTypes = schema.weaponTypes?.types || [];

  const groupedAbilities = groupAbilitiesByCategory(card.abilities);

  // Merge faction colours into the CSS variables the LESS file expects. When
  // the datasource omits colours, defaults from starcraft-tmg.less kick in.
  const mergedStyle = {
    ...(cardStyle || {}),
    "--sc-header-colour": faction?.colours?.header || cardStyle?.["--header-colour"] || undefined,
    "--sc-header-dark": faction?.colours?.banner || cardStyle?.["--banner-colour"] || undefined,
    "--sc-accent": faction?.colours?.accent || faction?.colours?.banner || undefined,
  };

  const weaponTypeByKey = Object.fromEntries(weaponTypes.map((wt) => [wt.key, wt]));
  const categoryByKey = Object.fromEntries(abilityCategories.map((c) => [c.key, c]));
  const consumedCategoryKeys = new Set();
  const consumedWeaponKeys = new Set();

  // Resolve which weapon type renders alongside an ability category. A weapon
  // type with `linkedAbilityCategory` referring to this category wins;
  // otherwise fall back to the same-key convention (Starcraft preset).
  const weaponTypeForCategory = (category) => {
    const explicit = weaponTypes.find((wt) => wt.linkedAbilityCategory === category.key);
    if (explicit) return explicit;
    const match = weaponTypeByKey[category.key];
    if (match && !weaponTypes.some((wt) => wt.linkedAbilityCategory && wt.linkedAbilityCategory !== category.key)) {
      return match;
    }
    return match || null;
  };

  // Visibility flags written by the Custom Unit Editor's panel-header toggles.
  // - `card.showPhases[key]` hides the entire combined weapon+ability phase
  //    block (panel-level toggle in the editor)
  // - `card.showAbilities[key]` hides just the ability list inside that block
  //    (per-category toggle inside the SchemaAbilitiesEditor)
  // - `card.showSections[key]` hides a Sections panel (e.g. Models / Supply)
  // - `card.showKeywords` hides the keyword tags + faction pill
  const isPhaseVisible = (key) => card.showPhases?.[key] !== false;
  const isCategoryVisible = (categoryKey) => isPhaseVisible(categoryKey) && card.showAbilities?.[categoryKey] !== false;
  const isWeaponPhaseVisible = (weaponKey) => isPhaseVisible(weaponKey);
  const showKeywords = card.showKeywords !== false;

  // Render an ability category. If a weapon type is linked to this category,
  // produce a combined weapon-table-plus-abilities section block; otherwise
  // a standalone ability list (or the inline movement-phase variant).
  const renderCategorySection = (categoryKey) => {
    const category = categoryByKey[categoryKey];
    if (!category) return null;
    consumedCategoryKeys.add(categoryKey);
    const weaponType = weaponTypeForCategory(category);
    const phaseKey = weaponType ? weaponType.key : categoryKey;
    if (!isPhaseVisible(phaseKey)) {
      if (weaponType) consumedWeaponKeys.add(weaponType.key);
      return null;
    }
    const showAbilities = isCategoryVisible(categoryKey);
    const abilities = showAbilities ? groupedAbilities[categoryKey] || [] : [];
    if (weaponType) {
      consumedWeaponKeys.add(weaponType.key);
      const weapons = card.weapons?.[weaponType.key] || [];
      return (
        <WeaponSection
          key={categoryKey}
          category={category}
          weaponTypeDef={weaponType}
          weapons={weapons}
          abilities={abilities}
          isMobile={isMobile}
          glossary={keywordGlossary}
        />
      );
    }
    if (!showAbilities) return null;
    if (category.layout === "inline") {
      return <InlinePhaseRow key={categoryKey} category={category} abilities={abilities} glossary={keywordGlossary} />;
    }
    return <AbilitySection key={categoryKey} category={category} abilities={abilities} glossary={keywordGlossary} />;
  };

  // Standalone weapon type (no linked or matching ability category).
  const renderStandaloneWeaponSection = (weaponType) => {
    if (!isWeaponPhaseVisible(weaponType.key)) return null;
    const weapons = card.weapons?.[weaponType.key] || [];
    if (!weapons.length) return null;
    return (
      <WeaponSection
        key={weaponType.key}
        category={{ key: weaponType.key, label: weaponType.label, phaseStyle: weaponType.phaseStyle }}
        weaponTypeDef={weaponType}
        weapons={weapons}
        abilities={[]}
        isMobile={isMobile}
        glossary={keywordGlossary}
      />
    );
  };

  const factionKeywords = card.factionKeywords || card.factions || [];
  const primaryFactionTag = factionKeywords[0] || faction?.name || faction?.id || "";
  const tagKeywords = card.keywords || [];

  return (
    <div className={`data-starcraft${isMobile ? " viewer" : ""}`} data-testid="ds-starcraft-unit" style={mergedStyle}>
      <div className={`ds-starcraft-card${card.styling?.autoHeight ? " auto-height" : ""}`} data-name={card.name}>
        <div className="sc-bg-texture" aria-hidden="true" />

        {isMobile && onBack && (
          <button className="sc-back-button" onClick={onBack} type="button" aria-label="Back">
            <ArrowLeft size={20} />
          </button>
        )}

        <StarcraftHeader
          card={card}
          statFields={statFields}
          showSupply={card.showPoints !== false}
          supplyCaption={schema.metadata?.pointsLabel}
        />

        <div className="sc-image-block" aria-hidden="true">
          {showKeywords && primaryFactionTag && <div className="sc-faction-pill">{primaryFactionTag}</div>}
          {showKeywords && tagKeywords.length > 0 && (
            <div className="sc-tags">
              <span className="sc-tags-label">Tags:</span>
              {tagKeywords.join(", ")}
            </div>
          )}
        </div>

        {isMobile && showKeywords && (primaryFactionTag || tagKeywords.length > 0) && (
          <div className="sc-mobile-tags">
            {primaryFactionTag && <span className="sc-mobile-faction-pill">{primaryFactionTag}</span>}
            {tagKeywords.length > 0 && (
              <span className="sc-mobile-tags-list">
                <span className="sc-mobile-tags-label">Tags:</span> {tagKeywords.join(", ")}
              </span>
            )}
          </div>
        )}

        <div className="sc-body">
          {/* Iterate ability categories in schema order — each may resolve to
              either a combined weapon+abilities section or a plain ability
              list / inline phase row. */}
          {abilityCategories.map((cat) => renderCategorySection(cat.key))}

          {/* Weapon types not consumed by a linked category — render their
              tables standalone after the ability-driven sections. */}
          {weaponTypes.filter((wt) => !consumedWeaponKeys.has(wt.key)).map((wt) => renderStandaloneWeaponSection(wt))}
        </div>
      </div>
    </div>
  );
};
