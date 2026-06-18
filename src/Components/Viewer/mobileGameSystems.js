// Canonical registry of "primary" built-in game systems shown in the mobile
// UI: the welcome wizard's game-system step and the mobile selector screen.
// Add a new system here once and it appears in both.
//
// Fields:
//   id        - datasource id used by the rest of the app
//   name      - short label rendered on the compact selector
//   meta      - short subtitle rendered on the compact selector
//   longName  - optional fuller label, used by the welcome wizard
//   longMeta  - optional fuller subtitle, used by the welcome wizard
//   cssClass  - per-system class consumed by selector CSS (gss-option-*)
//   color     - hex used by the wizard for the accent bar / translucent fills
export const PRIMARY_MOBILE_SYSTEMS = [
  {
    id: "40k-11e",
    name: "Warhammer 40,000",
    meta: "11th Edition",
    cssClass: "gss-option-40k",
    color: "#8b2020",
  },
  {
    id: "40k-10e",
    name: "Warhammer 40,000",
    meta: "10th Edition",
    cssClass: "gss-option-40k",
    color: "#8b2020",
  },
  {
    id: "aos",
    name: "Age of Sigmar",
    meta: "4th Edition",
    cssClass: "gss-option-aos",
    color: "#c9a227",
  },
  {
    id: "starcraft-tmg",
    name: "Starcraft",
    meta: "TMG",
    longName: "Starcraft 2 TMG",
    longMeta: "Tabletop Miniatures Game",
    cssClass: "gss-option-starcraft",
    color: "#7c3aed",
  },
];
