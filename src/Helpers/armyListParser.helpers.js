// Parser for Warhammer 40,000 app list exports, covering 10th and 11th edition.
//
// PORTED FILE. This is a JavaScript port of `src/lib/army-list/parse.ts` and its
// `types.ts` from the wargaming-streamer-saas repository, where the same module
// is kept byte-identical between the 40k-ez app and the gd streamer app. This
// app is JavaScript with a different prettier config, so a byte-identical copy
// is not possible; the port keeps the structure, the names and the comments so a
// fix made there can be transplanted here line for line.
//
// Four things are added on top of the shared parser, all purely additive so the
// fields it already produces keep their meaning:
//   * `unit.section`  - the raw section header a unit was listed under, which the
//                       importer needs to route ALLIED UNITS to allied factions.
//   * `list.battleSize` - the battle size by name ("Strike Force"), which an 11th
//                       edition list stores to get its Detachment Points budget.
//   * `unit.enhancementCost` - the "(+20 pts)" the export annotates an
//                       enhancement with, which the importer subtracts from the
//                       unit's points to get the datasheet's own cost. The
//                       shared parser strips the annotation and keeps only the
//                       name.
//   * the 10th edition detachment line. 11th edition writes the detachment with
//                       its DP cost, which the shared parser reads; 10th edition
//                       writes it as a bare line under the battle size, and this
//                       app matches enhancements against it. See the branch
//                       marked in parseHeader.
//
// Upstream's CATEGORY_ORDER and CATEGORY_LABELS are deliberately not ported: this
// app groups and labels list sections in listCategories.helpers.js, and a second
// set of labels here would only compete with it.
//
// The app ships several export shapes and users may paste any of them, so the
// parser is deliberately tolerant. Two families are handled:
//
//   Title format   - starts with "<name> (<pts> points/Points)", then faction
//                    lines, then section headers (CHARACTERS, BATTLELINE,
//                    OTHER DATASHEETS, ATTACHED UNITS, ...). Units read as
//                    "<name> (<pts> points)". Sub-bullets (•, ◦) list models
//                    and their weapons.
//   WTC/+++ format - a "+ FACTION KEYWORD:" header block, then CHARACTER /
//                    BATTLELINE / OTHER DATASHEETS sections with "<name>
//                    (<pts> pts)" units. The block is often pasted on top of a
//                    plain title-format export, so both are read.
//
// Name, points, model count, warlord flag, wargear and a display category are
// extracted. The category buckets mirror what the app shows; attached units are
// folded into characters (the leader) and battleline/other (the bodyguard) so
// the list reads as one clean army. Units come out in the order the export
// lists them; grouping them is up to the app.

/**
 * @typedef {"characters"|"battleline"|"transports"|"other"} ArmyListCategory
 * @typedef {"leader"|"bodyguard"|"support"} AttachedRole
 * @typedef {{ group: number, role: AttachedRole }} UnitAttachment
 * @typedef {{ id: string, name: string }} LeaderRef
 * @typedef {{
 *   id: string,
 *   name: string,
 *   points: number|null,
 *   models: number|null,
 *   category: ArmyListCategory,
 *   section: string|null,
 *   isWarlord: boolean,
 *   enhancement: string|null,
 *   enhancementCost: number|null,
 *   wargear: Array<string>,
 *   leaders: Array<LeaderRef>,
 *   attachment: UnitAttachment|null,
 * }} ArmyListUnit
 * @typedef {{
 *   name: string|null,
 *   faction: string|null,
 *   subfaction: string|null,
 *   detachment: string|null,
 *   detachmentPoints: number|null,
 *   disposition: string|null,
 *   battleSize: string|null,
 *   points: number|null,
 *   units: Array<ArmyListUnit>,
 * }} ArmyList
 */

// Trimmed, upper-cased section headers -> bucket. ATTACHED is special: the units
// inside carry their own "Attached as:" line that decides their real bucket.
const SECTION_HEADERS = {
  CHARACTER: "characters",
  CHARACTERS: "characters",
  BATTLELINE: "battleline",
  "BATTLE LINE": "battleline",
  "DEDICATED TRANSPORTS": "transports",
  "DEDICATED TRANSPORT": "transports",
  TRANSPORTS: "transports",
  "OTHER DATASHEETS": "other",
  "OTHER DATASHEET": "other",
  OTHER: "other",
  "ALLIED UNITS": "other",
  ALLIES: "other",
  "ATTACHED UNITS": "attached",
  "ATTACHED UNIT": "attached",
};

