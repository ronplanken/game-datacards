import { render, screen, act } from "@testing-library/react";
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
    render(<HelpTableOfContents />);
    await act(() => new Promise((r) => setTimeout(r, 300)));
    expect(screen.getByText("On this page")).toBeInTheDocument();
  });

  it("renders heading items from the article", async () => {
    render(<HelpTableOfContents />);
    await act(() => new Promise((r) => setTimeout(r, 300)));
    // TOC renders links; headings also exist in DOM. Use getAllByText and check for TOC links.
    const tocNav = document.querySelector(".help-toc-nav");
    expect(tocNav).toBeInTheDocument();
    expect(tocNav.querySelectorAll(".help-toc-item")).toHaveLength(2);
  });

  it("indents h3 items", async () => {
    render(<HelpTableOfContents />);
    await act(() => new Promise((r) => setTimeout(r, 300)));
    const tocNav = document.querySelector(".help-toc-nav");
    const indentedItems = tocNav.querySelectorAll(".help-toc-item-indent");
    expect(indentedItems).toHaveLength(1);
    expect(indentedItems[0].textContent).toBe("First Steps");
  });

  it("returns null when no headings exist", async () => {
    document.body.querySelector(".help-article-body")?.remove();
    const { container } = render(<HelpTableOfContents />);
    await act(() => new Promise((r) => setTimeout(r, 300)));
    expect(container.innerHTML).toBe("");
  });
});
