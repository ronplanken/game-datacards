import React from "react";
import { render } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { language: "en" } }),
}));

vi.mock("antd", () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  Popover: ({ children }) => <>{children}</>,
}));

import { UnitName } from "../UnitName";

// jsdom does no layout, so the measured boxes are faked per element class.
// Coordinates are screen pixels; `scale` mimics the card's CSS transform.
let layout;
const rect = (left, top, right, bottom) => ({ left, top, right, bottom, width: right - left, height: bottom - top });

const rectFor = (el) => {
  const { scale, nameRight, pointsLeft, chipsRight } = layout;
  const s = (value) => value * scale;
  if (el.classList.contains("header_container")) return rect(0, 0, s(1000), s(75));
  if (el.classList.contains("points_container")) return rect(s(pointsLeft), s(32), s(1000), s(75));
  if (el.classList.contains("points")) return rect(s(pointsLeft), s(37), s(chipsRight), s(74));
  if (el.classList.contains("name")) return rect(s(32), s(32), s(nameRight), s(72));
  return rect(0, 0, 0, 0);
};

const offsetWidthFor = (el) => {
  if (el.classList.contains("header_container")) return 1000;
  if (el.classList.contains("legends")) return 190;
  return 0;
};

beforeEach(() => {
  layout = { scale: 1, nameRight: 400, pointsLeft: 700, chipsRight: 980 };
  vi.spyOn(Element.prototype, "getBoundingClientRect").mockImplementation(function () {
    return rectFor(this);
  });
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockImplementation(function () {
    return offsetWidthFor(this);
  });
});

afterEach(() => {
  vi.restoreAllMocks();
});

const tier = { models: "1", cost: "160", keyword: null, detachment: null };
const surcharge = { cost: "15", afterSelections: 2 };

const renderLegends = (props) => {
  const { container } = render(<UnitName name="Leman Russ Battle Tank" legends={true} {...props} />);
  return container.querySelector(".legends");
};

describe("UnitName (11e) Legends label", () => {
  it("treats a single tier plus the roster surcharge as a multi-chip points row", () => {
    const label = renderLegends({ points: [tier], additionalCost: surcharge, showAllPoints: true });
    expect(label.classList.contains("legends--multi")).toBe(true);
    expect(label.style.getPropertyValue("--legends-multi-offset")).toBe("316px");
  });

  it("clears a single wide tier, e.g. a large models count", () => {
    layout.pointsLeft = 760;
    const label = renderLegends({
      points: [{ ...tier, models: "10000" }],
      showAllPoints: true,
      showPointsModels: true,
    });
    expect(label.classList.contains("legends--multi")).toBe(true);
    expect(label.style.getPropertyValue("--legends-multi-offset")).toBe("256px");
  });

  it("clears the points when Show all points is off", () => {
    const label = renderLegends({ points: [tier, tier], additionalCost: surcharge, showAllPoints: false });
    expect(label.classList.contains("legends--multi")).toBe(true);
    expect(label.style.getPropertyValue("--legends-multi-offset")).toBe("316px");
  });

  it("keeps the fixed position when the unit has no points", () => {
    const label = renderLegends({ points: [], showAllPoints: true });
    expect(label.classList.contains("legends--multi")).toBe(false);
    expect(label.style.getPropertyValue("--legends-multi-offset")).toBe("");
  });

  it("places the label left of the points on the same line when it fits", () => {
    const label = renderLegends({ points: [tier, tier], showAllPoints: true });
    expect(label.style.getPropertyValue("--legends-multi-offset")).toBe("316px");
    expect(label.style.getPropertyValue("--legends-multi-top")).toBe("");
  });

  it("converts measurements back to card pixels when the card is scaled", () => {
    layout.scale = 0.5;
    const label = renderLegends({ points: [tier, tier], showAllPoints: true });
    expect(label.style.getPropertyValue("--legends-multi-offset")).toBe("316px");
    expect(label.style.getPropertyValue("--legends-multi-top")).toBe("");
  });

  it("moves the label below the points when there is no room beside the name", () => {
    layout.nameRight = 600;
    const label = renderLegends({ points: [tier, tier, tier], additionalCost: surcharge, showAllPoints: true });
    expect(label.style.getPropertyValue("--legends-multi-offset")).toBe("20px");
    expect(label.style.getPropertyValue("--legends-multi-top")).toBe("75px");
  });

  it("moves the label below the points in card pixels when the card is scaled", () => {
    layout = { ...layout, scale: 0.6, nameRight: 600 };
    const label = renderLegends({ points: [tier, tier, tier], showAllPoints: true });
    expect(label.style.getPropertyValue("--legends-multi-offset")).toBe("20px");
    expect(label.style.getPropertyValue("--legends-multi-top")).toBe("75px");
  });

  it("renders no label when Legends is off", () => {
    const label = renderLegends({ legends: false, points: [tier, tier], showAllPoints: true });
    expect(label).toBeNull();
  });
});
