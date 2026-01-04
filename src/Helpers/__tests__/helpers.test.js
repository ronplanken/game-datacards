import { reorder } from "../generic.helpers";
import sizes from "../sizes.helpers";
import { COLOURS } from "../printcolours";
import {
  getBackgroundColor,
  getMinHeight,
  reorder as treeviewReorder,
  move,
  getListFactionId,
} from "../treeview.helpers";
import { BaseCard, CardType, StatSheet, DataCard } from "../gamedatacards.helpers";

describe("generic.helpers", () => {
  describe("reorder", () => {
    it("should move item from start to end", () => {
      const list = ["a", "b", "c", "d"];
      const result = reorder(list, 0, 3);
      expect(result).toEqual(["b", "c", "d", "a"]);
    });

    it("should move item from end to start", () => {
      const list = ["a", "b", "c", "d"];
      const result = reorder(list, 3, 0);
      expect(result).toEqual(["d", "a", "b", "c"]);
    });

    it("should move item to adjacent position", () => {
      const list = ["a", "b", "c"];
      const result = reorder(list, 0, 1);
      expect(result).toEqual(["b", "a", "c"]);
    });

    it("should not mutate original array", () => {
      const list = ["a", "b", "c"];
      reorder(list, 0, 2);
      expect(list).toEqual(["a", "b", "c"]);
    });
  });
});

describe("sizes.helpers", () => {
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

describe("printcolours", () => {
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

describe("treeview.helpers", () => {
  describe("getBackgroundColor", () => {
    it("should return dragging over color when isDraggingOver is true", () => {
      expect(getBackgroundColor({ isDraggingOver: true })).toBe("#f8f8f8");
    });

    it("should return dragging from color when draggingFromThisWith is set", () => {
      expect(getBackgroundColor({ draggingFromThisWith: "some-id" })).toBe("#e6f6ff");
    });

    it("should return white by default", () => {
      expect(getBackgroundColor({})).toBe("white");
    });
  });

  describe("getMinHeight", () => {
    it("should return 36px when dragging over", () => {
      expect(getMinHeight({ isDraggingOver: true })).toBe("36px");
    });

    it("should return 0px by default", () => {
      expect(getMinHeight({})).toBe("0px");
    });
  });

  describe("reorder", () => {
    it("should reorder items in list", () => {
      const list = [{ id: 1 }, { id: 2 }, { id: 3 }];
      const result = treeviewReorder(list, 0, 2);
      expect(result).toEqual([{ id: 2 }, { id: 3 }, { id: 1 }]);
    });

    it("should not mutate original array", () => {
      const list = [{ id: 1 }, { id: 2 }];
      treeviewReorder(list, 0, 1);
      expect(list).toEqual([{ id: 1 }, { id: 2 }]);
    });
  });

  describe("move", () => {
    it("should move item between lists", () => {
      const source = [{ id: 1 }, { id: 2 }];
      const destination = [{ id: 3 }];
      const droppableSource = { droppableId: "source", index: 0 };
      const droppableDestination = { droppableId: "dest", index: 0 };

      const result = move(source, destination, droppableSource, droppableDestination);

      expect(result.source).toEqual([{ id: 2 }]);
      expect(result.dest).toEqual([{ id: 1 }, { id: 3 }]);
    });
  });

  describe("getListFactionId", () => {
    it("should return empty string for null card", () => {
      expect(getListFactionId(null, {})).toBe("");
    });

    it("should return empty string for datasheet with matching faction", () => {
      const card = { cardType: "datasheet", faction_id: "SM" };
      const faction = { id: "SM" };
      expect(getListFactionId(card, faction)).toBe("");
    });

    it("should return faction_id for datasheet with different faction", () => {
      const card = { cardType: "datasheet", faction_id: "ORK" };
      const faction = { id: "SM" };
      expect(getListFactionId(card, faction)).toBe("ORK");
    });

    it("should return subfaction_id for stratagem with subfaction", () => {
      const card = { cardType: "stratagem", subfaction_id: "BA" };
      expect(getListFactionId(card, {})).toBe("BA");
    });

    it("should return empty string for stratagem without subfaction", () => {
      const card = { cardType: "stratagem", subfaction_id: null };
      expect(getListFactionId(card, {})).toBe("");
    });

    it("should return basic for secondary with empty faction", () => {
      const card = { cardType: "secondary", faction_id: "" };
      expect(getListFactionId(card, {})).toBe("basic");
    });

    it("should return faction_id for secondary with faction", () => {
      const card = { cardType: "secondary", faction_id: "SM" };
      expect(getListFactionId(card, {})).toBe("SM");
    });
  });
});

describe("gamedatacards.helpers", () => {
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

    it("should return false when comparing with null", () => {
      const card = new BaseCard();
      expect(card.equal(null)).toBe(false);
    });

    it("should return true when names match", () => {
      const card1 = new BaseCard();
      card1.name = "Test";
      const card2 = new BaseCard();
      card2.name = "Test";
      expect(card1.equal(card2)).toBe(true);
    });

    it("should return false when names differ", () => {
      const card1 = new BaseCard();
      card1.name = "Test1";
      const card2 = new BaseCard();
      card2.name = "Test2";
      expect(card1.equal(card2)).toBe(false);
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
