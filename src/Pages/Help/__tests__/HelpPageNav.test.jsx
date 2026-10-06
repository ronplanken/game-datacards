import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelpPageNav } from "../components/HelpPageNav";

vi.mock("lucide-react", () => ({
  ChevronLeft: (props) => <svg data-testid="icon-chevron-left" {...props} />,
  ChevronRight: (props) => <svg data-testid="icon-chevron-right" {...props} />,
}));

describe("HelpPageNav", () => {
  it("renders nothing when no prev or next", () => {
    const { container } = render(
      <MemoryRouter>
        <HelpPageNav prev={null} next={null} />
      </MemoryRouter>,
    );
    expect(container.querySelector(".help-page-nav")).toBeNull();
  });

  it("shows next link when next is provided", () => {
    render(
      <MemoryRouter>
        <HelpPageNav prev={null} next={{ key: "base-systems", category: "datasource-editor", label: "Base Systems" }} />
      </MemoryRouter>,
    );
    expect(screen.getByText("Next")).toBeInTheDocument();
    expect(screen.getByText("Base Systems")).toBeInTheDocument();
    expect(screen.queryByText("Previous")).not.toBeInTheDocument();
  });

  it("shows prev link when prev is provided", () => {
    render(
      <MemoryRouter>
        <HelpPageNav
          prev={{ key: "getting-started", category: "datasource-editor", label: "Getting Started" }}
          next={null}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Getting Started")).toBeInTheDocument();
    expect(screen.queryByText("Next")).not.toBeInTheDocument();
  });

  it("shows both prev and next when both are provided", () => {
    render(
      <MemoryRouter>
        <HelpPageNav
          prev={{ key: "getting-started", category: "datasource-editor", label: "Getting Started" }}
          next={{ key: "base-systems", category: "datasource-editor", label: "Base Systems" }}
        />
      </MemoryRouter>,
    );
    expect(screen.getByText("Previous")).toBeInTheDocument();
    expect(screen.getByText("Next")).toBeInTheDocument();
  });

  it("renders links with correct hrefs", () => {
    render(
      <MemoryRouter>
        <HelpPageNav prev={null} next={{ key: "base-systems", category: "datasource-editor", label: "Base Systems" }} />
      </MemoryRouter>,
    );
    const link = screen.getByText("Base Systems").closest("a");
    expect(link.getAttribute("href")).toBe("/help/datasource-editor/base-systems");
  });
});
