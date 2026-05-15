import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { SliderWithInput } from "../SliderWithInput";

describe("SliderWithInput", () => {
  afterEach(() => {
    cleanup();
  });

  it("renders both a slider and a numeric input", () => {
    render(<SliderWithInput min={0} max={100} step={1} value={50} onChange={() => {}} />);
    expect(screen.getByRole("slider")).toBeInTheDocument();
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  it("calls onChange with the typed number on blur", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SliderWithInput min={100} max={1000} step={10} value={260} onChange={onChange} />);

    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    await user.type(input, "460");
    await user.tab();

    expect(onChange).toHaveBeenCalledWith(460);
  });

  it("clamps out-of-range typed values to max on blur", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SliderWithInput min={100} max={1000} step={1} value={260} onChange={onChange} />);

    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    await user.type(input, "9999");
    await user.tab();

    expect(onChange).toHaveBeenLastCalledWith(1000);
  });

  it("reflects controlled value updates in the input", () => {
    const { rerender } = render(<SliderWithInput min={0} max={100} step={1} value={20} onChange={() => {}} />);
    expect(screen.getByRole("spinbutton")).toHaveValue("20");

    rerender(<SliderWithInput min={0} max={100} step={1} value={80} onChange={() => {}} />);
    expect(screen.getByRole("spinbutton")).toHaveValue("80");
  });

  it("renders mark labels", () => {
    render(<SliderWithInput min={100} max={1000} step={10} value={260} marks={{ 260: "260" }} onChange={() => {}} />);
    expect(screen.getByText("260")).toBeInTheDocument();
  });

  it("supports decimal steps without floating-point creep", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SliderWithInput min={0.2} max={3} step={0.1} value={1} onChange={onChange} />);

    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    await user.type(input, "1.3");
    await user.tab();

    expect(onChange).toHaveBeenCalledWith(1.3);
    expect(input.value).not.toMatch(/1\.30+\d/);
  });

  it("does not propagate null when the input is cleared", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SliderWithInput min={0} max={100} step={1} value={50} onChange={onChange} />);

    const input = screen.getByRole("spinbutton");
    await user.clear(input);

    expect(onChange).not.toHaveBeenCalledWith(null);
  });

  it("accepts negative values", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<SliderWithInput min={-200} max={200} step={1} value={0} onChange={onChange} />);

    const input = screen.getByRole("spinbutton");
    await user.clear(input);
    await user.type(input, "-50");
    await user.tab();

    expect(onChange).toHaveBeenCalledWith(-50);
  });

  it("mirrors tooltip.formatter onto the input display", () => {
    render(
      <SliderWithInput
        min={-200}
        max={200}
        step={1}
        value={50}
        tooltip={{ formatter: (v) => `${v > 0 ? "+" : ""}${v}px` }}
        onChange={() => {}}
      />,
    );
    expect(screen.getByRole("spinbutton")).toHaveValue("+50px");
  });

  it("forwards disabled to both controls", () => {
    render(<SliderWithInput min={0} max={100} step={1} value={50} disabled onChange={() => {}} />);
    expect(screen.getByRole("slider")).toHaveAttribute("aria-disabled", "true");
    expect(screen.getByRole("spinbutton")).toBeDisabled();
  });
});
