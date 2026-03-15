// background colour of the main top banner (not the bit with the unit name on)
// titleBackgroundColour;
// text colour of the top title banner, also does the titles for stats (M, T, Sv, W, etc) and the points container
// titleTextColour;
// text colour in the faction keyword box
// factionTextColour;
// header background colour for weapons, abilities, invulns, etc. and borders of all containers
// headerColour;
// colour for header text and icons
// headerTextColour;
// colour of the stat text (M, T, Sv, W, etc) and invuln save text
// statTextColour;
// colour of the main banner containing the unit name and stat text
// statTitleColour;
// colour of the title of the statline (mostly used when there are two e.g. aspect warriors with exarchs)
// bannerColour;
// background colour of the main text areas (not weapon rows)
// textBackgroundColour;
// background colour of the odd numbered rows for weapons
// rowsColour;
// background colour of the even numbered rows for weapons
// altRowsColour;
// background colour of the unit keywords box
// keywordsBackgroundColour;
// colour for the weapon keyword text like [assault] or [lethal hits]
// weaponKeywordColour;

// colour for the different types of stratagem
// greenStratagemColour;
// blueStratagemColour;
// redStratagemColour;

// AoS background variants override the CSS custom properties defined in aos.less.
// "standard" returns no overrides so the default theme is used.
export const AOS_COLOURS = {
  standard: {},
  light: {
    "--bg-parchment": "#f5f4f0",
    "--bg-header": "#d8d5cc",
    "--header-title-colour": "#2a2a2a",
    "--header-subtitle-colour": "#555555",
    "--text-gold": "#8c7335",
    "--text-light": "#1a1a1a",
    "--border-gold": "#a08c5c",
    "--stat-wheel-gold": "#c5b88a",
    "--stat-wheel-green": "#8aba78",
    "--wheel-bg": "#888888",
    "--wheel-quadrant": "#777777",
    "--banner-colour": "#c5bfb0",
    "--phase-combat": "#daa8a8",
    "--phase-start": "#b8b8b8",
    "--phase-hero": "#e4dca0",
    "--phase-movement": "#d8d8d8",
    "--phase-shooting": "#90c0cc",
    "--phase-charge": "#ecc8a0",
    "--phase-end": "#c0a8cc",
    "--phase-passive": "#e8e8e8",
    "--keywords-bg": "#e8e6df",
    "--keywords-badge-bg": "#c5b88a",
  },
  colourprint: {
    "--bg-parchment": "#ffffff",
    "--bg-header": "#e8e6df",
    "--header-title-colour": "#2a2a2a",
    "--header-subtitle-colour": "#666666",
    "--text-gold": "#8c7335",
    "--text-light": "#1a1a1a",
    "--border-gold": "#a08c5c",
    "--stat-wheel-gold": "#a08c5c",
    "--stat-wheel-green": "#5a8a48",
    "--banner-colour": "#d6d3c9",
    "--phase-combat": "#c47070",
    "--phase-start": "#888888",
    "--phase-hero": "#d4c87a",
    "--phase-movement": "#c8c8c8",
    "--phase-shooting": "#5a9aaa",
    "--phase-charge": "#e0a870",
    "--phase-end": "#9a7aaa",
    "--phase-passive": "#e0e0e0",
    "--keywords-bg": "#f0eeea",
    "--keywords-badge-bg": "#b8a878",
  },
  greyprint: {
    "--bg-parchment": "#ffffff",
    "--bg-header": "#cccccc",
    "--header-title-colour": "#000000",
    "--header-subtitle-colour": "#444444",
    "--text-gold": "#555555",
    "--text-dark": "#000000",
    "--text-light": "#000000",
    "--border-gold": "#999999",
    "--stat-wheel-gold": "#999999",
    "--stat-wheel-green": "#aaaaaa",
    "--banner-colour": "#cccccc",
    "--phase-combat": "#aaaaaa",
    "--phase-start": "#aaaaaa",
    "--phase-hero": "#cccccc",
    "--phase-movement": "#cccccc",
    "--phase-shooting": "#aaaaaa",
    "--phase-charge": "#cccccc",
    "--phase-end": "#aaaaaa",
    "--phase-passive": "#dddddd",
    "--keywords-bg": "#eeeeee",
    "--keywords-badge-bg": "#aaaaaa",
  },
};

export let COLOURS = {
  standard: {
    titleBackgroundColour: "black",
    titleTextColour: "white",
    factionTextColour: "white",
    headerColour: "#456664",
    headerTextColour: "white",
    statTextColour: "#456664",
    statTitleColour: "white",
    bannerColour: "#103344",
    textBackgroundColour: "#dfe0e2",
    rowsColour: "#d8d8da",
    altRowsColour: "#dee3e0",
    keywordsBackgroundColour: "#d8d8da",
    weaponKeywordColour: "#456664",
    greenStratagemColour: "#2c594c",
    blueStratagemColour: "#234461",
  },
  light: {
    titleBackgroundColour: "#dfe0e2",
    titleTextColour: "white",
    factionTextColour: "black",
    headerColour: "#456664",
    headerTextColour: "white",
    statTextColour: "#456664",
    statTitleColour: "#456664",
    bannerColour: "#103344",
    textBackgroundColour: "#dfe0e2",
    rowsColour: "#d8d8da",
    altRowsColour: "#dee3e0",
    keywordsBackgroundColour: "#d8d8da",
    weaponKeywordColour: "#456664",
    greenStratagemColour: "#2c594c",
    blueStratagemColour: "#234461",
    redStratagemColour: "#a2151a",
  },
  colourprint: {
    titleBackgroundColour: "white",
    titleTextColour: "white",
    factionTextColour: "black",
    headerColour: "#456664",
    headerTextColour: "white",
    statTextColour: "#456664",
    statTitleColour: "#456664",
    bannerColour: "#103344",
    textBackgroundColour: "white",
    rowsColour: "white",
    altRowsColour: "#ededed",
    keywordsBackgroundColour: "white",
    weaponKeywordColour: "#456664",
    greenStratagemColour: "#2c594c",
    blueStratagemColour: "#234461",
    redStratagemColour: "#a2151a",
  },
  greyprint: {
    titleBackgroundColour: "white",
    titleTextColour: "black",
    factionTextColour: "black",
    headerColour: "#cccccc",
    headerTextColour: "black",
    statTextColour: "black",
    statTitleColour: "black",
    bannerColour: "#cccccc",
    textBackgroundColour: "white",
    rowsColour: "white",
    altRowsColour: "#ededed",
    keywordsBackgroundColour: "white",
    weaponKeywordColour: "#4f4f4f",
    greenStratagemColour: "#595959",
    blueStratagemColour: "#616161",
    redStratagemColour: "#a3a3a3",
  },
  debug: {
    titleBackgroundColour: "pink",
    titleTextColour: "teal",
    factionTextColour: "black",
    headerColour: "red",
    headerTextColour: "white",
    statTextColour: "aqua",
    statTitleColour: "black",
    bannerColour: "yellow",
    textBackgroundColour: "green",
    rowsColour: "orange",
    altRowsColour: "blue",
    keywordsBackgroundColour: "brown",
    weaponKeywordColour: "purple",
    greenStratagemColour: "green",
    blueStratagemColour: "blue",
    redStratagemColour: "red",
  },
};
