export class BaseNotes {
  name = "";

  equal(other) {
    if (other == null) return false;
    // Weapons in 40k have unique names
    return this.name === other.name;
  }
}

/** A `selection` attached to a unit or model. */
export class Upgrade extends BaseNotes {
  cost = new Costs();
  count = 1;

  getSelectionName() {
    return this.name;
  }

  toString() {
    let string = this.getSelectionName();
    if (this.count > 1) string = `${this.count}x ${string}`;
    if (this.cost.hasValues()) string += ` ${this.cost.toString()}`;
    return string;
  }
}

/** A weapon `profile` that is under a `selection`. */
export class Weapon extends Upgrade {
  selectionName = "";

  range = "";
  type = "Melee";
  str = "user";
  ap = "";
  damage = "";

  abilities = "";

  /**
   * Name of this weapon's `selection`. This is different from name() because
   * name() is used for sorting and deduping weapon profiles.
   */
  getSelectionName() {
    return this.selectionName || this.name;
  }
}

export class WoundTracker extends BaseNotes {
  name = "";
  table = new Map();
}

export class Explosion extends BaseNotes {
  name = "";
  diceRoll = "";
  distance = "";
  mortalWounds = "";
}

export class Psyker extends BaseNotes {
  cast = "";
  deny = "";
  powers = "";
  other = "";
}

export class PsychicPower extends BaseNotes {
  name = "";
  manifest = 0;
  range = "";
  details = "";
}

export const UnitRole = {
  NONE: "NONE",

  // 40k
  SCD: "SCD",
  HQ: "HQ",
  TR: "TR",
  EL: "EL",
  FA: "FA",
  HS: "HS",
  FL: "FL",
  DT: "DT",
  FT: "FT",
  LW: "LW",
  AGENTS: "AGENTS",
  NF: "NF",
};

export const UnitRoleSorting = {
  NONE: 0,

  // 40k
  SCD: 1,
  HQ: 2,
  TR: 3,
  EL: 4,
  FA: 5,
  HS: 6,
  FL: 7,
  DT: 8,
  FT: 9,
  LW: 10,
  AGENTS: 11,
  NF: 12,
};

export const UnitRoleToString = [
  "None",

  // 40k
  "Supreme Command Detachment",
  "HQ",
  "Troops",
  "Elites",
  "Fast Attack",
  "Heavy Support",
  "Flyer",
  "Dedicated Transport",
  "Fortification",
  "Lord of War",
  "Agent of the Imperium",
  "No Force Org Slot",
];

export class Model extends BaseNotes {
  count = 0;

  // Characteristics
  move = '0"';
  ws = "";
  bs = "";
  str = 4;
  toughness = 4;
  wounds = 1;
  attacks = "";
  leadership = 7;
  save = "";

  weapons = [];
  upgrades = [];
  // TODO model upgrades (i.e. tau support systems)
  psyker = null;
  psychicPowers = [];
  explosions = [];

  equal(model) {
    if (model == null) return false;

    if (
      this.name === model.name &&
      this.count === model.count &&
      this.weapons.length === model.weapons.length &&
      this.upgrades.length === model.upgrades.length
    ) {
      for (let wi = 0; wi < this.weapons.length; wi++) {
        if (!this.weapons[wi].equal(model.weapons[wi])) {
          return false;
        }
      }
      for (let wi = 0; wi < this.upgrades.length; wi++) {
        if (!this.upgrades[wi].equal(model.upgrades[wi])) {
          return false;
        }
      }

      // TODO: check for the same psychic powers
      if (this.psyker != null || model.psyker != null) return false;

      return true;
    }
    return false;
  }

  nameAndGear() {
    let name = this.name;

    if (this.weapons.length > 0 || this.upgrades.length > 0) {
      const gear = this.getDedupedWeaponsAndUpgrades();
      name += ` (${gear.map((u) => u.toString()).join(", ")})`;
    }
    return name;
  }

