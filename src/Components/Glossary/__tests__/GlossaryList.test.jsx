import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { GlossaryList } from "../GlossaryList";

const glossary = [
  {
    key: "one-shot",
    name: "One Shot",
    description: "The bearer can only shoot with this weapon once per battle.",
    matchType: "exact",
    appliesTo: ["weapons"],
  },
  {
    key: "anti",
    name: "Anti-",
    description: "An unmodified Wound roll of 'x+' scores a Critical Wound.",
    matchType: "prefix",
    appliesTo: ["weapons", "abilities"],
  },
];

describe("GlossaryList", () => {
  it("lists entries alphabetically by name", () => {
    render(<GlossaryList glossary={glossary} />);
    const names = screen.getAllByText(/One Shot|Anti-/);
    expect(names[0].textContent).toContain("Anti-");
    expect(names[1].textContent).toContain("One Shot");
  });

  it("renders scope chips for each entry", () => {
    render(<GlossaryList glossary={glossary} />);
    expect(screen.getAllByText("Weapons").length).toBe(2);
    expect(screen.getByText("Abilities")).toBeTruthy();
  });

  it("reveals the description when an entry is expanded", () => {
    render(<GlossaryList glossary={glossary} />);
    expect(screen.queryByText("The bearer can only shoot with this weapon once per battle.")).toBeNull();
    fireEvent.click(screen.getByText("One Shot"));
    expect(screen.getByText("The bearer can only shoot with this weapon once per battle.")).toBeTruthy();
  });

  it("filters entries by search text against name and description", () => {
    render(<GlossaryList glossary={glossary} />);
    fireEvent.change(screen.getByPlaceholderText("Search keywords"), { target: { value: "critical wound" } });
    expect(screen.getByText(/Anti-/)).toBeTruthy();
    expect(screen.queryByText("One Shot")).toBeNull();
  });

  it("shows an empty message when no entries match the search", () => {
    render(<GlossaryList glossary={glossary} />);
    fireEvent.change(screen.getByPlaceholderText("Search keywords"), { target: { value: "zzz" } });
    expect(screen.getByText("No keywords match your search.")).toBeTruthy();
  });

  it("shows an empty message when the glossary is empty", () => {
    render(<GlossaryList glossary={[]} />);
    expect(screen.getByText("This datasource has no glossary entries yet.")).toBeTruthy();
  });

  it("tolerates a missing glossary prop", () => {
    render(<GlossaryList />);
    expect(screen.getByText("This datasource has no glossary entries yet.")).toBeTruthy();
  });

  it("uses a custom search placeholder when provided", () => {
    render(<GlossaryList glossary={glossary} searchPlaceholder="Find a keyword" />);
    expect(screen.getByPlaceholderText("Find a keyword")).toBeTruthy();
  });
});
