import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { CustomCardDisplay, resolveCardType } from "../CustomCardDisplay";

// Mock react-fitty (used by CustomUnitCard)
vi.mock("react-fitty", () => ({
  ReactFitty: ({ children }) => <span>{children}</span>,
}));

// Mock hooks
const mockActiveCard = { ref: null };
const mockDataSource = { ref: null };

vi.mock("../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({
    activeCard: mockActiveCard.ref,
  }),
}));

vi.mock("../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({
    dataSource: mockDataSource.ref,
  }),
}));

const makeSchema = (cardTypes = []) => ({
  version: "1.0.0",
  baseSystem: "blank",
  cardTypes,
});

const unitCardType = {
  key: "infantry",
  label: "Infantry",
  baseType: "unit",
  schema: { stats: { fields: [] } },
};

const ruleCardType = {
  key: "battle-rules",
  label: "Battle Rules",
  baseType: "rule",
  schema: { fields: [] },
};

const enhancementCardType = {
  key: "warlord-trait",
  label: "Warlord Trait",
  baseType: "enhancement",
  schema: { fields: [] },
};

const stratagemCardType = {
  key: "battle-tactic",
  label: "Battle Tactic",
  baseType: "stratagem",
  schema: { fields: [] },
};

describe("resolveCardType", () => {
  const schema = makeSchema([unitCardType, ruleCardType, enhancementCardType, stratagemCardType]);

  it("returns null when card is null", () => {
    const result = resolveCardType(null, schema);
    expect(result.cardTypeDef).toBeNull();
    expect(result.baseType).toBeNull();
  });

  it("returns null when schema has no cardTypes", () => {
    const result = resolveCardType({ cardType: "infantry" }, { version: "1.0.0", cardTypes: [] });
    expect(result.cardTypeDef).toBeNull();
  });

  it("matches by key", () => {
    const result = resolveCardType({ cardType: "infantry" }, schema);
    expect(result.cardTypeDef).toBe(unitCardType);
    expect(result.baseType).toBe("unit");
  });

  it("matches by baseType when key does not match", () => {
    const result = resolveCardType({ cardType: "unit" }, schema);
    expect(result.cardTypeDef).toBe(unitCardType);
    expect(result.baseType).toBe("unit");
  });

  it("matches rule by baseType", () => {
    const result = resolveCardType({ cardType: "rule" }, schema);
    expect(result.cardTypeDef).toBe(ruleCardType);
    expect(result.baseType).toBe("rule");
  });

  it("matches enhancement by baseType", () => {
    const result = resolveCardType({ cardType: "enhancement" }, schema);
    expect(result.cardTypeDef).toBe(enhancementCardType);
    expect(result.baseType).toBe("enhancement");
  });

  it("matches stratagem by baseType", () => {
    const result = resolveCardType({ cardType: "stratagem" }, schema);
    expect(result.cardTypeDef).toBe(stratagemCardType);
    expect(result.baseType).toBe("stratagem");
  });

  it("maps legacy DataCard to unit baseType", () => {
    const result = resolveCardType({ cardType: "DataCard" }, schema);
    expect(result.cardTypeDef).toBe(unitCardType);
    expect(result.baseType).toBe("unit");
  });

  it("maps legacy datasheet to unit baseType", () => {
    const result = resolveCardType({ cardType: "datasheet" }, schema);
    expect(result.cardTypeDef).toBe(unitCardType);
    expect(result.baseType).toBe("unit");
  });

  it("returns null for unknown cardType", () => {
    const result = resolveCardType({ cardType: "unknown-type" }, schema);
    expect(result.cardTypeDef).toBeNull();
    expect(result.baseType).toBeNull();
  });

  it("prefers key match over baseType match", () => {
    const schemaWithConflict = makeSchema([
      { key: "rule", label: "Rule Key", baseType: "enhancement", schema: {} },
      ruleCardType,
    ]);
    const result = resolveCardType({ cardType: "rule" }, schemaWithConflict);
    expect(result.cardTypeDef.label).toBe("Rule Key");
    expect(result.baseType).toBe("enhancement");
  });
});

