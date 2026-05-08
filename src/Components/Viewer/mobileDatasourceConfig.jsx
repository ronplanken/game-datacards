import React from "react";
import { Warhammer40K10eCardDisplay } from "../Warhammer40k-10e/CardDisplay";
import { Warhammer40KCardDisplay } from "../Warhammer40k/CardDisplay";
import { NecromundaCardDisplay } from "../Necromunda/CardDisplay";
import { AgeOfSigmarCardDisplay } from "../AgeOfSigmar/CardDisplay";
import { CustomCardDisplay } from "../Custom/CustomCardDisplay";
import { MobileFaction } from "./MobileFaction";
import { MobileFactionUnits } from "./MobileFactionUnits";
import { MobileAoSFaction, MobileAoSFactionUnits, MobileAoSManifestationLores, MobileAoSSpellLores } from "./AoS";
import { MobileSettings40k } from "./MobileSettings40k";
import { MobileSettingsAoS } from "./MobileSettingsAoS";

const MobileCustomFaction = React.lazy(() =>
  import("./MobileCustomFaction").then((mod) => ({ default: mod.MobileCustomFaction })),
);
const MobileCustomFactionUnits = React.lazy(() =>
  import("./MobileCustomFactionUnits").then((mod) => ({ default: mod.MobileCustomFactionUnits })),
);

/**
 * Built-in system configurations for mobile viewer.
 * Each entry defines everything the mobile viewer needs to render a game system.
 */
export const BUILTIN_CONFIGS = {
  "40k-10e": {
    label: "Warhammer 40K 10th Edition",
    labelShort: "Warhammer 40,000",
    labelMeta: "10th Edition",
    cssClass: "data-40k-10e",
    selectorCssClass: "gss-option-40k",
    renderCard: (type, { onBack } = {}) => <Warhammer40K10eCardDisplay type={type} />,
    FactionComponent: MobileFaction,
    FactionUnitsComponent: MobileFactionUnits,
    extraRouteViews: [],
    SettingsSection: MobileSettings40k,
    GameSystemSettingsScreen: null,
    useScrollRevealHeader: false,
    scrollRevealTargetSelector: null,
  },
  "40k": {
    label: "Wahapedia 9th Edition",
    labelShort: "Warhammer 40,000",
    labelMeta: "9th Edition",
    cssClass: "data-40k",
    selectorCssClass: "gss-option-40k",
    renderCard: () => <Warhammer40KCardDisplay />,
    FactionComponent: MobileFaction,
    FactionUnitsComponent: MobileFactionUnits,
    extraRouteViews: [],
    SettingsSection: null,
    GameSystemSettingsScreen: null,
    useScrollRevealHeader: false,
    scrollRevealTargetSelector: null,
  },
  basic: {
    label: "Basic Cards",
    labelShort: "Basic Cards",
    labelMeta: null,
    cssClass: "data-basic",
    selectorCssClass: "gss-option-basic",
    renderCard: () => <Warhammer40KCardDisplay />,
    FactionComponent: MobileFaction,
    FactionUnitsComponent: MobileFactionUnits,
    extraRouteViews: [],
    SettingsSection: null,
    GameSystemSettingsScreen: null,
    useScrollRevealHeader: false,
    scrollRevealTargetSelector: null,
  },
  necromunda: {
    label: "Necromunda",
    labelShort: "Necromunda",
    labelMeta: null,
    cssClass: "data-necromunda",
    selectorCssClass: "gss-option-necromunda",
    renderCard: () => <NecromundaCardDisplay />,
    FactionComponent: MobileFaction,
    FactionUnitsComponent: MobileFactionUnits,
    extraRouteViews: [],
    SettingsSection: null,
    GameSystemSettingsScreen: null,
    useScrollRevealHeader: false,
    scrollRevealTargetSelector: null,
  },
  aos: {
    label: "Age of Sigmar",
    labelShort: "Age of Sigmar",
    labelMeta: "4th Edition",
    cssClass: "data-aos",
    selectorCssClass: "gss-option-aos",
    renderCard: (type, { onBack } = {}) => (
      <AgeOfSigmarCardDisplay type={type} onBack={type === "viewer" ? onBack : undefined} />
    ),
    FactionComponent: MobileAoSFaction,
    FactionUnitsComponent: MobileAoSFactionUnits,
    extraRouteViews: [
      { prop: "showManifestationLores", Component: MobileAoSManifestationLores },
      { prop: "showSpellLores", Component: MobileAoSSpellLores },
    ],
    SettingsSection: MobileSettingsAoS,
    GameSystemSettingsScreen: "aos",
    useScrollRevealHeader: true,
    scrollRevealTargetSelector: ".warscroll-unit-name",
    scrollRevealHeaderClass: "mobile-card-header-aos",
  },
  "starcraft-tmg": {
    label: "Starcraft TMG",
    labelShort: "Starcraft",
    labelMeta: "TMG",
    cssClass: "data-custom data-starcraft-mobile",
    selectorCssClass: "gss-option-starcraft",
    renderCard: (type, { onBack } = {}) => (
      <CustomCardDisplay type={type} onBack={type === "viewer" ? onBack : undefined} />
    ),
    FactionComponent: MobileCustomFaction,
    FactionUnitsComponent: MobileCustomFactionUnits,
    extraRouteViews: [],
    SettingsSection: null,
    GameSystemSettingsScreen: null,
    useScrollRevealHeader: true,
    scrollRevealTargetSelector: ".sc-header-name",
    scrollRevealHeaderClass: "mobile-card-header-starcraft",
    scrollRevealTopOffset: -80,
  },
};

