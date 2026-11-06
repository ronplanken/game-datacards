import { render, screen, fireEvent } from "@testing-library/react";
import { UnitLinksSchemaEditor } from "../UnitLinksSchemaEditor";

const leader = { _id: "a", key: "leads", label: "Leader", description: "This unit can lead the following units:" };
const support = {
  _id: "b",
  key: "supports",
  label: "Support",
  description: "This unit can support the following units:",
};

const lastSchema = (onChange) => onChange.mock.calls[onChange.mock.calls.length - 1][0];

describe("UnitLinksSchemaEditor", () => {
  it("shows an empty state without groups", () => {
    render(<UnitLinksSchemaEditor schema={{}} onChange={vi.fn()} />);
    expect(screen.getByText("Unit Links")).toBeInTheDocument();
    expect(screen.getByText(/No link groups yet/)).toBeInTheDocument();
  });

  it("adds the Leader preset first and Support second", () => {
    const onChange = vi.fn();
    const { rerender } = render(<UnitLinksSchemaEditor schema={{ stats: {} }} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Add link group"));
    const first = lastSchema(onChange);
    expect(first.stats).toEqual({});
    expect(first.unitLinks.groups).toHaveLength(1);
    expect(first.unitLinks.groups[0]).toMatchObject({ key: "leads", label: "Leader" });

    rerender(<UnitLinksSchemaEditor schema={first} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Add link group"));
    expect(lastSchema(onChange).unitLinks.groups.map((g) => g.key)).toEqual(["leads", "supports"]);
  });

  it("edits the key, label and description of a group", () => {
    const onChange = vi.fn();
    render(<UnitLinksSchemaEditor schema={{ unitLinks: { groups: [leader] } }} onChange={onChange} />);
    fireEvent.click(screen.getByText("Leader"));

    fireEvent.change(screen.getByLabelText("Label"), { target: { value: "Leaders" } });
    expect(lastSchema(onChange).unitLinks.groups[0].label).toBe("Leaders");

    fireEvent.change(screen.getByLabelText("Key"), { target: { value: "leaders" } });
    expect(lastSchema(onChange).unitLinks.groups[0].key).toBe("leaders");

    fireEvent.change(screen.getByLabelText("Description"), { target: { value: "Can lead:" } });
    expect(lastSchema(onChange).unitLinks.groups[0].description).toBe("Can lead:");
  });

  it("removes and reorders groups", () => {
    const onChange = vi.fn();
    render(<UnitLinksSchemaEditor schema={{ unitLinks: { groups: [leader, support] } }} onChange={onChange} />);

    fireEvent.click(screen.getByLabelText("Move Support up"));
    expect(lastSchema(onChange).unitLinks.groups.map((g) => g.key)).toEqual(["supports", "leads"]);

    fireEvent.click(screen.getByLabelText("Remove Leader"));
    expect(lastSchema(onChange).unitLinks.groups.map((g) => g.key)).toEqual(["supports"]);
  });
});