  getDedupedWeaponsAndUpgrades() {
    const deduped = [];
    for (const upgrade of [...this.weapons, ...this.upgrades]) {
      if (!deduped.some((e) => upgrade.getSelectionName() === e.getSelectionName())) {
        deduped.push(upgrade);
      }
    }
    return deduped;
  }

  normalize() {
    this.weapons.sort(CompareWeapon);
    this.upgrades.sort(CompareObj);

    this.normalizeUpgrades(this.weapons);
    this.normalizeUpgrades(this.upgrades);
  }

  normalizeUpgrades(upgrades) {
    for (let i = 0; i < upgrades.length - 1; i++) {
      const upgrade = upgrades[i];
      if (upgrade.name === upgrades[i + 1].name) {
        upgrade.count += upgrades[i + 1].count;
        upgrade.cost.add(upgrades[i + 1].cost);
        upgrades.splice(i + 1, 1);
        i--;
      }
    }
    for (let upgrade of upgrades) {
      if (upgrade.count % this.count == 0) {
        upgrade.count /= this.count;
        upgrade.cost.points /= this.count;
      }
    }
  }
}

export class Unit extends BaseNotes {
  roleRole = UnitRole.NONE;
  factions = new Set();
  keywords = new Set();

  abilities = {};
  rules = new Map();

  models = [];
  modelStats = [];
  modelList = [];
  weapons = [];
  spells = [];
  psykers = [];
  explosions = [];

  cost = new Costs();

  woundTracker = [];
  role = undefined;

  nameWithExtraCosts() {
    const extraCosts = []; // Track extra costs like cabal points.
    for (const freeformCostType in this.cost.freeformValues) {
      if (this.cost.freeformValues[freeformCostType] === 0) continue;
      extraCosts.push(`${this.cost.freeformValues[freeformCostType]}${freeformCostType}`);
    }
    return extraCosts.length ? `${this.name} [${extraCosts.join(", ")}]` : this.name;
  }

  equal(unit) {
    if (unit == null) return false;

    if (
      unit.name === this.name &&
      unit.role === this.role &&
      unit.models.length === this.models.length &&
      unit.modelStats.length === this.modelStats.length
    ) {
      for (let mi = 0; mi < this.models.length; mi++) {
        if (!this.models[mi].equal(unit.models[mi])) {
          return false;
        }
      }

      for (let mi = 0; mi < this.modelStats.length; mi++) {
        if (!this.modelStats[mi].equal(unit.modelStats[mi])) {
          return false;
        }
      }

      // Check how to replace without lodash
      /* if (!.isEqual(this.abilities, unit.abilities)) {
        return false;
      } else if (!.isEqual(this.rules, unit.rules)) {
        return false;
      } */

      return true;
    }
    return false;
  }

  normalize() {
    // Sort force units by role and name
    this.models.sort(CompareModel);
    this.modelStats.sort((a, b) => {
      var wounds_order = parseInt(a.wounds) - parseInt(b.wounds);
      var leadership_order = parseInt(a.leadership) - parseInt(b.leadership);
      var move_order = parseInt(a.move) - parseInt(b.move);
      return -wounds_order || -leadership_order || -move_order || b.name.length - a.name.length;
    });

    for (let model of this.models) {
      model.normalize();
    }

    for (let i = 0; i < this.models.length - 1; i++) {
      const model = this.models[i];

      if (model.nameAndGear() === this.models[i + 1].nameAndGear()) {
        model.count++;
        this.models.splice(i + 1, 1);
        i--;
      }
    }

    for (let i = 0; i < this.modelStats.length - 1; i++) {
      const model = this.modelStats[i];

      if (model.equal(this.modelStats[i + 1])) {
        this.modelStats.splice(i + 1, 1);
        i--;
      }
    }

    this.modelList = this.models.map((model) => (model.count > 1 ? `${model.count}x ` : "") + model.nameAndGear());
    this.weapons = this.models
      .map((m) => m.weapons)
      .reduce((acc, val) => acc.concat(val), [])
      .sort(CompareWeapon)
      .filter((weap, i, array) => weap.name !== array[i - 1]?.name);

    this.spells.push(...this.models.map((m) => m.psychicPowers).reduce((acc, val) => acc.concat(val), []));
    this.psykers.push(...this.models.map((m) => m.psyker).filter((p) => p));
    this.explosions.push(...this.models.map((m) => m.explosions).reduce((acc, val) => acc.concat(val), []));
  }
}