// Thousands separators the app emits: a comma, a dot, or a space in any of the
// widths it uses (plain, no-break, narrow no-break, thin). Locale decides which,
// so "1 995", "1,995" and "2.000 Points" all have to read the same. Points are
// always whole numbers, so a dot here is never a decimal point.
const THOUSANDS_SEPARATORS = ",.\\u0020\\u00a0\\u202f\\u2009";

// "<name> (1,995 points)" / "(390 pts)" / "(2 000 Points)". The word after the
// number is required so plain parentheticals like "(132)" (app version) never
// match. A trailing ": <wargear>" is captured because compact exports put a
// unit's weapons after the points on the same line (e.g. "Ghostkeel Battlesuit
// (160 pts): Ghostkeel fists, ..."). A trailing "*" is allowed because 11th
// edition exports footnote a unit that also carries the Battleline keyword, and
// a trailing bracketed or dashed note because players annotate a line
// ("[proxy]", "- Pablo Escobar himself", "-Los Verdugos"). The space in front
// of the dash is what keeps a hyphen inside a name out of it.
const UNIT_LINE = new RegExp(
  `^(.+?)\\s*\\(([\\d${THOUSANDS_SEPARATORS}]+)\\s*(?:points|pts)\\)\\*?(?:\\s*\\[[^\\]]*\\])?(?:\\s*:\\s*(.*?))?(?:\\s+[-\\u2013\\u2014].*)?\\s*$`,
  "i",
);

// The five 11th edition force dispositions. An export names one on its own line
// in the header, between the detachment and the battle size, where a chapter or
// legion would otherwise be read as the subfaction.
const DISPOSITION_NAMES = /^(take and hold|purge the foe|reconnaissance|priority assets|disruption)$/i;

// "+ Total Army Points: 1,995" in the WTC/+++ header block.
const TOTAL_POINTS_LINE = new RegExp(`^total army points:\\s*([\\d${THOUSANDS_SEPARATORS}]+)`, "i");

// The battle sizes the app names. A battle-size line reads exactly like a unit
// line, so it is matched twice: to keep it out of the units, and to read the
// army total off it.
const BATTLE_SIZES = "strike force|incursion|onslaught|combat patrol";

const NON_UNIT_NAMES = new RegExp(`^(?:${BATTLE_SIZES})$`, "i");

// "Strike Force (2,000 Points)", and the same line written without its
// parentheses as "Strike Force 1995pts". Every export states the battle size,
// so it is the one army total that is always there, even when the list has no
// title line to carry one.
const BATTLE_SIZE_LINE = new RegExp(
  `^(${BATTLE_SIZES})\\s*\\(?\\s*([\\d${THOUSANDS_SEPARATORS}]+)\\s*(?:points|pts)\\)?\\s*$`,
  "i",
);

// The app signs its exports off with a build stamp, and some exports run the
// list's own title straight onto the end of it. Left alone the whole thing
// reads as a unit line, putting a datasheet called "Exported with App Version"
// in the list.
const EXPORT_FOOTER = /^exported with app version\b/i;

/**
 * Whether a line that reads like "<name> (<pts> points)" is in fact chrome the
 * export puts around the list: its battle size, or the build stamp it signs off
 * with. Both look exactly like a unit and neither is one.
 */
const isExportChrome = (name) => NON_UNIT_NAMES.test(name) || EXPORT_FOOTER.test(name);

// "Ironstorm Spearhead (3 Detachment Points)", and the same suffix on a
// "+ DETACHMENT:" field. The count is a property of the detachment, not part of
// its name. The name is optional because some exports break the line, leaving a
// bare "(3 Detachment Points)" of its own.
const DETACHMENT_POINTS = /^(.*?)\s*\((\d+)\s*detachment points\)/i;

// Players drop links to a list builder or a theme song in the header, often
// with a few words in front ("Theme song: https://..."). A faction or a chapter
// never carries a link, so the whole line goes, prefix and all.
const CARRIES_LINK = /(?:https?:\/\/|www\.)\S/i;

// Well past the longest real faction or chapter name ("Adeptus Mechanicus" is
// 18). Anything longer in the header is the list's description.
const MAX_FACTION_NAME_LENGTH = 60;

