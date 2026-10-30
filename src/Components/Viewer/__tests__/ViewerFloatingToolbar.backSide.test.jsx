import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { ViewerFloatingToolbar } from "../ViewerFloatingToolbar";

const state = { card: null, dataSource: null, isCustomDatasource: true };

vi.mock("../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({ activeCard: state.card }),
}));
vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: {}, updateSettings: vi.fn() }),
}));
vi.mock("../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({ dataSource: state.dataSource, isCustomDatasource: state.isCustomDatasource }),
}));
vi.mock("../../Custom/CustomCardDisplay", async () => {
  const { cardTypeHasBackSide } = await import("../../../Helpers/customSchema.helpers");
  return {
    customCardHasBackSide: (card, schema) =>
      cardTypeHasBackSide(
        schema?.cardTypes?.find((ct) => ct.key === card?.cardType),
        schema?.baseSystem,
      ),
  };
});
vi.mock("../../Tooltip/Tooltip", () => ({
  Tooltip: ({ children, content }) => <div data-content={content}>{children}</div>,
}));

const setup = (hasBackSide) => {
  state.card = { source: "custom-1", cardType: "unit" };
  state.dataSource = {
    schema: {
      baseSystem: "40k-10e",
      cardTypes: [{ key: "unit", baseType: "unit", schema: { metadata: { hasBackSide } } }],
    },
  };
};

describe("ViewerFloatingToolbar flip for custom cards", () => {
  it("flips the side for a card type with a back side", () => {
    setup(true);
    const setSide = vi.fn();
    const { container } = render(<ViewerFloatingToolbar side="front" setSide={setSide} />);
    fireEvent.click(container.querySelector('[data-content="Show back"] button'));
    expect(setSide).toHaveBeenCalled();
  });

  it("hides the flip button without a back side", () => {
    setup(false);
    const { container } = render(<ViewerFloatingToolbar side="front" setSide={vi.fn()} onShareLink={vi.fn()} />);
    expect(container.querySelector('[data-content="Show back"]')).toBeNull();
  });
});
