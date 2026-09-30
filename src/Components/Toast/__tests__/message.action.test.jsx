import { describe, it, expect, vi } from "vitest";
import { act, fireEvent, screen } from "@testing-library/react";
import { message } from "../message";

describe("message action", () => {
  it("renders an action button that runs its handler", async () => {
    const onClick = vi.fn();
    await act(async () => {
      message.success({ content: "Updated 1 card from the datasource.", action: { label: "Undo", onClick } });
    });
    const button = await screen.findByRole("button", { name: "Undo" });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders plain toasts without a button", async () => {
    await act(async () => {
      message.info("Plain toast");
    });
    const toast = (await screen.findByText("Plain toast")).closest(".toast");
    expect(toast.querySelector("button")).toBeNull();
  });
});
