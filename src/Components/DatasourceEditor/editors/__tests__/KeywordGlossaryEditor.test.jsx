import { render, screen, fireEvent } from "@testing-library/react";
import { KeywordGlossaryEditor } from "../KeywordGlossaryEditor";

vi.mock("lucide-react", () => ({
  BookOpen: (props) => <svg data-testid="icon-book" {...props} />,
  ChevronDown: (props) => <svg data-testid="icon-chevron-down" {...props} />,
  ChevronRight: (props) => <svg data-testid="icon-chevron-right" {...props} />,
  MoreHorizontal: (props) => <svg data-testid="icon-overflow" {...props} />,
  Plus: (props) => <svg data-testid="icon-plus" {...props} />,
  RotateCcw: (props) => <svg data-testid="icon-restore" {...props} />,
  Trash2: (props) => <svg data-testid="icon-trash" {...props} />,
}));

// Mock the bits of antd we use: a native multi-select stands in for
// the antd Select, and Dropdown/Menu are flattened so the menu items
// are reachable in tests without needing to click open a popover.
vi.mock("antd", () => ({
  Select: ({ value, onChange, options = [], "aria-label": ariaLabel }) => (
    <select
      multiple
      aria-label={ariaLabel}
      value={value || []}
      onChange={(e) => {
        const selected = Array.from(e.target.selectedOptions).map((o) => o.value);
        onChange?.(selected);
      }}>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  ),
  Dropdown: ({ children, overlay }) => (
    <>
      {children}
      {overlay}
    </>
  ),
  Menu: ({ items = [] }) => (
    <ul>
      {items.map((item) => (
        <li key={item.key}>
          <button type="button" onClick={item.onClick}>
            {item.label}
          </button>
        </li>
      ))}
    </ul>
  ),
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

// Helper: drive our mocked multi-select by setting `selected` on each
// option and dispatching a change event.
const setScopes = (select, values) => {
  for (const opt of select.options) {
    opt.selected = values.includes(opt.value);
  }
  fireEvent.change(select);
};

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

  it("adds a scope via the appliesTo dropdown", () => {
    const onChange = vi.fn();
    render(<KeywordGlossaryEditor schema={baseSchema()} onChange={onChange} />);
    openSection();
    const select = screen.getByLabelText("Applies to scopes for One Shot");
    setScopes(select, ["weapons", "abilities"]);
    const next = onChange.mock.calls.at(-1)[0];
    expect(next.keywordGlossary[0].appliesTo).toEqual(["weapons", "abilities"]);
  });

  it("removes a scope via the appliesTo dropdown (multi-scope entry)", () => {
    const onChange = vi.fn();
    const schema = baseSchema({
      keywordGlossary: [
        {
          key: "twin-linked",
          name: "Twin-linked",
          description: "",
          matchType: "exact",
          appliesTo: ["weapons", "abilities"],
        },
      ],
    });
    render(<KeywordGlossaryEditor schema={schema} onChange={onChange} />);
    openSection();
    const select = screen.getByLabelText("Applies to scopes for Twin-linked");
    setScopes(select, ["weapons"]);
    const next = onChange.mock.calls.at(-1)[0];
    expect(next.keywordGlossary[0].appliesTo).toEqual(["weapons"]);
  });

  it("refuses to clear appliesTo via the dropdown so the schema stays valid", () => {
    const onChange = vi.fn();
    render(<KeywordGlossaryEditor schema={baseSchema()} onChange={onChange} />);
    openSection();
    const select = screen.getByLabelText("Applies to scopes for One Shot");
    setScopes(select, []);
    expect(onChange).not.toHaveBeenCalled();
  });

  it("renders an option for every supported scope", () => {
    render(<KeywordGlossaryEditor schema={baseSchema()} onChange={vi.fn()} />);
    openSection();
    const select = screen.getByLabelText("Applies to scopes for One Shot");
    const labels = Array.from(select.options).map((o) => o.textContent);
    expect(labels).toEqual(["Weapons", "Abilities", "Unit keywords", "Rules", "Stratagems", "Enhancements"]);
  });

  it("seeds entries from the overflow menu 'Restore defaults' action on 40k-10e", () => {
    const onChange = vi.fn();
    render(<KeywordGlossaryEditor schema={baseSchema({ keywordGlossary: [] })} onChange={onChange} />);
    openSection();
    fireEvent.click(screen.getByRole("button", { name: /Restore defaults/i }));
    const next = onChange.mock.calls.at(-1)[0];
    expect(next.keywordGlossary.length).toBeGreaterThan(5);
    expect(next.keywordGlossary.some((e) => e.name === "One Shot")).toBe(true);
    expect(next.keywordGlossary.every((e) => e.appliesTo?.includes("weapons"))).toBe(true);
  });

  it("hides the overflow menu trigger when the base system has no seeds", () => {
    render(
      <KeywordGlossaryEditor schema={baseSchema({ baseSystem: "blank", keywordGlossary: [] })} onChange={vi.fn()} />,
    );
    openSection();
    expect(screen.queryByLabelText("Keyword glossary actions")).toBeNull();
    expect(screen.queryByRole("button", { name: /Restore defaults/i })).toBeNull();
  });

  it("strips the transient _id before persisting", () => {
    const onChange = vi.fn();
    render(<KeywordGlossaryEditor schema={baseSchema()} onChange={onChange} />);
    openSection();
    fireEvent.click(screen.getByLabelText("Add keyword"));
    const next = onChange.mock.calls.at(-1)[0];
    for (const entry of next.keywordGlossary) {
      expect(entry).not.toHaveProperty("_id");
    }
  });
});
