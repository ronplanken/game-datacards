import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

// react-swipeable attaches touch handlers we don't exercise here.
vi.mock("react-swipeable", () => ({ useSwipeable: () => ({}) }));

import { BottomSheet } from "../BottomSheet";
import { DetachmentPicker } from "../DetachmentPicker";
import { ArmyRosterSheet } from "../ArmyRosterSheet";

describe("BottomSheet elevation", () => {
  it("renders at the default layer without the elevated flag", () => {
    const { container } = render(
      <BottomSheet isOpen onClose={() => {}} title="Plain">
        <p>body</p>
      </BottomSheet>,
    );
    expect(container.querySelector(".bottom-sheet")).not.toHaveClass("bottom-sheet--elevated");
    expect(container.querySelector(".bottom-sheet-backdrop")).not.toHaveClass("bottom-sheet-backdrop--elevated");
  });

  it("lifts the sheet and its backdrop when elevated", () => {
    const { container } = render(
      <BottomSheet isOpen onClose={() => {}} title="Nested" elevated>
        <p>body</p>
      </BottomSheet>,
    );
    expect(container.querySelector(".bottom-sheet")).toHaveClass("bottom-sheet--elevated");
    expect(container.querySelector(".bottom-sheet-backdrop")).toHaveClass("bottom-sheet-backdrop--elevated");
  });
});

describe("DetachmentPicker elevation", () => {
  const detachments = [{ name: { en: "Gladius Task Force" } }];

  it("stays at the default layer by default", () => {
    const { container } = render(
      <DetachmentPicker isOpen onClose={() => {}} detachments={detachments} selected="" onSelect={() => {}} />,
    );
    expect(container.querySelector(".bottom-sheet")).not.toHaveClass("bottom-sheet--elevated");
  });

  it("passes elevation through so it clears a surrounding modal", () => {
    const { container } = render(
      <DetachmentPicker isOpen onClose={() => {}} detachments={detachments} selected="" onSelect={() => {}} elevated />,
    );
    expect(container.querySelector(".bottom-sheet")).toHaveClass("bottom-sheet--elevated");
  });
});

describe("ArmyRosterSheet elevation", () => {
  const detachments = [{ name: { en: "Gladius Task Force" }, detachmentPoints: 1 }];

  const renderSheet = (props = {}) =>
    render(
      <ArmyRosterSheet
        isOpen
        onClose={() => {}}
        detachments={detachments}
        selectedDetachments={[]}
        battleSize="strikeForce"
        onChangeBattleSize={() => {}}
        onChangeDetachments={() => {}}
        {...props}
      />,
    );

  it("clears the list overview modal it is opened from", () => {
    // Regression: the roster sheet rendered behind the modal because it never
    // forwarded elevation to the BottomSheet.
    const { container } = renderSheet();
    expect(container.querySelector(".bottom-sheet")).toHaveClass("bottom-sheet--elevated");
    expect(container.querySelector(".bottom-sheet-backdrop")).toHaveClass("bottom-sheet-backdrop--elevated");
  });

  it("can still be dropped to the default layer", () => {
    const { container } = renderSheet({ elevated: false });
    expect(container.querySelector(".bottom-sheet")).not.toHaveClass("bottom-sheet--elevated");
  });
});
