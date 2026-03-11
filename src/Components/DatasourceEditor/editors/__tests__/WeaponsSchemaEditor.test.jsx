import { render, screen, fireEvent } from "@testing-library/react";
import { WeaponsSchemaEditor } from "../WeaponsSchemaEditor";

vi.mock("lucide-react", () => ({
  Swords: (props) => <svg data-testid="icon-swords" {...props} />,
  Plus: (props) => <svg data-testid="icon-plus" {...props} />,
  Trash2: (props) => <svg data-testid="icon-trash" {...props} />,
  ChevronUp: (props) => <svg data-testid="icon-chevron-up" {...props} />,
  ChevronDown: (props) => <svg data-testid="icon-chevron-down" {...props} />,
  ChevronRight: (props) => <svg data-testid="icon-chevron-right" {...props} />,
}));

const mockSchema = {
  weaponTypes: {
    label: "Weapon Types",
    allowMultiple: true,
    types: [
      {
        key: "ranged",
        label: "Ranged Weapons",
        hasKeywords: true,
        hasProfiles: true,
        columns: [
          { key: "range", label: "Range", type: "string", required: true },
          { key: "a", label: "A", type: "string", required: true },
          { key: "bs", label: "BS", type: "string", required: true },
        ],
      },
      {
        key: "melee",
        label: "Melee Weapons",
        hasKeywords: false,
        hasProfiles: false,
        columns: [
          { key: "a", label: "A", type: "string", required: true },
          { key: "ws", label: "WS", type: "string", required: false },
        ],
      },
    ],
  },
};