export class Force extends BaseNotes {
  catalog = "";
  faction = "Unknown";
  factionRules = new Map();
  configurations = [];
  rules = new Map();
  units = [];
}

export class Roster40k extends BaseNotes {
  cost = new Costs();
  forces = [];
}

export class Costs {
  commandPoints = 0;
  points = 0;
  freeformValues;

  hasValues() {
    return this.commandPoints !== 0 || this.points !== 0;
  }

  toString() {
    const values = [];
    if (this.points !== 0) values.push(`${this.points} pts`);
    if (this.commandPoints !== 0) values.push(`${this.commandPoints} CP`);
    return `[${values.join(" / ")}]`;
  }

  add(other) {
    this.commandPoints += other.commandPoints;
    this.points += other.points;
    for (const name in other.freeformValues) {
      this.addFreeformValue(name, other.freeformValues[name]);
    }
  }

  addFreeformValue(name, value) {
    if (!this.freeformValues) this.freeformValues = {};
    const oldValue = this.freeformValues[name] || 0;
    this.freeformValues[name] = oldValue + value;
  }
}

export function Create40kRoster(doc) {
  // Determine roster type (game system).
  let info = doc.querySelector("roster");
  if (info) {
    const roster = new Roster40k();

    const name = info.getAttributeNode("name")?.nodeValue;
    if (name) {
      roster.name = name;
    } else {
      roster.name = "40k Army Roster";
    }

    ParseRosterPoints(doc, roster);
    ParseForces(doc, roster);

    return roster;
  }
}

function ParseRosterPoints(doc, roster) {
  let costs = doc.querySelectorAll("roster>costs>cost");
  for (let cost of costs) {
    roster.cost.add(ParseCost(cost));
  }
}

function ParseForces(doc, roster) {
  let forcesRoot = doc.querySelectorAll("roster>forces>force");
  for (let root of forcesRoot) {
    if (root.hasAttribute("name") && root.hasAttribute("catalogueName")) {
      let f = new Force();

      let which = root.getAttributeNode("name")?.nodeValue;
      let value = root.getAttributeNode("catalogueName")?.nodeValue;

      if (which) {
        f.name = which;
      }
      if (value) {
        f.catalog = value;
      }

      // TODO: Determine force faction and faction specific rules.

      // Only include the allegiance rules once.
      if (!DuplicateForce(f, roster)) {
        const rules = root.querySelectorAll("force>rules>rule");
        for (let rule of rules) {
          ExtractRuleDescription(rule, f.rules);
        }
      }

      ParseSelections(root, f);

      roster.forces.push(f);
    }
  }
}

function ParseSelections(root, force) {
  let selections = root.querySelectorAll("force>selections>selection");

  for (let selection of selections) {
    // What kind of selection is this
    let selectionName = selection.getAttributeNode("name")?.nodeValue;
    if (!selectionName) continue;

    if (selectionName.includes("Detachment Command Cost")) {
      // Ignore Detachment Command cost
    } else if (selectionName === "Battle Size" || selectionName === "Gametype") {
      ParseConfiguration(selection, force);
    } else if (selection.querySelector('profile[typeName="Unit"]')) {
      const unit = ParseUnit(selection);
      force.units.push(unit);
      for (const entry of unit.rules.entries()) {
        force.rules.set(entry[0], entry[1]);
      }
    } else if (selection.getAttribute("type") === "upgrade") {
      ExtractRuleFromSelection(selection, force.rules);
      ParseConfiguration(selection, force);
      const props = selection.querySelectorAll("selections>selection");
      for (let prop of props) {
        // sub-faction
        const name = prop.getAttribute("name");
        if (name && prop.getAttribute("type") === "upgrade") {
          if (force.faction === "Unknown") {
            // pick the first upgrade we see
            force.faction = name;
          }
          ExtractRuleFromSelection(prop, force.factionRules);
        }
      }
    } else {
      console.log("** UNEXPECTED SELECTION **", selectionName, selection);
    }
  }

  for (const key of force.factionRules.keys()) {
    force.rules.delete(key);
  }

  // Sort force units by role and name#
  force.units.sort((a, b) => {
    if (UnitRoleSorting[a.role] > UnitRoleSorting[b.role]) return 1;
    else if (UnitRoleSorting[a.role] == UnitRoleSorting[b.role]) {
      if (a.name > b.name) return 1;
      else if (a.name == b.name) return 0;
      return -1;
    }
    return -1;
  });
}

