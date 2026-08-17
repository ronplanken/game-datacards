import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { EnhancementCard } from "../EnhancementCard";

// Shaped like the real AoS data: declare/effect prose, a points or CP cost, and
// a phase line.
const artefact = {
  name: "Pennant of Azyrite Majesty",
  points: 20,
  cpCost: null,
  phaseDetails: "Start of Any Turn",
  declare: 'Pick a visible enemy unit within 18" of this unit.',
  effect: "Add 1 to the control score of that unit.",
};

describe("EnhancementCard", () => {
  it("renders the name, group, cost, phase and prose", () => {
    render(<EnhancementCard enhancement={artefact} groupName="Artefacts of Power" />);

    expect(screen.getByText("Pennant of Azyrite Majesty")).toBeInTheDocument();
    expect(screen.getByText("Artefacts of Power")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument();
    expect(screen.getByText("pts")).toBeInTheDocument();
    expect(screen.getByText("Start of Any Turn")).toBeInTheDocument();
    expect(screen.getByText("Declare")).toBeInTheDocument();
    expect(screen.getByText("Effect")).toBeInTheDocument();
  });

  it("shows a command point cost when the enhancement is not priced in points", () => {
    render(<EnhancementCard enhancement={{ ...artefact, points: null, cpCost: 1 }} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("CP")).toBeInTheDocument();
    expect(screen.queryByText("pts")).not.toBeInTheDocument();
  });

  it("shows no cost badge when the enhancement is free", () => {
    render(<EnhancementCard enhancement={{ ...artefact, points: null, cpCost: null }} />);
    expect(screen.queryByText("pts")).not.toBeInTheDocument();
    expect(screen.queryByText("CP")).not.toBeInTheDocument();
  });

  it("falls back to a plain description when there is no declare/effect split", () => {
    render(
      <EnhancementCard
        enhancement={{ name: "Old Export", declare: null, effect: null, description: "Adds 1 to hit rolls." }}
      />,
    );
    expect(screen.getByText("Adds 1 to hit rolls.")).toBeInTheDocument();
  });

  it("renders a back button on mobile only", () => {
    const onBack = vi.fn();
    const { rerender } = render(<EnhancementCard enhancement={artefact} isMobile onBack={onBack} />);
    expect(document.querySelector(".spell-back-button")).toBeInTheDocument();

    rerender(<EnhancementCard enhancement={artefact} onBack={onBack} />);
    expect(document.querySelector(".spell-back-button")).not.toBeInTheDocument();
  });

  it("renders nothing without an enhancement", () => {
    const { container } = render(<EnhancementCard enhancement={undefined} />);
    expect(container).toBeEmptyDOMElement();
  });
});
