import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { DatasourceUpdatesModal } from "../DatasourceUpdatesModal";

const unit = (id, name, keywords) => ({
  id,
  name,
  cardType: "DataCard",
  source: "40k-10e",
  faction_id: "SM",
  keywords,
});

const dataSource = {
  data: [
    {
      id: "SM",
      datasheets: [unit("u1", "Intercessors", ["Infantry", "Battleline"]), unit("u2", "Captain", ["Character"])],
    },
  ],
};

const savedCards = [
  { ...unit("u1", "Intercessors", ["Infantry"]), uuid: "a" },
  { ...unit("u2", "Captain", ["Character"]), uuid: "b" },
  { ...unit("u3", "Removed unit", []), uuid: "c" },
  { ...unit("w1", "Liberators", []), source: "aos", cardType: "warscroll", uuid: "d" },
];

const renderModal = (props = {}) =>
  render(
    <DatasourceUpdatesModal
      isOpen
      onClose={vi.fn()}
      cards={savedCards}
      dataSource={dataSource}
      selectedDataSource="40k-10e"
      onApply={vi.fn()}
      {...props}
    />,
  );

describe("DatasourceUpdatesModal", () => {
  let modalRoot;

  beforeEach(() => {
    modalRoot = document.createElement("div");
    modalRoot.setAttribute("id", "modal-root");
    document.body.appendChild(modalRoot);
  });

  afterEach(() => {
    document.body.removeChild(modalRoot);
  });

  it("renders nothing while closed", () => {
    renderModal({ isOpen: false });
    expect(modalRoot).toBeEmptyDOMElement();
  });

  it("summarises changed, missing and unavailable cards", () => {
    renderModal();
    expect(screen.getByTestId("dsu-summary")).toHaveTextContent("1 card differs from the loaded datasource.");
    expect(screen.getByText("Removed unit")).toBeInTheDocument();
    expect(screen.getByTestId("dsu-unavailable")).toHaveTextContent("1 card could not be compared");
    expect(screen.getByText("1 card already matches the datasource.")).toBeInTheDocument();
  });

  it("expands a single changed card and shows the change", () => {
    renderModal();
    expect(screen.getByText("Keywords")).toBeInTheDocument();
    expect(screen.getByText("Battleline")).toBeInTheDocument();
    expect(screen.getByText("Added")).toBeInTheDocument();
  });

  it("applies the selected cards", () => {
    const onApply = vi.fn();
    renderModal({ onApply });
    fireEvent.click(screen.getByText("Update 1 card"));
    expect(onApply).toHaveBeenCalledTimes(1);
    const [results, uuids] = onApply.mock.calls[0];
    expect(uuids).toEqual(["a"]);
    expect(results).toHaveLength(4);
  });

  it("disables the update button when nothing is selected", () => {
    renderModal();
    fireEvent.click(screen.getByRole("checkbox", { name: "Update Intercessors" }));
    expect(screen.getByText("Update 0 cards")).toBeDisabled();
  });

  it("offers only a close button when everything matches", () => {
    const onClose = vi.fn();
    renderModal({ onClose, cards: [savedCards[1]] });
    expect(screen.getByTestId("dsu-summary")).toHaveTextContent("1 card matches the loaded datasource.");
    fireEvent.click(screen.getByText("Close"));
    expect(onClose).toHaveBeenCalled();
  });
});
