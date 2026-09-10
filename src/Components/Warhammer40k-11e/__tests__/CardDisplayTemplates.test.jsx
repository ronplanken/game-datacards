import React from "react";
import { render } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";

// 11e cards read the selected language from settings; pin it to English.
vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { language: "en" } }),
}));
vi.mock("../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({ activeCard: null }),
}));
vi.mock("../../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({ dataSource: { data: [] } }),
}));
// antd Grid.useBreakpoint needs window.matchMedia which jsdom lacks; stub it.
vi.mock("antd", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, Grid: { useBreakpoint: () => ({}) } };
});
// Marker component so tests can assert when the premium renderer is mounted.
vi.mock("../../../Premium", () => ({
  TemplateRenderer: (props) => <div data-testid="template-renderer" data-template={props.templateId} />,
}));

import { Warhammer40K11eCardDisplay } from "../CardDisplay";

const stratagem = {
  cardType: "stratagem",
  name: { en: "Armour of Contempt" },
  type: "Battle Tactic",
  turn: "either",
  cost: 1,
  phase: [],
  faction_id: "uuid",
};

describe("Warhammer40K11eCardDisplay designer templates", () => {
  it("renders the built-in renderer when no template is assigned", () => {
    const { queryByTestId, getByText } = render(<Warhammer40K11eCardDisplay card={stratagem} />);
    expect(getByText("Armour of Contempt")).toBeInTheDocument();
    expect(queryByTestId("template-renderer")).toBeNull();
  });

  it("renders the template instead of the built-in renderer when one is assigned", () => {
    const { queryByText, getByTestId } = render(
      <Warhammer40K11eCardDisplay card={{ ...stratagem, templateId: "tpl-1" }} />,
    );
    expect(queryByText("Armour of Contempt")).toBeNull();
    expect(getByTestId("template-renderer").getAttribute("data-template")).toBe("tpl-1");
  });

  it("uses the print-mode template branch when printing a templated card", () => {
    const { container, getByTestId } = render(
      <Warhammer40K11eCardDisplay type="print" card={{ ...stratagem, templateId: "tpl-2" }} cardScaling={100} />,
    );
    expect(getByTestId("template-renderer")).toBeInTheDocument();
    // Built-in stratagem print branch is suppressed for templated cards.
    expect(container.querySelector(".stratagem_content")).toBeNull();
  });

  it("prints the built-in renderer when no template is assigned", () => {
    const { queryByTestId, getByText } = render(
      <Warhammer40K11eCardDisplay type="print" card={stratagem} cardScaling={100} />,
    );
    expect(getByText("Armour of Contempt")).toBeInTheDocument();
    expect(queryByTestId("template-renderer")).toBeNull();
  });
});