function ParseConfiguration(selection, force) {
  const name = selection.getAttribute("name");
  if (!name) {
    return;
  }
  const category = selection.querySelector("category")?.getAttribute("name");
  const subSelections = selection.querySelectorAll("selections>selection");
  const details = [];
  let costs = GetSelectionCosts(selection);
  for (const sel of subSelections) {
    details.push(sel.getAttribute("name"));
    costs.add(GetSelectionCosts(sel));
  }

  let configuration = !category || category === "Configuration" ? name : `${category} - ${name}`;
  if (details.length > 0) configuration += `: ${details.join(", ")}`;
  if (costs.hasValues()) configuration += ` ${costs.toString()}`;

  force.configurations.push(configuration);
}

function DuplicateForce(force, roster) {
  if (!roster || !force) return false;

  for (let f of roster.forces) {
    if (f.catalog === force.catalog) return true;
  }
  return false;
}

function ExtractRuleFromSelection(root, map) {
  const profiles = root.querySelectorAll("profiles>profile");
  for (const profile of profiles) {
    // detachment rules
    const profileName = profile.getAttribute("name");
    if (!profileName) continue;

    const profileType = profile.getAttribute("typeName");
    if (profileType === "Abilities" || profileType === "Dynastic Code" || profileType === "Household Tradition") {
      ParseProfileCharacteristics(profile, profileName, profileType, map);
    }
  }

  const rules = root.querySelectorAll("rules>rule");
  for (const rule of rules) {
    ExtractRuleDescription(rule, map);
  }
}

function ExtractRuleDescription(rule, map) {
  const ruleName = rule.getAttribute("name");
  const desc = rule.querySelector("description");
  if (ruleName && desc?.textContent) {
    map.set(ruleName, desc.textContent);
  }
}

function LookupRole(roleText) {
  switch (roleText) {
    case "HQ":
      return UnitRole.HQ;
    case "Troops":
      return UnitRole.TR;
    case "Elites":
      return UnitRole.EL;
    case "Fast Attack":
      return UnitRole.FA;
    case "Heavy Support":
      return UnitRole.HS;
    case "Flyer":
      return UnitRole.FL;
    case "Dedicated Transport":
      return UnitRole.DT;
    case "Fortification":
      return UnitRole.FT;
    case "Lord of War":
      return UnitRole.LW;
    case "Agent of the Imperium":
      return UnitRole.AGENTS;
    case "No Force Org Slot":
      return UnitRole.NF;
    case "Primarch | Daemon Primarch | Supreme Commander":
      return UnitRole.SCD;
  }
  return UnitRole.NONE;
}

function ExpandBaseNotes(root, obj) {
  obj.name = root.getAttributeNode("name")?.nodeValue;
  return obj.name;
}

function ExtractNumberFromParent(root) {
  // Get parent node (a selection) to determine model count.
  if (root.parentElement && root.parentElement.parentElement) {
    const parentSelection = root.parentElement.parentElement;
    const countValue = parentSelection.getAttributeNode("number")?.nodeValue;
    if (countValue) {
      return +countValue;
    }
  }

  return 0;
}

