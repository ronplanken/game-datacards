import { describe, it, expect } from "vitest";
import {
  areBindingsEmpty,
  extractBindings,
  formatBindingExpression,
  formatBindingValue,
  getNestedValue,
  hasBindings,
  isLanguageKeyedObject,
  normalizeBindingItem,
  normalizeCardForBinding,
  parseBindingExpression,
  parseBindings,
  resolveExpression,
  resolveTemplate,
  stripMarkup,
} from "../bindingResolver";

const make10eCard = () => ({
  id: "10e-1",
  source: "40k-10e",
  cardType: "DataCard",
  name: "Captain",
  subname: "Chapter Master",
  stats: [{ name: "Captain", m: '6"', t: "4", sv: "3+", w: "5", ld: "6+", oc: "1", invul: "4+" }],
  rangedWeapons: [
    {
      active: true,
      profiles: [{ name: "Bolt pistol", range: '12"', attacks: "1", skill: "3+", strength: "4", ap: "0", damage: "1" }],
    },
    {
      active: true,
      profiles: [
        { name: "Plasma gun", range: '24"', attacks: "1", skill: "3+", strength: "7", ap: "-2", damage: "1" },
        {
          name: "Plasma gun - supercharge",
          range: '24"',
          attacks: "1",
          skill: "3+",
          strength: "8",
          ap: "-3",
          damage: "2",
        },
      ],
    },
  ],
  meleeWeapons: [
    {
      active: true,
      profiles: [
        { name: "Chainsword", range: "Melee", attacks: "4", skill: "3+", strength: "4", ap: "-1", damage: "1" },
      ],
    },
  ],
  abilities: {
    core: ["Deep Strike", "Leader"],
    faction: ["Oath of Moment"],
    invul: { value: "4+", info: "", showInvulnerableSave: true },
    other: [
      { name: "Aura of Command", description: "Add 1 to Leadership.", showAbility: true },
      { name: "Iron Will", description: "Re-roll a failed Battle-shock test.", showAbility: true },
    ],
  },
  keywords: ["Infantry", "Character", "Imperium", "Captain"],
  factions: ["Adeptus Astartes"],
  composition: ["1 Captain"],
  loadout: "This model is equipped with: bolt pistol; chainsword.",
  points: [
    { models: "1", cost: "80", active: true },
    { models: "3", cost: "220", active: true },
  ],
});

const make11eCard = () => ({
  id: "11e-1",
  source: "40k-11e",
  cardType: "DataCard",
  name: "Captain",
  subname: { en: "Chapter Master", de: "Ordensmeister" },
  stats: [{ name: { en: "Captain", de: "Hauptmann" }, m: '6"', t: "4", sv: "3+", w: "5", ld: "6+", oc: "1" }],
  rangedWeapons: [
    {
      profiles: [
        {
          name: { en: "Bolt pistol", de: "Bolterpistole" },
          keywords: ["Pistol"],
          range: '12"',
          attacks: "1",
          skill: "3+",
          strength: "4",
          ap: "0",
          damage: "1",
        },
      ],
    },
  ],
  meleeWeapons: [
    {
      profiles: [
        {
          name: { en: "Chainsword" },
          keywords: [],
          range: "Melee",
          attacks: "4",
          skill: "3+",
          strength: "4",
          ap: "-1",
          damage: "1",
        },
      ],
    },
  ],
  abilities: {
    core: [{ name: { en: "Deep Strike", de: "Tiefschlag" } }, { name: { en: "Leader", de: "Anführer" } }],
    faction: [{ name: { en: "Oath of Moment", de: "Schwur des Augenblicks" } }],
    invul: { value: "4+" },
    other: [
      {
        name: { en: "Aura of Command", de: "Aura des Befehls" },
        description: {
          en: 'While a friendly unit is within 6", add 1 to its <k>Leadership</k>.',
          de: "Aura Beschreibung",
        },
      },
      {
        name: { en: "Iron Will" },
        description: { en: "Once per battle, this unit can re-roll a failed <b>Battle-shock</b> test." },
      },
    ],
    primarch: [],
    special: [],
    wargear: [],
    damaged: null,
  },
  keywords: [
    { en: "Infantry", de: "Infanterie" },
    { en: "Character", de: "Charaktermodell" },
  ],
  factions: ["Adeptus Astartes"],
  composition: [{ en: "1 Captain", de: "1 Hauptmann" }],
  loadout: { en: "This model is equipped with: bolt pistol.", de: "Ausrüstung." },
  leader: { en: "This model can be attached to a Squad.", de: "Anführer." },
  wargear: [{ en: "None", de: "Keine" }],
  points: [{ models: "1", cost: "80", keyword: { en: "Captain", de: "Hauptmann" }, faction: null }],
});

