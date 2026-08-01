import { describe, it, expect } from "vitest";
import {
  isAttachableLeader,
  getAttachTargetNames,
  canAttachTo,
  getEligibleSquads,
  getAttachedSquad,
  groupListForDisplay,
  getAttachmentType,
  requiresAttachment,
  getUnattachedSupportCards,
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

describe("support units (must be attached)", () => {
  const support = (extra = {}) => ({
    uuid: "sup-1",
    name: "Warlock",
    nameEn: "Warlock",
    attachesTo: [{ type: "support", target: "Guardian Defenders", targetType: "datasheet" }],
    ...extra,
  });
  const leaderCard = {
    uuid: "led-1",
    nameEn: "Captain",
    attachesTo: [{ type: "leader", target: "Intercessor Squad", targetType: "datasheet" }],
  };

  it("distinguishes support from leader attachments", () => {
    expect(getAttachmentType(support())).toBe("support");
    expect(getAttachmentType(leaderCard)).toBe("leader");
    expect(getAttachmentType({ name: "Rhino" })).toBeNull();
  });

  it("marks only support units as requiring attachment", () => {
    expect(requiresAttachment(support())).toBe(true);
    expect(requiresAttachment(leaderCard)).toBe(false);
  });

  it("flags support units that are unattached or point at a missing squad", () => {
    const squad = { uuid: "s1", nameEn: "Guardian Defenders" };
    expect(getUnattachedSupportCards([support(), squad]).map((c) => c.uuid)).toEqual(["sup-1"]);
    expect(getUnattachedSupportCards([support({ attachedTo: "s1" }), squad])).toEqual([]);
    // stale reference: squad no longer in the list
    expect(getUnattachedSupportCards([support({ attachedTo: "gone" })]).map((c) => c.uuid)).toEqual(["sup-1"]);
    // leaders are never flagged
    expect(getUnattachedSupportCards([leaderCard])).toEqual([]);
  });
});

describe("attachesTo qualifiers", () => {
  const abaddon = {
    uuid: "ab-1",
    nameEn: "Abaddon the Despoiler",
    attachesTo: [
      { type: "leader", target: "Chosen", targetType: "datasheet", excludesDetachment: "Pactbound Zealots" },
      {
        type: "leader",
        target: "Chosen",
        targetType: "datasheet",
        requiresDetachment: "Pactbound Zealots",
        requiresKeyword: "Khorne",
      },
    ],
  };
  const plainChosen = { uuid: "c1", nameEn: "Chosen", keywords: [{ en: "Infantry" }] };
  const khorneChosen = { uuid: "c2", nameEn: "Chosen", keywords: [{ en: "Infantry" }, { en: "Khorne" }] };

  it("is permissive when no detachment is chosen", () => {
    expect(canAttachTo(abaddon, plainChosen)).toBe(true);
  });

  it("honours excludesDetachment", () => {
    expect(canAttachTo(abaddon, plainChosen, { detachment: "Pactbound Zealots" })).toBe(false);
    expect(canAttachTo(abaddon, plainChosen, { detachment: "Slaves to Darkness" })).toBe(true);
  });

  it("honours requiresDetachment plus requiresKeyword on the target squad", () => {
    expect(canAttachTo(abaddon, khorneChosen, { detachment: "Pactbound Zealots" })).toBe(true);
    expect(canAttachTo(abaddon, khorneChosen, { detachment: "Slaves to Darkness" })).toBe(true);
  });

  it("filters eligible squads by the army detachment", () => {
    const list = [plainChosen, khorneChosen];
    expect(getEligibleSquads(abaddon, list, { detachment: "Pactbound Zealots" }).map((c) => c.uuid)).toEqual(["c2"]);
  });
});
