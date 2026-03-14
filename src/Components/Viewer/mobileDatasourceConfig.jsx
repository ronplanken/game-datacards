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
  },
};

/**
 * Build a config for a custom/subscribed/local datasource.
 * Uses CustomCardDisplay for rendering and MobileCustomFaction for browsing.
 */
export const buildCustomConfig = (dataSource) => {
  const isAos = dataSource?.schema?.baseSystem === "aos";
  return {
    label: dataSource?.name || "Custom Datasource",
    labelShort: dataSource?.name || "Custom Datasource",
    labelMeta: null,
    cssClass: "data-custom",
    selectorCssClass: "gss-option-custom",
    renderCard: (type, { onBack } = {}) => (
      <CustomCardDisplay type={type} onBack={type === "viewer" && isAos ? onBack : undefined} />
    ),
    FactionComponent: MobileCustomFaction,
    FactionUnitsComponent: MobileCustomFactionUnits,
    extraRouteViews: [],
    SettingsSection: null,
    GameSystemSettingsScreen: null,
    useScrollRevealHeader: isAos,
    scrollRevealTargetSelector: isAos ? ".warscroll-unit-name" : null,
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

/**
 * Systems shown on the game system selector screen.
 * These are the primary systems with full support.
 */
export const SELECTOR_SYSTEMS = [
  { id: "40k-10e", name: "Warhammer 40,000", meta: "10th Edition", cssClass: "gss-option-40k" },
  { id: "aos", name: "Age of Sigmar", meta: "4th Edition", cssClass: "gss-option-aos" },
];