const makeAoSCard = () => ({
  id: "aos-1",
  source: "aos",
  cardType: "warscroll",
  name: "Liberators",
  subname: "",
  points: 110,
  stats: { move: '5"', save: "3+", control: "2", health: "2", ward: "-", wizard: "-", priest: "-" },
  weapons: {
    ranged: [],
    melee: [{ name: "Warhammer", range: "1", attacks: "3", hit: "3+", wound: "3+", rend: "1", damage: "1" }],
  },
  abilities: [
    { name: "Shield of Civilisation", effect: "Add 1 to save rolls.", timing: "Passive" },
    { name: "Grand Strikes", effect: "Improve Rend by 1." },
  ],
  keywords: ["Infantry", "Stormcast Eternals"],
});

const makeCustomCard = () => ({
  id: "custom-1",
  source: "custom-abc",
  cardType: "unit",
  name: "Marine",
  stats: [{ m: '6"', t: "4", sv: "3+" }],
  weapons: {
    ranged: [
      { profiles: [{ name: "Boltgun", range: '24"', a: "2", bs: "3+", s: "4", ap: "0", d: "1" }] },
      { profiles: [{ name: "Bolt pistol", range: '12"', a: "1", bs: "3+", s: "4", ap: "0", d: "1" }] },
    ],
    melee: [{ profiles: [{ name: "Combat knife", range: "Melee", a: "3", ws: "3+", s: "4", ap: "0", d: "1" }] }],
  },
  abilities: {
    core: [{ name: "Deep Strike" }],
    unit: [
      { name: "Squad Tactics", description: "Re-roll hit rolls of 1." },
      { name: "Bolter Drill", description: "Sustained Hits 1." },
    ],
  },
  keywords: ["Infantry", "Imperium"],
  factionKeywords: ["Adeptus Astartes"],
  points: 100,
});

const makeLegacyCustomCard = () => ({
  id: "custom-2",
  source: "custom-abc",
  cardType: "unit",
  name: "Legacy Marine",
  abilities: [
    { category: "unit", name: "Squad Tactics", description: "Re-roll hit rolls of 1." },
    { category: "unit", name: "Bolter Drill", description: "Sustained Hits 1." },
    { category: "core", name: "Deep Strike" },
  ],
});

const resolve = (template, card, options = {}) =>
  resolveTemplate(template, normalizeCardForBinding(card, options), options);

