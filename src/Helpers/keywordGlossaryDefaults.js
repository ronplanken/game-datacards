/**
 * Default keyword glossary entries seeded into new `40k-10e` datasources.
 *
 * Each entry mirrors a keyword + explanation pair that the built-in
 * Warhammer 40K 10th Edition cards already explain inline via the
 * Components/Warhammer40k-10e/UnitCard/KeywordTooltip component. Custom
 * datasources opt into the same behavior through the
 * `schema.keywordGlossary` array; this list is the starter set.
 *
 * Fields:
 *   - matchType: "exact" (case-insensitive equality), "prefix"
 *     (case-insensitive startsWith), or "parameterized" for rules with a
 *     variable value like "Sustained Hits 2", "Feel No Pain 5+", or "Melta D6+2".
 *   - appliesTo: scopes in which a renderer may use the entry. Today the
 *     seeded entries are weapon-keyword explanations; future scopes
 *     (abilities, unit-keywords, rules, stratagems, enhancements) will
 *     allow ability-text tooltips, unit keyword bar tooltips, etc.
 *
 * The renderer resolves a keyword to at most one glossary entry by
 * preferring the longest matching `name` so e.g. "Twin-linked" wins over a
 * shorter prefix that happens to be a substring of the same keyword.
 */
export const WARHAMMER_40K_10E_KEYWORD_GLOSSARY = [
  {
    key: "anti",
    name: "Anti-",
    description: "An unmodified Wound roll of 'x+' against a target with the matching keyword scores a Critical Wound.",
    matchType: "parameterized",
    appliesTo: ["weapons"],
  },
  {
    key: "assault",
    name: "Assault",
    description: "Can be shot even if the bearer's unit Advanced.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "blast",
    name: "Blast",
    description:
      "• Add 1 to the Attacks characteristic for every five models in the target unit (rounding down).\n" +
      "• Can never be used against a target that is within Engagement Range of any units from the attacking model's army (including its own).",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "devastating-wounds",
    name: "Devastating Wounds",
    description:
      "Each time an attack is made with such a weapon, if that attack scores a Critical Wound, no saving throw of any kind can be made against that attack (including invulnerable saving throws). Such attacks are only allocated to models after all other attacks made by the attacking unit have been allocated and resolved. After that attack is allocated and after any modifiers are applied, it inflicts a number of mortal wounds on the target equal to the Damage characteristic of that attack, instead of inflicting damage normally.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "extra-attacks",
    name: "Extra Attacks",
    description:
      "Each time the bearer of one or more Extra Attacks weapons fights, it makes attacks with each of the Extra Attacks melee weapons it is equipped with and it makes attacks with one of the melee weapons it is equipped with that does not have the [EXTRA ATTACKS] ability (if any). The number of attacks made with an Extra Attacks weapon cannot be modified by other rules, unless that weapon's name is explicitly specified in that rule.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "feel-no-pain",
    name: "Feel No Pain",
    description:
      "Each time this model would lose a wound, roll one D6: if the result equals or exceeds 'x', that wound is not lost.",
    matchType: "parameterized",
    appliesTo: ["weapons"],
  },
  {
    key: "hazardous",
    name: "Hazardous",
    description:
      "Each time a unit is selected to shoot or fight, after that unit has resolved all of its attacks, for each Hazardous weapon that targets were selected for when resolving those attacks, that unit must take one Hazardous test. To do so, roll one D6: on a 1, that test is failed. For each failed test you must resolve the following sequence (resolve each failed test one at a time).\n" +
      "• If possible, select one model in that unit that has lost one or more wounds and is equipped with one or more Hazardous weapons.\n" +
      "• Otherwise, if possible, select one model in that unit (excluding Character models) equipped with one or more Hazardous weapons.\n" +
      "• Otherwise, select one Character model in that unit equipped with one or more Hazardous weapons.\n" +
      "If a model was selected, that unit suffers 3 mortal wounds and when allocating those mortal wounds, they must be allocated to the selected model.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "heavy",
    name: "Heavy",
    description: "Add 1 to Hit rolls if the bearer's unit Remained Stationary this turn.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "ignores-cover",
    name: "Ignores Cover",
    description:
      "Each time an attack is made with this weapon, the target cannot have the Benefit of Cover against that attack.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "indirect-fire",
    name: "Indirect Fire",
    description:
      "• Can target and make attacks against units that are not visible to the attacking unit.\n" +
      "• If no models are visible in a target unit when it is selected, then when making an attack against that target with an Indirect Fire weapon, subtract 1 from that attack's Hit roll, an unmodified Hit roll of 1-3 always fails, and the target has the Benefit of Cover against that attack.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "lance",
    name: "Lance",
    description:
      "Each time an attack is made with such a weapon, if the bearer made a Charge move this turn, add 1 to that attack's Wound roll.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "lethal-hits",
    name: "Lethal Hits",
    description: "Each time an attack is made with this weapon, a Critical Hit automatically wounds the target.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "linked-fire",
    name: "Linked Fire",
    description:
      "When selecting targets for this weapon, you can measure range and determine visibility from another friendly Fire Prism model that is visible to the bearer.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "melta",
    name: "Melta",
    description:
      "Each time an attack made with this weapon targets a unit within half that weapon's range, that attack's Damage characteristic is increased by the amount denoted by 'x'.",
    matchType: "parameterized",
    appliesTo: ["weapons"],
  },
  {
    key: "one-shot",
    name: "One Shot",
    description: "The bearer can only shoot with this weapon once per battle.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "pistol",
    name: "Pistol",
    description:
      "• Can be shot even if the bearer's unit is within Engagement Range of enemy units, but must target one of those enemy units.\n" +
      "• Cannot be shot alongside any other non-Pistol weapon (except by a Monster or Vehicle).",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "plasma-warhead",
    name: "Plasma Warhead",
    description:
      "The bearer can only shoot with this weapon in your Shooting phase, and only if it Remained Stationary this turn and you did not use its Deathstrike Missile ability to Designate Target or Adjust Target this phase. When the bearer shoots with this weapon, do not select a target. Instead, resolve this weapon's attacks, rolling for each unit within 6\" of the centre of its Deathstrike Target marker individually.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "precision",
    name: "Precision",
    description:
      "When targeting an Attached unit, the attacking model's player can have the attack allocated to a Character model in that unit visible to the bearer.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "psychic",
    name: "Psychic",
    description:
      "If a Psychic weapon or ability causes any unit to suffer one or more wounds, each of those wounds is considered to have been inflicted by a Psychic Attack.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "rapid-fire",
    name: "Rapid Fire",
    description: "Increase the Attacks by 'x' when targeting units within half range.",
    matchType: "parameterized",
    appliesTo: ["weapons"],
  },
  {
    key: "sustained-hits",
    name: "Sustained Hits",
    description: "Each Critical Hit scores 'x' additional hits on the target.",
    matchType: "parameterized",
    appliesTo: ["weapons"],
  },
  {
    key: "torrent",
    name: "Torrent",
    description: "Each time an attack is made with this weapon, that attack automatically hits the target.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "twin-linked",
    name: "Twin-linked",
    description: "Each time an attack is made with this weapon, you can re-roll that attack's Wound roll.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
];
