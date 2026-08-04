import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { UnitName } from "../UnitName";
import { MemoryRouter } from "react-router-dom";

vi.mock("antd", () => ({
  Button: ({ children, ...props }) => <button {...props}>{children}</button>,
  Popover: ({ children }) => <>{children}</>,
  Grid: { useBreakpoint: () => ({}) },
}));

const renderUnitName = (props) =>
  render(
    <MemoryRouter>
      <UnitName {...props} />
    </MemoryRouter>,
  );

describe("UnitName", () => {
  it("renders legends div when legends is true", () => {
    const { container } = renderUnitName({ name: "Test", legends: true, points: [] });
    expect(container.querySelector(".legends")).toBeInTheDocument();
  });

  it("does not render legends div when legends is false", () => {
    const { container } = renderUnitName({ name: "Test", legends: false, points: [] });
    expect(container.querySelector(".legends")).toBeNull();
  });

  it("does not add legends--multi class when showAllPoints is false", () => {
    const points = [
      { active: true, models: 5, cost: 100, primary: true },
      { active: true, models: 10, cost: 190 },
    ];
    const { container } = renderUnitName({ name: "Test", legends: true, points, showAllPoints: false });
    const legendsEl = container.querySelector(".legends");
    expect(legendsEl).toBeInTheDocument();
    expect(legendsEl.classList.contains("legends--multi")).toBe(false);
  });

  it("does not add legends--multi when showAllPoints is true but only one active point", () => {
    const points = [{ active: true, models: 5, cost: 100, primary: true }];
    const { container } = renderUnitName({ name: "Test", legends: true, points, showAllPoints: true });
    const legendsEl = container.querySelector(".legends");
    expect(legendsEl).toBeInTheDocument();
    expect(legendsEl.classList.contains("legends--multi")).toBe(false);
  });

  it("adds legends--multi class when legends is true, showAllPoints is true, and multiple active points", () => {
    const points = [
      { active: true, models: 5, cost: 100, primary: true },
      { active: true, models: 10, cost: 190 },
    ];
    const { container } = renderUnitName({ name: "Test", legends: true, points, showAllPoints: true });
    const legendsEl = container.querySelector(".legends");
    expect(legendsEl).toBeInTheDocument();
    expect(legendsEl.classList.contains("legends--multi")).toBe(true);
  });

  it("sets the --legends-multi-offset variable from measured layout when multiple points are shown", () => {
    const points = [
      { active: true, models: 5, cost: 100, primary: true },
      { active: true, models: 10, cost: 190 },
      { active: true, models: 20, cost: 360 },
    ];
    const { container } = renderUnitName({ name: "Test", legends: true, points, showAllPoints: true });
    const legendsEl = container.querySelector(".legends--multi");
    expect(legendsEl).toBeInTheDocument();
    // Layout is measured via useLayoutEffect, so the dynamic offset is applied inline
    // rather than relying on the fixed CSS fallback.
    expect(legendsEl.style.getPropertyValue("--legends-multi-offset")).not.toBe("");
  });

  it("does not set the --legends-multi-offset variable for a single point value", () => {
    const points = [{ active: true, models: 5, cost: 100, primary: true }];
    const { container } = renderUnitName({ name: "Test", legends: true, points, showAllPoints: true });
    const legendsEl = container.querySelector(".legends");
    expect(legendsEl.style.getPropertyValue("--legends-multi-offset")).toBe("");
  });

  it("does not add legends--multi when legends is false even with multiple points", () => {
    const points = [
      { active: true, models: 5, cost: 100 },
      { active: true, models: 10, cost: 190 },
    ];
    const { container } = renderUnitName({ name: "Test", legends: false, points, showAllPoints: true });
    const legendsEl = container.querySelector(".legends");
    expect(legendsEl).toBeNull();
  });

  it("renders unit name", () => {
    renderUnitName({ name: "Intercessors" });
    expect(screen.getByText("Intercessors")).toBeInTheDocument();
  });

  it("renders subname when provided", () => {
    renderUnitName({ name: "Captain", subname: "In Terminator Armour" });
    expect(screen.getByText("Captain")).toBeInTheDocument();
    expect(screen.getByText("In Terminator Armour")).toBeInTheDocument();
  });

  it("renders points when showAllPoints is true", () => {
    const points = [
      { active: true, models: 5, cost: 100, primary: true },
      { active: true, models: 10, cost: 190 },
    ];
    renderUnitName({ name: "Test", points, showAllPoints: true });
    expect(screen.getByText("100 pts")).toBeInTheDocument();
    expect(screen.getByText("190 pts")).toBeInTheDocument();
  });
});
