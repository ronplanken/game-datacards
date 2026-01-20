import sizes from "../sizes.helpers";
import { COLOURS } from "../printcolours";
import { BaseCard, CardType, StatSheet, DataCard } from "../gamedatacards.helpers";
import { SECTIONS_40K, SECTIONS_AOS } from "../listCategories.helpers";
import { VALID_DISPLAY_FORMATS } from "../customDatasource.helpers";
import {
  BaseNotes,
  Upgrade,
  Weapon,
  WoundTracker,
  Explosion,
  Psyker,
  PsychicPower,
  UnitRole,
  UnitRoleSorting,
  Model,
  Unit,
  Force,
  Roster40k,
  Costs,
} from "../battlescribe.40k.helpers";

describe("sizes.helpers - structure", () => {
  it("should have all expected size types", () => {
    expect(sizes).toHaveProperty("playingcard");
    expect(sizes).toHaveProperty("card");
    expect(sizes).toHaveProperty("poker");
    expect(sizes).toHaveProperty("sheet");
    expect(sizes).toHaveProperty("a4");
    expect(sizes).toHaveProperty("letter");
    expect(sizes).toHaveProperty("letterhalf");
    expect(sizes).toHaveProperty("secondary");
  });

  it("should have correct properties for each size", () => {
    Object.values(sizes).forEach((size) => {
      expect(size).toHaveProperty("height");
      expect(size).toHaveProperty("width");
      expect(size).toHaveProperty("heightInPixels");
      expect(size).toHaveProperty("widthInPixels");
    });
  });

  it("should have valid pixel dimensions", () => {
    Object.values(sizes).forEach((size) => {
      expect(typeof size.heightInPixels).toBe("number");
      expect(typeof size.widthInPixels).toBe("number");
      expect(size.heightInPixels).toBeGreaterThan(0);
      expect(size.widthInPixels).toBeGreaterThan(0);
    });
  });
});

describe("printcolours - structure", () => {
  it("should have all expected colour schemes", () => {
    expect(COLOURS).toHaveProperty("standard");
    expect(COLOURS).toHaveProperty("light");
    expect(COLOURS).toHaveProperty("colourprint");
    expect(COLOURS).toHaveProperty("greyprint");
    expect(COLOURS).toHaveProperty("debug");
  });

  it("should have required colour properties in each scheme", () => {
    const requiredProps = [
      "titleBackgroundColour",
      "titleTextColour",
      "factionTextColour",
      "headerColour",
      "headerTextColour",
      "statTextColour",
      "statTitleColour",
      "bannerColour",
      "textBackgroundColour",
      "rowsColour",
      "altRowsColour",
      "keywordsBackgroundColour",
      "weaponKeywordColour",
    ];

    Object.values(COLOURS).forEach((scheme) => {
      requiredProps.forEach((prop) => {
        expect(scheme).toHaveProperty(prop);
      });
    });
  });
});

describe("gamedatacards.helpers - structures", () => {
  describe("CardType", () => {
    it("should have correct card type values", () => {
      expect(CardType.DATASHEET).toBe("datasheet");
      expect(CardType.STRATAGEM).toBe("stratagem");
      expect(CardType.SECONDARY).toBe("secondary");
    });
  });

  describe("BaseCard", () => {
    it("should have default empty name", () => {
      const card = new BaseCard();
      expect(card.name).toBe("");
    });
  });

  describe("StatSheet", () => {
    it("should have default stat values", () => {
      const sheet = new StatSheet();
      expect(sheet.m).toBe(4);
      expect(sheet.t).toBe(4);
      expect(sheet.sv).toBe(4);
      expect(sheet.w).toBe(1);
      expect(sheet.ld).toBe(1);
      expect(sheet.oc).toBe(0);
      expect(sheet.invul).toBe(0);
      expect(sheet.active).toBe(true);
    });
  });

  describe("DataCard", () => {
    it("should have default values", () => {
      const card = new DataCard();
      expect(card.id).toBe(0);
      expect(card.description).toBe("");
      expect(card.faction_id).toBe("unknown");
      expect(card.statSheets).toEqual([]);
      expect(card.rangedWeapons).toEqual([]);
      expect(card.meleeWeapons).toEqual([]);
      expect(card.wargear).toEqual([]);
      expect(card.abilities).toEqual([]);
    });

    it("should have Set types for keywords", () => {
      const card = new DataCard();
      expect(card.factionKeywords).toBeInstanceOf(Set);
      expect(card.keywords).toBeInstanceOf(Set);
    });
  });
});

