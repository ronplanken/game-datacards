import { render, screen, fireEvent } from "@testing-library/react";
import { SectionsSchemaEditor } from "../SectionsSchemaEditor";

vi.mock("lucide-react", () => ({
  LayoutList: (props) => <svg data-testid="icon-list" {...props} />,
  Plus: (props) => <svg data-testid="icon-plus" {...props} />,
  Trash2: (props) => <svg data-testid="icon-trash" {...props} />,
  ChevronUp: (props) => <svg data-testid="icon-chevron-up" {...props} />,
  ChevronDown: (props) => <svg data-testid="icon-chevron-down" {...props} />,
  ChevronRight: (props) => <svg data-testid="icon-chevron-right" {...props} />,
}));

const makeSchema = (hasBackSide) => ({
  metadata: { hasBackSide },
  sections: {
    label: "Sections",
    sections: [
      { key: "loadout", label: "Loadout", format: "list", side: "back" },
      { key: "special", label: "Special Rules", format: "list" },
    ],
  },
});

const expand = (label) => fireEvent.click(screen.getByText(label));

describe("SectionsSchemaEditor card side", () => {
  it("hides the side select while the option is off", () => {
    render(<SectionsSchemaEditor schema={makeSchema(false)} onChange={vi.fn()} baseSystem="40k-11e" />);
    expand("Loadout");
    expect(screen.queryByLabelText("Card side")).toBeNull();
  });

  it("hides the side select on other base systems", () => {
    render(<SectionsSchemaEditor schema={makeSchema(true)} onChange={vi.fn()} baseSystem="aos" />);
    expand("Loadout");
    expect(screen.queryByLabelText("Card side")).toBeNull();
  });

  it("shows the resolved side and writes the choice", () => {
    const onChange = vi.fn();
    render(<SectionsSchemaEditor schema={makeSchema(true)} onChange={onChange} baseSystem="40k-11e" />);
    expand("Special Rules");
    const select = screen.getByLabelText("Card side");
    expect(select.value).toBe("front");

    fireEvent.change(select, { target: { value: "back" } });
    expect(onChange.mock.calls[0][0].sections.sections[1].side).toBe("back");
  });

  it("writes an explicit front choice", () => {
    const onChange = vi.fn();
    render(<SectionsSchemaEditor schema={makeSchema(true)} onChange={onChange} baseSystem="40k-10e" />);
    expand("Loadout");
    fireEvent.change(screen.getByLabelText("Card side"), { target: { value: "front" } });
    expect(onChange.mock.calls[0][0].sections.sections[0].side).toBe("front");
  });

  it("adds new sections without a stored side", () => {
    const onChange = vi.fn();
    render(<SectionsSchemaEditor schema={makeSchema(true)} onChange={onChange} baseSystem="40k-11e" />);
    fireEvent.click(screen.getByLabelText("Add section"));
    const added = onChange.mock.calls[0][0].sections.sections[2];
    expect(added.side).toBeUndefined();
  });
});