function GetImmediateSelections(root) {
  // querySelectorAll(':scope > tagname') doesn't work with jsdom, so we hack
  // around it: https://github.com/jsdom/jsdom/issues/2998
  const selections = [];
  for (const child of root.children) {
    if (child.tagName === "selections") {
      for (const subChild of child.children) {
        if (subChild.tagName === "selection") {
          selections.push(subChild);
        }
      }
    }
  }
  return selections;
}

function HasImmediateProfileWithTypeName(root, typeName) {
  // querySelectorAll(':scope > tagname') doesn't work with jsdom, so we hack
  // around it: https://github.com/jsdom/jsdom/issues/2998
  for (const child of root.children) {
    if (child.tagName === "profiles") {
      for (const subChild of child.children) {
        if (subChild.tagName === "profile" && subChild.getAttribute("typeName") === typeName) {
          return true;
        }
      }
    }
  }
  return false;
}

function GetSelectionCosts(selection) {
  // querySelectorAll(':scope > tagname') doesn't work with jsdom, so we hack
  // around it: https://github.com/jsdom/jsdom/issues/2998

  const costs = new Costs();
  for (const child of selection.children) {
    if (child.tagName === "costs") {
      for (const subChild of child.children) {
        costs.add(ParseCost(subChild));
      }
    }
  }
  return costs;
}

function ParseCost(cost) {
  const costs = new Costs();
  const which = cost.getAttribute("name");
  const value = cost.getAttribute("value");
  if (which && value) {
    if (which === "pts") {
      costs.points += +value;
    } else if (which === "CP") {
      costs.commandPoints += +value;
    } else {
      costs.addFreeformValue(which, +value);
    }
  }
  return costs;
}