// "3x Wolf Guard" -> count 3. The bullet marker is stripped before matching.
const COUNT_PREFIX = /^(\d+)x\s+/i;

// Compact WTC exports prefix a character with its roster slot, e.g.
// "Char4: 1x Commander ...". The same slot id appears in the header WARLORD line.
const CHAR_PREFIX = /^(char\d+):\s*/i;

// Compact exports write a whole model's loadout on one line, with the model in
// front of it ("1x Broadside Shas'vre: Marker Drone, Shield Drone") and
// per-model counts spelled out either way ("3x Storm Shield", "3 with Close
// combat weapon"). A fragment can carry several of these in a row, e.g.
// "Crisis Shas'ui: 2 with Gun Drone", so they are peeled off until only the
// wargear name is left.
const LOADOUT_PREFIX = /^(?:(?:[^:]+:|\d+\s+with|\d+x)\s*)+/i;

const BULLET_CHARS = "•◦▪‣·*-";

// The app marks a sub-bullet with "◦" under a "•" or "*" parent. Some exports
// indent that second level and some do not, so the marker carries the level on
// its own: a "◦" always sits one step below the bullet above it, indented or
// not. Without this a flat export reads as one level and a squad's weapons look
// like more models.
const SUB_BULLET = "◦";

const stripBullet = (line) => {
  // Indent is the visual depth: leading whitespace, then an optional bullet
  // marker also counts as depth so a "• foo" sits deeper than the line above it
  // even at the same left margin.
  const leading = line.length - line.trimStart().length;
  let rest = line.slice(leading);
  let marker = "";
  if (rest.length > 0 && BULLET_CHARS.includes(rest[0])) {
    marker = rest[0];
    rest = rest.slice(1).trimStart();
  }
  const depth = marker === SUB_BULLET ? 2 : marker ? 1 : 0;
  return { indent: leading + depth, text: rest, bulleted: marker !== "" };
};

const SEPARATOR_RE = new RegExp(`[${THOUSANDS_SEPARATORS}]`, "g");

const toNumber = (raw) => {
  const n = Number(raw.replace(SEPARATOR_RE, ""));
  return Number.isFinite(n) ? n : null;
};

/**
 * What a line inside a unit block says. Everything the parser reads is named
 * here, so each reader picks its kind instead of running its own regex over
 * every line, and wargear is simply what is left over.
 *
 * @param {string} text
 * @returns {{ kind: "attachedAs"|"leading"|"enhancement"|"warlord"|"trailer"|"content", value?: string }}
 */
const classify = (text) => {
  if (/^attached as:/i.test(text)) return { kind: "attachedAs" };
  // WTC exports name the unit a character joins on its own line:
  // "Leading: Zephyrim".
  const leading = text.match(/^leading:\s*(.+)$/i);
  if (leading) return { kind: "leading", value: leading[1].trim() };
  // "Enhancement:" and "Enhancements:", dropping a trailing "(Upgrade)" or
  // "(+15 pts)" annotation the app sometimes appends. The points of that
  // annotation are kept as `cost` (an addition to the shared parser); "(Upgrade)"
  // carries none, so those stay null and the faction data prices them.
  const labelled = text.match(/^enhancements?:\s*(.+?)(?:\s*\((?:upgrade|\+?([\d,]+)\s*pts?)\))?\s*$/i);
  if (labelled)
    return { kind: "enhancement", value: labelled[1].trim(), cost: labelled[2] ? toNumber(labelled[2]) : null };
  if (/^warlord$/i.test(text)) return { kind: "warlord" };
  if (/^exported with/i.test(text)) return { kind: "trailer" };
  // WTC exports write the enhancement with no label at all, just its cost:
  // "Fade to Darkness (+30 pts)".
  const priced = text.match(/^(.+?)\s*\(\+?([\d,]+)\s*pts?\)\s*$/i);
  if (priced) return { kind: "enhancement", value: priced[1].trim(), cost: toNumber(priced[2]) };
  return { kind: "content" };
};

