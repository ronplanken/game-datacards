import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { CustomCardStats, sortStatFields } from "../CustomCardStats";

vi.mock("react-fitty", () => ({
  ReactFitty: ({ children }) => <span data-testid="react-fitty">{children}</span>,
}));

const make40kStatFields = () => [
  { key: "m", label: "M", type: "string", displayOrder: 1 },
  { key: "t", label: "T", type: "string", displayOrder: 2 },
  { key: "sv", label: "SV", type: "string", displayOrder: 3 },
  { key: "w", label: "W", type: "string", displayOrder: 4 },
  { key: "ld", label: "LD", type: "string", displayOrder: 5 },
  { key: "oc", label: "OC", type: "string", displayOrder: 6 },
];

describe("sortStatFields", () => {
  it("sorts fields by displayOrder ascending", () => {
    const fields = [
      { key: "c", label: "C", displayOrder: 3 },
      { key: "a", label: "A", displayOrder: 1 },
      { key: "b", label: "B", displayOrder: 2 },
    ];
    const sorted = sortStatFields(fields);
    expect(sorted.map((f) => f.key)).toEqual(["a", "b", "c"]);
  });

  it("treats missing displayOrder as 0", () => {
    const fields = [
      { key: "b", label: "B", displayOrder: 1 },
      { key: "a", label: "A" },
    ];
    const sorted = sortStatFields(fields);
    expect(sorted[0].key).toBe("a");
    expect(sorted[1].key).toBe("b");
  });

  it("returns empty array for null/undefined input", () => {
    expect(sortStatFields(null)).toEqual([]);
    expect(sortStatFields(undefined)).toEqual([]);
  });

  it("does not mutate the original array", () => {
    const fields = [
      { key: "b", label: "B", displayOrder: 2 },
      { key: "a", label: "A", displayOrder: 1 },
    ];
    const original = [...fields];
    sortStatFields(fields);
    expect(fields).toEqual(original);
  });
});

describe("CustomCardStats", () => {
  it("renders stat header labels from schema fields", () => {
    render(<CustomCardStats stats={[]} statFields={make40kStatFields()} />);
    expect(screen.getByText("M")).toBeInTheDocument();
    expect(screen.getByText("T")).toBeInTheDocument();
    expect(screen.getByText("SV")).toBeInTheDocument();
    expect(screen.getByText("W")).toBeInTheDocument();
    expect(screen.getByText("LD")).toBeInTheDocument();
    expect(screen.getByText("OC")).toBeInTheDocument();
  });

  it("renders stat values from active stat lines", () => {
    const stats = [{ active: true, m: '6"', t: "4", sv: "3+", w: "2", ld: "6+", oc: "1" }];
    render(<CustomCardStats stats={stats} statFields={make40kStatFields()} />);
    expect(screen.getByText('6"')).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("3+")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("6+")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders dash for missing stat values", () => {
    const fields = [{ key: "x", label: "X", type: "string", displayOrder: 1 }];
    const stats = [{ active: true }];
    render(<CustomCardStats stats={stats} statFields={fields} />);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("filters out inactive stat lines", () => {
    const stats = [
      { active: true, m: "6" },
      { active: false, m: "8" },
    ];
    const fields = [{ key: "m", label: "M", displayOrder: 1 }];
    const { container } = render(<CustomCardStats stats={stats} statFields={fields} />);
    // Header row + 1 active stat line = 2 stats_containers
    const containers = container.querySelectorAll(".stats_container");
    expect(containers).toHaveLength(2);
  });

  it("renders multiple active stat profiles", () => {
    const stats = [
      { active: true, m: "6" },
      { active: true, m: "8", showName: true, name: "Leader" },
    ];
    const fields = [{ key: "m", label: "M", displayOrder: 1 }];
    const { container } = render(<CustomCardStats stats={stats} statFields={fields} />);
    const containers = container.querySelectorAll(".stats_container");
    expect(containers).toHaveLength(3);
    expect(screen.getByText("Leader")).toBeInTheDocument();
  });

  it("renders stat profile name only when showName is true", () => {
    const stats = [{ active: true, m: "6", showName: false, name: "Hidden" }];
    const fields = [{ key: "m", label: "M", displayOrder: 1 }];
    render(<CustomCardStats stats={stats} statFields={fields} />);
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("renders columns in displayOrder", () => {
    const fields = [
      { key: "c", label: "C", displayOrder: 3 },
      { key: "a", label: "A", displayOrder: 1 },
      { key: "b", label: "B", displayOrder: 2 },
    ];
    const stats = [{ active: true, a: "1", b: "2", c: "3" }];
    const { container } = render(<CustomCardStats stats={stats} statFields={fields} />);
    const captions = container.querySelectorAll(".caption");
    expect(captions[0].textContent).toBe("A");
    expect(captions[1].textContent).toBe("B");
    expect(captions[2].textContent).toBe("C");
  });

  it("renders custom game system stats (AoS-style)", () => {
    const fields = [
      { key: "move", label: "Move", type: "string", displayOrder: 1 },
      { key: "save", label: "Save", type: "string", displayOrder: 2 },
      { key: "control", label: "Control", type: "string", displayOrder: 3 },
      { key: "health", label: "Health", type: "string", displayOrder: 4 },
    ];
    const stats = [{ active: true, move: '8"', save: "4+", control: "2", health: "10" }];
    render(<CustomCardStats stats={stats} statFields={fields} />);
    expect(screen.getByText("Move")).toBeInTheDocument();
    expect(screen.getByText("Save")).toBeInTheDocument();
    expect(screen.getByText("Control")).toBeInTheDocument();
    expect(screen.getByText("Health")).toBeInTheDocument();
    expect(screen.getByText('8"')).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("handles empty stats array", () => {
    const { container } = render(<CustomCardStats stats={[]} statFields={make40kStatFields()} />);
    // Only the header row
    const containers = container.querySelectorAll(".stats_container");
    expect(containers).toHaveLength(1);
  });

  it("handles null stats", () => {
    const { container } = render(<CustomCardStats stats={null} statFields={make40kStatFields()} />);
    const containers = container.querySelectorAll(".stats_container");
    expect(containers).toHaveLength(1);
  });

  it("handles empty statFields", () => {
    const stats = [{ active: true, m: "6" }];
    const { container } = render(<CustomCardStats stats={stats} statFields={[]} />);
    const captions = container.querySelectorAll(".caption");
    expect(captions).toHaveLength(0);
  });
});