function ParseUnit(root) {
  let unit = new Unit();
  const unitName = ExpandBaseNotes(root, unit);

  let categories = root.querySelectorAll("categories>category");
  for (let cat of categories) {
    const catName = cat.getAttributeNode("name")?.nodeValue;
    if (catName) {
      const factPattern = "Faction: ";
      const factIndex = catName.lastIndexOf(factPattern);
      if (factIndex >= 0) {
        const factKeyword = catName.slice(factIndex + factPattern.length);
        unit.factions.add(factKeyword);
      } else {
        const roleText = catName.trim();
        let unitRole = LookupRole(roleText);
        if (unitRole != UnitRole.NONE) {
          unit.role = unitRole;
        } else {
          // Keyword
          unit.keywords.add(catName);
        }
      }
    }
  }

  const seenProfiles = [];

  // First, find model stats. These have typeName=Unit.
  const modelStatsProfiles = Array.from(root.querySelectorAll('profile[typeName="Unit"],profile[typeName="Model"]'));
  ParseModelStatsProfiles(modelStatsProfiles, unit, unitName);
  seenProfiles.push(...modelStatsProfiles);

  // Next, look for selections with models. These usually have type="model",
  // but may have type="upgrade" containing a profile of type="Unit".
  const modelSelections = [];
  if (root.getAttribute("type") === "model") {
    modelSelections.push(root); // Single-model unit.
  } else {
    const immediateSelections = GetImmediateSelections(root);
    for (const selection of immediateSelections) {
      if (selection.getAttribute("type") === "model" || HasImmediateProfileWithTypeName(selection, "Unit")) {
        modelSelections.push(selection);
      }
    }
    // Some units are under a root selection with type="upgrade".
    if (modelSelections.length === 0) {
      modelSelections.push(...Array.from(root.querySelectorAll('selection[type="model"]')));
    }
    // Some single-model units have type="unit" or type="upgrade".
    if (modelSelections.length === 0 && HasImmediateProfileWithTypeName(root, "Unit")) {
      modelSelections.push(root);
    }
  }

  // Now, parse the model -- profiles for stats, and selections for upgrades.
  for (const modelSelection of modelSelections) {
    const profiles = Array.from(modelSelection.querySelectorAll("profiles>profile"));
    const unseenProfiles = profiles.filter((e) => !seenProfiles.includes(e));
    seenProfiles.push(...unseenProfiles);

    const model = new Model();
    model.name = modelSelection.getAttribute("name") || "Unknown Model";
    model.count = Number(modelSelection.getAttribute("number") || 1);
    unit.models.push(model);

    // Find stats for all profiles (weapons, powers, abilities, etc).
    ParseModelProfiles(profiles, model, unit);

    // Find all upgrades on the model. This may include weapons that were
    // parsed from profiles (above), so dedupe those in nameAndGear().
    for (const upgradeSelection of modelSelection.querySelectorAll('selections>selection[type="upgrade"]')) {
      // Ignore selections without abilities but with sub-selection upgrades,
      // since those sub-selections will be picked up individually.
      if (
        upgradeSelection.querySelector('selections>selection[type="upgrade"]') &&
        !HasImmediateProfileWithTypeName(upgradeSelection, "Abilities")
      )
        continue;

      let upgradeName = upgradeSelection.getAttribute("name");
      if (upgradeName) {
        const upgrade = new Upgrade();
        upgrade.name = upgradeName;
        upgrade.cost = GetSelectionCosts(upgradeSelection);
        upgrade.count = Number(upgradeSelection.getAttribute("number"));
        model.upgrades.push(upgrade);
      }
    }
  }

  // Finally, look for profiles that are not under models. They may apply to
  //    a) model loadouts, if it's selection with a Weapon (eg Immortals)
  //    b) unit loadout, if it's a selection with an Ability (eg Bomb Squigs)
  //    c) abilities for the unit, if it's not under a child selection
  let profiles = Array.from(root.querySelectorAll("profiles>profile"));
  let unseenProfiles = profiles.filter((e) => !seenProfiles.includes(e));
  seenProfiles.push(...unseenProfiles);
  if (unseenProfiles.length > 0) {
    const unitUpgradesModel = new Model();
    unitUpgradesModel.name = "Unit Upgrades";
    ParseModelProfiles(unseenProfiles, unitUpgradesModel, unit);
    if (unitUpgradesModel.weapons.length > 0 && unit.models.length > 0) {
      // Apply weapons at the unit level to all models in the unit.
      for (const model of unit.models) {
        model.weapons.push(...unitUpgradesModel.weapons);
      }
      unitUpgradesModel.weapons.length = 0; // Clear the array.
    }
    if (unitUpgradesModel.psychicPowers.length > 0) {
      // Add spells to the unit's spell list. However, we'll still need
      // to add spell upgrade selections to the upgrade list, below.
      unit.spells.push(...unitUpgradesModel.psychicPowers);
      unitUpgradesModel.psychicPowers.length = 0;
    }
    if (unitUpgradesModel.psyker) {
      unit.psykers.push(unitUpgradesModel.psyker);
      unitUpgradesModel.psyker = null;
    }
    if (unitUpgradesModel.explosions.length > 0) {
      unit.explosions.push(...unitUpgradesModel.explosions);
      unitUpgradesModel.explosions.length = 0;
    }

    // Look for any unit-level upgrade selections that we didn't catch
    // previously, and stuff them in the "Unit Upgrades" model.
    for (const selection of GetImmediateSelections(root)) {
      if (selection.getAttribute("type") !== "upgrade") continue;
      // Ignore model selections (which were already processed).
      if (modelSelections.includes(selection)) continue;
      // Ignore unit-level weapon selections; these were handled above.
      if (selection.querySelector('profiles>profile[typeName="Weapon"]')) continue;

      let name = selection.getAttribute("name");
      if (!name) continue;

      const upgrade = new Upgrade();
      upgrade.name = name;
      upgrade.cost = GetSelectionCosts(selection);
      upgrade.count = Number(selection.getAttribute("number"));
      unitUpgradesModel.upgrades.push(upgrade);
    }

    if (unitUpgradesModel.weapons.length > 0 || unitUpgradesModel.upgrades.length > 0) {
      unit.models.push(unitUpgradesModel);
    }
  }

  // Only match costs->costs associated with the unit and not its children (model and weapon) costs.
  let costs = root.querySelectorAll("costs>cost");
  for (let cost of costs) {
    unit.cost.add(ParseCost(cost));
  }

  let rules = root.querySelectorAll("rules > rule");
  for (let rule of rules) {
    ExtractRuleDescription(rule, unit.rules);
  }

  unit.normalize();
  return unit;
}

