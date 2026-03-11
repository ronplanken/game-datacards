import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

// Mock antd Layout
vi.mock("antd", () => {
  const Content = ({ children, className }) => (
    <div className={className} data-testid="content">
      {children}
    </div>
  );
  Content.displayName = "MockContent";

  const LayoutComponent = ({ children, className }) => (
    <div className={className} data-testid="layout">
      {children}
    </div>
  );
  LayoutComponent.displayName = "MockLayout";
  LayoutComponent.Content = Content;

  return { Layout: LayoutComponent };
});

// Mock resizable panels
vi.mock("react-resizable-panels", () => ({
  Panel: ({ children, defaultSize, order }) => (
    <div data-testid={`panel-${order}`} data-default-size={defaultSize}>
      {children}
    </div>
  ),
  PanelGroup: ({ children, direction }) => (
    <div data-testid="panel-group" data-direction={direction}>
      {children}
    </div>
  ),
  PanelResizeHandle: ({ className }) => <div data-testid="resize-handle" className={className} />,
}));

// Mock AppHeader
vi.mock("../../Components/AppHeader", () => ({
  AppHeader: (props) => <div data-testid="app-header" data-props={JSON.stringify(props)} />,
}));

// Capture EditorLeftPanel props for interaction testing
let capturedLeftPanelProps = {};
vi.mock("../../Components/DatasourceEditor/EditorLeftPanel", () => ({
  EditorLeftPanel: (props) => {
    capturedLeftPanelProps = props;
    return <div data-testid="left-panel">Left Panel</div>;
  },
}));
vi.mock("../../Components/DatasourceEditor/EditorCenterPanel", () => ({
  EditorCenterPanel: () => <div data-testid="center-panel">Center Panel</div>,
}));
vi.mock("../../Components/DatasourceEditor/EditorRightPanel", () => ({
  EditorRightPanel: () => <div data-testid="right-panel">Right Panel</div>,
}));

// Mock DatasourceWizard to capture props
let capturedWizardProps = {};
vi.mock("../../Components/DatasourceWizard", () => ({
  DatasourceWizard: (props) => {
    capturedWizardProps = props;
    return props.open ? <div data-testid="datasource-wizard">Wizard</div> : null;
  },
}));

// Mock ConfirmDialog to capture props
let capturedConfirmProps = {};
vi.mock("../../Components/DatasourceEditor/components", () => ({
  ConfirmDialog: (props) => {
    capturedConfirmProps = props;
    return props.open ? (
      <div data-testid="confirm-dialog">
        <span>{props.title}</span>
        <span>{props.message}</span>
        <button data-testid="confirm-delete" onClick={props.onConfirm}>
          {props.confirmLabel}
        </button>
        <button data-testid="cancel-delete" onClick={props.onCancel}>
          {props.cancelLabel}
        </button>
      </div>
    ) : null;
  },
}));

// Mock CSS import
vi.mock("../../Components/DatasourceEditor/DatasourceEditor.css", () => ({}));

// Mock storage hooks
const mockCreateCustomDatasource = vi.fn().mockResolvedValue({ success: true, id: "custom-new-123" });
const mockGetCustomDatasourceData = vi.fn().mockResolvedValue({
  id: "custom-new-123",
  name: "New DS",
  schema: { baseSystem: "blank", cardTypes: [] },
});

vi.mock("../../Hooks/useDataSourceStorage", () => ({
  useDataSourceStorage: () => ({
    createCustomDatasource: mockCreateCustomDatasource,
    getCustomDatasourceData: mockGetCustomDatasourceData,
  }),
}));

// Mock editor state hook
const mockUpdateDatasource = vi.fn();
const mockSetCreatedDatasource = vi.fn();
const mockSelectDatasource = vi.fn();
const mockActiveDatasource = {
  id: "custom-ds-1",
  name: "Test DS",
  version: "1.0.0",
  schema: {
    baseSystem: "40k-10e",
    cardTypes: [{ key: "infantry", label: "Infantry", baseType: "unit", schema: {} }],
  },
};

let editorStateOverrides = {};
vi.mock("../../Components/DatasourceEditor/hooks/useDatasourceEditorState", () => ({
  useDatasourceEditorState: () => ({
    datasources: [],
    activeDatasource: null,
    selectedItem: null,
    isLoading: false,
    openDatasource: vi.fn(),
    selectDatasource: mockSelectDatasource,
    selectCardType: vi.fn(),
    updateDatasource: mockUpdateDatasource,
    setCreatedDatasource: mockSetCreatedDatasource,
    ...editorStateOverrides,
  }),
}));

