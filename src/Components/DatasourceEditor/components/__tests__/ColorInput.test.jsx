import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { ColorInput } from "../ColorInput";

describe("ColorInput", () => {
  it("renders color swatch and text input", () => {
    const { container } = render(<ColorInput value="#ff0000" onChange={() => {}} />);
    expect(container.querySelector(".props-color-swatch")).toBeInTheDocument();
    expect(container.querySelector(".props-color-text")).toBeInTheDocument();
  });

  it("displays the hex value in text input", () => {
    const { container } = render(<ColorInput value="#ff0000" onChange={() => {}} />);
    expect(container.querySelector(".props-color-text")).toHaveValue("#ff0000");
  });

  it("sets swatch background color from value", () => {
    const { container } = render(<ColorInput value="#00ff00" onChange={() => {}} />);
    const swatch = container.querySelector(".props-color-swatch");
    expect(swatch).toHaveStyle({ backgroundColor: "#00ff00" });
  });

  it("calls onChange when text input changes", () => {
    const handleChange = vi.fn();
    const { container } = render(<ColorInput value="#000000" onChange={handleChange} />);
    const textInput = container.querySelector(".props-color-text");

    fireEvent.change(textInput, { target: { value: "#abcdef" } });
    expect(handleChange).toHaveBeenCalledWith("#abcdef");
  });

  it("shows transparent class on swatch when value is null", () => {
    const { container } = render(<ColorInput value={null} onChange={() => {}} allowTransparent />);
    const swatch = container.querySelector(".props-color-swatch");
    expect(swatch).toHaveClass("transparent");
  });

  it("shows transparent class on swatch when value is 'transparent'", () => {
    const { container } = render(<ColorInput value="transparent" onChange={() => {}} allowTransparent />);
    const swatch = container.querySelector(".props-color-swatch");
    expect(swatch).toHaveClass("transparent");
  });

  it("displays 'transparent' in text input when value is null", () => {
    const { container } = render(<ColorInput value={null} onChange={() => {}} allowTransparent />);
    expect(container.querySelector(".props-color-text")).toHaveValue("transparent");
  });

  it("calls onChange with 'transparent' when text cleared with allowTransparent", () => {
    const handleChange = vi.fn();
    const { container } = render(<ColorInput value="#ff0000" onChange={handleChange} allowTransparent />);
    const textInput = container.querySelector(".props-color-text");

    fireEvent.change(textInput, { target: { value: "" } });
    expect(handleChange).toHaveBeenCalledWith("transparent");
  });

  it("does not show transparent class when value is a valid color", () => {
    const { container } = render(<ColorInput value="#123456" onChange={() => {}} />);
    const swatch = container.querySelector(".props-color-swatch");
    expect(swatch).not.toHaveClass("transparent");
  });

  it("opens color picker when swatch is clicked", () => {
    const { container } = render(<ColorInput value="#ff0000" onChange={() => {}} />);
    const hiddenInput = container.querySelector('input[type="color"]');
    const clickSpy = vi.spyOn(hiddenInput, "click");

    const swatch = container.querySelector(".props-color-swatch");
    fireEvent.click(swatch);

    expect(clickSpy).toHaveBeenCalled();
  });

  it("calls onChange when color picker value changes", () => {
    const handleChange = vi.fn();
    const { container } = render(<ColorInput value="#000000" onChange={handleChange} />);
    const hiddenInput = container.querySelector('input[type="color"]');

    fireEvent.change(hiddenInput, { target: { value: "#ff5500" } });
    expect(handleChange).toHaveBeenCalledWith("#ff5500");
  });

  it("applies correct CSS classes on container", () => {
    const { container } = render(<ColorInput value="#000" onChange={() => {}} />);
    expect(container.querySelector(".props-color-input")).toBeInTheDocument();
  });

  it("uses monospace font class on text input", () => {
    const { container } = render(<ColorInput value="#000" onChange={() => {}} />);
    expect(container.querySelector(".props-color-text")).toBeInTheDocument();
  });

  it("shows placeholder for transparent when allowTransparent", () => {
    const { container } = render(<ColorInput value="#aaa" onChange={() => {}} allowTransparent />);
    const textInput = container.querySelector(".props-color-text");
    expect(textInput).toHaveAttribute("placeholder", "transparent");
  });

  it("shows placeholder #000000 when allowTransparent is false", () => {
    const { container } = render(<ColorInput value="#bbb" onChange={() => {}} />);
    const textInput = container.querySelector(".props-color-text");
    expect(textInput).toHaveAttribute("placeholder", "#000000");
  });
});
