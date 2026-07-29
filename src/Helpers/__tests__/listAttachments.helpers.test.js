import { describe, it, expect } from "vitest";
import {
  isAttachableLeader,
  getAttachTargetNames,
  canAttachTo,
  getEligibleSquads,
  getAttachedSquad,
  groupListForDisplay,
} from "../listAttachments.helpers";

const leader = (extra = {}) => ({
  uuid: "leader-1",
  name: "Captain",
  nameEn: "Captain",
  attachesTo: [
    { type: "leader", target: "Intercessor Squad", targetType: "datasheet" },
    { type: "leader", target: "Assault Intercessor Squad", targetType: "datasheet" },
  ],
  ...extra,
});

const squad = (name, uuid) => ({ uuid, name, nameEn: name });

describe("isAttachableLeader / getAttachTargetNames", () => {
  it("detects a leader by its attachesTo targets", () => {
    expect(isAttachableLeader(leader())).toBe(true);
    expect(isAttachableLeader(squad("Intercessor Squad", "s1"))).toBe(false);
    expect(isAttachableLeader({ attachesTo: [] })).toBe(false);
  });

  it("lists the English target names", () => {
    expect(getAttachTargetNames(leader())).toEqual(["Intercessor Squad", "Assault Intercessor Squad"]);
  });
});

describe("canAttachTo", () => {
  it("matches a squad whose English name is a target", () => {
    expect(canAttachTo(leader(), squad("Intercessor Squad", "s1"))).toBe(true);
  });

  it("matches by English name even when the display name is localised", () => {
    const germanSquad = { uuid: "s1", name: "Intercessor-Trupp", nameEn: "Intercessor Squad" };
    expect(canAttachTo(leader(), germanSquad)).toBe(true);
  });

  it("rejects a non-target squad and self-attachment", () => {
    expect(canAttachTo(leader(), squad("Terminator Squad", "s2"))).toBe(false);
    expect(canAttachTo(leader(), { ...squad("Captain", "leader-1") })).toBe(false);
  });
});

describe("getEligibleSquads", () => {
  it("returns only eligible squads present in the list", () => {
    const list = [leader(), squad("Intercessor Squad", "s1"), squad("Terminator Squad", "s2")];
    expect(getEligibleSquads(leader(), list).map((c) => c.uuid)).toEqual(["s1"]);
  });
});

describe("getAttachedSquad", () => {
  it("resolves the squad a leader is attached to", () => {
    const list = [squad("Intercessor Squad", "s1")];
    expect(getAttachedSquad(leader({ attachedTo: "s1" }), list)?.uuid).toBe("s1");
    expect(getAttachedSquad(leader(), list)).toBeNull();
  });
});

describe("groupListForDisplay", () => {
  it("nests attached leaders under their squad and removes them from the flat list", () => {
    const list = [leader({ attachedTo: "s1" }), squad("Intercessor Squad", "s1"), squad("Terminator Squad", "s2")];
    const rows = groupListForDisplay(list);
    expect(rows.map((r) => r.card.uuid)).toEqual(["s1", "s2"]);
    const s1 = rows.find((r) => r.card.uuid === "s1");
    expect(s1.attachedLeaders.map((l) => l.uuid)).toEqual(["leader-1"]);
  });

  it("treats a leader with a stale attachedTo as standalone", () => {
    const list = [leader({ attachedTo: "missing" })];
    const rows = groupListForDisplay(list);
    expect(rows.map((r) => r.card.uuid)).toEqual(["leader-1"]);
    expect(rows[0].attachedLeaders).toEqual([]);
  });
});
