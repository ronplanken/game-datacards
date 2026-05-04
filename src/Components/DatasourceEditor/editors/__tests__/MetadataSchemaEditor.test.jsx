import { render, screen, fireEvent } from "@testing-library/react";
import { MetadataSchemaEditor } from "../MetadataSchemaEditor";

vi.mock("lucide-react", () => ({
  Tags: (props) => <svg data-testid="icon-tags" {...props} />,
  ChevronDown: (props) => <svg data-testid="icon-chevron-down" {...props} />,
  ChevronRight: (props) => <svg data-testid="icon-chevron-right" {...props} />,
}));

const mockSchema = {
  metadata: {
    hasKeywords: true,
    hasFactionKeywords: true,
    hasPoints: true,
    pointsFormat: "per-model",
  },
};

describe("MetadataSchemaEditor", () => {
  it("returns null when schema has no metadata", () => {
    const { container } = render(<MetadataSchemaEditor schema={{}} onChange={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });

  it("returns null when schema is null", () => {
    const { container } = render(<MetadataSchemaEditor schema={null} onChange={vi.fn()} />);
    expect(container.innerHTML).toBe("");
  });

  it("renders section with Card Options title", () => {
    render(<MetadataSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    expect(screen.getByText("Card Options")).toBeInTheDocument();
  });

  it("renders all three toggle inputs", () => {
    render(<MetadataSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Keywords")).toBeInTheDocument();
    expect(screen.getByLabelText("Faction keywords")).toBeInTheDocument();
    expect(screen.getByLabelText("Points cost")).toBeInTheDocument();
  });

  it("renders hasKeywords checkbox checked when true", () => {
    render(<MetadataSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0].checked).toBe(true);
  });

  it("renders hasFactionKeywords checkbox checked when true", () => {
    render(<MetadataSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[1].checked).toBe(true);
  });

  it("renders hasPoints checkbox checked when true", () => {
    render(<MetadataSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[2].checked).toBe(true);
  });

  it("toggles hasKeywords on checkbox change", () => {
    const onChange = vi.fn();
    render(<MetadataSchemaEditor schema={mockSchema} onChange={onChange} />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ hasKeywords: false }),
      }),
    );
  });

  it("toggles hasFactionKeywords on checkbox change", () => {
    const onChange = vi.fn();
    render(<MetadataSchemaEditor schema={mockSchema} onChange={onChange} />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[1]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ hasFactionKeywords: false }),
      }),
    );
  });

  it("toggles hasPoints on checkbox change", () => {
    const onChange = vi.fn();
    render(<MetadataSchemaEditor schema={mockSchema} onChange={onChange} />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[2]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ hasPoints: false }),
      }),
    );
  });

  it("shows points format dropdown when hasPoints is true", () => {
    render(<MetadataSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Points format")).toBeInTheDocument();
  });

  it("hides points format dropdown when hasPoints is false", () => {
    const noPointsSchema = {
      metadata: { hasKeywords: true, hasFactionKeywords: true, hasPoints: false, pointsFormat: "per-model" },
    };
    render(<MetadataSchemaEditor schema={noPointsSchema} onChange={vi.fn()} />);
    expect(screen.queryByLabelText("Points format")).not.toBeInTheDocument();
  });

  it("renders points format dropdown with correct value", () => {
    render(<MetadataSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Points format").value).toBe("per-model");
  });

  it("updates pointsFormat on dropdown change", () => {
    const onChange = vi.fn();
    render(<MetadataSchemaEditor schema={mockSchema} onChange={onChange} />);
    fireEvent.change(screen.getByLabelText("Points format"), { target: { value: "per-unit" } });
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        metadata: expect.objectContaining({ pointsFormat: "per-unit" }),
      }),
    );
  });

  it("defaults pointsFormat to per-model when not set", () => {
    const noFormatSchema = {
      metadata: { hasKeywords: false, hasFactionKeywords: false, hasPoints: true },
    };
    render(<MetadataSchemaEditor schema={noFormatSchema} onChange={vi.fn()} />);
    expect(screen.getByLabelText("Points format").value).toBe("per-model");
  });

  it("preserves other schema properties when updating metadata", () => {
    const onChange = vi.fn();
    const schemaWithExtra = { ...mockSchema, stats: { fields: [] } };
    render(<MetadataSchemaEditor schema={schemaWithExtra} onChange={onChange} />);
    const checkboxes = screen.getAllByRole("checkbox");
    fireEvent.click(checkboxes[0]);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        stats: { fields: [] },
      }),
    );
  });

  it("renders Per Model and Per Unit as dropdown options", () => {
    render(<MetadataSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
    const options = screen.getByLabelText("Points format").querySelectorAll("option");
    expect(options).toHaveLength(2);
    expect(options[0].value).toBe("per-model");
    expect(options[0].textContent).toBe("Per Model");
    expect(options[1].value).toBe("per-unit");
    expect(options[1].textContent).toBe("Per Unit");
  });

  describe("custom labels", () => {
    it("shows keywords label input when hasKeywords is true", () => {
      render(<MetadataSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
      expect(screen.getByLabelText("Keywords label")).toBeInTheDocument();
    });

    it("hides keywords label input when hasKeywords is false", () => {
      const schema = { metadata: { hasKeywords: false, hasFactionKeywords: false } };
      render(<MetadataSchemaEditor schema={schema} onChange={vi.fn()} />);
      expect(screen.queryByLabelText("Keywords label")).not.toBeInTheDocument();
    });

    it("shows faction keywords label input only when hasFactionKeywords is true", () => {
      render(<MetadataSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
      expect(screen.getByLabelText("Faction keywords label")).toBeInTheDocument();
    });

    it("hides faction keywords label input when hasFactionKeywords is false", () => {
      const schema = { metadata: { hasKeywords: false, hasFactionKeywords: false } };
      render(<MetadataSchemaEditor schema={schema} onChange={vi.fn()} />);
      expect(screen.queryByLabelText("Faction keywords label")).not.toBeInTheDocument();
    });

    it("renders keywordsLabel value when set", () => {
      const schema = { metadata: { hasKeywords: true, hasFactionKeywords: true, keywordsLabel: "Tags" } };
      render(<MetadataSchemaEditor schema={schema} onChange={vi.fn()} />);
      expect(screen.getByLabelText("Keywords label").value).toBe("Tags");
    });

    it("renders factionKeywordsLabel value when set", () => {
      const schema = {
        metadata: { hasKeywords: true, hasFactionKeywords: true, factionKeywordsLabel: "Allegiance" },
      };
      render(<MetadataSchemaEditor schema={schema} onChange={vi.fn()} />);
      expect(screen.getByLabelText("Faction keywords label").value).toBe("Allegiance");
    });

    it("uses default placeholders when no custom label is set", () => {
      render(<MetadataSchemaEditor schema={mockSchema} onChange={vi.fn()} />);
      expect(screen.getByLabelText("Keywords label").placeholder).toBe("Keywords");
      expect(screen.getByLabelText("Faction keywords label").placeholder).toBe("Faction");
    });

    it("updates keywordsLabel on text change", () => {
      const onChange = vi.fn();
      render(<MetadataSchemaEditor schema={mockSchema} onChange={onChange} />);
      fireEvent.change(screen.getByLabelText("Keywords label"), { target: { value: "Tags" } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ keywordsLabel: "Tags" }),
        }),
      );
    });

    it("clears keywordsLabel back to undefined when input is emptied", () => {
      const schema = { metadata: { hasKeywords: true, hasFactionKeywords: true, keywordsLabel: "Tags" } };
      const onChange = vi.fn();
      render(<MetadataSchemaEditor schema={schema} onChange={onChange} />);
      fireEvent.change(screen.getByLabelText("Keywords label"), { target: { value: "" } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ keywordsLabel: undefined }),
        }),
      );
    });

    it("updates factionKeywordsLabel on text change", () => {
      const onChange = vi.fn();
      render(<MetadataSchemaEditor schema={mockSchema} onChange={onChange} />);
      fireEvent.change(screen.getByLabelText("Faction keywords label"), { target: { value: "Allegiance" } });
      expect(onChange).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({ factionKeywordsLabel: "Allegiance" }),
        }),
      );
    });
  });
});