function ParseModelStatsProfiles(profiles, unit, unitName) {
  for (const profile of profiles) {
    const profileName = profile.getAttribute("name");
    const profileType = profile.getAttribute("typeName");
    if (!profileName || !profileType) return;

    const model = new Model();
    model.name = profileName;
    unit.modelStats.push(model);

    ExpandBaseNotes(profile, model);

    const chars = profile.querySelectorAll("characteristics>characteristic");
    for (const char of chars) {
      const charName = char.getAttribute("name");
      if (!charName) continue;

      if (char.textContent) {
        switch (charName) {
          case "M":
            model.move = char.textContent;
            break;
          case "WS":
            model.ws = char.textContent;
            break;
          case "BS":
            model.bs = char.textContent;
            break;
          case "S":
            model.str = +char.textContent;
            break;
          case "T":
            model.toughness = +char.textContent;
            break;
          case "W":
            model.wounds = +char.textContent;
            break;
          case "A":
            model.attacks = char.textContent;
            break;
          case "Ld":
            model.leadership = +char.textContent;
            break;
          case "Save":
            model.save = char.textContent;
            break;
        }
      }
    }
  }
}

function ParseModelProfiles(profiles, model, unit) {
  for (const profile of profiles) {
    const profileName = profile.getAttribute("name");
    const typeName = profile.getAttribute("typeName");
    if (!profileName || !typeName) continue;

    if (typeName === "Unit" || typeName === "Model" || profile.getAttribute("type") === "model") {
      // Do nothing; these were already handled.
    } else if (typeName === "Weapon") {
      const weapon = ParseWeaponProfile(profile);
      model.weapons.push(weapon);
    } else if (typeName.includes("Wound Track") || typeName.includes("Stat Damage") || typeName.includes(" Wounds")) {
      const tracker = ParseWoundTrackerProfile(profile);
      unit.woundTracker.push(tracker);
    } else if (typeName == "Psychic Power") {
      const power = ParsePsychicPowerProfile(profile);
      model.psychicPowers.push(power);
    } else if (typeName.includes("Explosion")) {
      const explosion = ParseExplosionProfile(profile);
      model.explosions.push(explosion);
    } else if (typeName == "Psyker") {
      model.psyker = ParsePsykerProfile(profile);
    } else {
      // Everything else, like Prayers and Warlord Traits.
      if (!unit.abilities.Abilities) unit.abilities["Abilities"] = new Map();
      ParseProfileCharacteristics(profile, profileName, typeName, unit.abilities.Abilities);
    }
  }
}

function ParseProfileCharacteristics(profile, profileName, typeName, map) {
  const chars = profile.querySelectorAll("characteristics>characteristic");
  for (const char of chars) {
    if (!char.textContent) continue;

    const charName = char.getAttribute("name");
    if (charName && chars.length > 1) {
      // Profiles with multiple characteristics need to distinguish them by name.
      map.set([profileName, charName.toString()].join(" - "), char.textContent);
    } else {
      // Profiles with a single characteristic can ignore the char name.
      if (!map) {
        debugger;
      }
      map.set(profileName, char.textContent);
    }
  }
}