describe("listCategories.helpers - structures", () => {
  describe("SECTIONS_40K", () => {
    it("should have all 40k section types", () => {
      const keys = SECTIONS_40K.map((s) => s.key);
      expect(keys).toContain("characters");
      expect(keys).toContain("battleline");
      expect(keys).toContain("transports");
      expect(keys).toContain("other");
      expect(keys).toContain("allied");
    });

    it("should have required properties for each section", () => {
      SECTIONS_40K.forEach((section) => {
        expect(section).toHaveProperty("key");
        expect(section).toHaveProperty("label");
        expect(section).toHaveProperty("clipboardLabel");
      });
    });
  });

  describe("SECTIONS_AOS", () => {
    it("should have all AoS section types", () => {
      const keys = SECTIONS_AOS.map((s) => s.key);
      expect(keys).toContain("heroes");
      expect(keys).toContain("battleline");
      expect(keys).toContain("monsters");
      expect(keys).toContain("cavalry");
      expect(keys).toContain("infantry");
    });
  });
});

describe("customDatasource.helpers - structures", () => {
  describe("VALID_DISPLAY_FORMATS", () => {
    it("should contain expected formats", () => {
      expect(VALID_DISPLAY_FORMATS).toContain("40k-10e");
      expect(VALID_DISPLAY_FORMATS).toContain("40k");
      expect(VALID_DISPLAY_FORMATS).toContain("basic");
      expect(VALID_DISPLAY_FORMATS).toContain("necromunda");
      expect(VALID_DISPLAY_FORMATS).toContain("aos");
    });
  });
});

describe("battlescribe.40k.helpers - structures", () => {
  describe("UnitRole", () => {
    it("should have all unit roles", () => {
      expect(UnitRole.NONE).toBe("NONE");
      expect(UnitRole.HQ).toBe("HQ");
      expect(UnitRole.TR).toBe("TR");
      expect(UnitRole.EL).toBe("EL");
      expect(UnitRole.FA).toBe("FA");
      expect(UnitRole.HS).toBe("HS");
      expect(UnitRole.DT).toBe("DT");
    });
  });

  describe("UnitRoleSorting", () => {
    it("should have sorting values for roles", () => {
      expect(UnitRoleSorting.NONE).toBe(0);
      expect(UnitRoleSorting.HQ).toBe(2);
      expect(UnitRoleSorting.TR).toBe(3);
    });
  });

  describe("BaseNotes", () => {
    it("should have default empty name", () => {
      const notes = new BaseNotes();
      expect(notes.name).toBe("");
    });
  });

  describe("Upgrade", () => {
    it("should have default values", () => {
      const upgrade = new Upgrade();
      expect(upgrade.count).toBe(1);
      expect(upgrade.cost).toBeInstanceOf(Costs);
    });
  });

  describe("Weapon", () => {
    it("should have default values", () => {
      const weapon = new Weapon();
      expect(weapon.range).toBe("");
      expect(weapon.type).toBe("Melee");
      expect(weapon.str).toBe("user");
    });
  });

  describe("Model", () => {
    it("should have default values", () => {
      const model = new Model();
      expect(model.count).toBe(0);
      expect(model.toughness).toBe(4);
      expect(model.wounds).toBe(1);
      expect(model.weapons).toEqual([]);
      expect(model.upgrades).toEqual([]);
    });
  });

  describe("Unit", () => {
    it("should have default values", () => {
      const unit = new Unit();
      expect(unit.factions).toBeInstanceOf(Set);
      expect(unit.keywords).toBeInstanceOf(Set);
      expect(unit.models).toEqual([]);
      expect(unit.cost).toBeInstanceOf(Costs);
    });
  });

  describe("Force", () => {
    it("should have default values", () => {
      const force = new Force();
      expect(force.catalog).toBe("");
      expect(force.faction).toBe("Unknown");
      expect(force.units).toEqual([]);
    });
  });

  describe("Roster40k", () => {
    it("should have default values", () => {
      const roster = new Roster40k();
      expect(roster.cost).toBeInstanceOf(Costs);
      expect(roster.forces).toEqual([]);
    });
  });

  describe("Costs", () => {
    it("should have default values", () => {
      const costs = new Costs();
      expect(costs.commandPoints).toBe(0);
      expect(costs.points).toBe(0);
    });
  });
});
