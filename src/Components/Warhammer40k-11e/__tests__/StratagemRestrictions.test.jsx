import React from "react";
import { render, fireEvent } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";

// Some 11e stratagems (Insane Bravery, Rapid Ingress, …) carry a `restrictions`
// section that the card renders; the editor has to be able to write it, add it
// to a stratagem that never had one, and take it away again.
let capturedCard;
const mockUpdateActiveCard = vi.fn((arg) => {
  capturedCard = typeof arg === "function" ? arg() : arg;
});
const mockActiveCard = { ref: {} };

vi.mock("../../../Hooks/useCardStorage", () => ({
  useCardStorage: () => ({
    activeCard: mockActiveCard.ref,
    updateActiveCard: mockUpdateActiveCard,
  }),
}));

// Edit in German so we can assert English siblings survive.
vi.mock("../../../Hooks/useSettingsStorage", () => ({
  useSettingsStorage: () => ({ settings: { language: "de" } }),
}));

// The markdown editor is replaced with a plain textarea, labelled by the card
// title it sits under so a test can pick the right field.
vi.mock("../../CustomMarkdownEditor", () => ({
  CustomMarkdownEditor: ({ value, onChange }) => (
    <textarea className="md-editor" value={value} onChange={(e) => onChange(e.target.value)} />
  ),
}));

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

import { StratagemCardInfo } from "../StratagemEditor/StratagemCardInfo";
import { StratagemCard } from "../StratagemCard";

// The panels render in a fixed order: When, Target, Effect, Restrictions.
const editorFor = (container, title) => {
  const panel = [...container.querySelectorAll(".ant-card")].find(
    (card) => card.querySelector(".ant-card-head-title")?.textContent === title,
  );
  return panel.querySelector("textarea.md-editor");
};

describe("11e stratagem restrictions editor", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    capturedCard = undefined;
  });

  it("shows the restrictions of the active card language", () => {
    mockActiveCard.ref = {
      when: { en: "When" },
      restrictions: { en: "Once per battle.", de: "Einmal pro Schlacht." },
    };
    const { container } = render(<StratagemCardInfo />);

    expect(editorFor(container, "Restrictions").value).toBe("Einmal pro Schlacht.");
  });

  it("merges an edit into the active language and preserves the others", () => {
    mockActiveCard.ref = { restrictions: { en: "Once per battle.", de: "Alt" } };
    const { container } = render(<StratagemCardInfo />);

    fireEvent.change(editorFor(container, "Restrictions"), { target: { value: "Einmal pro Schlacht." } });

    expect(capturedCard.restrictions).toEqual({ en: "Once per battle.", de: "Einmal pro Schlacht." });
  });

  // Without seeding, the first value typed into a stratagem that has no
  // restrictions would be stored as a bare string and show in every language.
  it("starts a language-keyed field on a stratagem that had no restrictions", () => {
    mockActiveCard.ref = { when: { en: "When" } };
    const { container } = render(<StratagemCardInfo />);

    fireEvent.change(editorFor(container, "Restrictions"), { target: { value: "Einmal pro Schlacht." } });

    expect(capturedCard.restrictions).toEqual({ de: "Einmal pro Schlacht." });
  });

  it("drops the field once it is empty in every language", () => {
    mockActiveCard.ref = { when: { en: "When" }, restrictions: { de: "Einmal pro Schlacht." } };
    const { container } = render(<StratagemCardInfo />);

    fireEvent.change(editorFor(container, "Restrictions"), { target: { value: "" } });

    expect(capturedCard).not.toHaveProperty("restrictions");
    expect(capturedCard.when).toEqual({ en: "When" });
  });

  it("keeps the other languages when only the active one is cleared", () => {
    mockActiveCard.ref = { restrictions: { en: "Once per battle.", de: "Einmal pro Schlacht." } };
    const { container } = render(<StratagemCardInfo />);

    fireEvent.change(editorFor(container, "Restrictions"), { target: { value: "" } });

    expect(capturedCard.restrictions).toEqual({ en: "Once per battle.", de: "" });
  });

  it("still edits when / target / effect in place", () => {
    mockActiveCard.ref = { when: { en: "When", de: "Wann" }, target: { en: "T" }, effect: { en: "E" } };
    const { container } = render(<StratagemCardInfo />);

    fireEvent.change(editorFor(container, "When"), { target: { value: "Wann genau" } });

    expect(capturedCard.when).toEqual({ en: "When", de: "Wann genau" });
  });

  // Dropping an emptied field is for `restrictions`, which the datasource omits
  // on most stratagems. when/target/effect ship on every stratagem and keep
  // their key whatever they are cleared to.
  it("keeps when / target / effect when they are cleared", () => {
    mockActiveCard.ref = { when: { de: "Wann" }, target: { en: "T" }, effect: { en: "E" } };
    const { container } = render(<StratagemCardInfo />);

    fireEvent.change(editorFor(container, "When"), { target: { value: "" } });

    expect(capturedCard).toHaveProperty("when");
    expect(capturedCard.when).toEqual({ de: "" });
  });

  it("renders what the editor wrote on the card", () => {
    const { getByText } = render(
      <StratagemCard
        stratagem={{ name: { de: "Wahnsinniger Mut" }, restrictions: { de: "Einmal pro Schlacht." }, phase: [] }}
      />,
    );

    expect(getByText("restrictions:")).toBeInTheDocument();
    expect(getByText("Einmal pro Schlacht.")).toBeInTheDocument();
  });
});
