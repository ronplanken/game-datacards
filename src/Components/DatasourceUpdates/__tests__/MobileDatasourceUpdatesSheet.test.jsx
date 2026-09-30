import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MobileDatasourceUpdatesSheet } from "../MobileDatasourceUpdatesSheet";

const unit = (id, name, keywords) => ({
  id,
  name,
  cardType: "DataCard",
  source: "40k-11e",
  faction_id: "DA",
  keywords,
});

const dataSource = {
  data: [{ id: "DA", datasheets: [unit("u1", "Belial", ["Infantry"]), unit("u2", "Azrael", ["Character"])] }],
};

const savedCards = [
  { ...unit("u1", "Belial", ["Infantry", "Belial"]), uuid: "a" },
  { ...unit("u2", "Azrael", ["Character"]), uuid: "b" },
];

const renderSheet = (props = {}) =>
  render(
    <MobileDatasourceUpdatesSheet
      isOpen
      onClose={vi.fn()}
      cards={savedCards}
      dataSource={dataSource}
      selectedDataSource="40k-11e"
      onApply={vi.fn()}
      {...props}
    />,
  );

describe("MobileDatasourceUpdatesSheet", () => {
  let modalRoot;

  beforeEach(() => {
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    document.body.removeChild(modalRoot);
    document.body.style.overflow = "";
  });

  it("renders nothing while closed", () => {
    renderSheet({ isOpen: false });
    expect(modalRoot).toBeEmptyDOMElement();
  });

  it("shows the same comparison as the desktop dialog in a mobile modal", () => {
    renderSheet();
    expect(screen.getByText("Compare with datasource")).toBeInTheDocument();
    expect(screen.getByTestId("dsu-mobile")).toBeInTheDocument();
    expect(screen.getByTestId("dsu-summary")).toHaveTextContent("1 card differs from the loaded datasource.");
    expect(screen.getByText("Removed")).toBeInTheDocument();
  });

  it("applies the selected cards", () => {
    const onApply = vi.fn();
    renderSheet({ onApply });
    fireEvent.click(screen.getByText("Update 1 card"));
    expect(onApply.mock.calls[0][1]).toEqual(["a"]);
  });

  it("offers a close button when everything matches", () => {
    const onClose = vi.fn();
    renderSheet({ onClose, cards: [savedCards[1]] });
    fireEvent.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalled();
  });
});
