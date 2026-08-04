import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImportDatasourceModal } from "../ImportDatasourceModal";

vi.mock("lucide-react", () => ({
  Upload: (props) => <svg data-testid="icon-upload" {...props} />,
  FileText: (props) => <svg data-testid="icon-file-text" {...props} />,
  AlertCircle: (props) => <svg data-testid="icon-alert-circle" {...props} />,
  CheckCircle2: (props) => <svg data-testid="icon-check-circle" {...props} />,
}));

const validDatasourceJson = JSON.stringify({
  name: "Test Datasource",
  version: "1.0.0",
  data: [
    {
      id: "test-faction",
      name: "Test Faction",
      colours: { header: "#1a1a2e", banner: "#16213e" },
      datasheets: [
        { id: "card-1", name: "Unit One", cardType: "unit", source: "test", faction_id: "test-faction" },
        { id: "card-2", name: "Unit Two", cardType: "unit", source: "test", faction_id: "test-faction" },
      ],
      rules: [{ id: "rule-1", name: "Rule One", cardType: "rule", source: "test", faction_id: "test-faction" }],
    },
  ],
});

const invalidJson = "{ not valid json";

const missingVersionJson = JSON.stringify({
  name: "Test",
  data: [{ id: "f", name: "F", colours: { header: "#000", banner: "#111" } }],
});

const missingDataJson = JSON.stringify({
  name: "Test",
  version: "1.0.0",
});

const missingColoursJson = JSON.stringify({
  name: "Test",
  version: "1.0.0",
  data: [{ id: "f", name: "F" }],
});

const createFile = (content, name = "test.json") => {
  return new File([content], name, { type: "application/json" });
};

