import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ArmyRosterModal } from "../ArmyRosterModal";

const det = (name, points, id, disposition) => ({
  id,
  name: { en: name },
  detachmentPoints: points,
  forceDisposition: disposition ? { name: { en: disposition } } : undefined,
});

const lions = det("Lions of the Emperor", 2, "d-lions", "Disruption");
const shield = det("Shield Host", 1, "d-shield", "Vanguard");
const talons = det("Talons of the Emperor", 3, "d-talons");

const renderModal = (props = {}) =>
  render(
    <ArmyRosterModal
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

describe("ArmyRosterModal", () => {
  // The modal renders through a portal into #modal-root.
  let modalRoot;

  beforeEach(() => {
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    document.body.removeChild(modalRoot);
  });

  it("renders nothing while closed", () => {
    renderModal({ isOpen: false });
    expect(modalRoot).toBeEmptyDOMElement();
  });

  it("offers both 11e battle sizes with their points and DP", () => {
    renderModal();
    expect(screen.getByText("Incursion")).toBeInTheDocument();
    expect(screen.getByText("Strike Force")).toBeInTheDocument();
    expect(screen.getByText("1000 pts · 2 DP")).toBeInTheDocument();
    expect(screen.getByText("2000 pts · 3 DP")).toBeInTheDocument();
  });

  it("reports the chosen battle size", () => {
    const onChangeBattleSize = vi.fn();
    renderModal({ onChangeBattleSize });
    fireEvent.click(screen.getByText("Incursion"));
    expect(onChangeBattleSize).toHaveBeenCalledWith("incursion");
  });

  it("shows every force disposition of a detachment", () => {
    const both = {
      ...lions,
      forceDispositions: [{ name: { en: "Disruption" } }, { name: { en: "Take and Hold" } }],
    };
    renderModal({ detachments: [both] });
    expect(screen.getByText("Disruption, Take and Hold")).toBeInTheDocument();
  });

  it("lists each detachment with its DP cost and force disposition", () => {
    renderModal();
    expect(screen.getByText("Lions of the Emperor")).toBeInTheDocument();
    expect(screen.getByText("Disruption")).toBeInTheDocument();
    expect(screen.getAllByText(/^\d DP$/).map((node) => node.textContent)).toEqual(["2 DP", "1 DP", "3 DP"]);
  });

  it("adds a detachment to the selection", () => {
    const onChangeDetachments = vi.fn();
    renderModal({ onChangeDetachments });
    fireEvent.click(screen.getByText("Shield Host"));
    expect(onChangeDetachments).toHaveBeenCalledWith([shield]);
  });

  it("removes an already selected detachment", () => {
    const onChangeDetachments = vi.fn();
    renderModal({ selectedDetachments: [shield], onChangeDetachments });
    fireEvent.click(screen.getByText("Shield Host"));
    expect(onChangeDetachments).toHaveBeenCalledWith([]);
  });

  it("disables detachments that no longer fit the DP budget", () => {
    const onChangeDetachments = vi.fn();
    // Strike Force is 3 DP; Lions (2) leaves 1, so Talons (3) cannot be added.
    renderModal({ selectedDetachments: [lions], onChangeDetachments });
    fireEvent.click(screen.getByText("Talons of the Emperor"));
    expect(onChangeDetachments).not.toHaveBeenCalled();
  });

  it("shows the remaining Detachment Points", () => {
    renderModal({ selectedDetachments: [shield] });
    expect(screen.getByText("1/3 DP")).toBeInTheDocument();
    expect(screen.getByText("2 DP remaining.")).toBeInTheDocument();
  });

  it("tells the user when the faction has no detachments", () => {
    renderModal({ detachments: [] });
    expect(screen.getByText("This faction has no detachments.")).toBeInTheDocument();
  });

  it("warns when a lowered battle size can no longer pay for the selection", () => {
    // Picked at Strike Force (3 DP), then switched to Incursion (2 DP).
    renderModal({ selectedDetachments: [lions, shield], battleSize: "incursion" });
    expect(screen.getByText(/This selection costs 3 DP, more than Incursion allows/)).toBeInTheDocument();
    expect(screen.getByText("3/2 DP")).toHaveClass("arm-dp--over");
  });

  it("does not warn about the legal Incursion solo 3DP detachment", () => {
    renderModal({ selectedDetachments: [talons], battleSize: "incursion" });
    expect(screen.queryByText(/more than/)).not.toBeInTheDocument();
    expect(screen.getByText("3/2 DP")).not.toHaveClass("arm-dp--over");
  });

  it("closes on the Done button", () => {
    const onClose = vi.fn();
    renderModal({ onClose });
    fireEvent.click(screen.getByText("Done"));
    expect(onClose).toHaveBeenCalled();
  });

  describe("custom detachments", () => {
    const wrath = {
      id: "custom:f:wrath of the doomed",
      name: "Wrath of the Doomed",
      detachmentPoints: 1,
      forceDispositions: [{ name: "Purge the Foe" }],
      custom: true,
    };

    it("does not show a custom group when there are no custom detachments", () => {
      renderModal();
      expect(screen.queryByText("Your detachments")).not.toBeInTheDocument();
      expect(screen.queryByTestId("arm-custom-detachments")).not.toBeInTheDocument();
    });

    it("lists custom detachments in their own group", () => {
      renderModal({ detachments: [lions, shield, talons, wrath] });
      expect(screen.getByText("Your detachments")).toBeInTheDocument();
      const group = screen.getByTestId("arm-custom-detachments");
      expect(group).toHaveTextContent("Wrath of the Doomed");
      expect(group).toHaveTextContent("Purge the Foe");
      expect(group).not.toHaveTextContent("Shield Host");
    });

    it("selects a custom detachment against the DP budget", () => {
      const onChangeDetachments = vi.fn();
      renderModal({ detachments: [lions, wrath], onChangeDetachments });
      fireEvent.click(screen.getByText("Wrath of the Doomed"));
      expect(onChangeDetachments).toHaveBeenCalledWith([wrath]);
    });

    it("shows only the custom group when the faction has no official detachments", () => {
      renderModal({ detachments: [wrath] });
      expect(screen.queryByText("This faction has no detachments.")).not.toBeInTheDocument();
      expect(screen.getByText("Wrath of the Doomed")).toBeInTheDocument();
    });

    it("keeps a selected custom detachment whose card is gone so it can be removed", () => {
      const onChangeDetachments = vi.fn();
      renderModal({ detachments: [lions], selectedDetachments: [wrath], onChangeDetachments });
      fireEvent.click(screen.getByText("Wrath of the Doomed"));
      expect(onChangeDetachments).toHaveBeenCalledWith([]);
    });
  });
});