import { DatasourceEditorPage } from "../DatasourceEditor";

const renderPage = () =>
  render(
    <MemoryRouter initialEntries={["/datasources"]}>
      <DatasourceEditorPage />
    </MemoryRouter>,
  );

describe("DatasourceEditorPage", () => {
  beforeEach(() => {
    capturedLeftPanelProps = {};
    capturedWizardProps = {};
    capturedConfirmProps = {};
    editorStateOverrides = {};
    mockCreateCustomDatasource.mockClear();
    mockGetCustomDatasourceData.mockClear();
    mockUpdateDatasource.mockClear();
    mockSetCreatedDatasource.mockClear();
    mockSelectDatasource.mockClear();
  });

  it("renders the page layout with correct class", () => {
    renderPage();
    expect(screen.getByTestId("layout")).toHaveClass("datasource-editor-layout");
  });

  it("renders AppHeader with correct props", () => {
    renderPage();
    const header = screen.getByTestId("app-header");
    const props = JSON.parse(header.dataset.props);
    expect(props.showModals).toBe(false);
    expect(props.showNav).toBe(true);
    expect(props.showActions).toBe(false);
  });

  it("renders content area with correct class", () => {
    renderPage();
    expect(screen.getByTestId("content")).toHaveClass("datasource-editor-content");
  });

  it("renders PanelGroup with horizontal direction", () => {
    renderPage();
    expect(screen.getByTestId("panel-group")).toHaveAttribute("data-direction", "horizontal");
  });

  it("renders 3 panels with correct order and sizes", () => {
    renderPage();
    const panel1 = screen.getByTestId("panel-1");
    const panel2 = screen.getByTestId("panel-2");
    const panel3 = screen.getByTestId("panel-3");

    expect(panel1).toHaveAttribute("data-default-size", "18");
    expect(panel2).toHaveAttribute("data-default-size", "52");
    expect(panel3).toHaveAttribute("data-default-size", "22");
  });

  it("renders 2 resize handles", () => {
    renderPage();
    const handles = screen.getAllByTestId("resize-handle");
    expect(handles).toHaveLength(2);
    handles.forEach((handle) => {
      expect(handle).toHaveClass("designer-resizer", "vertical");
    });
  });

  it("renders all three panel components", () => {
    renderPage();
    expect(screen.getByTestId("left-panel")).toBeInTheDocument();
    expect(screen.getByTestId("center-panel")).toBeInTheDocument();
    expect(screen.getByTestId("right-panel")).toBeInTheDocument();
  });

  describe("wizard integration", () => {
    it("wizard is initially closed", () => {
      renderPage();
      expect(screen.queryByTestId("datasource-wizard")).not.toBeInTheDocument();
      expect(capturedWizardProps.open).toBe(false);
    });

    it("passes onNewDatasource and onAddCardType to left panel", () => {
      renderPage();
      expect(capturedLeftPanelProps.onNewDatasource).toBeInstanceOf(Function);
      expect(capturedLeftPanelProps.onAddCardType).toBeInstanceOf(Function);
    });

    it("opens wizard in create mode when onNewDatasource is called", () => {
      renderPage();
      act(() => {
        capturedLeftPanelProps.onNewDatasource();
      });
      expect(capturedWizardProps.open).toBe(true);
      expect(capturedWizardProps.existingDatasource).toBeUndefined();
    });

    it("opens wizard in add-card-type mode when onAddCardType is called with active datasource", () => {
      editorStateOverrides = { activeDatasource: mockActiveDatasource };
      renderPage();
      act(() => {
        capturedLeftPanelProps.onAddCardType();
      });
      expect(capturedWizardProps.open).toBe(true);
      expect(capturedWizardProps.existingDatasource).toEqual(mockActiveDatasource);
    });

    it("does not open wizard for add-card-type when no active datasource", () => {
      editorStateOverrides = { activeDatasource: null };
      renderPage();
      act(() => {
        capturedLeftPanelProps.onAddCardType();
      });
      expect(capturedWizardProps.open).toBe(false);
    });

    it("closes wizard when onClose is called", () => {
      renderPage();
      act(() => {
        capturedLeftPanelProps.onNewDatasource();
      });
      expect(capturedWizardProps.open).toBe(true);
      act(() => {
        capturedWizardProps.onClose();
      });
      expect(capturedWizardProps.open).toBe(false);
    });

    it("calls createCustomDatasource on create mode completion", async () => {
      renderPage();
      act(() => {
        capturedLeftPanelProps.onNewDatasource();
      });

      const wizardResult = {
        name: "My DS",
        version: "1.0.0",
        author: "Tester",
        schema: { version: "1.0.0", baseSystem: "blank", cardTypes: [] },
      };

      await act(async () => {
        await capturedWizardProps.onComplete(wizardResult);
      });

      expect(mockCreateCustomDatasource).toHaveBeenCalledWith(
        { name: "My DS", version: "1.0.0", author: "Tester" },
        { version: "1.0.0", baseSystem: "blank", cardTypes: [] },
      );
      expect(mockGetCustomDatasourceData).toHaveBeenCalledWith("custom-new-123");
      expect(mockSetCreatedDatasource).toHaveBeenCalled();
    });

    it("appends card type to active datasource on add-card-type completion", async () => {
      editorStateOverrides = { activeDatasource: mockActiveDatasource, updateDatasource: mockUpdateDatasource };
      renderPage();
      act(() => {
        capturedLeftPanelProps.onAddCardType();
      });

      const newCardType = {
        key: "battle-rules",
        label: "Battle Rules",
        baseType: "rule",
        schema: { fields: [] },
      };

      await act(async () => {
        await capturedWizardProps.onComplete(newCardType);
      });

      expect(mockUpdateDatasource).toHaveBeenCalledWith({
        ...mockActiveDatasource,
        schema: {
          ...mockActiveDatasource.schema,
          cardTypes: [...mockActiveDatasource.schema.cardTypes, newCardType],
        },
      });
    });
  });

  describe("delete card type", () => {
    it("passes onDeleteCardType to left panel", () => {
      renderPage();
      expect(capturedLeftPanelProps.onDeleteCardType).toBeInstanceOf(Function);
    });

    it("confirmation dialog is initially closed", () => {
      renderPage();
      expect(screen.queryByTestId("confirm-dialog")).not.toBeInTheDocument();
      expect(capturedConfirmProps.open).toBe(false);
    });

    it("opens confirmation dialog when onDeleteCardType is called", () => {
      editorStateOverrides = { activeDatasource: mockActiveDatasource };
      renderPage();
      act(() => {
        capturedLeftPanelProps.onDeleteCardType({ key: "infantry", label: "Infantry", baseType: "unit" });
      });
      expect(capturedConfirmProps.open).toBe(true);
      expect(capturedConfirmProps.title).toBe("Delete Card Type");
      expect(capturedConfirmProps.message).toContain("Infantry");
    });

    it("closes confirmation dialog when cancel is clicked", () => {
      editorStateOverrides = { activeDatasource: mockActiveDatasource };
      renderPage();
      act(() => {
        capturedLeftPanelProps.onDeleteCardType({ key: "infantry", label: "Infantry", baseType: "unit" });
      });
      expect(capturedConfirmProps.open).toBe(true);
      act(() => {
        capturedConfirmProps.onCancel();
      });
      expect(capturedConfirmProps.open).toBe(false);
    });

    it("removes card type from datasource on confirm", async () => {
      editorStateOverrides = { activeDatasource: mockActiveDatasource };
      renderPage();
      act(() => {
        capturedLeftPanelProps.onDeleteCardType({ key: "infantry", label: "Infantry", baseType: "unit" });
      });
      await act(async () => {
        await capturedConfirmProps.onConfirm();
      });
      expect(mockUpdateDatasource).toHaveBeenCalledWith({
        ...mockActiveDatasource,
        schema: {
          ...mockActiveDatasource.schema,
          cardTypes: [],
        },
      });
      // Dialog should close after deletion
      expect(capturedConfirmProps.open).toBe(false);
    });

    it("selects datasource when the deleted card type was selected", async () => {
      editorStateOverrides = {
        activeDatasource: mockActiveDatasource,
        selectedItem: { type: "cardType", key: "infantry" },
      };
      renderPage();
      act(() => {
        capturedLeftPanelProps.onDeleteCardType({ key: "infantry", label: "Infantry", baseType: "unit" });
      });
      await act(async () => {
        await capturedConfirmProps.onConfirm();
      });
      expect(mockSelectDatasource).toHaveBeenCalledWith(mockActiveDatasource);
    });

    it("does not change selection when a different card type was selected", async () => {
      editorStateOverrides = {
        activeDatasource: mockActiveDatasource,
        selectedItem: { type: "cardType", key: "other-type" },
      };
      renderPage();
      act(() => {
        capturedLeftPanelProps.onDeleteCardType({ key: "infantry", label: "Infantry", baseType: "unit" });
      });
      await act(async () => {
        await capturedConfirmProps.onConfirm();
      });
      expect(mockSelectDatasource).not.toHaveBeenCalled();
    });
  });
});