// Reads a unit's body lines into a depth-annotated, classified list. An
// unbulleted line is a continuation of the bullet above it, not a child of it:
// the app wraps a model's extra weapons onto plain indented lines. Pulling them
// up to the bullet's depth keeps model detection and wargear collection honest.
const readBody = (bodyLines) => {
  const out = [];
  let lastBulletIndent = null;
  for (const line of bodyLines) {
    if (line.trim().length === 0) continue;
    const { indent, text, bulleted } = stripBullet(line);
    if (bulleted) lastBulletIndent = indent;
    const count = text.match(COUNT_PREFIX);
    out.push({
      depth: bulleted ? indent : (lastBulletIndent ?? indent),
      bulleted,
      text,
      count: count ? Number(count[1]) : null,
      ...classify(text),
    });
  }
  return out;
};

// The words a name compares on: lowercased, stripped of the leading count, of
// the "Squad" the app appends to some unit names, and of punctuation.
const nameWords = (text) =>
  text
    .replace(COUNT_PREFIX, "")
    .toLowerCase()
    .replace(/\bsquad\b/g, "")
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter(Boolean);

// Whether a body line names the unit itself, which is how a squad writes its
// rank and file: "Daemonettes" lists "9x Daemonette", "Squighog Boyz" lists
// "6x Squighog Boy". The app also shortens the name to the words that identify
// the model ("Hyperadapted Raveners" lists "4x Raveners"), so the line matches
// on the last whole words of the unit name, with the plural one of them carries
// allowed to differ. Only the end of the name, because the front of it is what
// a weapon borrows: "Burna Boyz" lists both "4x Burna Boy", its models, and
// "4x Burna", the flamers they carry. It never runs the other way either, a
// line with more words than the unit name being wargear that took one of them,
// like a Piranha's "Piranha fusion blaster".
const namesTheUnit = (text, unit) => {
  const named = nameWords(text);
  if (named.length === 0 || named.length > unit.length) return false;
  const alike = (a, b) => a === b || ["s", "es", "z"].some((p) => a + p === b || b + p === a);
  const offset = unit.length - named.length;
  return named.every((word, i) => (i === named.length - 1 ? alike(word, unit[offset + i]) : word === unit[offset + i]));
};

/**
 * The lines that name a model, as opposed to a weapon.
 *
 * The app writes a unit as a run of groups, one per model type: the model, then
 * its wargear. Two shapes turn up, and only the first is nested:
 *
 *     • 4x Custodian Guard        • 19x Boy
 *     ◦ 2x Guardian spear         • 17x Choppa
 *     ◦ 1x Misericordia           2x Rokkit launcha
 *                                 • 1x Boss Nob
 *
 * When the wargear nests, the models are simply the counted bullets at the
 * outer depth. When it does not, the model is the counted bullet that *opens* a
 * group, and everything until the next group is its wargear: a bullet is a
 * model only when the line before it was not, which is what separates "19x Boy"
 * from the "17x Choppa" right under it.
 *
 * Some exports lose their indentation on the way in, leaving a model's own
 * wargear bulleted with nothing unbulleted to close the group off. Counts alone
 * cannot read those, because a squad and a lone vehicle write the same shape:
 *
 *     Daemonettes              Stormlord
 *     • 1x Alluress            • 1x Armoured tracks
 *     • 1x Slashing claws      • 2x Heavy stubber
 *     • 9x Daemonette          • 2x Lascannon
 *     • 1x Daemonic Icon       • 1x Vulcan mega-bolter
 *
 * What separates them is the name. A squad's rank and file is named after the
 * unit it fills ("Daemonettes" -> "9x Daemonette"), and a weapon never is, so
 * mid-run only a line naming the unit opens a group. The tank keeps every line
 * as wargear and stays one model.
 *
 * A flat group whose opener is written "1x" is a lone model listing its weapons
 * ("• 1x Armoured tracks • 1x Flamestorm cannon"), so every line in it is
 * wargear and the unit falls back to one model. A higher count means a squad
 * ("• 6x Sanguinary Guard" then its weapons), so the opener is a model.
 *
 * The flat shape still misses the models it cannot name: a squad's second model
 * type, listed under another model's wargear with a name of its own ("1x Nob on
 * Smasha Squig"), reads exactly like wargear. That undercounts a few units
 * rather than multiplying every squad by its weapon list.
 */
