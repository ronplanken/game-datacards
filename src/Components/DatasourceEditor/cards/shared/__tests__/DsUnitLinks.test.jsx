import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import { vi, describe, it, expect } from "vitest";
import { DsUnitLinks } from "../DsUnitLinks";
import { UnitLinkProvider, ViewerUnitLinkProvider } from "../UnitLinkContext";

const cardTypeDef = {
  key: "unit",
  baseType: "unit",
  schema: {
    unitLinks: {
      groups: [
        { key: "leads", label: "Leader", description: "This unit can lead the following units:" },
        { key: "supports", label: "Support", description: "This unit can support the following units:" },
      ],
    },
  },
};

const factions = [
  {
    id: "f1",
    name: "Space Wolves",
    datasheets: [
      { id: "c2", name: "Blood Claws", cardType: "unit" },
      { id: "c3", name: "Grey Hunters", cardType: "unit" },
    ],
  },
];

const card = {
  id: "c1",
  name: "Wolf Lord",
  unitLinks: {
    leads: [{ cardId: "c2", name: "Old Name" }, { name: "Wulfen" }, { cardId: "gone", name: "Deleted Unit" }],
    supports: [{ cardId: "c3", name: "Grey Hunters" }],
  },
};

describe("DsUnitLinks", () => {
  it("renders nothing when the card type has no link groups", () => {
    const { container } = render(<DsUnitLinks card={card} cardTypeDef={{ schema: {} }} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the card has no links", () => {
    const { container } = render(<DsUnitLinks card={{ id: "x" }} cardTypeDef={cardTypeDef} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders each group with its label, description and entries", () => {
    render(
      <UnitLinkProvider factions={factions}>
        <DsUnitLinks card={card} cardTypeDef={cardTypeDef} />
      </UnitLinkProvider>,
    );
    expect(screen.getByText("Leader")).toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();
    expect(screen.getByText("This unit can lead the following units:")).toBeInTheDocument();
    expect(screen.getByText("Blood Claws")).toBeInTheDocument();
    expect(screen.queryByText("Old Name")).not.toBeInTheDocument();
    expect(screen.getByText("Wulfen")).toBeInTheDocument();
    expect(screen.getByText("Grey Hunters")).toBeInTheDocument();
  });

  it("shows links to deleted cards as struck through", () => {
    render(
      <UnitLinkProvider factions={factions}>
        <DsUnitLinks card={card} cardTypeDef={cardTypeDef} />
      </UnitLinkProvider>,
    );
    expect(screen.getByText("Deleted Unit")).toHaveStyle({ textDecoration: "line-through" });
  });

  it("calls onNavigate with the linked card when a link is clicked", () => {
    const onNavigate = vi.fn();
    render(
      <UnitLinkProvider factions={factions} onNavigate={onNavigate}>
        <DsUnitLinks card={card} cardTypeDef={cardTypeDef} />
      </UnitLinkProvider>,
    );
    const links = screen.getAllByTestId("ds-unit-link");
    expect(links.map((l) => l.textContent)).toEqual(["Blood Claws", "Grey Hunters"]);
    fireEvent.click(links[0]);
    expect(onNavigate).toHaveBeenCalledWith(expect.objectContaining({ card: factions[0].datasheets[0] }));
  });

  it("does not render clickable links without a navigation handler", () => {
    render(
      <UnitLinkProvider factions={factions}>
        <DsUnitLinks card={card} cardTypeDef={cardTypeDef} />
      </UnitLinkProvider>,
    );
    expect(screen.queryAllByTestId("ds-unit-link")).toHaveLength(0);
  });

  it("hides a group the card has switched off", () => {
    render(
      <UnitLinkProvider factions={factions}>
        <DsUnitLinks card={{ ...card, showUnitLinks: { leads: false } }} cardTypeDef={cardTypeDef} />
      </UnitLinkProvider>,
    );
    expect(screen.queryByText("Leader")).not.toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();
  });

  it.each(["40k", "aos", "starcraft", "custom"])("renders the %s variant", (variant) => {
    render(
      <UnitLinkProvider factions={factions}>
        <DsUnitLinks card={card} cardTypeDef={cardTypeDef} variant={variant} grandAlliance="order" />
      </UnitLinkProvider>,
    );
    expect(screen.getByTestId("ds-unit-links-leads")).toBeInTheDocument();
    expect(screen.getByTestId("ds-unit-links-supports")).toBeInTheDocument();
  });
});

describe("ViewerUnitLinkProvider", () => {
  const LocationDisplay = () => <div data-testid="location">{useLocation().pathname}</div>;

  const renderAt = (path, navigable = true) =>
    render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route
            path="*"
            element={
              <>
                <ViewerUnitLinkProvider factions={factions} navigable={navigable}>
                  <DsUnitLinks card={card} cardTypeDef={cardTypeDef} />
                </ViewerUnitLinkProvider>
                <LocationDisplay />
              </>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

  it("navigates to the desktop viewer", () => {
    renderAt("/viewer/space-wolves/wolf-lord");
    fireEvent.click(screen.getByText("Blood Claws"));
    expect(screen.getByTestId("location")).toHaveTextContent("/viewer/space-wolves/blood-claws");
  });

  it("navigates within the mobile viewer", () => {
    renderAt("/mobile/space-wolves/wolf-lord");
    fireEvent.click(screen.getByText("Grey Hunters"));
    expect(screen.getByTestId("location")).toHaveTextContent("/mobile/space-wolves/grey-hunters");
  });

  it("renders plain names when navigation is disabled", () => {
    renderAt("/print", false);
    expect(screen.queryAllByTestId("ds-unit-link")).toHaveLength(0);
    expect(screen.getByText("Blood Claws")).toBeInTheDocument();
  });

  it("works outside a router", () => {
    render(
      <ViewerUnitLinkProvider factions={factions}>
        <DsUnitLinks card={card} cardTypeDef={cardTypeDef} />
      </ViewerUnitLinkProvider>,
    );
    expect(screen.getByText("Blood Claws")).toBeInTheDocument();
    expect(screen.queryAllByTestId("ds-unit-link")).toHaveLength(0);
  });
});
