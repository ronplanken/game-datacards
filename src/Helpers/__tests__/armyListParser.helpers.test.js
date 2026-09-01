// PORTED FILE. Copied from `src/lib/army-list/parse.test.ts` in the
// wargaming-streamer-saas repository, with its TypeScript annotations dropped.
// Keep it in step with that file: a parser fix made there should arrive here
// with the test that proves it.

import { describe, it, expect } from "vitest";
import { parseArmyList } from "../armyListParser.helpers";
import {
  BARK_AT_THE_MOON,
  CHAOS_DAEMONS_WTC,
  LOGAN_STEEL_CHAIR,
  WORLD_EATERS,
  IRONSTORM,
  TAU_MONTKA,
  SORORITAS_LEADING,
  RED_GEAR_SPACED_POINTS,
} from "./armyListParser.fixtures";

// Look up the first unit whose name matches, for per-unit assertions.
function unit(list, name) {
  const found = list.units.find((u) => u.name === name);
  if (!found) throw new Error(`unit not found: ${name}`);
  return found;
}

function leaderNames(unit) {
  return unit.leaders.map((l) => l.name);
}

function countByCategory(list, category) {
  return list.units.filter((u) => u.category === category).length;
}

describe("parseArmyList - title format (Bark at the Moon)", () => {
  const list = parseArmyList(BARK_AT_THE_MOON);

  it("reads the list name and total points from the title line", () => {
    expect(list.name).toBe("Bark at the Moon");
    expect(list.points).toBe(1990);
  });

  it("reads faction, chapter and detachment from the header", () => {
    expect(list.faction).toBe("Space Marines");
    expect(list.subfaction).toBe("Space Wolves");
    expect(list.detachment).toBe("Legends of Saga and Song and Saga of the Beastslayer");
  });

  it("parses every unit and drops battle-size and app-version noise", () => {
    expect(list.units).toHaveLength(15);
    expect(list.units.map((u) => u.name)).not.toContain("Strike Force");
  });

  it("folds attached leaders into characters and bodyguards into other", () => {
    // 3 attached leaders + 3 standalone characters.
    expect(countByCategory(list, "characters")).toBe(6);
    expect(countByCategory(list, "battleline")).toBe(3);
    // 3 attached bodyguards + Gladiator + Scouts + Wulfen.
    expect(countByCategory(list, "other")).toBe(6);
  });

  it("counts models: single characters are 1, squads sum their members", () => {
    expect(unit(list, "Logan Grimnar").models).toBe(1);
    expect(unit(list, "Wolf Guard Terminators").models).toBe(5); // 1 leader + 4
    expect(unit(list, "Wolf Guard Headtakers").models).toBe(6);
    expect(unit(list, "Bjorn the Fell-Handed").models).toBe(1);
    expect(unit(list, "Intercessor Squad").models).toBe(5);
    expect(unit(list, "Gladiator Lancer").models).toBe(1); // vehicle
    expect(unit(list, "Scout Squad").models).toBe(5);
    expect(unit(list, "Wulfen with Storm Shields").models).toBe(10);
  });

  it("reads enhancements", () => {
    expect(unit(list, "Wolf Guard Battle Leader").enhancement).toBe("Wolf-touched");
  });

  it("keeps the order the export lists the units in", () => {
    // Grouping them by category is left to the app that shows the list.
    expect(list.units[0].name).toBe("Logan Grimnar");
    expect(list.units[1].name).toBe("Wolf Guard Terminators");
  });

  it("flags the warlord and gives every unit a unique id", () => {
    expect(unit(list, "Logan Grimnar").isWarlord).toBe(true);
    expect(unit(list, "Wolf Guard Terminators").isWarlord).toBe(false);
    const ids = list.units.map((u) => u.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("reads wargear from the deepest bullet level", () => {
    expect(unit(list, "Logan Grimnar").wargear).toEqual(["Axe Morkai", "Storm bolter", "Tyrnak and Fenrir"]);
    // Squad weapons are deduped, and the model lines are not wargear.
    expect(unit(list, "Wolf Guard Headtakers").wargear).toEqual([
      "Heavy bolt pistol",
      "Master-crafted power weapon",
      "Storm Shield",
    ]);
    expect(unit(list, "Wolf Guard Headtakers").wargear).not.toContain("Wolf Guard Headtaker");
  });

  it("keeps parser-owned lines out of the wargear", () => {
    const logan = unit(list, "Logan Grimnar");
    expect(logan.wargear).not.toContain("Warlord");
    expect(logan.wargear.some((w) => /^attached as:/i.test(w))).toBe(false);
    const leader = unit(list, "Wolf Guard Battle Leader");
    expect(leader.enhancement).toBe("Wolf-touched");
    expect(leader.wargear.some((w) => /enhancement/i.test(w))).toBe(false);
    // The export ends with an "Exported with App Version: ..." trailer, which
    // would otherwise attach to the last unit.
    expect(list.units.every((u) => u.wargear.every((w) => !/app version/i.test(w)))).toBe(true);
  });
});

describe('parseArmyList - WTC "+++" format (Chaos Daemons)', () => {
  const list = parseArmyList(CHAOS_DAEMONS_WTC);

  it('reads faction, detachment and points from the "+" header block', () => {
    expect(list.faction).toBe("Chaos - Chaos Daemons");
    expect(list.detachment).toBe("Shadow Legion, Warptide (First Prince of Chaos)");
    expect(list.points).toBe(2000);
  });

  it("parses the exact unit count the header declares", () => {
    // The export header states "NUMBER OF UNITS: 14".
    expect(list.units).toHaveLength(14);
  });

  it("treats flat weapon-only characters as a single model", () => {
    expect(unit(list, "Be'lakor").models).toBe(1);
    expect(unit(list, "Be'lakor").isWarlord).toBe(true);
    expect(unit(list, "Chaos Lord in Terminator Armour").models).toBe(1);
  });

  it("reads an enhancement written with only its cost", () => {
    // The export lists it as "Fade to Darkness (+30 pts)" with no label, and
    // names it in the header block as an enhancement on Char2.
    expect(unit(list, "Bloodthirster").enhancement).toBe("Fade to Darkness");
    expect(unit(list, "Bloodthirster").wargear).not.toContain("Fade to Darkness");
  });

  it("sums models for nested squads", () => {
    expect(unit(list, "Blue Horrors").models).toBe(10);
    expect(unit(list, "Flesh Hounds").models).toBe(5); // 1 + 4
    expect(list.units.filter((u) => u.name === "Screamers")).toHaveLength(3);
    expect(unit(list, "Screamers").models).toBe(3);
  });
});

describe("parseArmyList - flattened bullets and comma thousands (Logan)", () => {
  const list = parseArmyList(LOGAN_STEEL_CHAIR);

  it("parses the comma thousands total", () => {
    expect(list.points).toBe(2000);
    expect(list.name).toBe("Logan Grimnar with the steel chair");
  });

  it("reads the detachment even when the mission line follows it", () => {
    expect(list.detachment).toBe("Legends of Saga and Song and Saga of the Great Wolf");
  });

  it("keeps a lone character at 1 model when weapons are not nested", () => {
    // App v2.1.0 lists a character's weapons at the same bullet depth as the
    // model; without nesting there is nothing to sum, so it must stay 1.
    expect(unit(list, "Logan Grimnar").models).toBe(1);
    expect(unit(list, "Bjorn the Fell-Handed").models).toBe(1);
  });

  it("still sums nested squad members", () => {
    const terminators = list.units.filter((u) => u.name === "Wolf Guard Terminators");
    expect(terminators.map((u) => u.models)).toEqual([5, 10]);
  });

  it('keeps a solo vehicle at 1 model even when a weapon count is written "2x"', () => {
    // "2x Flamestorm cannon" is a one-off in this block, not a squad count.
    expect(unit(list, "Land Raider Redeemer").models).toBe(1);
  });

  it('reads enhancements that carry an "(Upgrade)" suffix', () => {
    const first = list.units.find((u) => u.name === "Wolf Guard Terminators" && u.enhancement);
    expect(first?.enhancement).toBe("Fierce Example");
  });
});

describe("parseArmyList - single faction line and battleline annotation", () => {
  const list = parseArmyList(WORLD_EATERS);

  it("reads a faction with no chapter line", () => {
    expect(list.faction).toBe("World Eaters");
    expect(list.subfaction).toBeNull();
    expect(list.name).toBe("berserker");
  });

  it('routes a "Bodyguard (Battleline)" unit to battleline', () => {
    expect(unit(list, "Khorne Berzerkers").category).toBe("battleline");
    expect(unit(list, "Khorne Berzerkers").models).toBe(10); // 1 + 9
  });

  it('routes a plain "Bodyguard" unit to other', () => {
    expect(unit(list, "Exalted Eightbound").category).toBe("other");
  });
});

describe("parseArmyList - multi-model character (Grimaldus)", () => {
  const list = parseArmyList(IRONSTORM);

  it("sums a character that brings a bodyguard of its own", () => {
    // Grimaldus (1) + 3 Cenobyte Servitors.
    expect(unit(list, "Chaplain Grimaldus").models).toBe(4);
    expect(unit(list, "Chaplain Grimaldus").isWarlord).toBe(true);
  });

  it("reads the comma thousands total from the title", () => {
    expect(list.points).toBe(1990);
  });
});

describe("parseArmyList - compact WTC export with no section headers (Tau)", () => {
  const list = parseArmyList(TAU_MONTKA);

  it('reads faction, detachment and points from the "+" header block', () => {
    expect(list.faction).toBe("Xenos - T'au Empire");
    expect(list.detachment).toBe("Mont'ka (Killing Blow)");
    expect(list.points).toBe(2000);
  });

  it("parses every unit even though the export has no section headers", () => {
    // The export header states "NUMBER OF UNITS: 18".
    expect(list.units).toHaveLength(18);
  });

  it('routes "CharN" slots to characters and everything else to other', () => {
    // 3 Commanders + The Twin Lance carry a CharN slot.
    expect(countByCategory(list, "characters")).toBe(4);
    expect(countByCategory(list, "other")).toBe(14);
  });

  it('reads the model count from the leading "Nx" on the unit line', () => {
    expect(unit(list, "Broadside Battlesuits").models).toBe(2);
    expect(unit(list, "Pathfinder Team").models).toBe(10);
    expect(unit(list, "Stealth Battlesuits").models).toBe(5);
    expect(unit(list, "Crisis Fireknife Battlesuits").models).toBe(3);
    expect(unit(list, "The Twin Lance").models).toBe(2);
  });

  it("parses units whose weapons trail the points on the same line", () => {
    expect(unit(list, "Ghostkeel Battlesuit").points).toBe(160);
    expect(unit(list, "Ghostkeel Battlesuit").models).toBe(1);
    expect(unit(list, "Piranhas").points).toBe(60);
  });

  it('strips the "CharN:" slot and "Nx" prefix from the display name', () => {
    // Would be "Char4: 1x Commander in Enforcer Battlesuit" unstripped.
    expect(list.units.some((u) => u.name === "Commander in Enforcer Battlesuit")).toBe(true);
    expect(list.units.every((u) => !/^char\d+:/i.test(u.name))).toBe(true);
    expect(list.units.every((u) => !/^\d+x /.test(u.name))).toBe(true);
  });

  it("reads wargear that trails the points on the same line", () => {
    expect(unit(list, "Ghostkeel Battlesuit").wargear).toEqual([
      "Ghostkeel fists",
      "Cyclic ion raker",
      "Twin fusion blaster",
    ]);
  });

  it("strips per-model counts and model labels from the wargear", () => {
    // Written as "... 3x Missile pod ..." and "Broadside Shas'vre: Marker Drone".
    expect(unit(list, "Commander in Enforcer Battlesuit").wargear).toContain("Missile pod");
    expect(unit(list, "Broadside Battlesuits").wargear).toContain("Marker Drone");
    expect(list.units.every((u) => u.wargear.every((w) => !/^\d+(x|\s+with)\s/i.test(w)))).toBe(true);
  });

  it("reads the enhancement of a compact-export character", () => {
    expect(unit(list, "Commander in Enforcer Battlesuit").enhancement).toBe("Exemplar of the Mont'ka");
  });

  it("flags the warlord the header names by roster slot", () => {
    // The header says "WARLORD: Char4", and no unit block carries a Warlord line.
    expect(unit(list, "Commander in Enforcer Battlesuit").isWarlord).toBe(true);
    expect(list.units.filter((u) => u.isWarlord)).toHaveLength(1);
  });
});

describe("parseArmyList - empty and junk input", () => {
  it("returns an empty list for blank input", () => {
    const list = parseArmyList("   \n  \n");
    expect(list.units).toHaveLength(0);
    expect(list.points).toBeNull();
  });

  it("does not throw on free text with no units", () => {
    const list = parseArmyList("hello world\nthis is not a list");
    expect(list.units).toHaveLength(0);
  });
});

describe("parseArmyList - attachments and detachment cost", () => {
  it("reads the detachment cost from the app title export", () => {
    const list = parseArmyList(BARK_AT_THE_MOON);
    expect(list.detachmentPoints).toBe(3);
  });

  it("leaves the cost unset when the export does not state one", () => {
    // The WTC "+" header block has a DETACHMENT line but no points.
    expect(parseArmyList(CHAOS_DAEMONS_WTC).detachmentPoints).toBeNull();
  });

  it('names the leader on the unit it joined, per "Attached unit" block', () => {
    const list = parseArmyList(BARK_AT_THE_MOON);
    // Block 1 is Logan Grimnar with a 5-strong Wolf Guard Terminators, block 3
    // is Arjac Rockfist with another one.
    const terminators = list.units.filter((u) => u.name === "Wolf Guard Terminators");
    expect(terminators.map((u) => leaderNames(u))).toEqual([["Logan Grimnar"], ["Arjac Rockfist"]]);
    expect(leaderNames(unit(list, "Wolf Guard Headtakers"))).toEqual(["Ragnar Blackmane"]);
  });

  it("leaves the leader itself unattached, so it keeps its own entry", () => {
    const list = parseArmyList(BARK_AT_THE_MOON);
    expect(unit(list, "Logan Grimnar").leaders).toEqual([]);
    expect(unit(list, "Logan Grimnar").category).toBe("characters");
  });

  it("gives an unled unit no leaders", () => {
    const list = parseArmyList(BARK_AT_THE_MOON);
    expect(unit(list, "Gladiator Lancer").leaders).toEqual([]);
  });

  it('reads the WTC "Leading:" line as the attachment', () => {
    const list = parseArmyList(SORORITAS_LEADING);
    expect(leaderNames(unit(list, "Zephyrim Squad"))).toEqual(["Canoness with Jump Pack"]);
    expect(leaderNames(unit(list, "Battle Sisters Squad"))).toEqual(["Palatine"]);
    expect(unit(list, "Canoness with Jump Pack").enhancement).toBe("Divine Aspect");
  });

  it('keeps the "Leading:" line out of the wargear', () => {
    const list = parseArmyList(SORORITAS_LEADING);
    expect(unit(list, "Canoness with Jump Pack").wargear).toEqual(["Blessed Halberd"]);
  });
});

describe("parseArmyList - two units of the same name, each with a leader", () => {
  const list = parseArmyList(SORORITAS_LEADING);

  it("gives each squad its own leader instead of piling them on the first", () => {
    const squads = list.units.filter((u) => u.name === "Battle Sisters Squad");
    expect(squads).toHaveLength(2);
    expect(squads.map((u) => leaderNames(u))).toEqual([["Palatine"], ["Canoness"]]);
  });
});

describe("parseArmyList - attached units without the numbered labels", () => {
  it("pairs each leader with its own bodyguard, labels or not", () => {
    // Not every app version writes the "Attached Unit N" lines. A new block
    // starts at each leader, so the pairing does not depend on them.
    const stripped = BARK_AT_THE_MOON.split("\n")
      .filter((l) => !/^attached unit \d+$/i.test(l.trim()))
      .join("\n");
    const list = parseArmyList(stripped);
    expect(leaderNames(unit(list, "Wolf Guard Headtakers"))).toEqual(["Ragnar Blackmane"]);
    const terminators = list.units.filter((u) => u.name === "Wolf Guard Terminators");
    expect(terminators.map((u) => leaderNames(u))).toEqual([["Logan Grimnar"], ["Arjac Rockfist"]]);
  });
});

describe("parseArmyList - a transport bought alongside an attached unit", () => {
  // A Rhino in the same attached block is not led by the character. Marking it
  // as led would fold it into the character's entry and drop it from the list.
  const list = parseArmyList(`Sisters (500 points)

Adepta Sororitas
Hallowed Martyrs (3 Detachment Points)

ATTACHED UNITS

Attached Unit 1

Palatine (60 points)
• Attached as: Leader (Character)
  • 1x Palatine blade

Battle Sisters Squad (105 points)
• Attached as: Bodyguard (Battleline)
  • 1x Sister Superior
    • 1x Power weapon
  • 9x Battle Sister
    • 9x Boltgun

Immolator (125 points)
• Attached as: Dedicated Transport
  • 1x Immolation flamer`);

  it("leads the squad but not the transport", () => {
    expect(leaderNames(unit(list, "Battle Sisters Squad"))).toEqual(["Palatine"]);
    expect(unit(list, "Immolator").category).toBe("transports");
    expect(unit(list, "Immolator").leaders).toEqual([]);
  });
});

describe("parseArmyList - space thousands separator with allied units (Red gear)", () => {
  const list = parseArmyList(RED_GEAR_SPACED_POINTS);

  it("reads a title total written with a space separator", () => {
    expect(list.name).toBe("Red gear");
    expect(list.points).toBe(1995);
  });

  it("parses the allied unit and its space-separated points", () => {
    expect(unit(list, "Chaos Warhound Titan").points).toBe(1100);
    expect(unit(list, "Chaos Warhound Titan").category).toBe("other");
  });

  it("keeps every unit and drops the battle-size line", () => {
    expect(list.units.map((u) => u.name)).toEqual([
      "Angron",
      "Khârn the Betrayer",
      "Khorne Berzerkers",
      "Chaos Rhino",
      "Chaos Warhound Titan",
    ]);
  });

  it('reads a labelled "Force Dispositions:" line', () => {
    expect(list.disposition).toBe("Disruption, Priority Assets, Purge the Foe");
  });

  it("reads the faction and detachment past the spaced-points lines", () => {
    expect(list.faction).toBe("World Eaters");
    expect(list.detachment).toBe("Brazen Engines, Butchers of Khorne, and Vessels of Wrath");
    expect(list.detachmentPoints).toBe(3);
  });

  it("leaves the free-text description out of the faction", () => {
    expect(list.subfaction).toBeNull();
  });

  it("still counts models in the squad", () => {
    expect(unit(list, "Khorne Berzerkers").models).toBe(20);
    expect(unit(list, "Angron").models).toBe(1);
  });
});

describe("parseArmyList - 11th edition exports", () => {
  const list = `Theme song (1995 points)

Space Marines
Salamanders
Forgefather's Seekers and Librarius Conclave (3 Detachment Points)
Priority Assets
Strike Force (2000 points)

Attached Units
Attached Unit 1

Librarian (95 points)
• Attached as: Leader (Character)
• Enhancement: Temporal Corridor

Painboy (105 points)
• Attached as: Support (Character)

Infernus Squad (180 points)
• Attached as: Bodyguard

Attached Unit 2

Captain (85 points)
• Attached as: Leader (Character)

Vanguard Veterans (210 points)
• Attached as: Bodyguard (Battleline)

CHARACTERS

Vulkan He'stan (85 points)
`;

  it("keeps a disposition line out of the subfaction", () => {
    const parsed = parseArmyList(list);
    expect(parsed.subfaction).toBe("Salamanders");
    expect(parsed.disposition).toBe("Priority Assets");
  });

  it("names every character of an attached block on the unit it joined", () => {
    const parsed = parseArmyList(list);
    // The Painboy is attached as support, so it joins the Librarian's block
    // instead of starting one of its own.
    expect(leaderNames(unit(parsed, "Infernus Squad"))).toEqual(["Librarian", "Painboy"]);
    expect(leaderNames(unit(parsed, "Vanguard Veterans"))).toEqual(["Captain"]);
  });

  it("leaves units outside an attached block unattached", () => {
    const parsed = parseArmyList(list);
    expect(leaderNames(unit(parsed, "Vulkan He'stan"))).toEqual([]);
    expect(unit(parsed, "Vulkan He'stan").attachment).toBeNull();
  });

  it("links each unit to the attached block it was listed under", () => {
    const parsed = parseArmyList(list);
    const attached = parsed.units
      .filter((u) => u.attachment)
      .map((u) => `${u.attachment.group}:${u.attachment.role}:${u.name}`);
    expect(attached).toEqual([
      "1:leader:Librarian",
      "1:support:Painboy",
      "1:bodyguard:Infernus Squad",
      "2:leader:Captain",
      "2:bodyguard:Vanguard Veterans",
    ]);
  });

  it("reads a dot as a thousands separator and a footnote star as part of the unit line", () => {
    const parsed = parseArmyList(`My list (2.000 Points)

Chaos Knights
Houndpack Lance (3 Detachment Points)
Reconnaissance
Strike Force (2.000 Points)

CHARACTERS

War Dog Karnivore (155 Points)*
• 1x Slaughterclaw

* This Datasheet also has the Battleline keyword
`);
    expect(parsed.points).toBe(2000);
    expect(parsed.units.map((u) => u.name)).toEqual(["War Dog Karnivore"]);
    expect(parsed.units[0].points).toBe(155);
  });
});

// Real exports carry every variation the app and its users produce. Each case
// below came from a list that parsed wrong before.
describe("parseArmyList - real export variations", () => {
  it('reads the list under a "+++" WTC header block, not just the block', () => {
    const parsed = parseArmyList(`+++++++++++++++++++++++++
+ PLAYER NAME: Chong Liu
+ TEAM NAME: Team China
+ FACTION USED: Adeptus Custodes
+FORCE DISPOSITIONS: Reconnaissance
+++++++++++++++++++++++++
Set my heart to blaze (1,990 Points)

Adeptus Custodes
Lions of the Emperor and Silent Hunters (3 Detachment Points)
Reconnaissance
Strike Force (2,000 Points)

CHARACTERS

Trajann Valoris (135 Points)
• Warlord
`);
    expect(parsed.faction).toBe("Adeptus Custodes");
    expect(parsed.subfaction).toBeNull();
    expect(parsed.detachment).toBe("Lions of the Emperor and Silent Hunters");
    expect(parsed.points).toBe(1990);
    expect(parsed.units.map((u) => u.name)).toEqual(["Trajann Valoris"]);
  });

  it("keeps the first line as the faction when the list has no title line", () => {
    const parsed = parseArmyList(`Emperor's Children
Strike Force (2000 points)
Carnival of Excess and Frenzied Host (3 Detachment Points)
Disruption

CHARACTERS

Lord Exultant (105 points)
`);
    expect(parsed.faction).toBe("Emperor's Children");
    expect(parsed.detachment).toBe("Carnival of Excess and Frenzied Host");
    expect(parsed.points).toBe(2000);
  });

  it("takes the army total from the battle size when nothing else states one", () => {
    const parsed = parseArmyList(`Adeptus Mechanicus
Lords of the Forge and Rad-Zone Corps (3 Detachment Points)
Priority Assets
Strike Force (2 000 Points)

CHARACTERS

Tech-Priest Manipulus (60 Points) [me frfr]
`);
    expect(parsed.points).toBe(2000);
    expect(parsed.units.map((u) => u.name)).toEqual(["Tech-Priest Manipulus"]);
  });

  it("reads a unit annotated after its points with a dash", () => {
    const parsed = parseArmyList(`Drukhari
Kabalite Cartel and Tools of Torment (3 Detachment Points)
Disruption
Strike Force (2000 points)

CHARACTERS

Archon (80 points) - Pablo Escobar himself
• Warlord

Ravager (110 points) -Product Delivery

Ravager (110 points) - Competition Removal
`);
    // The second Ravager's note runs straight on from the dash, with no space.
    expect(parsed.units.map((u) => u.name)).toEqual(["Archon", "Ravager", "Ravager"]);
    expect(parsed.units[0].points).toBe(80);
  });

  it("reads a detachment whose points sit on the next line", () => {
    const parsed = parseArmyList(`Crayon Eating (1,995 Points)

Adeptus Custodes
Talons of the Emperor
(3 Detachment Points)
Take and Hold
Strike Force (2,000 Points)

CHARACTERS

Trajann Valoris (135 Points)
`);
    expect(parsed.faction).toBe("Adeptus Custodes");
    expect(parsed.detachment).toBe("Talons of the Emperor");
    expect(parsed.detachmentPoints).toBe(3);
    expect(parsed.subfaction).toBeNull();
    expect(parsed.points).toBe(1995);
  });

  it("reads the army total from a battle size on the first line", () => {
    const parsed = parseArmyList(`Strike Force (2,000 Points)

Adeptus Custodes
Lions of the Emperor (3 Detachment Points)
Take and Hold

CHARACTERS

Trajann Valoris (75 Points)
`);
    expect(parsed.points).toBe(2000);
    expect(parsed.faction).toBe("Adeptus Custodes");
    expect(parsed.name).toBeNull();
  });

  it("reads a battle size written without parentheses", () => {
    const parsed = parseArmyList(`Leagues of Votann
Needgaard Oathband (2DP) + Hearthband Covenant (1DP)
Force Dispositions: Purge The Foe
Strike Force 1995pts

CHARACTERS

Einhyr Champion (85 points)
`);
    expect(parsed.points).toBe(1995);
    expect(parsed.subfaction).toBeNull();
  });

  it("leaves the export footer out of the units", () => {
    const parsed = parseArmyList(`My list (2000 points)

Chaos Daemons
Legion of Excess (3 Detachment Points)
Strike Force (2000 points)

CHARACTERS

Flesh Hounds (75 points)

Exported with App Version: v2.3.0 (137), Data Version: v912my list (2000 points)
`);
    expect(parsed.units.map((u) => u.name)).toEqual(["Flesh Hounds"]);
  });

  it("keeps the detachment count out of the detachment name", () => {
    const parsed = parseArmyList(`+++++++++++++++++++++++++
+ FACTION KEYWORD: T'au Empire
+ DETACHMENT: Mont'ka (3 Detachment Points)
+ TOTAL ARMY POINTS: 2000 pts
+++++++++++++++++++++++++

CHARACTERS

Ethereal (60 points)
`);
    expect(parsed.detachment).toBe("Mont'ka");
    expect(parsed.detachmentPoints).toBe(3);
  });

  it("does not read a link in the header as a faction, labelled or bare", () => {
    const bare = parseArmyList(`My list (2000 points)

Chaos Daemons
https://www.youtube.com/watch?v=VXcTKe0X1ZA
Legion of Excess (3 Detachment Points)

CHARACTERS

Bloodletters (75 points)
`);
    expect(bare.faction).toBe("Chaos Daemons");
    expect(bare.subfaction).toBeNull();

    // The link often has a few words in front of it, and the whole line has to
    // go: keeping the label would put it where the faction belongs.
    const labelled = parseArmyList(`Zerker POV - https://www.youtube.com/watch?v=5JJu-CTDLoc

Kill My Friends (2,000 Points)

World Eaters
Berzerker Warband (3 Detachment Points)

CHARACTERS

Khorne Berzerkers (180 points)
`);
    expect(labelled.faction).toBe("World Eaters");
    expect(labelled.subfaction).toBeNull();
  });
});

describe("parseArmyList - models and wargear in a flat unit block", () => {
  it("counts a model type once, not once per weapon it carries", () => {
    // The flat shape: wargear sits at the same bullet depth as its model, and
    // sometimes at a shallower one.
    const parsed = parseArmyList(`My list (2000 points)

Orks
More Dakka (3 Detachment Points)

BATTLELINE

Boyz (160 points)
• Attached as: Bodyguard (Battleline)
• 19x Boy
• 17x Choppa
2x Close combat weapon
2x Rokkit launcha
17x Shoota
17x Slugga
• 1x Boss Nob
• 1x Power klaw
1x Slugga
`);
    expect(parsed.units[0].models).toBe(20);
    expect(parsed.units[0].wargear).toEqual([
      "Choppa",
      "Close combat weapon",
      "Rokkit launcha",
      "Shoota",
      "Slugga",
      "Power klaw",
    ]);
  });

  it("counts a second model type that opens its own group", () => {
    // Ghazghkull's datasheet brings Makari, listed after Ghazghkull's own
    // wargear, so both are models.
    const parsed = parseArmyList(`My list (2000 points)

Orks
More Dakka (3 Detachment Points)

CHARACTERS

Ghazghkull Thraka (235 points)
• 1x Ghazghkull Thraka
• Warlord
• 1x Gork's Klaw
1x Mork's Roar
• 1x Makari
• 1x Makari's stabba
`);
    expect(parsed.units[0].models).toBe(2);
    expect(parsed.units[0].wargear).toEqual(["Gork's Klaw", "Mork's Roar", "Makari's stabba"]);
  });

  it("counts a squad whose per-model wargear is bulleted with no unbulleted break", () => {
    // Chaos Daemons export: "Slashing claws" and "Daemonic Icon" are each the
    // sole, bulleted wargear line for their model, so nothing unbulleted ever
    // separates Alluress's group from the Daemonette squad's.
    const parsed = parseArmyList(`My list (2000 points)

Chaos Daemons
Legion of Excess (3 Detachment Points)

BATTLELINE

Daemonettes (90 points)
* Attached as: Bodyguard (Battleline)
• 1x Alluress
• 1x Slashing claws
• 9x Daemonette
• 1x Daemonic Icon
1x Instrument of Chaos
9x Slashing claws
`);
    expect(parsed.units[0].models).toBe(10);
    expect(parsed.units[0].wargear).toEqual(["Slashing claws", "Daemonic Icon", "Instrument of Chaos"]);
  });

  it("reads a vehicle as one model however many guns it lists", () => {
    const parsed = parseArmyList(`My list (2000 points)

Space Marines
Gladius Task Force (3 Detachment Points)

OTHER DATASHEETS

Land Raider Redeemer (240 points)
• 1x Armoured tracks
• 1x Flamestorm cannon
• 1x Twin assault cannon
• 1x Multi-melta
`);
    expect(parsed.units[0].models).toBe(1);
    expect(parsed.units[0].wargear).toEqual([
      "Armoured tracks",
      "Flamestorm cannon",
      "Twin assault cannon",
      "Multi-melta",
    ]);
  });

  it("does not mistake a lone model carrying two of a weapon for a second model", () => {
    // The squad's rank and file is named after the unit and a weapon is not,
    // so a bigger count on its own never starts a second model.
    // Real export: LOGAN_STEEL_CHAIR's Land Raider.
    const parsed = parseArmyList(`My list (2000 points)

Space Marines
Gladius Task Force (3 Detachment Points)

OTHER DATASHEETS

Land Raider Redeemer (240 points)
• 1x Armoured tracks
• 2x Flamestorm cannon
• 1x Hunter-killer missile
• 1x Multi-melta
`);
    expect(parsed.units[0].models).toBe(1);
    expect(parsed.units[0].wargear).toEqual([
      "Armoured tracks",
      "Flamestorm cannon",
      "Hunter-killer missile",
      "Multi-melta",
    ]);
  });

  it("keeps a vehicle at one model when its weapon counts run up and down", () => {
    // Every line is bulleted and the counts alternate, which reads exactly like
    // a squad listing a second model. None of them names the unit, so none is.
    const parsed = parseArmyList(`My list (2000 points)

Astra Militarum
Hammer of the Emperor (3 Detachment Points)

OTHER DATASHEETS

Stormlord (395 Points)
• 1x Armoured tracks
• 2x Heavy stubber
• 2x Lascannon
• 1x Twin heavy bolter
• 2x Twin heavy bolter
• 1x Vulcan mega-bolter
`);
    expect(parsed.units[0].models).toBe(1);
  });

  it("reads the rank and file the unit is named after, however it is shortened", () => {
    const parsed = parseArmyList(`My list (2000 points)

Tyranids
Invasion Fleet (3 Detachment Points)

OTHER DATASHEETS

Hyperadapted Raveners (165 Points)
• 1x Ravener Prime
• 1x Prime claws and talons
• 4x Raveners
• 4x Ravener heavy claws and talons
`);
    expect(parsed.units[0].models).toBe(5);
  });

  it("keeps a weapon that borrows the front of the unit name out of the count", () => {
    // "Burna Boyz" lists its models as "Burna Boy" and their flamers as
    // "Burna", so only the full name reads as rank and file.
    const parsed = parseArmyList(`My list (2000 points)

Orks
More Dakka (3 Detachment Points)

OTHER DATASHEETS

Burna Boyz (60 points)
• 1x Spanner
• 1x Rokkit Launcha
1x Close combat weapon
• 4x Burna Boy
• 4x Burna
4x Cuttin flames
`);
    expect(parsed.units[0].models).toBe(5);
  });

  it("keeps a lone weapon named after its unit out of the count", () => {
    // A Skull Cannon's gun is a skull cannon. Rank and file comes several
    // strong, so a single one of them mid-block is the weapon, not a model.
    const parsed = parseArmyList(`My list (2000 points)

Chaos Daemons
Blood Legion (3 Detachment Points)

OTHER DATASHEETS

Skull Cannon (90 Points)
• 1x Attendants hellblades
• 1x Biting maw
• 1x Skull cannon
`);
    expect(parsed.units[0].models).toBe(1);
  });

  it('ignores the loadout an "X with Y" unit name carries', () => {
    const parsed = parseArmyList(`My list (2000 points)

Orks
More Dakka (3 Detachment Points)

CHARACTERS

Big Mek with Shokk Attack Gun (85 points)
• 1x Close combat weapon
• 2x Shokk Attack Gun
`);
    expect(parsed.units[0].models).toBe(1);
  });

  it("reads unit-wide kit listed in front of the rank and file as wargear", () => {
    // The Bomb Squig opens the block and lists no wargear of its own, so it is
    // kit the mob shares rather than a model: 6 Boyz + 2 Nobs.
    const parsed = parseArmyList(`My list (2000 points)

Orks
More Dakka (3 Detachment Points)

OTHER DATASHEETS

Squighog Boyz (270 points)
• Attached as: Bodyguard
• 2x Bomb Squig
• 6x Squighog Boy
• 6x Saddlegit weapons
6x Squig jaws
• 2x Nob on Smasha Squig
• 2x Big choppa
2x Slugga
`);
    expect(parsed.units[0].models).toBe(8);
  });
});

describe("parseArmyList - sub-bullets that are not indented", () => {
  // The app marks the wargear level with "◦" but does not always indent it, so
  // the marker is the only thing separating a model from its weapons.
  const list = `Itz Da Pirate's Lyf 4 Me (1,995 Points)

Orks
Equatorial Hordes and Freebooter Krew (3 Detachment Points)
Take and Hold
Strike Force (2,000 Points)

ATTACHED UNITS

Attached unit 1

Ghazghkull Thraka (235 Points)
* Attached as: Leader (Character)
* 1x Ghazghkull Thraka
* Warlord
◦ 1x Gork's Klaw
◦ 1x Mork's Roar
* 1x Makari
◦ 1x Makari's stabba

Boyz (160 Points)
* Attached as: Bodyguard (Battleline)
* 19x Boy
◦ 18x Choppa
◦ 18x Slugga
* 1x Boss Nob
◦ 1x Big choppa
◦ 1x Slugga

OTHER DATASHEETS

Kommandos (120 Points)
* 1x Bomb Squig
* 1x Distraction Grot
* 9x Kommando
◦ 4x Choppa
◦ 4x Slugga
* 1x Boss Nob
◦ 1x Power klaw
`;

  it("counts every model bullet, not just the one that opens a group", () => {
    const parsed = parseArmyList(list);
    expect(unit(parsed, "Boyz").models).toBe(20); // 19 + 1
    // Models listed back to back with no weapons between them still all count.
    expect(unit(parsed, "Kommandos").models).toBe(12); // 1 + 1 + 9 + 1
    expect(unit(parsed, "Ghazghkull Thraka").models).toBe(2);
  });

  it("keeps the model lines out of the wargear", () => {
    const parsed = parseArmyList(list);
    expect(unit(parsed, "Boyz").wargear).toEqual(["Choppa", "Slugga", "Big choppa"]);
    expect(unit(parsed, "Ghazghkull Thraka").wargear).toEqual(["Gork's Klaw", "Mork's Roar", "Makari's stabba"]);
  });

  it("does not read the disposition as the chapter", () => {
    expect(parseArmyList(list).subfaction).toBeNull();
    expect(parseArmyList(list).disposition).toBe("Take and Hold");
  });
});

describe("parseArmyList - a flat squad of one model type", () => {
  // No sub-bullets at all: the model and its weapons share a depth, and only
  // the model's own count says it is a squad rather than a lone model.
  const squad = `My list (2000 points)

Space Marines
Blood Angels
Encarmine Speartip (3 Detachment Points)

OTHER DATASHEETS

Sanguinary Guard (280 points)
• 6x Sanguinary Guard
• 4x Angelus boltgun
6x Encarmine spear
1x Sanguinary Banner
`;

  it("reads the squad size from the model line", () => {
    const parsed = parseArmyList(squad);
    expect(parsed.units[0].models).toBe(6);
    expect(parsed.units[0].wargear).toEqual(["Angelus boltgun", "Encarmine spear", "Sanguinary Banner"]);
  });
});

describe("parseArmyList - an attached block with a support character", () => {
  // The labels are what the app grouped by: unit 1 is the leader, its support
  // character and their bodyguard, and unit 2 starts a new block even though it
  // opens on a support character.
  const list = `My list (2000 points)

Orks
Equatorial Hordes (3 Detachment Points)

ATTACHED UNITS

Attached unit 1

Ghazghkull Thraka (235 Points)
* Attached as: Leader (Character)

Painboy (90 Points)
* Attached as: Support (Character)

Boyz (160 Points)
* Attached as: Bodyguard (Battleline)

Attached unit 2

Bannernob (70 Points)
* Attached as: Support (Character)

Flash Gitz (150 Points)
* Attached as: Bodyguard ()
`;

  it("names both characters of the block on the unit they joined", () => {
    const parsed = parseArmyList(list);
    expect(leaderNames(unit(parsed, "Boyz"))).toEqual(["Ghazghkull Thraka", "Painboy"]);
  });

  it("keeps the next label a new block, whatever character opens it", () => {
    const parsed = parseArmyList(list);
    expect(leaderNames(unit(parsed, "Flash Gitz"))).toEqual(["Bannernob"]);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// ADDED HERE. The three fields this app adds on top of the shared parser (see
// the note at the top of armyListParser.helpers.js). Everything above this line
// is the upstream suite and should stay that way.
// ─────────────────────────────────────────────────────────────────────────────

describe("parseArmyList - fields added for the datacards importer", () => {
  it("names the battle size an 11th edition export states with its points", () => {
    expect(parseArmyList(IRONSTORM).battleSize).toBe("Strike Force");
  });

  it("names a battle size written on its own, with no points beside it", () => {
    const list = parseArmyList(`My Army (500 pts)

Orks
Incursion

CHARACTERS

Warboss (90 pts)`);
    expect(list.battleSize).toBe("Incursion");
  });

  it("leaves the battle size unset when the export never states one", () => {
    expect(parseArmyList(CHAOS_DAEMONS_WTC).battleSize).toBeNull();
  });

  it("keeps the battle size out of the faction and the chapter", () => {
    const list = parseArmyList(IRONSTORM);
    expect(list.faction).toBe("Space Marines");
    expect(list.subfaction).toBe("Black Templars");
  });

  it("records the section header a unit was listed under", () => {
    const list = parseArmyList(IRONSTORM);
    expect(unit(list, "Techmarine").section).toBe("CHARACTERS");
    expect(unit(list, "Infiltrator Squad").section).toBe("OTHER DATASHEETS");
    // An attached unit keeps the header it was written under, so the importer
    // can still tell where the export put it.
    expect(unit(list, "Chaplain Grimaldus").section).toBe("ATTACHED UNITS");
  });

  it("keeps ALLIED UNITS apart from the other datasheets it buckets with", () => {
    const list = parseArmyList(RED_GEAR_SPACED_POINTS);
    const allied = list.units.filter((u) => u.section === "ALLIED UNITS");
    expect(allied.length).toBeGreaterThan(0);
    // They share the "other" bucket, which is why the raw header is kept.
    expect(allied.every((u) => u.category === "other")).toBe(true);
  });

  it("leaves the section unset for an export with no section headers", () => {
    expect(parseArmyList(TAU_MONTKA).units.every((u) => u.section === null)).toBe(true);
  });

  it("reads the cost off a labelled enhancement", () => {
    const list = parseArmyList(`My Army (500 pts)

Space Marines
Strike Force

CHARACTERS

Captain (120 pts)
• Enhancements: Iron Resolve (+20 pts)`);
    expect(unit(list, "Captain").enhancement).toBe("Iron Resolve");
    expect(unit(list, "Captain").enhancementCost).toBe(20);
  });

  it("reads the cost off a WTC enhancement written as the cost alone", () => {
    const list = parseArmyList(CHAOS_DAEMONS_WTC);
    const shalaxi = unit(list, "Bloodthirster");
    expect(shalaxi.enhancement).toBe("Fade to Darkness");
    expect(shalaxi.enhancementCost).toBe(30);
  });

  it("leaves the cost unset for an enhancement annotated only as an upgrade", () => {
    const sword = unit(parseArmyList(IRONSTORM), "Sword Brethren Squad");
    expect(sword.enhancement).toBe("Fervent Exemplars");
    expect(sword.enhancementCost).toBeNull();
  });
  it("reads a 10th edition detachment written as a bare line under the battle size", () => {
    const list = parseArmyList(`My Army (2000 Points)

Space Marines
Blood Angels
Strike Force
Gladius Task Force

CHARACTERS

Captain (100 pts)`);
    expect(list.faction).toBe("Space Marines");
    expect(list.subfaction).toBe("Blood Angels");
    expect(list.battleSize).toBe("Strike Force");
    expect(list.detachment).toBe("Gladius Task Force");
  });

  it("reads a 10th edition detachment for a faction with no chapter line", () => {
    const list = parseArmyList(`My List (1000 pts)

Astra Militarum
Strike Force
Combined Regiment

CHARACTERS

Lord Solar Leontus (145 pts)`);
    expect(list.faction).toBe("Astra Militarum");
    expect(list.subfaction).toBeNull();
    expect(list.detachment).toBe("Combined Regiment");
  });

  it("does not read the disposition of an 11th edition export as the detachment", () => {
    const list = parseArmyList(`Adeptus Custodes
Strike Force (2,000 Points)
Take and Hold

CHARACTERS

Trajann Valoris (135 Points)`);
    expect(list.disposition).toBe("Take and Hold");
    expect(list.detachment).toBeNull();
  });
});