const findModelLines = (body, unitName) => {
  const counted = body.filter((l) => l.kind === "content" && l.count !== null);
  const bulletDepths = counted.filter((l) => l.bulleted).map((l) => l.depth);
  // Nothing bulleted at all: a lone character listing only its weapons.
  if (bulletDepths.length === 0) return new Set();
  const modelDepth = Math.min(...bulletDepths);

  // The wargear nests under its model, so every outer bullet is a model.
  if (body.some((l) => l.kind === "content" && l.depth > modelDepth))
    return new Set(counted.filter((l) => l.bulleted && l.depth === modelDepth));

  // The loadout an "X with Y" unit name carries is dropped, because that half
  // names a weapon: a "Big Mek with Shokk Attack Gun" lists "1x Shokk Attack
  // Gun" and is still one model.
  const unit = nameWords(unitName.replace(/\swith\s.*$/i, ""));

  const groups = [];
  // Whether a group is open. The first bullet of a run always opens one; after
  // that only the rank and file does, everything else being its wargear. Rank
  // and file comes several strong, so a lone "1x" naming the unit mid-run is
  // the weapon the unit was named after, like a Skull Cannon's skull cannon.
  let grouped = false;
  for (const line of counted) {
    if (!(line.bulleted && line.depth === modelDepth)) {
      grouped = false;
      continue;
    }
    const rankAndFile = (line.count ?? 0) > 1 && namesTheUnit(line.text, unit);
    if (!grouped || rankAndFile) groups.push({ line, hasWargear: false, rankAndFile });
    else groups[groups.length - 1].hasWargear = true;
    grouped = true;
  }

  // A group that listed no wargear of its own, sitting right in front of the
  // rank and file, is kit the whole unit shares rather than a model of its own:
  // the Bomb Squig a mob of Squighog Boyz brings along. Rank and file is never
  // dropped itself, which no export has needed but is what the rule means.
  const openers = groups
    .filter((g, i) => g.hasWargear || g.rankAndFile || !groups[i + 1]?.rankAndFile)
    .map((g) => g.line);

  const namesModels = openers.length > 1 || (openers[0]?.count ?? 0) > 1;
  return new Set(namesModels ? openers : []);
};

const countModels = (body, modelLines) => {
  // No model line found: a single-model unit as long as it has any content.
  if (modelLines.size === 0) return body.length > 0 ? 1 : null;
  let total = 0;
  for (const line of modelLines) total += line.count ?? 0;
  return total > 0 ? total : null;
};

// Weapons and wargear: the content lines that are not model lines, plus
// whatever trailed the points on the unit line. Counts are stripped and entries
// deduped, so a squad reads "Bolt pistol, Bolt rifle" instead of repeating per
// model.
const collectWargear = (body, modelLines, sameLine) => {
  const seen = new Set();
  const items = [];

  const add = (entry) => {
    for (const part of entry.split(",")) {
      const name = part.trim().replace(LOADOUT_PREFIX, "").trim();
      if (!name) continue;
      const key = name.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      items.push(name);
    }
  };

  if (sameLine) add(sameLine);
  for (const line of body) {
    if (line.kind !== "content") continue;
    if (modelLines.has(line)) continue;
    add(line.text);
  }
  return items;
};

// The bucket for a unit inside an ATTACHED UNITS section, read from its
// "Attached as:" line. Leaders are characters; bodyguards annotated Battleline
// go to battleline, everything else to other.
const attachedCategory = (attachedAs) => {
  if (!attachedAs) return "other";
  if (/leader|character/i.test(attachedAs)) return "characters";
  if (/battleline/i.test(attachedAs)) return "battleline";
  if (/transport/i.test(attachedAs)) return "transports";
  return "other";
};

// The role a unit plays in its attached block, from the same "Attached as:"
// line. Null when the line is missing, so the caller can leave it ungrouped.
const attachedRole = (attachedAs) => {
  if (!attachedAs) return null;
  if (/leader/i.test(attachedAs)) return "leader";
  if (/support/i.test(attachedAs)) return "support";
  if (/bodyguard/i.test(attachedAs)) return "bodyguard";
  return null;
};

// Unit ids are stable within one parse: the name, plus the unit's position to
// keep two squads of the same name apart.
const slug = (name) =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const equalsIgnoringCase = (a, b) => a.localeCompare(b, undefined, { sensitivity: "accent" }) === 0;