describe("ImportDatasourceModal", () => {
  it("does not render when closed", () => {
    render(<ImportDatasourceModal isOpen={false} onClose={vi.fn()} onImport={vi.fn()} />);
    expect(screen.queryByText("Import Datasource")).not.toBeInTheDocument();
  });

  it("renders dialog when open", () => {
    render(<ImportDatasourceModal isOpen={true} onClose={vi.fn()} onImport={vi.fn()} />);
    expect(screen.getByRole("heading", { name: "Import Datasource" })).toBeInTheDocument();
    expect(screen.getByText(/Select a datasource JSON file/)).toBeInTheDocument();
  });

  it("has Import button disabled initially", () => {
    render(<ImportDatasourceModal isOpen={true} onClose={vi.fn()} onImport={vi.fn()} />);
    expect(screen.getByRole("button", { name: "Import" })).toBeDisabled();
  });

  it("calls onClose when Cancel button clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ImportDatasourceModal isOpen={true} onClose={onClose} onImport={vi.fn()} />);
    await user.click(screen.getByText("Cancel"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("calls onClose when Escape key pressed", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ImportDatasourceModal isOpen={true} onClose={onClose} onImport={vi.fn()} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("shows valid status with card count for a valid datasource file", async () => {
    const user = userEvent.setup();
    render(<ImportDatasourceModal isOpen={true} onClose={vi.fn()} onImport={vi.fn()} />);

    const fileInput = screen.getByLabelText("Select datasource file");
    await user.upload(fileInput, createFile(validDatasourceJson));

    await waitFor(() => {
      expect(screen.getByText("Valid datasource")).toBeInTheDocument();
    });
    expect(screen.getByText("Test Datasource")).toBeInTheDocument();
    expect(screen.getByText("v1.0.0")).toBeInTheDocument();
    expect(screen.getByText("1 faction")).toBeInTheDocument();
    expect(screen.getByText("3 cards")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import" })).not.toBeDisabled();
  });

  it("calls onImport with parsed data when Import clicked", async () => {
    const user = userEvent.setup();
    const onImport = vi.fn();
    render(<ImportDatasourceModal isOpen={true} onClose={vi.fn()} onImport={onImport} />);

    const fileInput = screen.getByLabelText("Select datasource file");
    await user.upload(fileInput, createFile(validDatasourceJson));

    await waitFor(() => {
      expect(screen.getByText("Valid datasource")).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: "Import" }));
    expect(onImport).toHaveBeenCalledTimes(1);
    expect(onImport.mock.calls[0][0].name).toBe("Test Datasource");
    expect(onImport.mock.calls[0][0].data).toHaveLength(1);
    expect(onImport.mock.calls[0][0].data[0].datasheets).toHaveLength(2);
  });

  it("shows error for invalid JSON", async () => {
    const user = userEvent.setup();
    render(<ImportDatasourceModal isOpen={true} onClose={vi.fn()} onImport={vi.fn()} />);

    const fileInput = screen.getByLabelText("Select datasource file");
    await user.upload(fileInput, createFile(invalidJson));

    await waitFor(() => {
      expect(screen.getByText("Validation failed")).toBeInTheDocument();
    });
    expect(screen.getByText(/Invalid JSON/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import" })).toBeDisabled();
  });

  it("shows error for missing version", async () => {
    const user = userEvent.setup();
    render(<ImportDatasourceModal isOpen={true} onClose={vi.fn()} onImport={vi.fn()} />);

    const fileInput = screen.getByLabelText("Select datasource file");
    await user.upload(fileInput, createFile(missingVersionJson));

    await waitFor(() => {
      expect(screen.getByText("Validation failed")).toBeInTheDocument();
    });
    expect(screen.getByText(/Missing or invalid 'version' field/)).toBeInTheDocument();
  });

  it("shows error for missing data array", async () => {
    const user = userEvent.setup();
    render(<ImportDatasourceModal isOpen={true} onClose={vi.fn()} onImport={vi.fn()} />);

    const fileInput = screen.getByLabelText("Select datasource file");
    await user.upload(fileInput, createFile(missingDataJson));

    await waitFor(() => {
      expect(screen.getByText("Validation failed")).toBeInTheDocument();
    });
    expect(screen.getByText(/Missing or invalid 'data' array/)).toBeInTheDocument();
  });

  it("shows error for missing faction colours", async () => {
    const user = userEvent.setup();
    render(<ImportDatasourceModal isOpen={true} onClose={vi.fn()} onImport={vi.fn()} />);

    const fileInput = screen.getByLabelText("Select datasource file");
    await user.upload(fileInput, createFile(missingColoursJson));

    await waitFor(() => {
      expect(screen.getByText("Validation failed")).toBeInTheDocument();
    });
    expect(screen.getByText(/Faction missing 'colours' field/)).toBeInTheDocument();
  });

  it("resets state when dialog is closed and reopened", async () => {
    const user = userEvent.setup();
    const { rerender } = render(<ImportDatasourceModal isOpen={true} onClose={vi.fn()} onImport={vi.fn()} />);

    const fileInput = screen.getByLabelText("Select datasource file");
    await user.upload(fileInput, createFile(validDatasourceJson));

    await waitFor(() => {
      expect(screen.getByText("Valid datasource")).toBeInTheDocument();
    });

    rerender(<ImportDatasourceModal isOpen={false} onClose={vi.fn()} onImport={vi.fn()} />);
    rerender(<ImportDatasourceModal isOpen={true} onClose={vi.fn()} onImport={vi.fn()} />);

    expect(screen.getByText("Click or drag a JSON file here")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Import" })).toBeDisabled();
  });

  it("shows filename after file selection", async () => {
    const user = userEvent.setup();
    render(<ImportDatasourceModal isOpen={true} onClose={vi.fn()} onImport={vi.fn()} />);

    const fileInput = screen.getByLabelText("Select datasource file");
    await user.upload(fileInput, createFile(validDatasourceJson, "chaos-dwarfs.json"));

    await waitFor(() => {
      expect(screen.getByText("chaos-dwarfs.json")).toBeInTheDocument();
    });
  });
});
