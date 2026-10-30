import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { FloatingToolbar } from "../FloatingToolbar";

vi.mock("../../Custom/CustomCardDisplay", async () => {
  const { cardTypeHasBackSide } = await import("../../../Helpers/customSchema.helpers");
  return {
    customCardHasBackSide: (card, schema) =>
      !card?.templateId &&
      cardTypeHasBackSide(
        schema?.cardTypes?.find((ct) => ct.key === card?.cardType),
        schema?.baseSystem,
      ),
  };
});

vi.mock("../../Tooltip/Tooltip", () => ({
  Tooltip: ({ children, content }) => (
    <div data-testid="tooltip" data-content={content}>
      {children}
    </div>
  ),
}));

const schema = (hasBackSide) => ({
  baseSystem: "40k-11e",
  cardTypes: [{ key: "unit", baseType: "unit", schema: { metadata: { hasBackSide } } }],
});

const card = { source: "custom-1", cardType: "unit", isCustom: true };

const renderToolbar = (props) =>
  render(
    <FloatingToolbar
      activeCard={card}
      settings={{}}
      categories={[]}
      currentZoom={100}
      isAutoFit={true}
      updateActiveCard={vi.fn()}
      saveActiveCard={vi.fn()}
      onZoomChange={vi.fn()}
      onAutoFitToggle={vi.fn()}
      onAddToCategory={vi.fn()}
      {...props}
    />,
  );

const flipTooltip = (container, label) => container.querySelector(`[data-content="${label}"]`);

describe("FloatingToolbar flip for custom cards", () => {
  it("shows the flip button when the card type has a back side", () => {
    const { container } = renderToolbar({ dataSource: { schema: schema(true) } });
    expect(flipTooltip(container, "Show back")).toBeTruthy();
  });

  it("stays available with double-sided display on", () => {
    const { container } = renderToolbar({
      dataSource: { schema: schema(true) },
      settings: { showCardsAsDoubleSided: true },
    });
    expect(flipTooltip(container, "Show back")).toBeTruthy();
  });

  it("hides the flip button when the option is off", () => {
    const { container } = renderToolbar({ dataSource: { schema: schema(false) } });
    expect(flipTooltip(container, "Show back")).toBeNull();
  });

  it("hides the flip button while the datasource schema is not loaded", () => {
    const { container } = renderToolbar({ dataSource: undefined });
    expect(flipTooltip(container, "Show back")).toBeNull();
  });

  it("hides the flip button for cards drawn by a template", () => {
    const { container } = renderToolbar({
      dataSource: { schema: schema(true) },
      activeCard: { ...card, templateId: "t1" },
    });
    expect(flipTooltip(container, "Show back")).toBeNull();
  });

  it("stores the side on the card", () => {
    const updateActiveCard = vi.fn();
    const { container } = renderToolbar({ dataSource: { schema: schema(true) }, updateActiveCard });
    fireEvent.click(flipTooltip(container, "Show back").querySelector("button"));
    expect(updateActiveCard).toHaveBeenCalledWith({ ...card, print_side: "back" }, true);
  });
});