describe("WeaponsSchemaEditor", () => {
  it("returns null when schema has no weaponTypes", () => {
    const { container } = render(<WeaponsSchemaEditor schema={{}} onChange={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null when schema is null", () => {
    const { container } = render(<WeaponsSchemaEditor schema={null} onChange={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders section with Weapon Types title", () => {
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    expect(screen.getByText("Weapon Types")).toBeInTheDocument();
  });

  it("renders tabs for each weapon type", () => {
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    expect(screen.getByRole("tab", { name: /Ranged Weapons/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Melee Weapons/i })).toBeInTheDocument();
  });

  it("first tab is active by default", () => {
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    const tabs = screen.getAllByRole("tab");
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
  });

  it("shows columns of the active weapon type", () => {
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    // First tab (Ranged) columns should be visible
    expect(screen.getByDisplayValue("Range")).toBeInTheDocument();
    expect(screen.getByDisplayValue("BS")).toBeInTheDocument();
  });

  it("switches tab content on tab click", () => {
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    // Click on Melee tab
    fireEvent.click(screen.getByRole("tab", { name: /Melee Weapons/i }));
    // Melee columns should now be visible
    expect(screen.getByDisplayValue("WS")).toBeInTheDocument();
  });

  it("renders hasKeywords checkbox checked when true", () => {
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    const checkboxes = screen.getAllByRole("checkbox");
    const hasKeywordsCheckbox = checkboxes.find(
      (cb) => cb.closest("label")?.textContent?.includes("Has keywords") && cb.checked,
    );
    expect(hasKeywordsCheckbox).toBeTruthy();
  });

  it("renders hasProfiles checkbox checked when true", () => {
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    const checkboxes = screen.getAllByRole("checkbox");
    const hasProfilesCheckbox = checkboxes.find(
      (cb) => cb.closest("label")?.textContent?.includes("Has profiles") && cb.checked,
    );
    expect(hasProfilesCheckbox).toBeTruthy();
  });

  it("toggles hasKeywords on checkbox change", () => {
    const onChange = vi.fn();
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={onChange} />);
    const checkboxes = screen.getAllByRole("checkbox");
    const hasKeywordsCheckbox = checkboxes.find((cb) => cb.closest("label")?.textContent?.includes("Has keywords"));
    fireEvent.click(hasKeywordsCheckbox);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        weaponTypes: expect.objectContaining({
          types: expect.arrayContaining([expect.objectContaining({ key: "ranged", hasKeywords: false })]),
        }),
      }),
    );
  });

  it("toggles hasProfiles on checkbox change", () => {
    const onChange = vi.fn();
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={onChange} />);
    const checkboxes = screen.getAllByRole("checkbox");
    const hasProfilesCheckbox = checkboxes.find((cb) => cb.closest("label")?.textContent?.includes("Has profiles"));
    fireEvent.click(hasProfilesCheckbox);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        weaponTypes: expect.objectContaining({
          types: expect.arrayContaining([expect.objectContaining({ key: "ranged", hasProfiles: false })]),
        }),
      }),
    );
  });

  it("updates weapon type key", () => {
    const onChange = vi.fn();
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={onChange} />);
    const keyInput = screen.getByDisplayValue("ranged");
    fireEvent.change(keyInput, { target: { value: "shooting" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        weaponTypes: expect.objectContaining({
          types: expect.arrayContaining([expect.objectContaining({ key: "shooting" })]),
        }),
      }),
    );
  });

  it("updates weapon type label", () => {
    const onChange = vi.fn();
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={onChange} />);
    const labelInput = screen.getByDisplayValue("Ranged Weapons");
    fireEvent.change(labelInput, { target: { value: "Shooting Weapons" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        weaponTypes: expect.objectContaining({
          types: expect.arrayContaining([expect.objectContaining({ label: "Shooting Weapons" })]),
        }),
      }),
    );
  });

  it("adds a new weapon type", () => {
    const onChange = vi.fn();
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Add weapon type"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        weaponTypes: expect.objectContaining({
          types: expect.arrayContaining([
            expect.objectContaining({ key: "ranged" }),
            expect.objectContaining({ key: "melee" }),
            expect.objectContaining({ key: "weapon_type_3", label: "Weapon Type 3", columns: [] }),
          ]),
        }),
      }),
    );
  });

  it("removes a weapon type via tab remove button", () => {
    const onChange = vi.fn();
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={onChange} />);
    const removeBtn = screen.getByTitle("Remove Ranged Weapons");
    fireEvent.click(removeBtn);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        weaponTypes: expect.objectContaining({
          types: [expect.objectContaining({ key: "melee" })],
        }),
      }),
    );
  });

  it("adds a column to the active weapon type", () => {
    const onChange = vi.fn();
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Add column"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        weaponTypes: expect.objectContaining({
          types: expect.arrayContaining([
            expect.objectContaining({
              key: "ranged",
              columns: expect.arrayContaining([
                expect.objectContaining({ key: "range" }),
                expect.objectContaining({ key: "col_4", label: "Column 4" }),
              ]),
            }),
          ]),
        }),
      }),
    );
  });

  it("removes a column", () => {
    const onChange = vi.fn();
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={onChange} />);
    const removeButtons = screen.getAllByTitle("Remove column");
    fireEvent.click(removeButtons[0]); // Remove Range column
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        weaponTypes: expect.objectContaining({
          types: expect.arrayContaining([
            expect.objectContaining({
              key: "ranged",
              columns: [expect.objectContaining({ key: "a" }), expect.objectContaining({ key: "bs" })],
            }),
          ]),
        }),
      }),
    );
  });

  it("moves a column up", () => {
    const onChange = vi.fn();
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={onChange} />);
    const moveUpButtons = screen.getAllByTitle("Move up");
    fireEvent.click(moveUpButtons[1]); // Move A up (second column)
    const call = onChange.mock.calls[0][0];
    const rangedType = call.weaponTypes.types.find((t) => t.key === "ranged");
    expect(rangedType.columns[0].key).toBe("a");
    expect(rangedType.columns[1].key).toBe("range");
  });

  it("moves a column down", () => {
    const onChange = vi.fn();
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={onChange} />);
    const moveDownButtons = screen.getAllByTitle("Move down");
    fireEvent.click(moveDownButtons[0]); // Move Range down
    const call = onChange.mock.calls[0][0];
    const rangedType = call.weaponTypes.types.find((t) => t.key === "ranged");
    expect(rangedType.columns[0].key).toBe("a");
    expect(rangedType.columns[1].key).toBe("range");
  });

  it("disables move up for first column", () => {
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    const moveUpButtons = screen.getAllByTitle("Move up");
    expect(moveUpButtons[0]).toBeDisabled();
  });

  it("disables move down for last column", () => {
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    const moveDownButtons = screen.getAllByTitle("Move down");
    // Last move-down button for columns in the active tab
    const lastIdx = 2; // third column (BS) is last
    expect(moveDownButtons[lastIdx]).toBeDisabled();
  });

  it("updates column type via select", () => {
    const onChange = vi.fn();
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={onChange} />);
    const typeSelects = screen.getAllByLabelText("Column type");
    fireEvent.change(typeSelects[0], { target: { value: "boolean" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        weaponTypes: expect.objectContaining({
          types: expect.arrayContaining([
            expect.objectContaining({
              key: "ranged",
              columns: expect.arrayContaining([expect.objectContaining({ key: "range", type: "boolean" })]),
            }),
          ]),
        }),
      }),
    );
  });

  it("toggles column required flag", () => {
    const onChange = vi.fn();
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={onChange} />);
    const checkboxes = screen.getAllByRole("checkbox");
    // Find the first Required checkbox (after hasKeywords and hasProfiles)
    const requiredCheckbox = checkboxes.find(
      (cb) => cb.closest("label")?.textContent?.includes("Required") && cb.checked,
    );
    fireEvent.click(requiredCheckbox);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        weaponTypes: expect.objectContaining({
          types: expect.arrayContaining([
            expect.objectContaining({
              key: "ranged",
              columns: expect.arrayContaining([expect.objectContaining({ key: "range", required: false })]),
            }),
          ]),
        }),
      }),
    );
  });

  it("preserves other schema properties when updating weapon types", () => {
    const onChange = vi.fn();
    const schemaWithExtra = { ...mockSchema, stats: { fields: [] } };
    render(<WeaponsSchemaEditor schema={schemaWithExtra} onChange={onChange} />);
    fireEvent.click(screen.getByLabelText("Add weapon type"));
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        stats: { fields: [] },
      }),
    );
  });

  it("renders empty state with no columns", () => {
    const emptySchema = {
      weaponTypes: {
        label: "Weapon Types",
        types: [{ key: "ranged", label: "Ranged", hasKeywords: false, hasProfiles: false, columns: [] }],
      },
    };
    render(<WeaponsSchemaEditor schema={emptySchema} onChange={vi.fn()} />);
    expect(screen.getByText("Columns")).toBeInTheDocument();
    expect(screen.getByLabelText("Add column")).toBeInTheDocument();
  });

  it("renders with no weapon types and only Add Weapon Type button", () => {
    const emptySchema = { weaponTypes: { label: "Weapon Types", types: [] } };
    render(<WeaponsSchemaEditor schema={emptySchema} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Add weapon type")).toBeInTheDocument();
    expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
  });

  it("adjusts active tab when removing last weapon type in list", () => {
    const onChange = vi.fn();
    render(<WeaponsSchemaEditor schema={mockSchema} onChange={onChange} />);
    // Switch to the second tab (Melee)
    fireEvent.click(screen.getByRole("tab", { name: /Melee Weapons/i }));
    // Remove the second tab
    fireEvent.click(screen.getByTitle("Remove Melee Weapons"));
    // onChange should be called with only ranged remaining
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        weaponTypes: expect.objectContaining({
          types: [expect.objectContaining({ key: "ranged" })],
        }),
      }),
    );
  });
});