describe("CustomCardDisplay", () => {
  beforeEach(() => {
    mockActiveCard.ref = null;
    mockDataSource.ref = null;
  });

  it("returns null when no card and no schema", () => {
    mockDataSource.ref = { data: [] };
    const { container } = render(<CustomCardDisplay />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null when no schema on datasource", () => {
    mockActiveCard.ref = { cardType: "infantry", name: "Test Unit" };
    mockDataSource.ref = { data: [{ id: "f1", colours: { header: "#000", banner: "#111" } }] };
    const { container } = render(<CustomCardDisplay />);
    expect(container.innerHTML).toBe("");
  });

  it("shows unknown card type message for unresolvable card", () => {
    mockActiveCard.ref = { cardType: "unknown-type", name: "Bad Card" };
    mockDataSource.ref = {
      schema: makeSchema([unitCardType]),
      data: [{ id: "f1", colours: { header: "#000", banner: "#111" } }],
    };
    render(<CustomCardDisplay />);
    expect(screen.getByText(/Unknown card type: unknown-type/)).toBeInTheDocument();
  });

  it("renders unit card placeholder for unit baseType", () => {
    mockActiveCard.ref = { cardType: "infantry", name: "Space Marine", faction_id: "f1" };
    mockDataSource.ref = {
      schema: makeSchema([unitCardType]),
      data: [{ id: "f1", colours: { header: "#1a1a2e", banner: "#16213e" } }],
    };
    render(<CustomCardDisplay />);
    expect(screen.getByTestId("custom-unit-card")).toBeInTheDocument();
    expect(screen.getByText("Space Marine")).toBeInTheDocument();
  });

  it("renders rule card placeholder for rule baseType", () => {
    mockActiveCard.ref = { cardType: "battle-rules", name: "Core Rules", faction_id: "f1" };
    mockDataSource.ref = {
      schema: makeSchema([ruleCardType]),
      data: [{ id: "f1", colours: { header: "#000", banner: "#111" } }],
    };
    render(<CustomCardDisplay />);
    expect(screen.getByTestId("custom-rule-card")).toBeInTheDocument();
    expect(screen.getByText("Core Rules")).toBeInTheDocument();
  });

  it("renders enhancement card placeholder", () => {
    mockActiveCard.ref = { cardType: "enhancement", name: "Iron Will", faction_id: "f1" };
    mockDataSource.ref = {
      schema: makeSchema([enhancementCardType]),
      data: [{ id: "f1", colours: { header: "#000", banner: "#111" } }],
    };
    render(<CustomCardDisplay />);
    expect(screen.getByTestId("custom-enhancement-card")).toBeInTheDocument();
  });

  it("renders stratagem card placeholder", () => {
    mockActiveCard.ref = { cardType: "stratagem", name: "Overwatch", faction_id: "f1" };
    mockDataSource.ref = {
      schema: makeSchema([stratagemCardType]),
      data: [{ id: "f1", colours: { header: "#000", banner: "#111" } }],
    };
    render(<CustomCardDisplay />);
    expect(screen.getByTestId("custom-stratagem-card")).toBeInTheDocument();
  });

  it("uses custom colours when card has useCustomColours enabled", () => {
    mockActiveCard.ref = {
      cardType: "infantry",
      name: "Custom Unit",
      faction_id: "f1",
      useCustomColours: true,
      customHeaderColour: "#ff0000",
      customBannerColour: "#00ff00",
    };
    mockDataSource.ref = {
      schema: makeSchema([unitCardType]),
      data: [{ id: "f1", colours: { header: "#1a1a2e", banner: "#16213e" } }],
    };
    render(<CustomCardDisplay />);
    const card = screen.getByTestId("custom-unit-card");
    expect(card.style.getPropertyValue("--header-colour")).toBe("#ff0000");
    expect(card.style.getPropertyValue("--banner-colour")).toBe("#00ff00");
  });

  it("uses faction colours when card does not have custom colours", () => {
    mockActiveCard.ref = { cardType: "infantry", name: "Unit", faction_id: "f1" };
    mockDataSource.ref = {
      schema: makeSchema([unitCardType]),
      data: [{ id: "f1", colours: { header: "#1a1a2e", banner: "#16213e" } }],
    };
    render(<CustomCardDisplay />);
    const card = screen.getByTestId("custom-unit-card");
    expect(card.style.getPropertyValue("--header-colour")).toBe("#1a1a2e");
    expect(card.style.getPropertyValue("--banner-colour")).toBe("#16213e");
  });

  it("renders card passed as prop instead of activeCard", () => {
    mockActiveCard.ref = null;
    mockDataSource.ref = {
      schema: makeSchema([unitCardType]),
      data: [{ id: "f1", colours: { header: "#000", banner: "#111" } }],
    };
    render(<CustomCardDisplay card={{ cardType: "infantry", name: "Prop Unit", faction_id: "f1" }} />);
    expect(screen.getByText("Prop Unit")).toBeInTheDocument();
  });

  it("renders in print mode with zoom scaling", () => {
    mockActiveCard.ref = null;
    mockDataSource.ref = {
      schema: makeSchema([unitCardType]),
      data: [{ id: "f1", colours: { header: "#000", banner: "#111" } }],
    };
    const { container } = render(
      <CustomCardDisplay
        type="print"
        card={{ cardType: "infantry", name: "Print Unit", faction_id: "f1" }}
        cardScaling={80}
      />,
    );
    const wrapper = container.querySelector(".data-custom");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.style.zoom).toBe("0.8");
  });

  it("renders in viewer mode with transform scaling", () => {
    mockActiveCard.ref = { cardType: "infantry", name: "Viewer Unit", faction_id: "f1" };
    mockDataSource.ref = {
      schema: makeSchema([unitCardType]),
      data: [{ id: "f1", colours: { header: "#000", banner: "#111" } }],
    };
    const { container } = render(<CustomCardDisplay type="viewer" cardScaling={75} />);
    const wrapper = container.querySelector(".data-custom");
    expect(wrapper).toBeInTheDocument();
    expect(wrapper.style.transform).toBe("scale(0.75)");
  });

  it("handles legacy DataCard cardType for unit rendering", () => {
    mockActiveCard.ref = { cardType: "DataCard", name: "Legacy Unit", faction_id: "f1" };
    mockDataSource.ref = {
      schema: makeSchema([unitCardType]),
      data: [{ id: "f1", colours: { header: "#000", banner: "#111" } }],
    };
    render(<CustomCardDisplay />);
    expect(screen.getByTestId("custom-unit-card")).toBeInTheDocument();
    expect(screen.getByText("Legacy Unit")).toBeInTheDocument();
  });

  it("shows fallback name for card without a name", () => {
    mockActiveCard.ref = { cardType: "infantry", faction_id: "f1" };
    mockDataSource.ref = {
      schema: makeSchema([unitCardType]),
      data: [{ id: "f1", colours: { header: "#000", banner: "#111" } }],
    };
    render(<CustomCardDisplay />);
    expect(screen.getByText("Untitled Unit")).toBeInTheDocument();
  });
});
