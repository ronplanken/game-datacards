import { render, screen, fireEvent } from "@testing-library/react";
import { KeywordGlossaryEditor } from "../KeywordGlossaryEditor";

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
  keywordGlossary: [
    {
      key: "one-shot",
      name: "One Shot",
      description: "Once per battle.",
      matchType: "exact",
      appliesTo: ["weapons"],
    },
  ],
  ...overrides,
});

const openSection = () => fireEvent.click(screen.getByText("Keyword Glossary"));

describe("KeywordGlossaryEditor", () => {
  it("returns null when schema is missing", () => {
    const { container } = render(<KeywordGlossaryEditor schema={null} onChange={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders the section title", () => {
    render(<KeywordGlossaryEditor schema={baseSchema()} onChange={vi.fn()} />);
    openSection();
    expect(screen.getByText("Keyword Glossary")).toBeInTheDocument();
  });

  it("renders existing entries", () => {
    render(<KeywordGlossaryEditor schema={baseSchema()} onChange={vi.fn()} />);
    openSection();
    expect(screen.getByDisplayValue("One Shot")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Once per battle.")).toBeInTheDocument();
  });

  it("shows the empty-state message when there are no entries", () => {
    render(<KeywordGlossaryEditor schema={baseSchema({ keywordGlossary: [] })} onChange={vi.fn()} />);
    openSection();
    expect(screen.getByText(/No keyword definitions yet/i)).toBeInTheDocument();
  });

  it("adds a new entry with appliesTo: ['weapons'] via the section add button", () => {
    const onChange = vi.fn();
    render(<KeywordGlossaryEditor schema={baseSchema()} onChange={onChange} />);
    openSection();
    fireEvent.click(screen.getByLabelText("Add keyword"));
    expect(onChange).toHaveBeenCalled();
    const next = onChange.mock.calls.at(-1)[0];
    expect(next.keywordGlossary).toHaveLength(2);
    expect(next.keywordGlossary[1]).toMatchObject({
      name: "",
      description: "",
      matchType: "exact",
      appliesTo: ["weapons"],
    });
  });

  it("removes an entry on trash click", () => {
    const onChange = vi.fn();
    render(<KeywordGlossaryEditor schema={baseSchema()} onChange={onChange} />);
    openSection();
    fireEvent.click(screen.getByRole("button", { name: /Remove One Shot/i }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ keywordGlossary: [] }));
  });

  it("updates the description as it is typed", () => {
    const onChange = vi.fn();
    render(<KeywordGlossaryEditor schema={baseSchema()} onChange={onChange} />);
    openSection();
    const desc = screen.getByLabelText("Keyword description");
    fireEvent.change(desc, { target: { value: "Updated text." } });
    const next = onChange.mock.calls.at(-1)[0];
    expect(next.keywordGlossary[0].description).toBe("Updated text.");
  });

  it("switches matchType via the select", () => {
    const onChange = vi.fn();
    render(<KeywordGlossaryEditor schema={baseSchema()} onChange={onChange} />);
    openSection();
    fireEvent.change(screen.getByLabelText("Match type"), { target: { value: "prefix" } });
    const next = onChange.mock.calls.at(-1)[0];
    expect(next.keywordGlossary[0].matchType).toBe("prefix");
  });

  it("toggles an additional scope on appliesTo", () => {
    const onChange = vi.fn();
    render(<KeywordGlossaryEditor schema={baseSchema()} onChange={onChange} />);
    openSection();
    fireEvent.click(screen.getByLabelText("Abilities"));
    const next = onChange.mock.calls.at(-1)[0];
    expect(next.keywordGlossary[0].appliesTo).toEqual(["weapons", "abilities"]);
  });

  it("removes a scope from appliesTo when its checkbox is toggled off", () => {
    const onChange = vi.fn();
    render(<KeywordGlossaryEditor schema={baseSchema()} onChange={onChange} />);
    openSection();
    fireEvent.click(screen.getByLabelText("Weapons"));
    const next = onChange.mock.calls.at(-1)[0];
    expect(next.keywordGlossary[0].appliesTo).toEqual([]);
  });

  it("renders a checkbox for every supported scope", () => {
    render(<KeywordGlossaryEditor schema={baseSchema()} onChange={vi.fn()} />);
    openSection();
    ["Weapons", "Abilities", "Unit keywords", "Rules", "Stratagems", "Enhancements"].forEach((label) => {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    });
  });

  it("shows a Restore defaults button for 40k-10e and seeds entries", () => {
    const onChange = vi.fn();
    render(<KeywordGlossaryEditor schema={baseSchema({ keywordGlossary: [] })} onChange={onChange} />);
    openSection();
    fireEvent.click(screen.getByRole("button", { name: /Restore default keyword glossary/i }));
    const next = onChange.mock.calls.at(-1)[0];
    expect(next.keywordGlossary.length).toBeGreaterThan(5);
    expect(next.keywordGlossary.some((e) => e.name === "One Shot")).toBe(true);
    expect(next.keywordGlossary.every((e) => e.appliesTo?.includes("weapons"))).toBe(true);
  });

  it("hides the Restore defaults button for systems without seeds", () => {
    render(
      <KeywordGlossaryEditor schema={baseSchema({ baseSystem: "blank", keywordGlossary: [] })} onChange={vi.fn()} />,
    );
    openSection();
    expect(screen.queryByRole("button", { name: /Restore default keyword glossary/i })).toBeNull();
  });
});
