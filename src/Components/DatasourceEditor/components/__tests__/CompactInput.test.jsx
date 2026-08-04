import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CompactInput } from "../CompactInput";

describe("CompactInput", () => {
  it("renders label text", () => {
    render(<CompactInput label="X" value="10" onChange={() => {}} />);
    expect(screen.getByText("X")).toBeInTheDocument();
  });

  it("renders input with correct value", () => {
    render(<CompactInput label="W" value="42" onChange={() => {}} />);
    expect(screen.getByRole("spinbutton")).toHaveValue(42);
  });

  it("defaults to number type", () => {
    render(<CompactInput label="N" value="5" onChange={() => {}} />);
    expect(screen.getByRole("spinbutton")).toHaveAttribute("type", "number");
  });

  it("supports text type", () => {
    render(<CompactInput label="T" value="hello" onChange={() => {}} type="text" />);
    expect(screen.getByRole("textbox")).toHaveAttribute("type", "text");
    expect(screen.getByRole("textbox")).toHaveValue("hello");
  });

  it("calls onChange with input value", () => {
    const handleChange = vi.fn();
    render(<CompactInput label="V" value="0" onChange={handleChange} type="text" />);

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "new" } });
    expect(handleChange).toHaveBeenCalledWith("new");
  });

  it("renders suffix when provided", () => {
    render(<CompactInput label="S" value="100" onChange={() => {}} suffix="px" />);
    expect(screen.getByText("px")).toBeInTheDocument();
  });

  it("does not render suffix when not provided", () => {
    const { container } = render(<CompactInput label="S" value="100" onChange={() => {}} />);
    expect(container.querySelector(".props-compact-suffix")).not.toBeInTheDocument();
  });

  it("passes min, max, step to input", () => {
    render(<CompactInput label="R" value="5" onChange={() => {}} min={0} max={10} step={0.5} />);
    const input = screen.getByRole("spinbutton");
    expect(input).toHaveAttribute("min", "0");
    expect(input).toHaveAttribute("max", "10");
    expect(input).toHaveAttribute("step", "0.5");
  });

  it("applies custom style to container", () => {
    const { container } = render(<CompactInput label="C" value="1" onChange={() => {}} style={{ width: "80px" }} />);
    expect(container.querySelector(".props-compact-input")).toHaveStyle({ width: "80px" });
  });

  it("applies correct CSS classes", () => {
    const { container } = render(<CompactInput label="L" value="0" onChange={() => {}} suffix="%" />);

    expect(container.querySelector(".props-compact-input")).toBeInTheDocument();
    expect(container.querySelector(".props-compact-label")).toBeInTheDocument();
    expect(container.querySelector(".props-compact-field")).toBeInTheDocument();
    expect(container.querySelector(".props-compact-suffix")).toBeInTheDocument();
  });
});
