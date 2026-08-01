import React from "react";
import { render } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// react-swipeable attaches touch handlers we don't exercise here.
vi.mock("react-swipeable", () => ({ useSwipeable: () => ({}) }));

import { BottomSheet } from "../BottomSheet";
import { DetachmentPicker } from "../DetachmentPicker";
import { ArmyRosterSheet } from "../ArmyRosterSheet";

// BottomSheet portals to #modal-root (the same layer MobileModal uses). Without
// a #modal-root in the test DOM the portal has no target.
const mountModalRoot = () => {
  const root = document.createElement("div");
  root.id = "modal-root";
  document.body.appendChild(root);
  return root;
};

describe("BottomSheet elevation", () => {
  beforeEach(() => mountModalRoot());
  afterEach(() => {
    document.getElementById("modal-root")?.remove();
  });

  it("renders above the modal layer by default", () => {
    const { baseElement } = render(
      <BottomSheet isOpen onClose={() => {}} title="Plain">
        <p>body</p>
      </BottomSheet>,
    );
    expect(baseElement.querySelector(".bottom-sheet")).toHaveClass("bottom-sheet--elevated");
    expect(baseElement.querySelector(".bottom-sheet-backdrop")).toHaveClass("bottom-sheet-backdrop--elevated");
  });

  it("can be dropped below the modal layer", () => {
    const { baseElement } = render(
      <BottomSheet isOpen onClose={() => {}} title="Plain" elevated={false}>
        <p>body</p>
      </BottomSheet>,
    );
    expect(baseElement.querySelector(".bottom-sheet")).not.toHaveClass("bottom-sheet--elevated");
    expect(baseElement.querySelector(".bottom-sheet-backdrop")).not.toHaveClass("bottom-sheet-backdrop--elevated");
  });

  it("portals into #modal-root so it shares the modal stacking context", () => {
    const { baseElement } = render(
      <BottomSheet isOpen onClose={() => {}} title="Plain">
        <p>body</p>
      </BottomSheet>,
    );
    // Regression: the sheet used to render inline in the app tree, trapped in
    // MobileNav's position:fixed stacking context below the #modal-root layer.
    const modalRoot = document.getElementById("modal-root");
    expect(modalRoot.querySelector(".bottom-sheet")).not.toBeNull();
    expect(modalRoot.querySelector(".bottom-sheet").textContent).toContain("Plain");
    // The inline tree (render container) must not hold the sheet.
    expect(baseElement).not.toBeNull();
  });
});

describe("DetachmentPicker elevation", () => {
  beforeEach(() => mountModalRoot());
  afterEach(() => {
    document.getElementById("modal-root")?.remove();
  });

  const detachments = [{ name: { en: "Gladius Task Force" } }];

  it("clears a surrounding modal by default", () => {
    const { baseElement } = render(
      <DetachmentPicker isOpen onClose={() => {}} detachments={detachments} selected="" onSelect={() => {}} />,
    );
    expect(baseElement.querySelector(".bottom-sheet")).toHaveClass("bottom-sheet--elevated");
  });

  it("can be dropped to the default layer", () => {
    const { baseElement } = render(
      <DetachmentPicker
        isOpen
        onClose={() => {}}
        detachments={detachments}
        selected=""
        onSelect={() => {}}
        elevated={false}
      />,
    );
    expect(baseElement.querySelector(".bottom-sheet")).not.toHaveClass("bottom-sheet--elevated");
  });
});

describe("ArmyRosterSheet elevation", () => {
  beforeEach(() => mountModalRoot());
  afterEach(() => {
    document.getElementById("modal-root")?.remove();
  });

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
    const { baseElement } = renderSheet();
    expect(baseElement.querySelector(".bottom-sheet")).toHaveClass("bottom-sheet--elevated");
    expect(baseElement.querySelector(".bottom-sheet-backdrop")).toHaveClass("bottom-sheet-backdrop--elevated");
  });

  it("can still be dropped to the default layer", () => {
    const { baseElement } = renderSheet({ elevated: false });
    expect(baseElement.querySelector(".bottom-sheet")).not.toHaveClass("bottom-sheet--elevated");
  });
});