// Reads the preamble that precedes the first section header. A list may carry
// a "+ FIELD:" block, a title-format header, or both stacked, so this reads
// whichever parts are present rather than choosing one shape.
const parseHeader = (preamble) => {
  const info = {
    name: null,
    faction: null,
    subfaction: null,
    detachment: null,
    detachmentPoints: null,
    disposition: null,
    battleSize: null,
    points: null,
    warlordCharId: null,
  };

  // A "+ FIELD:" block states some of the header outright. It is not always the
  // whole header though: WTC entries routinely paste the block on top of an
  // ordinary title-format export, so read the block, then carry on reading
  // whatever is left rather than returning on the block alone.
  for (const raw of preamble.filter((l) => l.trim().startsWith("+"))) {
    const line = raw.replace(/^\s*\+\s*/, "").trim();
    const faction = line.match(/^faction(?: keyword| used)?:\s*(.+)$/i);
    if (faction) info.faction ??= faction[1].trim();
    const det = line.match(/^detachment:\s*(.+)$/i);
    if (det && !info.detachment) {
      const value = det[1].trim();
      const withPoints = value.match(DETACHMENT_POINTS);
      info.detachment = withPoints ? withPoints[1].trim() : value;
      if (withPoints) info.detachmentPoints = toNumber(withPoints[2]);
    }
    const disposition = line.match(/^force dispositions?:\s*(.+)$/i);
    if (disposition) info.disposition ??= disposition[1].trim();
    const battleSize = line.match(/^battle size:\s*(.+)$/i);
    if (battleSize) info.battleSize ??= battleSize[1].trim();
    const pts = line.match(TOTAL_POINTS_LINE);
    if (pts) info.points ??= toNumber(pts[1]);
    const wl = line.match(/^warlord:\s*(char\d+)\b/i);
    if (wl) info.warlordCharId ??= wl[1];
  }

  const lines = preamble.map((l) => l.trim()).filter((l) => l.length > 0 && !l.startsWith("+"));
  if (lines.length === 0) return info;

  // Title line: "<name> (<pts> points)". Not every export has one, and when it
  // is missing the first line is already the faction, so only skip it when it
  // really was a title.
  const firstLine = lines[0].match(UNIT_LINE);
  const title = firstLine && !NON_UNIT_NAMES.test(firstLine[1].trim()) ? firstLine : null;
  if (title) {
    info.name = title[1].trim();
    info.points ??= toNumber(title[2]);
  }

  // Skip the first line only when it really was a title. A list that opens on
  // its battle size still has to read that line, or the army total is lost.
  for (const line of title ? lines.slice(1) : lines) {
    const det = line.match(DETACHMENT_POINTS);
    if (det && !info.detachment) {
      // Some exports break the line, leaving a bare "(3 Detachment Points)".
      // The detachment is then the plain line just read, which up to here has
      // been taken for the subfaction.
      const named = det[1].trim();
      const detachment = named || info.subfaction;
      if (detachment) {
        info.detachment = detachment;
        info.detachmentPoints = toNumber(det[2]);
        if (!named) info.subfaction = null;
        continue;
      }
    }
    // Written either as a labelled line ("Force Dispositions: Purge the Foe")
    // or as the bare name on its own line.
    const labelled = line.match(/^force dispositions?:\s*(.*)$/i);
    if (labelled) {
      if (labelled[1].trim()) info.disposition ??= labelled[1].trim();
      continue;
    }
    if (DISPOSITION_NAMES.test(line)) {
      info.disposition ??= line;
      continue;
    }
    const battleSize = line.match(BATTLE_SIZE_LINE);
    if (battleSize) {
      info.battleSize ??= battleSize[1].trim();
      info.points ??= toNumber(battleSize[2]);
      continue;
    }
    // A battle size on its own, with no points beside it, still names the size.
    if (NON_UNIT_NAMES.test(line)) {
      info.battleSize ??= line;
      continue;
    }
    // Skip any parenthetical line (battle size, mission notes) — factions and
    // chapters never carry parentheses.
    if (line.includes("(")) continue;
    // Skip the optional free-text description the app puts under the title. A
    // faction or chapter name is short and is not a sentence, so a long line or
    // one carrying sentence punctuation is prose, not a faction.
    if (line.length > MAX_FACTION_NAME_LENGTH || /\.(\s|$)/.test(line)) continue;
    if (CARRIES_LINK.test(line)) continue;
    // ADDED HERE. The 10th edition detachment, which is a bare line and so has
    // nothing of its own to match on. What places it is the battle size: 10e
    // writes faction, then the chapter if there is one, then the battle size,
    // then the detachment, so the first plain line after the battle size is it.
    // 11e states the detachment with its DP cost and reads it above, well
    // before this, and the disposition is matched by name above too, so neither
    // reaches here. The faction has to be known already, because an export that
    // opens on its battle size has not reached the faction line yet.
    if (info.faction && info.battleSize && !info.detachment) {
      info.detachment = line;
      continue;
    }
    // First two plain lines are faction then subfaction (chapter/legion). A
    // "+ FACTION:" header names the same faction the list then repeats, so a
    // line equal to the faction is that repeat, not a chapter.
    if (!info.faction) info.faction = line;
    else if (!info.subfaction && !equalsIgnoringCase(line, info.faction)) info.subfaction = line;
  }

  return info;
};

