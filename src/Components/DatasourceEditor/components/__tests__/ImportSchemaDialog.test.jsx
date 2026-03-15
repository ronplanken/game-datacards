import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImportSchemaDialog } from "../ImportSchemaDialog";

vi.mock("lucide-react", () => ({
  Upload: (props) => <svg data-testid="icon-upload" {...props} />,
  FileText: (props) => <svg data-testid="icon-file-text" {...props} />,
  AlertCircle: (props) => <svg data-testid="icon-alert-circle" {...props} />,
  CheckCircle2: (props) => <svg data-testid="icon-check-circle" {...props} />,
}));

vi.mock("../../../../Helpers/customSchema.helpers", () => ({
  validateSchema: vi.fn((schema) => {
    if (!schema || !schema.cardTypes) {
      return { valid: false, errors: ["Missing cardTypes array"] };
    }
    return { valid: true, errors: [] };
  }),
}));

const validSchemaJson = JSON.stringify({
  name: "Test Schema",
  version: "1.0.0",
  schema: {
    version: "1.0.0",
    baseSystem: "40k-10e",
    cardTypes: [{ key: "unit", label: "Unit", baseType: "unit", schema: {} }],
  },
});

const invalidJson = "{ not valid json";

const missingSchemaJson = JSON.stringify({
  name: "Test",
  version: "1.0.0",
});

const createFile = (content, name = "test.json") => {
  return new File([content], name, { type: "application/json" });
};

describe("ImportSchemaDialog", () => {
  it("does not render when closed", () => {
    render(<ImportSchemaDialog open={false} onImport={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.queryByText("Import Schema")).not.toBeInTheDocument();
  });

  it("renders dialog when open", () => {
    render(<ImportSchemaDialog open={true} onImport={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Import Schema" })).toBeInTheDocument();
    expect(screen.getByText(/Select a datasource schema JSON file/)).toBeInTheDocument();
  });

  it("renders file selection prompt", () => {
    render(<ImportSchemaDialog open={true} onImport={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText("Click or drag a JSON file here")).toBeInTheDocument();
  });

  it("has Import Schema button disabled initially", () => {
    render(<ImportSchemaDialog open={true} onImport={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Import Schema" })).toBeDisabled();
  });

  it("calls onCancel when Cancel button clicked", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ImportSchemaDialog open={true} onImport={vi.fn()} onCancel={onCancel} />);
    await user.click(screen.getByText("Cancel"));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("calls onCancel when Escape key pressed", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(<ImportSchemaDialog open={true} onImport={vi.fn()} onCancel={onCancel} />);
    await user.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("shows valid status and enables Import for valid schema file", async () => {
    const user = userEvent.setup();
    const onImport = vi.fn();
    render(<ImportSchemaDialog open={true} onImport={onImport} onCancel={vi.fn()} />);

    const fileInput = screen.getByLabelText("Select schema file");
    const file = createFile(validSchemaJson);
    await user.upload(fileInput, file);

    await waitFor(() => {
      expect(screen.getByText("Valid schema")).toBeInTheDocument();
    });
    expect(screen.getByText("Test Schema")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import Schema" })).not.toBeDisabled();
  });

  it("calls onImport with parsed data when Import Schema clicked after valid file", async () => {
    const user = userEvent.setup();
    const onImport = vi.fn();
    render(<ImportSchemaDialog open={true} onImport={onImport} onCancel={vi.fn()} />);

    const fileInput = screen.getByLabelText("Select schema file");
    await user.upload(fileInput, createFile(validSchemaJson));

    await waitFor(() => {
      expect(screen.getByText("Valid schema")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Import Schema" }));
    expect(onImport).toHaveBeenCalledTimes(1);
    expect(onImport.mock.calls[0][0].name).toBe("Test Schema");
    expect(onImport.mock.calls[0][0].schema.cardTypes).toHaveLength(1);
  });

  it("shows error for invalid JSON", async () => {
    const user = userEvent.setup();
    render(<ImportSchemaDialog open={true} onImport={vi.fn()} onCancel={vi.fn()} />);

    const fileInput = screen.getByLabelText("Select schema file");
    await user.upload(fileInput, createFile(invalidJson));

    await waitFor(() => {
      expect(screen.getByText("Validation failed")).toBeInTheDocument();
    });
    expect(screen.getByText(/Invalid JSON/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import Schema" })).toBeDisabled();
  });

  it("shows error for missing schema property", async () => {
    const user = userEvent.setup();
    render(<ImportSchemaDialog open={true} onImport={vi.fn()} onCancel={vi.fn()} />);

    const fileInput = screen.getByLabelText("Select schema file");
    await user.upload(fileInput, createFile(missingSchemaJson));

    await waitFor(() => {
      expect(screen.getByText("Validation failed")).toBeInTheDocument();
    });
    expect(screen.getByText(/Missing 'schema' property/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import Schema" })).toBeDisabled();
  });

  it("resets state when dialog is closed and reopened", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ImportSchemaDialog open={true} onImport={vi.fn()} onCancel={vi.fn()} />);

    const fileInput = screen.getByLabelText("Select schema file");
    await user.upload(fileInput, createFile(validSchemaJson));

    await waitFor(() => {
      expect(screen.getByText("Valid schema")).toBeInTheDocument();
    });

    // Close the dialog
    rerender(<ImportSchemaDialog open={false} onImport={vi.fn()} onCancel={vi.fn()} />);

    // Reopen
    rerender(<ImportSchemaDialog open={true} onImport={vi.fn()} onCancel={vi.fn()} />);

    // Should be back to initial state
    expect(screen.getByText("Click or drag a JSON file here")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import Schema" })).toBeDisabled();
  });
});
