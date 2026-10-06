import { render, screen } from "@testing-library/react";
import { Kbd } from "../components/Kbd";

describe("Kbd", () => {
  it("renders a plain key", () => {
    render(<Kbd>Delete</Kbd>);
    const kbd = screen.getByText("Delete");
    expect(kbd.tagName).toBe("KBD");
    expect(kbd.className).toBe("help-kbd");
  });

  it("renders mod key with platform prefix", () => {
    render(<Kbd mod>C</Kbd>);
    const kbd = screen.getByText(/C$/);
    expect(kbd.tagName).toBe("KBD");
    // Should contain either Cmd+ or Ctrl+ depending on platform
    expect(kbd.textContent).toMatch(/(Cmd|Ctrl)\+C/);
  });

  it("renders without mod when mod prop is absent", () => {
    render(<Kbd>Backspace</Kbd>);
    expect(screen.getByText("Backspace").textContent).not.toMatch(/Cmd|Ctrl/);
  });
});