// The first line after a leading "+++ ... +++" header block: the first line
// that is not blank and not part of the block ("+++" fences, "+ FIELD:" lines,
// and "&" continuations). Used to find where units start in a compact export
// that lists them straight after the block with no section headers.
const headerBlockEnd = (lines) => {
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (t === "" || t.startsWith("+") || t.startsWith("&")) continue;
    return i;
  }
  return lines.length;
};

// The unit a "Leading:" line points at. Claimed units are off the table, so two
// characters leading two squads of the same name take one each.
const findLedUnit = (units, wanted, claimed) => {
  const want = wanted.toLowerCase();
  const free = units.filter((u) => !claimed.has(u) && u.category !== "characters");
  return (
    free.find((u) => u.name.toLowerCase() === want) ??
    // The two sides do not always spell the unit out in full ("Leading:
    // Zephyrim" against a "Zephyrim Squad"), so fall back to a prefix match.
    free.find((u) => u.name.toLowerCase().startsWith(want) || want.startsWith(u.name.toLowerCase()))
  );
};

// Writes each character's name onto the unit it leads.
const resolveAttachments = (units) => {
  const claimed = new Set();

  for (const character of units) {
    if (character.category !== "characters") continue;

    const ref = { id: character.id, name: character.name };

    if (character.leads) {
      const led = findLedUnit(units, character.leads, claimed);
      if (led) {
        led.leaders.push(ref);
        claimed.add(led);
      }
      continue;
    }

    // Otherwise the units following it in its own block are the ones it leads.
    if (character.block === null) continue;
    for (const other of units) {
      if (other === character || other.block !== character.block) continue;
      if (other.category === "characters") continue;
      // A dedicated transport in the block is not led by the character, it is
      // just bought alongside it.
      if (other.category === "transports") continue;
      other.leaders.push(ref);
    }
  }
};

/**
 * Read a Warhammer 40,000 app list export.
 *
 * @param {string} input - the pasted export
 * @returns {ArmyList}
 */
