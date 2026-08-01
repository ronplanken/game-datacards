import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ArmyRosterSheet } from "../ArmyRosterSheet";

// BottomSheet renders through a portal/animation wrapper; render its children inline.
vi.mock("../BottomSheet", () => ({
  BottomSheet: ({ isOpen, title, children }) => (isOpen ? <div aria-label={title}>{children}</div> : null),
}));

const det = (name, points, id, disposition) => ({
  id,
  name: { en: name },
  detachmentPoints: points,
  forceDisposition: disposition ? { name: { en: disposition } } : undefined,
});

const lions = det("Lions of the Emperor", 2, "d-lions", "Disruption");
const shield = det("Shield Host", 1, "d-shield", "Vanguard");
const talons = det("Talons of the Emperor", 3, "d-talons");

const renderSheet = (props = {}) =>
  render(
    <ArmyRosterSheet
      isOpen
      onClose={vi.fn()}
      detachments={[lions, shield, talons]}
      selectedDetachments={[]}
      battleSize="strikeForce"
      onChangeBattleSize={vi.fn()}
      onChangeDetachments={vi.fn()}
      {...props}
    />,
  );

describe("ArmyRosterSheet battle size", () => {
  it("offers both 11e battle sizes with their points and DP", () => {
    renderSheet();
    expect(screen.getByText("Incursion")).toBeInTheDocument();
    expect(screen.getByText("Strike Force")).toBeInTheDocument();
    expect(screen.getByText("1000 pts · 2 DP")).toBeInTheDocument();
    expect(screen.getByText("2000 pts · 3 DP")).toBeInTheDocument();
  });

  it("reports the chosen battle size", () => {
    const onChangeBattleSize = vi.fn();
    renderSheet({ onChangeBattleSize });
    fireEvent.click(screen.getByText("Incursion"));
    expect(onChangeBattleSize).toHaveBeenCalledWith("incursion");
  });
});

describe("ArmyRosterSheet detachments", () => {
  it("lists each detachment with its DP cost and force disposition", () => {
    renderSheet();
    expect(screen.getByText("Lions of the Emperor")).toBeInTheDocument();
    expect(screen.getByText("Disruption")).toBeInTheDocument();
    expect(screen.getByText("2 DP")).toBeInTheDocument();
  });

  it("shows the DP spent against the battle size budget", () => {
    renderSheet({ selectedDetachments: [lions] });
    expect(screen.getByText("2/3 DP")).toBeInTheDocument();
  });

  it("adds a detachment that fits the budget", () => {
    const onChangeDetachments = vi.fn();
    renderSheet({ selectedDetachments: [lions], onChangeDetachments });
    fireEvent.click(screen.getByText("Shield Host"));
    expect(onChangeDetachments).toHaveBeenCalledWith([lions, shield]);
  });

  it("removes an already selected detachment", () => {
    const onChangeDetachments = vi.fn();
    renderSheet({ selectedDetachments: [lions, shield], onChangeDetachments });
    fireEvent.click(screen.getByText("Lions of the Emperor"));
    expect(onChangeDetachments).toHaveBeenCalledWith([shield]);
  });

  it("disables detachments that would exceed the DP budget", () => {
    // Strike Force = 3 DP; Lions (2) leaves 1, so Talons (3) must be unavailable.
    const onChangeDetachments = vi.fn();
    renderSheet({ selectedDetachments: [lions], onChangeDetachments });
    const talonsButton = screen.getByText("Talons of the Emperor").closest("button");
    expect(talonsButton).toBeDisabled();
    fireEvent.click(talonsButton);
    expect(onChangeDetachments).not.toHaveBeenCalled();
  });

  it("respects a smaller Incursion budget", () => {
    renderSheet({ selectedDetachments: [lions], battleSize: "incursion" });
    expect(screen.getByText("2/2 DP")).toBeInTheDocument();
    expect(screen.getByText("Shield Host").closest("button")).toBeDisabled();
  });

  it("tells the user when the faction has no detachments", () => {
    renderSheet({ detachments: [] });
    expect(screen.getByText("This faction has no detachments.")).toBeInTheDocument();
  });
});
