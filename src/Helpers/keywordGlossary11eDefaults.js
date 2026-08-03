/**
 * Default keyword glossary entries seeded into new `40k-11e` datasources.
 *
 * Derived from the 11th edition datasource's shared `keywords.json` (English
 * fields only; `<k>`/`<b>`/`<i>`/`<u>` markup stripped and `<ul>`/`<li>` lists
 * flattened to bullet lines, because custom-datasource tooltips render plain
 * text). Entries already use the custom datasource glossary shape: key, name,
 * description, matchType and appliesTo.
 *
 * Regenerate by re-deriving from `11th/gdc/keywords.json` in the
 * game-datacards/datasources repo when the source glossary changes.
 */
export const WARHAMMER_40K_11E_KEYWORD_GLOSSARY = [
  {
    key: "anti",
    name: "Anti-",
    description:
      "This ability always takes the form [ANTI-X Y+]. Each time an attack is made with an [ANTI] weapon, if the target unit has the keyword denoted by X, an unmodified wound roll of Y+ is a critical wound.\nExample: An attack made with an [ANTI-VEHICLE 4+] weapon against a VEHICLE unit will result in a critical wound on an unmodified wound roll of 4+, while an attack made with an [ANTI-PSYKER 2+] weapon against a PSYKER unit will result in a critical wound on an unmodified wound roll of 2+.",
    matchType: "parameterized",
    appliesTo: ["weapons"],
  },
  {
    key: "assault",
    name: "Assault",
    description:
      "Units containing one or more models with an [ASSAULT] weapon can shoot using assault shooting (10.05).",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "blast",
    name: "Blast",
    description:
      "Each time you gather attack dice for a [BLAST] weapon, add one additional attack dice for every five models that were in the target unit in the Select Targets step (rounding down).\n\nIf this ability takes the form [BLAST X], each time you gather attack dice for such a weapon, add X additional attack dice for every five models that were in the target unit in the Select Targets step (rounding down) instead.\n\nExample: If a [BLAST 2] weapon with an A characteristic of 3 targets a unit containing 12 models, you would gather four additional attack dice for that weapon (for a total of seven for that weapon).",
    matchType: "parameterized",
    appliesTo: ["weapons"],
  },
  {
    key: "bubblechukka",
    name: "Bubblechukka",
    description:
      "Before selecting targets for one or more models equipped with this weapon, roll one D6 to determine which profile models equipped with this weapon will make attacks with, comparing the result with the numbers shown.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "cleave",
    name: "Cleave",
    description:
      "This ability always takes the form [CLEAVE X]. Each time you gather attack dice for a [CLEAVE] weapon, if you only selected one target for all of that weapon’s attacks, add X additional attack dice for every five models that were in the target unit in the Select Targets step (rounding down).\n\nExample: If a [CLEAVE 1] weapon with an A characteristic of 3 targets one unit containing 16 models, you would gather three additional attack dice for that weapon (for a total of six for that weapon).",
    matchType: "parameterized",
    appliesTo: ["weapons"],
  },
  {
    key: "close-quarters",
    name: "CLOSE-QUARTERS",
    description:
      "Units containing one or more models with a [CLOSE-QUARTERS] weapon can shoot using close-quarters shooting (10.06).\n\nWhen using another shooting type, for each model in that unit (excluding MONSTER/VEHICLE models), you can only select one of the following to make attacks with:\n• One or more of its [CLOSE-QUARTERS] weapons.\n• One or more of its other ranged weapons.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "conversion",
    name: "Conversion",
    description:
      'Each time an attack made with this weapon targets an enemy unit that is not within 12", an unmodified successful Hit roll of 4+ scores a Critical Hit.',
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "dead-choppy",
    name: "Dead Choppy",
    description:
      "The Attacks characteristic of this weapon is increased by 1 for each additional Dread klaw the bearer is equipped with.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "devastating-wounds",
    name: "Devastating Wounds",
    description:
      "Each time an attack made with a [DEVASTATING WOUNDS] weapon results in a critical wound, the attack sequence for that attack ends and the target unit suffers a number of mortal wounds equal to the D characteristic of that weapon. These are inflicted after resolving any normal damage inflicted by those attacks.\n\nMortal wounds inflicted by [DEVASTATING WOUNDS] weapons can damage a maximum of one model for each critical wound; any remaining mortal wounds inflicted by that attack are lost.\n\nExample: An attack made with a [DEVASTATING WOUNDS] weapon with a D characteristic of 3 results in a critical wound against an Intercessor Squad, so inflicts 3 mortal wounds. The first 2 mortal wounds are sufficient to destroy 1 Intercessor model, so the remaining mortal wound is lost.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "extra-attacks",
    name: "Extra Attacks",
    description:
      "Each time a unit containing one or more models with an [EXTRA ATTACKS] weapon fights, those models will make attacks with those weapons in addition to any others. In the Select Weapons step (04.01), for each of those models, you must select:\n• All of that model’s [EXTRA ATTACKS] weapons.\n• One of that model’s other melee weapons, if possible.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "harpooned",
    name: "Harpooned",
    description:
      "After the bearer has shot with this weapon, select one enemy **MONSTER** or **VEHICLE** unit hit by one or more of those attacks. Until the end of the turn, each time the bearer selects that unit as a target of a charge, add 2 to the Charge roll.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "hazardous",
    name: "Hazardous",
    description:
      "Each time a unit is selected to shoot or selected to fight, after that unit has resolved all of its attacks, make a number of hazard rolls (06.03) for that unit equal to the number of [HAZARDOUS] weapons you selected in the Select Weapons step.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "heavy",
    name: "Heavy",
    description:
      'In your Shooting phase, each time an attack is made with a [HEAVY] weapon, add 1 to the hit roll if all of the following apply to the attacking unit:\n• That unit is unengaged.\u0007\n• That unit was not set up on the battlefield this turn.\n• No model in that unit has moved moret han 3" this turn.',
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "ignores-cover",
    name: "Ignores Cover",
    description:
      "Each time an attack is made with an [IGNORES COVER] weapon, the target cannot have the benefit of cover against that attack (13.08), including from rules that give a model or unit the benefit of cover (e.g. Stealth).",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "indirect-fire",
    name: "Indirect Fire",
    description:
      "Units containing one or more models with an [INDIRECT FIRE] weapon can shoot using indirect shooting (10.07).",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "lance",
    name: "Lance",
    description:
      "Each time an attack is made with a [LANCE] weapon, if the attacking model’s unit made a charge move this turn, add 1 to the wound roll.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "lethal-hits",
    name: "Lethal Hits",
    description:
      "Each time an attack made with a [LETHAL HITS] weapon results in a critical hit, you can choose for that attack to automatically wound the target.\n\nDesigner’s Note: Choosing to automatically wound the target means that no wound roll is made for that attack. You may decide against this, as it means that attack cannot result in a critical wound and so cannot trigger other abilities such as [DEVASTATING WOUNDS].",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "linked-fire",
    name: "Linked Fire",
    description:
      "When selecting targets for this weapon, you can measure range and determine visibility from another friendly **FIRE PRISM** model that is visible to the bearer. When doing so, this weapon has an Attacks characteristic of 1.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "melta",
    name: "Melta",
    description:
      "This ability always takes the form [MELTA X]. Each time a model makes an attack with a [MELTA] weapon, if the target unit was within half range of that weapon in the Select Targets step, until the attacking unit’s attacks have been resolved, add X to that weapon’s D characteristic.\n\nExample: A model targets a unit that is within half range of a [MELTA 2] weapon with a D characteristic of D6. While resolving those attacks, that weapon has a D characteristic of D6+2",
    matchType: "parameterized",
    appliesTo: ["weapons"],
  },
  {
    key: "one-shot",
    name: "One Shot",
    description:
      "Each weapon with this ability can only be selected to make attacks with once per battle.\n\nIf a destroyed model is returned to a unit, all of its [ONE SHOT] weapons that have already been selected to make attacks with during the battle cannot be selected to make attacks with again.\n\nIf a new unit is added to an army, all [ONE SHOT] weapons in that unit can be selected to make attacks with once per battle.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "overcharge",
    name: "Overcharge",
    description: "Each time the bearer takes a Hazardous test for this weapon profile, subtract 2 from the result.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "pistol",
    name: "Pistol",
    description:
      "Units containing one or more models with a [CLOSE-QUARTERS] weapon can shoot using close-quarters shooting (10.06).\n\nWhen using another shooting type, for each model in that unit (excluding MONSTER/VEHICLE models), you can only select one of the following to make attacks with:\n• One or more of its [CLOSE-QUARTERS] weapons.\n• One or more of its other ranged weapons.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "plasma-warhead",
    name: "Plasma Warhead",
    description:
      'The bearer can only shoot with this weapon in your Shooting phase, and only if it Remained Stationary this turn and you did not use its Deathstrike Missile ability to Designate Target or Adjust Target this phase. When the bearer shoots with this weapon, do not select a target. Instead, resolve this weapon’s attacks, rolling for each unit within 6" of the centre of its Deathstrike Target marker individually.',
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "precision",
    name: "Precision",
    description:
      "While resolving attacks made with one or more [PRECISION] weapons, at the start of the Allocation Order step (05.03), if the target unit contains one or more CHARACTER models visible to one or more of the attacking models, the active player can select one allocation group that contains one of those visible CHARACTER models. If they do, until those attacks are resolved, or until that CHARACTER group is destroyed (whichever happens first), that CHARACTER group is the current allocation group.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "psychic",
    name: "Psychic",
    description:
      "Each time an attack is made with a [PSYCHIC] weapon, you can ignore any or all modifiers to that attack’s BS or WS characteristic and any or all modifiers to the hit roll. Attacks made with [PSYCHIC] weapons are known as psychic attacks (this can be important for the triggering of other rules).",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "psychic-assassin",
    name: "Psychic Assassin",
    description:
      "Each time you select a **Psyker** unit as the target for this weapon, until those attacks are resolved, change the Attacks characteristic of this weapon to 6.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "rapid-fire",
    name: "Rapid Fire",
    description:
      "This ability always takes the form [RAPID FIRE X]. Each time you gather attack dice for a [RAPID FIRE] weapon, add X additional attack dice if the target unit was within half range of that weapon in the Select Targets step.\n\nExample: If a [RAPID FIRE 1] weapon with an A characteristic of 1 targets a unit that is within half range, you would gather one additional attack dice for that weapon (for a total of two for that weapon).",
    matchType: "parameterized",
    appliesTo: ["weapons"],
  },
  {
    key: "reverberating-summons",
    name: "Reverberating Summons",
    description:
      'Each time a model is destroyed by this weapon, you can select one friendly **PLAGUEBEARERS** unit within 12" of the bearer and return 1 destroyed Plaguebearer model to that unit.',
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "snagged",
    name: "Snagged",
    description:
      "Each time this weapon scores a hit against a **MONSTER** or **VEHICLE** unit, until the end of the turn, if the bearer selects that unit as a target of a charge, add 2 to Charge rolls made for the bearer and enemy units cannot use the Fire Overwatch Stratagem to shoot at the bearer.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "sustained-hits",
    name: "Sustained Hits",
    description:
      "This ability always takes the form [SUSTAINED HITS X]. Each time an attack made with a [SUSTAINED HITS] weapon results in a critical hit, that attack results in a number of additional hits on the target as denoted by X.\n\nExample: An attack made with a [SUSTAINED HITS 2] weapon results in a critical hit. That attack therefore hits the target three times (once from the critical hit, and twice more from the [SUSTAINED HITS 2] ability).",
    matchType: "parameterized",
    appliesTo: ["weapons"],
  },
  {
    key: "torrent",
    name: "Torrent",
    description: "Each time an attack is made with a [TORRENT] weapon, that attack automatically hits the target.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "twin-linked",
    name: "Twin-linked",
    description: "Each time an attack is made with a [TWIN-LINKED] weapon, you can re-roll the wound roll.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "deadly-demise",
    name: "Deadly Demise",
    description:
      'This ability always takes the form Deadly Demise X. Each time a model in this unit is destroyed, after the units embarked within it (if any) have made their emergency disembark moves, roll one D6. On a 6, that model suffers a deadly demise; each unit within 6" of that model suffers a number of mortal wounds denoted by X (if this is a random number, roll separately for each unit within 6").\n\nExample: An Impulsor with a unit of Intercessors embarked within it is destroyed by ranged attacks. First, any unresolved attacks made by the attacking unit are resolved. Then the Intercessors make an emergency disembark move. Then the roll is made for the Deadly Demise ability, and on a 6, that ability is resolved. Finally, the Impulsor is removed from the battlefield.',
    matchType: "parameterized",
    appliesTo: ["abilities"],
  },
  {
    key: "deep-strike",
    name: "Deep Strike",
    description:
      'Each time this unit makes an ingress move (20.04), if every model in this unit has this ability, it can be set up anywhere on the battlefield that is more than 8" horizontally from all enemy units, even if that is within your opponent’s deployment zone.',
    matchType: "exact",
    appliesTo: ["abilities"],
  },
  {
    key: "feel-no-pain",
    name: "Feel No Pain",
    description:
      "This ability always takes the form Feel No Pain X+. Each time a model with this ability would lose a wound, roll one D6: on an X+, that wound is not lost.",
    matchType: "parameterized",
    appliesTo: ["abilities"],
  },
  {
    key: "fights-first",
    name: "Fights First",
    description:
      "While every model in a unit has this ability, that unit is a Fights First unit.\n\nSee the Resolve Fights First Combats step in the Fight phase (12.04).",
    matchType: "exact",
    appliesTo: ["abilities"],
  },
  {
    key: "firing-deck",
    name: "Firing Deck",
    description:
      "This ability always takes the form Firing Deck X. In your Shooting phase, each time this TRANSPORT is selected to shoot, if one or more units are embarked within it, resolve the following sequence:\n\n1. Select up to X models embarked within this TRANSPORT (excluding models whose units have already been selected to shoot this phase).\n\n2. For each selected model, select one of its ranged weapons (excluding [ONE SHOT] weapons).\n\n3. Until this TRANSPORT has resolved all of its attacks, it has all of those selected weapons in addition to its other weapons.\n\n4. Until the end of the turn, units embarked within this TRANSPORT are not eligible to shoot.",
    matchType: "parameterized",
    appliesTo: ["abilities"],
  },
  {
    key: "hover",
    name: "Hover",
    description: 'Each time this unit takes to the skies (21.03), do not subtract 2" from the maximum distance.',
    matchType: "exact",
    appliesTo: ["abilities"],
  },
  {
    key: "infiltrators",
    name: "Infiltrators",
    description:
      'During deployment, if every model in a unit has this ability, it can be set up anywhere on the battlefield that is more than 8" horizontally from your opponent’s deployment zone and all enemy units.',
    matchType: "exact",
    appliesTo: ["abilities"],
  },
  {
    key: "leader",
    name: "Leader",
    description:
      "Before the battle, in the Muster Armies step, for each leader and support unit in your army, you can select one friendly bodyguard unit that unit can lead. That unit will then lead that bodyguard unit for the battle and form an attached unit with it.\n\nUnless otherwise stated, each bodyguard unit can only have one leader unit and one support unit attached to it.\n\nSee Attached Units (19)",
    matchType: "exact",
    appliesTo: ["abilities"],
  },
  {
    key: "lone-operative",
    name: "Lone Operative",
    description:
      'Unless part of an attached unit, this unit is not visible to enemy models unless they are within 12" of this unit, and it cannot be targeted by [INDIRECT FIRE] weapons unless the attacking model is within 12" of this unit.\n\nIf this ability takes the form Lone Operative X", unless part of an attached unit, this unit is not visible to enemy models unless they are within X" of this unit, and it cannot be targeted by [INDIRECT FIRE] weapons unless the attacking model is within X" of this unit.',
    matchType: "exact",
    appliesTo: ["abilities"],
  },
  {
    key: "scouts",
    name: "Scouts",
    description:
      'This ability always takes the form Scouts X". In the Resolve Pre-battle Abilities step, if every model in a unit has this ability, you can do one of the following:\n• If that unit is in strategic reserves, you can set up that unit anywhere that is wholly within your deployment zone.\n• If that unit is wholly within your deployment zone, it can make a scout move (24.32).\n• If that unit is embarked within a DEDICATED TRANSPORT that is wholly within your deployment zone, and if every model embarked within that DEDICATED TRANSPORT has the Scouts ability, that DEDICATED TRANSPORT can make a scout move.',
    matchType: "parameterized",
    appliesTo: ["abilities"],
  },
  {
    key: "stealth",
    name: "Stealth",
    description:
      "If every model in a unit has this ability, each time a ranged attack targets that unit, that unit has the benefit of cover against that attack (13.08).",
    matchType: "exact",
    appliesTo: ["abilities"],
  },
  {
    key: "super-heavy-walker",
    name: "Super-heavy Walker",
    description:
      'Each time a unit with this ability makes a normal, advance or fall-back move:\n• Models in that unit can move through models (including MONSTER/VEHICLE models, but excluding TITANIC models) and can move horizontally through sections of terrain features that are 4" or less in height.\n• Before moving that unit, you can select for all models in that unit to have the MOBILE keyword until that move ends. If you do, when that move ends, roll one D6: on a 1, that unit is battle-shocked.\nDesigner’s Note: Gaining the MOBILE keyword for the duration of a move will enable models in that unit to move horizontally through dense terrain features (13.06).',
    matchType: "exact",
    appliesTo: ["abilities"],
  },
  {
    key: "support",
    name: "Support",
    description:
      "Before the battle, in the Muster Armies step, for each leader and support unit in your army, you can select one friendly bodyguard unit that unit can lead. That unit will then lead that bodyguard unit for the battle and form an attached unit with it.\n\nUnless otherwise stated, each bodyguard unit can only have one leader unit and one support unit attached to it.\n\nSee Attached Units (19).",
    matchType: "exact",
    appliesTo: ["abilities"],
  },
];