function ParseWeaponProfile(profile) {
  const weapon = new Weapon();
  ExpandBaseNotes(profile, weapon);
  weapon.count = ExtractNumberFromParent(profile);

  let chars = profile.querySelectorAll("characteristics>characteristic");
  for (let char of chars) {
    let charName = char.getAttribute("name");
    if (charName) {
      if (char.textContent) {
        switch (charName) {
          case "Range":
            weapon.range = char.textContent;
            break;
          case "Type":
            weapon.type = char.textContent;
            break;
          case "S":
            weapon.str = char.textContent;
            break;
          case "AP":
            weapon.ap = char.textContent;
            break;
          case "D":
            weapon.damage = char.textContent;
            break;
          case "Abilities":
            weapon.abilities = char.textContent;
            break;
        }
      }
    }
  }
  // Keep track of the weapon's parent selection for its name, unless the
  // weapon is directly under the unit's profile.
  const selection = profile.parentElement?.parentElement;
  const selectionName = selection?.getAttribute("name");
  if (selection?.getAttribute("type") === "upgrade" && selectionName) {
    weapon.selectionName = selectionName;
    weapon.cost = GetSelectionCosts(selection);
  }
  return weapon;
}

function ParseWoundTrackerProfile(profile) {
  let tracker = new WoundTracker();
  ExpandBaseNotes(profile, tracker);
  let chars = profile.querySelectorAll("characteristics>characteristic");
  for (let char of chars) {
    const charName = char.getAttribute("name");
    if (charName) {
      if (char.textContent) {
        tracker.table.set(charName, char.textContent);
      } else {
        tracker.table.set(charName, "-");
      }
    }
  }
  return tracker;
}

function ParsePsychicPowerProfile(profile) {
  const power = new PsychicPower();
  ExpandBaseNotes(profile, power);

  const chars = profile.querySelectorAll("characteristics>characteristic");
  for (let char of chars) {
    const charName = char.getAttribute("name");
    if (charName && char.textContent) {
      switch (charName) {
        case "Range":
          power.range = char.textContent;
          break;
        case "Warp Charge":
          power.manifest = +char.textContent;
          break;
        case "Details":
          power.details = char.textContent;
          break;
      }
    }
  }
  return power;
}

function ParseExplosionProfile(profile) {
  const explosion = new Explosion();
  ExpandBaseNotes(profile, explosion);

  const chars = profile.querySelectorAll("characteristics>characteristic");
  for (const char of chars) {
    const charName = char.getAttribute("name");
    if (charName && char.textContent) {
      switch (charName) {
        case "Dice Roll":
          explosion.diceRoll = char.textContent;
          break;
        case "Distance":
          explosion.distance = char.textContent;
          break;
        case "Mortal Wounds":
          explosion.mortalWounds = char.textContent;
          break;
      }
    }
  }
  return explosion;
}

function ParsePsykerProfile(profile) {
  const psyker = new Psyker();
  ExpandBaseNotes(profile, psyker);

  const chars = profile.querySelectorAll("characteristics>characteristic");
  for (const char of chars) {
    const charName = char.getAttribute("name");
    if (charName && char.textContent) {
      switch (charName) {
        case "Cast":
          psyker.cast = char.textContent;
          break;
        case "Deny":
          psyker.deny = char.textContent;
          break;
        case "Powers Known":
          psyker.powers = char.textContent;
          break;
        case "Other":
          psyker.other = char.textContent;
          break;
      }
    }
  }
  return psyker;
}

function CompareObj(a, b) {
  return Compare(a.name, b.name);
}

function CompareModel(a, b) {
  if (a.name === b.name) {
    return Compare(a.nameAndGear(), b.nameAndGear());
  } else if (a.name === "Unit Upgrades") {
    // "Unit Upgrades", a special model name, is always sorted last.
    return 1;
  } else if (b.name === "Unit Upgrades") {
    // "Unit Upgrades", a special model name, is always sorted last.
    return -1;
  } else {
    return Compare(a.name, b.name);
  }
}

export function CompareWeapon(a, b) {
  const aType = a.type.startsWith("Grenade") ? 2 : a.type.startsWith("Melee") ? 1 : 0;
  const bType = b.type.startsWith("Grenade") ? 2 : b.type.startsWith("Melee") ? 1 : 0;
  return aType - bType || a.name.localeCompare(b.name);
}

export function Compare(a, b) {
  if (a > b) return 1;
  else if (a == b) return 0;
  return -1;
}
