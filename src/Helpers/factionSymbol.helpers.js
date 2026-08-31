// Faction symbols are SVGs in the legacy 40k-Data-Card repository, addressed by
// short codes (CSM, CHUL, TAU, ...). Only 10th edition datasheets carry such a
// code in `faction_id`: 11th edition references factions by UUID and custom
// datasources by a slug generated from the faction name, so for those the code
// has to be resolved from the human readable faction name(s) instead.
//
// Keys below are normalised (lowercase, punctuation stripped) so "T'au Empire",
// "Tau Empire" and "t'au  empire" all resolve to the same code. Both the FACTION
// keyword(s) printed on the card and the datasource faction name are used as
// lookup candidates, which is why sub-faction names (chapters, legions, sects)
// map onto their parent's symbol.

const ALIASES = {
  AC: ["adeptus custodes", "custodes", "talons of the emperor"],
  AE: ["aeldari", "asuryani", "craftworlds", "craftworld aeldari", "ynnari"],
  AoI: ["agents of the imperium", "imperial agents", "agents", "inquisition", "officio assassinorum"],
  AM: ["astra militarum", "imperial guard", "militarum tempestus"],
  AS: ["adepta sororitas", "adeptus sororitas", "sisters of battle"],
  AdM: ["adeptus mechanicus", "ad mech", "admech", "cult mechanicus", "skitarii"],
  CD: ["chaos daemons", "daemons", "chaos daemon"],
  CHBA: ["blood angels", "flesh tearers", "blood drinkers"],
  CHBT: ["black templar", "black templars"],
  CHDA: ["dark angels", "unforgiven"],
  CHDW: ["deathwatch"],
  CHIF: ["imperial fists", "crimson fists"],
  CHIH: ["iron hands"],
  CHRG: ["raven guard"],
  CHSA: ["salamanders"],
  CHSW: ["space wolves"],
  CHUL: ["ultramarines"],
  CHWS: ["white scars"],
  CSM: ["chaos space marines", "heretic astartes", "chaos astartes"],
  DG: ["death guard"],
  DRU: ["drukhari", "dark eldar"],
  GC: ["genestealer cults", "genestealer cult", "gsc"],
  GK: ["grey knights"],
  HAR: ["harlequins", "aeldari harlequins"],
  LGAL: ["alpha legion"],
  LGBL: ["black legion"],
  LGEC: ["emperors children"],
  LGIW: ["iron warriors"],
  LGNL: ["night lords"],
  LGRC: ["red corsairs"],
  LGWB: ["word bearers"],
  LoV: ["leagues of votann", "votann"],
  NEC: ["necrons"],
  ORK: ["orks", "ork"],
  QI: ["imperial knights", "questor imperialis"],
  QT: ["chaos knights", "questor traitoris"],
  SM: ["space marines", "adeptus astartes"],
  TAU: ["tau empire", "tau", "farsight enclaves", "vior la", "borkan", "sacea", "dal yth", "kel shan"],
  TS: ["thousand sons"],
  TYR: ["tyranids"],
  WE: ["world eaters"],
};

// Strips accents and punctuation so apostrophes, hyphens and stray whitespace in
// a faction name never decide whether a symbol is found.
export const normalizeFactionName = (name) =>
  String(name ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/^the\s+/, "")
    .replace(/[^a-z0-9]/g, "");

const CODE_BY_NAME = Object.entries(ALIASES).reduce((acc, [code, names]) => {
  names.forEach((name) => {
    acc[normalizeFactionName(name)] = code;
  });
  return acc;
}, {});

// A legacy short code as used by 10th edition (`CSM`, `CHUL`, `AoI`). Custom
// datasource faction ids are slugs ("farsight-enclaves") and 11th edition ids
// are UUIDs, so neither is mistaken for a symbol filename. The required capital
// rules out a short slug that would otherwise pass ("orks"): generateIdFromName
// lowercases, so a generated slug never has one. Matching against the alias
// table's codes instead would drop any 10e code this file does not list.
const LEGACY_CODE_PATTERN = /^(?=.*[A-Z])[A-Za-z]{2,6}$/;

export const isLegacyFactionCode = (factionId) => LEGACY_CODE_PATTERN.test(String(factionId ?? ""));

/** Every symbol code the given names resolve to, most specific name first. */
export const resolveFactionCodes = (names = []) => {
  const codes = [];
  for (const name of names) {
    if (!name) continue;
    const code = CODE_BY_NAME[normalizeFactionName(name)];
    if (code && !codes.includes(code)) codes.push(code);
  }
  return codes;
};

/** The first symbol code the given names resolve to, or null. */
export const resolveFactionCode = (names = []) => resolveFactionCodes(names)[0] ?? null;

/**
 * The faction keyword(s) printed on a card, most specific (last) keyword first.
 * Custom datasources may store them under `factionKeywords`, which is also the
 * field their card renders, so it wins when both are filled. Empty arrays fall
 * through to the other field rather than counting as an answer.
 */
export const factionNamesFromCard = (card) => {
  const keywords = card?.factionKeywords?.length ? card.factionKeywords : card?.factions;
  return Array.isArray(keywords) ? [...keywords].reverse() : [];
};

/**
 * Ordered list of symbol codes to try for a card. The card's own faction id wins
 * when it already is a legacy code (10th edition), and the faction names are
 * tried after it so 11th edition and custom datasource cards still get a symbol.
 */
export const buildFactionIconCandidates = ({ factionId, names = [] } = {}) => {
  const candidates = [];
  if (isLegacyFactionCode(factionId)) candidates.push(factionId);
  resolveFactionCodes(names).forEach((code) => {
    if (!candidates.includes(code)) candidates.push(code);
  });
  return candidates;
};
