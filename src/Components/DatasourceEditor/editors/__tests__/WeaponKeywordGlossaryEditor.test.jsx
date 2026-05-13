import { render, screen, fireEvent } from "@testing-library/react";
import { WeaponKeywordGlossaryEditor } from "../WeaponKeywordGlossaryEditor";

vi.mock("lucide-react", () => ({
  BookOpen: (props) => <svg data-testid="icon-book" {...props} />,
  ChevronDown: (props) => <svg data-testid="icon-chevron-down" {...props} />,
  ChevronRight: (props) => <svg data-testid="icon-chevron-right" {...props} />,
  Plus: (props) => <svg data-testid="icon-plus" {...props} />,
  RotateCcw: (props) => <svg data-testid="icon-restore" {...props} />,
  Trash2: (props) => <svg data-testid="icon-trash" {...props} />,
}));

const baseSchema = (overrides = {}) => ({
  baseSystem: "40k-10e",
  weaponKeywordGlossary: [{ key: "one-shot", name: "One Shot", description: "Once per battle.", matchType: "exact" }],
  ...overrides,
});

describe("WeaponKeywordGlossaryEditor", () => {
  it("returns null when schema is missing", () => {
    const { container } = render(<WeaponKeywordGlossaryEditor schema={null} onChange={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders the section title", () => {
    render(<WeaponKeywordGlossaryEditor schema={baseSchema()} onChange={vi.fn()} />);
    // Open the section (defaultOpen=false)
    fireEvent.click(screen.getByText("Weapon Keyword Glossary"));
    expect(screen.getByText("Weapon Keyword Glossary")).toBeInTheDocument();
  });

  it("renders existing entries", () => {
    render(<WeaponKeywordGlossaryEditor schema={baseSchema()} onChange={vi.fn()} />);
    fireEvent.click(screen.getByText("Weapon Keyword Glossary"));
    expect(screen.getByDisplayValue("One Shot")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Once per battle.")).toBeInTheDocument();
  });

  it("shows the empty-state message when there are no entries", () => {
    render(<WeaponKeywordGlossaryEditor schema={baseSchema({ weaponKeywordGlossary: [] })} onChange={vi.fn()} />);
    fireEvent.click(screen.getByText("Weapon Keyword Glossary"));
    expect(screen.getByText(/No keyword definitions yet/i)).toBeInTheDocument();
  });

  it("adds a new entry via the section add button", () => {
    const onChange = vi.fn();
    render(<WeaponKeywordGlossaryEditor schema={baseSchema()} onChange={onChange} />);
    fireEvent.click(screen.getByText("Weapon Keyword Glossary"));
    fireEvent.click(screen.getByLabelText("Add keyword"));
    expect(onChange).toHaveBeenCalled();
    const next = onChange.mock.calls.at(-1)[0];
    expect(next.weaponKeywordGlossary).toHaveLength(2);
    expect(next.weaponKeywordGlossary[1]).toMatchObject({ name: "", description: "", matchType: "exact" });
  });

  it("removes an entry on trash click", () => {
    const onChange = vi.fn();
    render(<WeaponKeywordGlossaryEditor schema={baseSchema()} onChange={onChange} />);
    fireEvent.click(screen.getByText("Weapon Keyword Glossary"));
    fireEvent.click(screen.getByRole("button", { name: /Remove One Shot/i }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ weaponKeywordGlossary: [] }));
  });

  it("updates the description as it is typed", () => {
    const onChange = vi.fn();
    render(<WeaponKeywordGlossaryEditor schema={baseSchema()} onChange={onChange} />);
    fireEvent.click(screen.getByText("Weapon Keyword Glossary"));
    const desc = screen.getByLabelText("Keyword description");
    fireEvent.change(desc, { target: { value: "Updated text." } });
    const next = onChange.mock.calls.at(-1)[0];
    expect(next.weaponKeywordGlossary[0].description).toBe("Updated text.");
  });

  it("switches matchType via the select", () => {
    const onChange = vi.fn();
    render(<WeaponKeywordGlossaryEditor schema={baseSchema()} onChange={onChange} />);
    fireEvent.click(screen.getByText("Weapon Keyword Glossary"));
    fireEvent.change(screen.getByLabelText("Match type"), { target: { value: "prefix" } });
    const next = onChange.mock.calls.at(-1)[0];
    expect(next.weaponKeywordGlossary[0].matchType).toBe("prefix");
  });

  it("shows a Restore defaults button for 40k-10e and seeds entries", () => {
    const onChange = vi.fn();
    render(<WeaponKeywordGlossaryEditor schema={baseSchema({ weaponKeywordGlossary: [] })} onChange={onChange} />);
    fireEvent.click(screen.getByText("Weapon Keyword Glossary"));
    fireEvent.click(screen.getByRole("button", { name: /Restore default keyword glossary/i }));
    const next = onChange.mock.calls.at(-1)[0];
    expect(next.weaponKeywordGlossary.length).toBeGreaterThan(5);
    expect(next.weaponKeywordGlossary.some((e) => e.name === "One Shot")).toBe(true);
  });

  it("hides the Restore defaults button for systems without seeds", () => {
    render(
      <WeaponKeywordGlossaryEditor
        schema={baseSchema({ baseSystem: "blank", weaponKeywordGlossary: [] })}
        onChange={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByText("Weapon Keyword Glossary"));
    expect(screen.queryByRole("button", { name: /Restore default keyword glossary/i })).toBeNull();
  });
});
