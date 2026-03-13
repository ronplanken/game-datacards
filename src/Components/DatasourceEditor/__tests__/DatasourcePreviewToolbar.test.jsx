import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import { DatasourcePreviewToolbar } from "../DatasourcePreviewToolbar";

vi.mock("antd", () => ({
  Menu: ({ items, onClick }) => (
    <div data-testid="zoom-menu">
      {items
        ?.filter((i) => i.key)
        .map((item) => (
          <button key={item.key} data-testid={`zoom-${item.key}`} onClick={() => onClick({ key: item.key })}>
            {item.key}
          </button>
        ))}
    </div>
  ),
  Dropdown: ({ children, overlay }) => (
    <div>
      {children}
      {overlay}
    </div>
  ),
}));

vi.mock("lucide-react", () => ({
  Check: () => <span data-testid="check-icon" />,
  ZoomIn: () => <span data-testid="zoom-in-icon" />,
  ZoomOut: () => <span data-testid="zoom-out-icon" />,
}));

describe("DatasourcePreviewToolbar", () => {
  it("renders the floating toolbar", () => {
    const { container } = render(
      <DatasourcePreviewToolbar currentZoom={100} isAutoFit={true} onZoomChange={vi.fn()} onAutoFitToggle={vi.fn()} />,
    );
    expect(container.querySelector(".floating-toolbar")).toBeTruthy();
  });

  it("shows Auto when isAutoFit is true", () => {
    render(
      <DatasourcePreviewToolbar currentZoom={100} isAutoFit={true} onZoomChange={vi.fn()} onAutoFitToggle={vi.fn()} />,
    );
    expect(screen.getByText("Auto")).toBeTruthy();
  });

  it("shows zoom percentage when isAutoFit is false", () => {
    render(
      <DatasourcePreviewToolbar currentZoom={75} isAutoFit={false} onZoomChange={vi.fn()} onAutoFitToggle={vi.fn()} />,
    );
    expect(screen.getByText("75%")).toBeTruthy();
  });

  it("calls onZoomChange when zoom in is clicked", () => {
    const onZoomChange = vi.fn();
    render(
      <DatasourcePreviewToolbar
        currentZoom={100}
        isAutoFit={false}
        onZoomChange={onZoomChange}
        onAutoFitToggle={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Zoom in"));
    expect(onZoomChange).toHaveBeenCalledWith(125);
  });

  it("calls onZoomChange when zoom out is clicked", () => {
    const onZoomChange = vi.fn();
    render(
      <DatasourcePreviewToolbar
        currentZoom={100}
        isAutoFit={false}
        onZoomChange={onZoomChange}
        onAutoFitToggle={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByLabelText("Zoom out"));
    expect(onZoomChange).toHaveBeenCalledWith(75);
  });

  it("disables zoom out at minimum level", () => {
    render(
      <DatasourcePreviewToolbar currentZoom={25} isAutoFit={false} onZoomChange={vi.fn()} onAutoFitToggle={vi.fn()} />,
    );
    expect(screen.getByLabelText("Zoom out").disabled).toBe(true);
  });

  it("disables zoom in at maximum level", () => {
    render(
      <DatasourcePreviewToolbar currentZoom={200} isAutoFit={false} onZoomChange={vi.fn()} onAutoFitToggle={vi.fn()} />,
    );
    expect(screen.getByLabelText("Zoom in").disabled).toBe(true);
  });

  it("disables zoom out when auto fit is active", () => {
    render(
      <DatasourcePreviewToolbar currentZoom={100} isAutoFit={true} onZoomChange={vi.fn()} onAutoFitToggle={vi.fn()} />,
    );
    expect(screen.getByLabelText("Zoom out").disabled).toBe(true);
  });

  it("calls onAutoFitToggle when auto is selected from menu", () => {
    const onAutoFitToggle = vi.fn();
    render(
      <DatasourcePreviewToolbar
        currentZoom={100}
        isAutoFit={false}
        onZoomChange={vi.fn()}
        onAutoFitToggle={onAutoFitToggle}
      />,
    );
    fireEvent.click(screen.getByTestId("zoom-auto"));
    expect(onAutoFitToggle).toHaveBeenCalled();
  });

  it("calls onZoomChange when a zoom level is selected from menu", () => {
    const onZoomChange = vi.fn();
    render(
      <DatasourcePreviewToolbar
        currentZoom={100}
        isAutoFit={false}
        onZoomChange={onZoomChange}
        onAutoFitToggle={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByTestId("zoom-50"));
    expect(onZoomChange).toHaveBeenCalledWith(50);
  });
});
