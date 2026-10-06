import { render, screen, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { HelpTableOfContents } from "../components/HelpTableOfContents";

// Mock IntersectionObserver
const mockObserve = vi.fn();
const mockDisconnect = vi.fn();

beforeAll(() => {
  global.IntersectionObserver = vi.fn(() => ({
    observe: mockObserve,
    disconnect: mockDisconnect,
    unobserve: vi.fn(),
  }));
});

// Mock MutationObserver — call callback immediately on observe
let mutationCallback;
beforeAll(() => {
  global.MutationObserver = vi.fn((cb) => {
    mutationCallback = cb;
    return {
      observe: vi.fn(() => {
        // Trigger callback so headings get extracted
        cb();
      }),
      disconnect: vi.fn(),
    };
  });
});

const renderTOC = (path = "/help/datasource-editor/getting-started") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <HelpTableOfContents />
    </MemoryRouter>,
  );

describe("HelpTableOfContents", () => {
  beforeEach(() => {
    mockObserve.mockClear();
    mockDisconnect.mockClear();

    // Create a mock article with headings
    const article = document.createElement("div");
    article.className = "help-article-body";

    const h2 = document.createElement("h2");
    h2.id = "getting-started";
    h2.textContent = "Getting Started";
    article.appendChild(h2);

    const h3 = document.createElement("h3");
    h3.id = "first-steps";
    h3.textContent = "First Steps";
    article.appendChild(h3);

    document.body.appendChild(article);
  });

  afterEach(() => {
    document.body.querySelector(".help-article-body")?.remove();
  });

  it("renders the title after headings are extracted", async () => {
    await act(async () => renderTOC());
    expect(screen.getByText("On this page")).toBeInTheDocument();
  });

  it("renders heading items from the article", async () => {
    await act(async () => renderTOC());
    const tocNav = document.querySelector(".help-toc-nav");
    expect(tocNav).toBeInTheDocument();
    expect(tocNav.querySelectorAll(".help-toc-item")).toHaveLength(2);
  });

  it("indents h3 items", async () => {
    await act(async () => renderTOC());
    const tocNav = document.querySelector(".help-toc-nav");
    const indentedItems = tocNav.querySelectorAll(".help-toc-item-indent");
    expect(indentedItems).toHaveLength(1);
    expect(indentedItems[0].textContent).toBe("First Steps");
  });

  it("returns null when no headings exist", async () => {
    document.body.querySelector(".help-article-body")?.remove();
    let container;
    await act(async () => {
      ({ container } = renderTOC());
    });
    expect(container.innerHTML).toBe("");
  });
});
