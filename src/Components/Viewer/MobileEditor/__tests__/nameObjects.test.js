import { describe, it, expect } from "vitest";
import { alignNameObjects, nameObjectLabel } from "../shared/nameObjects";

describe("nameObjectLabel", () => {
  it("reads both the object and the bare-string shape", () => {
    expect(nameObjectLabel({ name: "Scouts" })).toBe("Scouts");
    expect(nameObjectLabel("Scouts")).toBe("Scouts");
    expect(nameObjectLabel(undefined)).toBe("");
  });
});

describe("alignNameObjects", () => {
  // The language map each entry carries is what must survive a chip edit.
  const items = [
    { name: "Infantry", __i18n: { name: { en: "Infantry", de: "Infanterie" } } },
    { name: "Imperium", __i18n: { name: { en: "Imperium", de: "Imperium" } } },
    { name: "Grenades", __i18n: { name: { en: "Grenades", de: "Granaten" } } },
  ];

  it("keeps the original entries when nothing changed", () => {
    expect(alignNameObjects(items, ["Infantry", "Imperium", "Grenades"])).toEqual(items);
  });

  it("keeps the surviving entries when one is removed", () => {
    expect(alignNameObjects(items, ["Infantry", "Grenades"])).toEqual([items[0], items[2]]);
  });

  it("adds a new entry for a chip that did not exist", () => {
    const result = alignNameObjects(items, ["Infantry", "Imperium", "Grenades", "Character"]);

    expect(result.slice(0, 3)).toEqual(items);
    expect(result[3]).toEqual({ name: "Character" });
  });

  it("consumes duplicates one at a time", () => {
    const dupes = [{ name: "Core" }, { name: "Core" }];
    expect(alignNameObjects(dupes, ["Core"])).toEqual([{ name: "Core" }]);
  });
});