export const parseArmyList = (input) => {
  const lines = String(input ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n");

  // Normalise every line once, so the section-header lookup below and the main
  // loop share the work.
  const keys = lines.map((l) => l.trim().toUpperCase().replace(/\s+/g, " "));
  const firstSection = keys.findIndex((k) => k in SECTION_HEADERS);

  // Where the unit body begins. With section headers the preamble is everything
  // before the first one. Without them (a compact export that lists units right
  // after the "+++" block) the preamble is that leading block.
  const bodyStart = firstSection >= 0 ? firstSection : headerBlockEnd(lines);
  const header = parseHeader(lines.slice(0, bodyStart));

  const units = [];
  // Null until a section header is seen, so lists with no headers fall back to
  // per-unit inference (a "CharN" slot is a character, everything else "other").
  let currentSection = null;
  // The header as it was written, kept so the importer can tell an ALLIED UNITS
  // section from any other bucket that also maps to "other".
  let currentSectionLabel = null;
  // Numbers the runs of attached units. The export usually labels them
  // ("Attached unit 2") and those labels are what the app grouped by, so they
  // win. Not every app version writes them; without them a new run starts at
  // every leader instead.
  let attachedBlock = 0;
  let labelledBlocks = false;

  // Accumulate the lines that belong to the unit currently being read so its
  // model count and flags can be computed when the next unit or section starts.
  let pending = null;

  const flush = () => {
    if (!pending) return;
    const body = readBody(pending.body);
    const modelLines = findModelLines(body, pending.name);
    const attached = currentSection === "attached";
    const attachedAs = body.find((l) => l.kind === "attachedAs")?.text ?? null;
    const category =
      currentSection === "attached"
        ? attachedCategory(attachedAs)
        : (currentSection ?? (pending.charId ? "characters" : "other"));
    // A leader opens a block, so a character attached as support joins the
    // leader's block instead of starting one of its own. Without the
    // annotation any character opens one, as it always did.
    const opensBlock = attachedAs ? /leader/i.test(attachedAs) : category === "characters";
    if (attached && !labelledBlocks && opensBlock) attachedBlock++;
    // The header names the warlord by roster slot in a compact export, the unit
    // block flags it with a "Warlord" line in every other shape.
    const warlord =
      body.some((l) => l.kind === "warlord") ||
      (pending.charId != null &&
        header.warlordCharId != null &&
        pending.charId.toLowerCase() === header.warlordCharId.toLowerCase());
    const role = attached ? attachedRole(attachedAs) : null;
    units.push({
      id: `${slug(pending.name) || "unit"}-${units.length}`,
      name: pending.name,
      points: pending.points,
      models: pending.count ?? countModels(body, modelLines),
      category,
      section: currentSectionLabel,
      isWarlord: warlord,
      enhancement: body.find((l) => l.kind === "enhancement")?.value ?? null,
      enhancementCost: body.find((l) => l.kind === "enhancement")?.cost ?? null,
      wargear: collectWargear(body, modelLines, pending.sameLineWargear),
      leaders: [],
      attachment: role ? { group: attachedBlock, role } : null,
      block: attached ? attachedBlock : null,
      leads: body.find((l) => l.kind === "leading")?.value ?? null,
    });
    pending = null;
  };

  for (let i = bodyStart; i < lines.length; i++) {
    const raw = lines[i];

    if (keys[i] in SECTION_HEADERS) {
      flush();
      currentSection = SECTION_HEADERS[keys[i]];
      currentSectionLabel = keys[i];
      continue;
    }

    // "Attached unit 1" style sub-labels are not units. They mark where one run
    // of attached units ends and the next begins, which is exactly the grouping
    // to keep.
    if (/^ATTACHED UNIT \d+$/.test(keys[i])) {
      flush();
      labelledBlocks = true;
      attachedBlock++;
      continue;
    }

    // Only a line carrying "(<n> points)" can be a unit line. The cheap check
    // keeps the lazy UNIT_LINE match off the weapon bullets, which are most of
    // the input.
    if (!raw.includes("(")) {
      if (pending) pending.body.push(raw);
      continue;
    }

    const { bulleted } = stripBullet(raw);
    const unitMatch = raw.match(UNIT_LINE);
    // A unit line starts at the left margin and is not bulleted (bulleted
    // "(x pts)" lines are enhancements/wargear inside a unit).
    if (unitMatch && !bulleted && !isExportChrome(unitMatch[1].trim())) {
      flush();
      let name = unitMatch[1].trim();
      // Peel a "CharN:" roster slot, then a leading "Nx" model count, off the
      // name (compact exports carry both; the other export shapes carry neither).
      const charMatch = name.match(CHAR_PREFIX);
      const charId = charMatch ? charMatch[1] : null;
      if (charMatch) name = name.slice(charMatch[0].length);
      const countMatch = name.match(COUNT_PREFIX);
      const count = countMatch ? Number(countMatch[1]) : null;
      if (countMatch) name = name.slice(countMatch[0].length);
      pending = {
        name: name.trim(),
        points: toNumber(unitMatch[2]),
        body: [],
        count,
        charId,
        sameLineWargear: unitMatch[3]?.trim() || null,
      };
      continue;
    }

    if (pending) pending.body.push(raw);
  }
  flush();
  resolveAttachments(units);

  const summedPoints = units.reduce((sum, u) => sum + (u.points ?? 0), 0);

  // Drop the fields that only exist while reading, keeping the export's order.
  // eslint-disable-next-line no-unused-vars
  const display = units.map(({ block, leads, ...unit }) => unit);

  return {
    name: header.name,
    faction: header.faction,
    subfaction: header.subfaction,
    detachment: header.detachment,
    detachmentPoints: header.detachmentPoints,
    disposition: header.disposition,
    battleSize: header.battleSize,
    points: header.points ?? (summedPoints > 0 ? summedPoints : null),
    units: display,
  };
};
