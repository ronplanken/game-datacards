import { render, screen } from "@testing-library/react";
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

// Mock panel components
vi.mock("../../Components/DatasourceEditor/EditorLeftPanel", () => ({
  EditorLeftPanel: () => <div data-testid="left-panel">Left Panel</div>,
}));
vi.mock("../../Components/DatasourceEditor/EditorCenterPanel", () => ({
  EditorCenterPanel: () => <div data-testid="center-panel">Center Panel</div>,
}));
vi.mock("../../Components/DatasourceEditor/EditorRightPanel", () => ({
  EditorRightPanel: () => <div data-testid="right-panel">Right Panel</div>,
}));

// Mock CSS import
vi.mock("../../Components/DatasourceEditor/DatasourceEditor.css", () => ({}));

// Mock editor state hook
vi.mock("../../Components/DatasourceEditor/hooks/useDatasourceEditorState", () => ({
  useDatasourceEditorState: () => ({
    datasources: [],
    activeDatasource: null,
    selectedItem: null,
    isLoading: false,
    openDatasource: vi.fn(),
    selectDatasource: vi.fn(),
    selectCardType: vi.fn(),
    updateDatasource: vi.fn(),
    setCreatedDatasource: vi.fn(),
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
});
