import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EnhancementStylingInfo } from "../EnhancementEditor/EnhancementStylingInfo";
import { StratagemStylingInfo } from "../StratagemEditor/StratagemStylingInfo";
import { RuleStylingInfo } from "../RuleEditor/RuleStylingInfo";

let activeCard;
const updateActiveCard = vi.fn();
vi.mock("../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({ activeCard, updateActiveCard }),
}));

beforeEach(() => {
  updateActiveCard.mockClear();
  activeCard = { name: "Test Card", styling: { width: 260, height: 458, textSize: 16, lineHeight: 1 } };
});

const typeValue = (label, value) => {
  const input = screen.getByText(label).closest(".ant-form-item").querySelector("input[role='spinbutton']");
  fireEvent.change(input, { target: { value } });
  fireEvent.blur(input);
};

describe.each([
  ["enhancement", EnhancementStylingInfo],
  ["stratagem", StratagemStylingInfo],
])("11th edition %s styling", (_name, Component) => {
  it.each([
    ["Width", "327", "width", 327],
    ["Height", "513", "height", 513],
    ["Text size", "19", "textSize", 19],
    ["Line height", "1.7", "lineHeight", 1.7],
  ])("saves a typed %s without changing other styling", (label, text, field, value) => {
    render(<Component />);
    typeValue(label, text);
    expect(updateActiveCard).toHaveBeenLastCalledWith({
      ...activeCard,
      styling: { ...activeCard.styling, [field]: value },
    });
  });
});

describe("11th edition rule styling", () => {
  it.each([
    ["Width", "537", "width", 537],
    ["Height", "783", "height", 783],
    ["Text size", "19", "textSize", 19],
  ])("saves a typed %s with auto height disabled", (label, text, field, value) => {
    activeCard.styling.autoHeight = false;
    render(<RuleStylingInfo />);
    typeValue(label, text);
    expect(updateActiveCard).toHaveBeenLastCalledWith({
      ...activeCard,
      styling: { ...activeCard.styling, [field]: value },
    });
  });

  it("hides manual height while auto height is enabled", () => {
    render(<RuleStylingInfo />);
    expect(screen.queryByText("Height")).not.toBeInTheDocument();
    expect(screen.getAllByRole("spinbutton")).toHaveLength(2);
  });
});