/**
 * Build a config for a custom/subscribed/local datasource.
 * Uses CustomCardDisplay for rendering and MobileCustomFaction for browsing.
 */
export const buildCustomConfig = (dataSource) => {
  const baseSystem = dataSource?.schema?.baseSystem;
  const isAos = baseSystem === "aos";
  const isStarcraft = baseSystem === "starcraft-tmg";
  // Append a per-base-system marker so mobile-page chrome (the back-button
  // header / title) can adopt that system's typography. The card itself
  // still owns its `.data-starcraft` (etc.) scope; the marker here is for
  // header/title styling outside the card.
  const cssClass = ["data-custom", isStarcraft ? "data-starcraft-mobile" : null].filter(Boolean).join(" ");
  let scrollRevealTargetSelector = null;
  let scrollRevealHeaderClass = null;
  let scrollRevealTopOffset;
  if (isAos) {
    scrollRevealTargetSelector = ".warscroll-unit-name";
    scrollRevealHeaderClass = "mobile-card-header-aos";
  } else if (isStarcraft) {
    // Reveal once the in-card unit name scrolls out of view, so the card's
    // own back button + name carry the top of the screen until then.
    // Negative offset extends the observer's effective root above the
    // container, keeping the name flagged as "visible" for an extra ~80px
    // of scroll past the actual top — so the page-level header doesn't
    // pop in the instant the name disappears.
    scrollRevealTargetSelector = ".sc-header-name";
    scrollRevealHeaderClass = "mobile-card-header-starcraft";
    scrollRevealTopOffset = -80;
  }
  return {
    label: dataSource?.name || "Custom Datasource",
    labelShort: dataSource?.name || "Custom Datasource",
    labelMeta: null,
    cssClass,
    selectorCssClass: "gss-option-custom",
    renderCard: (type, { onBack } = {}) => (
      <CustomCardDisplay type={type} onBack={type === "viewer" && (isAos || isStarcraft) ? onBack : undefined} />
    ),
    FactionComponent: MobileCustomFaction,
    FactionUnitsComponent: MobileCustomFactionUnits,
    extraRouteViews: [],
    SettingsSection: null,
    GameSystemSettingsScreen: null,
    useScrollRevealHeader: isAos || isStarcraft,
    scrollRevealTargetSelector,
    scrollRevealHeaderClass,
    scrollRevealTopOffset,
  };
};

/**
 * Resolve a mobile config for a given datasource ID.
 * 1. Exact match for built-in systems
 * 2. Prefix match for custom-/subscribed-/local-ds- datasources
 * 3. Fallback to custom config
 */
export const resolveMobileConfig = (datasourceId, dataSource) => {
  if (BUILTIN_CONFIGS[datasourceId]) {
    return BUILTIN_CONFIGS[datasourceId];
  }

  if (
    datasourceId?.startsWith("custom-") ||
    datasourceId?.startsWith("subscribed-") ||
    datasourceId?.startsWith("local-ds-")
  ) {
    return buildCustomConfig(dataSource);
  }

  // Fallback
  return buildCustomConfig(dataSource);
};

// Systems shown on the mobile game system selector screen. Sourced from the
// canonical mobile-systems registry so the welcome wizard and the selector
// stay in sync — see ./mobileGameSystems.js.
export { PRIMARY_MOBILE_SYSTEMS as SELECTOR_SYSTEMS } from "./mobileGameSystems";