describe("bindingResolver", () => {
  describe("getNestedValue", () => {
    it("reads dot paths", () => {
      expect(getNestedValue({ a: { b: "c" } }, "a.b")).toBe("c");
    });

    it("reads array indexes", () => {
      expect(getNestedValue({ a: [{ b: "c" }] }, "a[0].b")).toBe("c");
    });

    it("reads keys containing hyphens", () => {
      expect(
        getNestedValue({ abilities: { "special-rules": [{ name: "Fly" }] } }, "abilities.special-rules[0].name"),
      ).toBe("Fly");
    });

    it("returns undefined for missing values and non-arrays", () => {
      expect(getNestedValue({ a: {} }, "a.b.c")).toBeUndefined();
      expect(getNestedValue({ a: { b: "c" } }, "a[0]")).toBeUndefined();
      expect(getNestedValue(null, "a")).toBeUndefined();
      expect(getNestedValue({ a: 1 }, "")).toBeUndefined();
    });

    it("reads repeater variables", () => {
      expect(getNestedValue({ $index: 2 }, "$index")).toBe(2);
    });
  });

  describe("stripMarkup", () => {
    it("keeps the content of inline tags", () => {
      expect(stripMarkup("Add 1 to its <k>Leadership</k>.")).toBe("Add 1 to its Leadership.");
      expect(stripMarkup("Re-roll a failed <b>Battle-shock</b> test.")).toBe("Re-roll a failed Battle-shock test.");
      expect(stripMarkup("An <i>italic</i> word.")).toBe("An italic word.");
    });

    it("turns list items into dashed lines", () => {
      expect(stripMarkup("Choose one:<ul><li>Move</li><li>Shoot</li></ul>")).toBe("Choose one:\n- Move\n- Shoot");
    });

    it("normalises carriage returns", () => {
      expect(stripMarkup("First\r\nSecond\rThird")).toBe("First\nSecond\nThird");
    });

    it("puts box bullets on their own line", () => {
      expect(stripMarkup("Effects: ■ One ■ Two")).toBe("Effects:\n■ One\n■ Two");
    });

    it("leaves markdown alone", () => {
      expect(stripMarkup("**Bold** and _italic_ and 3 < 4")).toBe("**Bold** and _italic_ and 3 < 4");
    });

    it("handles non-strings", () => {
      expect(stripMarkup(undefined)).toBe("");
      expect(stripMarkup("")).toBe("");
    });
  });

  describe("isLanguageKeyedObject", () => {
    it("detects language maps", () => {
      expect(isLanguageKeyedObject({ en: "a", de: "b" })).toBe(true);
      expect(isLanguageKeyedObject({ en: "a", extra: "b" })).toBe(false);
      expect(isLanguageKeyedObject({})).toBe(false);
      expect(isLanguageKeyedObject(["en"])).toBe(false);
      expect(isLanguageKeyedObject("en")).toBe(false);
    });
  });

  describe("40k 10th edition", () => {
    const card = make10eCard();

    it("exposes weapon profile fields at item level", () => {
      expect(resolve("{{rangedWeapons[0].name}}", card)).toBe("Bolt pistol");
      expect(resolve("{{rangedWeapons[0].range}} {{rangedWeapons[0].damage}}", card)).toBe('12" 1');
      expect(resolve("{{meleeWeapons[0].name}}", card)).toBe("Chainsword");
      expect(resolve("{{rangedWeapons[1].name}}", card)).toBe("Plasma gun");
    });

    it("keeps the profiles array for repeaters", () => {
      const normalized = normalizeCardForBinding(card);
      expect(normalized.rangedWeapons[1].profiles).toHaveLength(2);
      expect(normalized.rangedWeapons[1].profiles[1].name).toBe("Plasma gun - supercharge");
    });

    it("resolves keywords as plain strings", () => {
      expect(resolve("{{keywords[0]}}", card)).toBe("Infantry");
      expect(resolve("{{keywords[3]}}", card)).toBe("Captain");
      expect(resolve("{{keywords}}", card)).toBe("Infantry, Character, Imperium, Captain");
      expect(resolve("{{factions}}", card)).toBe("Adeptus Astartes");
    });

    it("resolves abilities", () => {
      expect(resolve("{{abilities.other[0].name}}", card)).toBe("Aura of Command");
      expect(resolve("{{abilities.other[1].description}}", card)).toBe("Re-roll a failed Battle-shock test.");
      expect(resolve("{{abilities.core}}", card)).toBe("Deep Strike, Leader");
      expect(resolve("{{abilities.faction}}", card)).toBe("Oath of Moment");
      expect(resolve("{{abilities.invul.value}}", card)).toBe("4+");
    });

    it("resolves stats and points", () => {
      expect(resolve("{{stats[0].m}}/{{stats[0].t}}/{{stats[0].sv}}", card)).toBe('6"/4/3+');
      expect(resolve("{{points[0].cost}}", card)).toBe("80");
      expect(resolve("{{points[1].models}}", card)).toBe("3");
    });

    it("returns an empty string for missing values", () => {
      expect(resolve("{{rangedWeapons[9].name}}", card)).toBe("");
      expect(resolve("{{nope.at.all}}", card)).toBe("");
    });
  });

  describe("40k 11th edition", () => {
    const card = make11eCard();

    it("localises fields at every level", () => {
      expect(resolve("{{name}}", card)).toBe("Captain");
      expect(resolve("{{subname}}", card)).toBe("Chapter Master");
      expect(resolve("{{stats[0].name}}", card)).toBe("Captain");
      expect(resolve("{{rangedWeapons[0].name}}", card)).toBe("Bolt pistol");
      expect(resolve("{{meleeWeapons[0].name}}", card)).toBe("Chainsword");
      expect(resolve("{{abilities.other[0].name}}", card)).toBe("Aura of Command");
      expect(resolve("{{keywords}}", card)).toBe("Infantry, Character");
      expect(resolve("{{keywords[1]}}", card)).toBe("Character");
      expect(resolve("{{composition}}", card)).toBe("1 Captain");
      expect(resolve("{{loadout}}", card)).toBe("This model is equipped with: bolt pistol.");
      expect(resolve("{{leader}}", card)).toBe("This model can be attached to a Squad.");
      expect(resolve("{{wargear}}", card)).toBe("None");
      expect(resolve("{{points[0].keyword}}", card)).toBe("Captain");
      expect(resolve("{{points[0].cost}}", card)).toBe("80");
    });

    it("uses the requested language", () => {
      const options = { language: "de" };
      expect(resolve("{{subname}}", card, options)).toBe("Ordensmeister");
      expect(resolve("{{rangedWeapons[0].name}}", card, options)).toBe("Bolterpistole");
      expect(resolve("{{keywords}}", card, options)).toBe("Infanterie, Charaktermodell");
      expect(resolve("{{abilities.core}}", card, options)).toBe("Tiefschlag, Anführer");
    });

    it("falls back to English when a language is missing", () => {
      expect(resolve("{{meleeWeapons[0].name}}", card, { language: "fr" })).toBe("Chainsword");
      expect(resolve("{{abilities.other[1].name}}", card, { language: "de" })).toBe("Iron Will");
    });

    it("resolves core and faction abilities to their names", () => {
      expect(resolve("{{abilities.core}}", card)).toBe("Deep Strike, Leader");
      expect(resolve("{{abilities.faction}}", card)).toBe("Oath of Moment");
      expect(resolve("{{abilities.invul.value}}", card)).toBe("4+");
    });

    it("strips rich-text markup from ability descriptions", () => {
      const description = resolve("{{abilities.other[0].description}}", card);
      expect(description).toBe('While a friendly unit is within 6", add 1 to its Leadership.');
      expect(description).not.toContain("<k>");
      expect(resolve("{{abilities.other[1].description}}", card)).toBe(
        "Once per battle, this unit can re-roll a failed Battle-shock test.",
      );
    });

    it("never prints [object Object]", () => {
      const paths = [
        "name",
        "subname",
        "stats[0].name",
        "rangedWeapons[0].name",
        "abilities.core",
        "abilities.faction",
        "abilities.other[0].name",
        "abilities.other[0].description",
        "keywords",
        "composition",
        "loadout",
        "leader",
        "wargear",
        "points[0].keyword",
      ];
      const rendered = paths.map((path) => resolve(`{{${path}}}`, card)).join(" | ");
      expect(rendered).not.toContain("[object Object]");
    });
  });

  describe("Age of Sigmar", () => {
    const card = makeAoSCard();

    it("resolves stats, weapons, abilities and keywords", () => {
      expect(resolve("{{stats.move}}", card)).toBe('5"');
      expect(resolve("{{stats.save}}", card)).toBe("3+");
      expect(resolve("{{weapons.melee[0].name}}", card)).toBe("Warhammer");
      expect(resolve("{{weapons.melee[0].hit}}", card)).toBe("3+");
      expect(resolve("{{abilities[0].name}}", card)).toBe("Shield of Civilisation");
      expect(resolve("{{abilities[0].effect}}", card)).toBe("Add 1 to save rolls.");
      expect(resolve("{{keywords[0]}}", card)).toBe("Infantry");
      expect(resolve("{{keywords}}", card)).toBe("Infantry, Stormcast Eternals");
      expect(resolve("{{points}}", card)).toBe("110");
    });

    it("keeps the ability array shape", () => {
      const normalized = normalizeCardForBinding(card);
      expect(Array.isArray(normalized.abilities)).toBe(true);
      expect(normalized.abilities).toHaveLength(2);
    });
  });

  describe("custom datasources", () => {
    const card = makeCustomCard();

    it("resolves weapon fields through profiles", () => {
      expect(resolve("{{weapons.ranged[0].name}}", card)).toBe("Boltgun");
      expect(resolve("{{weapons.ranged[1].name}}", card)).toBe("Bolt pistol");
      expect(resolve("{{weapons.ranged[0].bs}}", card)).toBe("3+");
      expect(resolve("{{weapons.melee[0].name}}", card)).toBe("Combat knife");
    });

    it("resolves abilities per category", () => {
      expect(resolve("{{abilities.unit[0].name}}", card)).toBe("Squad Tactics");
      expect(resolve("{{abilities.unit[1].description}}", card)).toBe("Sustained Hits 1.");
    });

    it("keeps a name-only custom category addressable by name", () => {
      expect(resolve("{{abilities.core[0].name}}", card)).toBe("Deep Strike");
    });

    it("resolves keywords and faction keywords", () => {
      expect(resolve("{{keywords[0]}}", card)).toBe("Infantry");
      expect(resolve("{{factionKeywords}}", card)).toBe("Adeptus Astartes");
      expect(resolve("{{points}}", card)).toBe("100");
    });

    it("converts a legacy flat ability array into the category object", () => {
      const legacy = makeLegacyCustomCard();
      const normalized = normalizeCardForBinding(legacy);
      expect(Array.isArray(normalized.abilities)).toBe(false);
      expect(normalized.abilities.unit).toHaveLength(2);
      expect(resolve("{{abilities.unit[0].name}}", legacy)).toBe("Squad Tactics");
      expect(resolve("{{abilities.core[0].name}}", legacy)).toBe("Deep Strike");
    });
  });

  describe("repeater context", () => {
    const card = make10eCard();

    it("resolves item fields through the flattened weapon", () => {
      const normalizedCard = normalizeCardForBinding(card);
      const item = normalizeBindingItem(card.rangedWeapons[0]);
      const context = { ...normalizedCard, ...item, $index: 0, $count: 2, $first: true, $last: false };

      expect(resolveTemplate("{{name}} {{range}} {{damage}}", context)).toBe('Bolt pistol 12" 1');
      expect(resolveTemplate("{{$index}}/{{$count}}", context)).toBe("0/2");
      expect(resolveTemplate("{{$first}} {{$last}}", context)).toBe("true false");
    });

    it("leaves card level paths reachable from inside the repeater", () => {
      const normalizedCard = normalizeCardForBinding(card);
      const item = normalizeBindingItem(card.rangedWeapons[1]);
      const context = { ...normalizedCard, ...item };

      expect(resolveTemplate("{{name}}", context)).toBe("Plasma gun");
      expect(resolveTemplate("{{abilities.other[0].name}}", context)).toBe("Aura of Command");
      expect(resolveTemplate("{{keywords[0]}}", context)).toBe("Infantry");
      expect(resolveTemplate("{{stats[0].t}}", context)).toBe("4");
    });

    it("localises 11th edition repeater items", () => {
      const card11e = make11eCard();
      const item = normalizeBindingItem(card11e.rangedWeapons[0], { language: "de" });
      expect(resolveTemplate("{{name}}", item, { language: "de" })).toBe("Bolterpistole");
    });
  });

  describe("caching", () => {
    it("returns the same normalised object for the same card and language", () => {
      const card = make11eCard();
      expect(normalizeCardForBinding(card, { language: "en" })).toBe(normalizeCardForBinding(card, { language: "en" }));
      expect(normalizeCardForBinding(card, { language: "en" })).not.toBe(
        normalizeCardForBinding(card, { language: "de" }),
      );
    });

    it("does not mutate the source card", () => {
      const card = make11eCard();
      normalizeCardForBinding(card);
      expect(card.keywords[0]).toEqual({ en: "Infantry", de: "Infanterie" });
      expect(card.rangedWeapons[0].name).toBeUndefined();
    });
  });

  describe("binding expressions", () => {
    it("parses a bare path", () => {
      expect(parseBindingExpression("name")).toEqual({ path: "name", filters: [] });
      expect(parseBindingExpression(" stats[0].m ")).toEqual({ path: "stats[0].m", filters: [] });
    });

    it("parses filters with and without arguments", () => {
      expect(parseBindingExpression("name | upper")).toEqual({ path: "name", filters: [{ name: "upper" }] });
      expect(parseBindingExpression('keywords | join:", "')).toEqual({
        path: "keywords",
        filters: [{ name: "join", arg: ", " }],
      });
      expect(parseBindingExpression('name | upper | prefix:"A: " | truncate:10')).toEqual({
        path: "name",
        filters: [{ name: "upper" }, { name: "prefix", arg: "A: " }, { name: "truncate", arg: "10" }],
      });
    });

    it("keeps a pipe inside a quoted argument", () => {
      expect(parseBindingExpression('keywords | join:" | "')).toEqual({
        path: "keywords",
        filters: [{ name: "join", arg: " | " }],
      });
    });

    it("round-trips through formatBindingExpression", () => {
      const expressions = [
        "name",
        "name | upper",
        'keywords | join:", "',
        'missing | default:"n/a"',
        'name | prefix:"Weapon: " | truncate:"12"',
      ];
      for (const expression of expressions) {
        const parsed = parseBindingExpression(expression);
        expect(parseBindingExpression(formatBindingExpression(parsed))).toEqual(parsed);
      }
      expect(formatBindingExpression({ path: "name", filters: [{ name: "upper" }] })).toBe("name | upper");
      expect(formatBindingExpression({ path: "keywords", filters: [{ name: "join", arg: ", " }] })).toBe(
        'keywords | join:", "',
      );
    });

    it("escapes quotes in arguments", () => {
      const expression = formatBindingExpression({ path: "name", filters: [{ name: "prefix", arg: 'a"b' }] });
      expect(expression).toBe('name | prefix:"a\\"b"');
      expect(parseBindingExpression(expression).filters[0].arg).toBe('a"b');
    });

    it("parses the bindings of a text", () => {
      expect(parseBindings('{{name | upper}} {{keywords | join:" / "}}')).toEqual([
        { expression: "name | upper", path: "name", filters: [{ name: "upper" }] },
        { expression: 'keywords | join:" / "', path: "keywords", filters: [{ name: "join", arg: " / " }] },
      ]);
      expect(parseBindings("plain text")).toEqual([]);
    });
  });

  describe("binding filters", () => {
    const context = normalizeCardForBinding(make10eCard());

    it("keeps plain bindings working", () => {
      expect(resolveTemplate("{{name}}", context)).toBe("Captain");
      expect(resolveTemplate("{{ name }}", context)).toBe("Captain");
    });

    it("applies case filters", () => {
      expect(resolveTemplate("{{name | upper}}", context)).toBe("CAPTAIN");
      expect(resolveTemplate("{{name | lower}}", context)).toBe("captain");
      expect(resolveTemplate("{{subname | title}}", context)).toBe("Chapter Master");
    });

    it("applies trim", () => {
      expect(resolveExpression({ value: "  spaced  " }, "value | trim")).toBe("spaced");
    });

    it("joins arrays with the given separator and defaults to a comma", () => {
      expect(resolveTemplate("{{keywords | join}}", context)).toBe("Infantry, Character, Imperium, Captain");
      expect(resolveTemplate('{{keywords | join:" / "}}', context)).toBe("Infantry / Character / Imperium / Captain");
      expect(resolveTemplate("{{keywords}}", context)).toBe("Infantry, Character, Imperium, Captain");
    });

    it("adds a prefix and a suffix only when the value is filled", () => {
      expect(resolveTemplate('{{rangedWeapons[0].name | prefix:"Weapon: "}}', context)).toBe("Weapon: Bolt pistol");
      expect(resolveTemplate('{{rangedWeapons[9].name | prefix:"Weapon: "}}', context)).toBe("");
      expect(resolveTemplate('{{name | suffix:" (unit)"}}', context)).toBe("Captain (unit)");
      expect(resolveTemplate('{{missing | suffix:" (unit)"}}', context)).toBe("");
    });

    it("falls back to a default for missing and empty values", () => {
      expect(resolveTemplate('{{missingField | default:"n/a"}}', context)).toBe("n/a");
      expect(resolveExpression({ value: "" }, 'value | default:"n/a"')).toBe("n/a");
      expect(resolveTemplate('{{name | default:"n/a"}}', context)).toBe("Captain");
    });

    it("truncates with an ellipsis", () => {
      expect(resolveTemplate("{{abilities.other[0].description | truncate:10}}", context)).toBe("Add 1 to L...");
      expect(resolveTemplate("{{name | truncate:20}}", context)).toBe("Captain");
    });

    it("takes the first item and counts arrays", () => {
      expect(resolveTemplate("{{keywords | first}}", context)).toBe("Infantry");
      expect(resolveTemplate("{{keywords | count}}", context)).toBe("4");
      expect(resolveTemplate("{{rangedWeapons | first | upper}}", context)).toBe("BOLT PISTOL");
      expect(resolveTemplate("{{missing | count}}", context)).toBe("0");
    });

    it("chains filters in order", () => {
      expect(resolveTemplate('{{name | upper | prefix:"Unit: "}}', context)).toBe("Unit: CAPTAIN");
      expect(resolveTemplate('{{missing | default:"none" | upper}}', context)).toBe("NONE");
    });

    it("ignores unknown filters", () => {
      expect(resolveTemplate("{{name | bogus}}", context)).toBe("Captain");
      expect(resolveTemplate('{{name | bogus:"x" | upper}}', context)).toBe("CAPTAIN");
    });

    it("reports when every binding of a text is empty", () => {
      expect(areBindingsEmpty("{{transport}}", context)).toBe(true);
      expect(areBindingsEmpty("{{name}}", context)).toBe(false);
      expect(areBindingsEmpty("{{transport}} {{missing}}", context)).toBe(true);
      expect(areBindingsEmpty("{{transport}} {{name}}", context)).toBe(false);
      expect(areBindingsEmpty('{{transport | default:"-"}}', context)).toBe(false);
      expect(areBindingsEmpty("static text", context)).toBe(false);
    });
  });

  describe("template helpers", () => {
    it("detects and extracts bindings", () => {
      expect(hasBindings("Name: {{name}}")).toBe(true);
      expect(hasBindings("Name")).toBe(false);
      expect(extractBindings("{{name}} - {{ stats[0].m }}")).toEqual(["name", "stats[0].m"]);
    });

    it("formats values", () => {
      expect(formatBindingValue(undefined)).toBe("");
      expect(formatBindingValue(null)).toBe("");
      expect(formatBindingValue(0)).toBe("0");
      expect(formatBindingValue(false)).toBe("false");
      expect(formatBindingValue(["a", "b"])).toBe("a, b");
      expect(formatBindingValue({ en: "Leader", de: "Anführer" }, "de")).toBe("Anführer");
    });

    it("returns the template unchanged without a context", () => {
      expect(resolveTemplate("{{name}}", null)).toBe("{{name}}");
      expect(resolveTemplate("", {})).toBe("");
    });
  });
});
