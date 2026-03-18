import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockToBlob, mockToPng } = vi.hoisted(() => ({
  mockToBlob: vi.fn(),
  mockToPng: vi.fn(),
}));
vi.mock("@zumer/snapdom", () => ({
  snapdom: {
    toBlob: mockToBlob,
    toPng: mockToPng,
  },
}));

import { captureToBlob, captureToDataUrl } from "../screenshot.helpers";

describe("screenshot.helpers", () => {
  const mockElement = document.createElement("div");
  const mockBlob = new Blob(["test"], { type: "image/png" });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("captureToBlob", () => {
    it("calls snapdom.toBlob with type png and default scale 1.5", async () => {
      mockToBlob.mockResolvedValue(mockBlob);

      const result = await captureToBlob(mockElement);

      expect(mockToBlob).toHaveBeenCalledWith(mockElement, { type: "png", scale: 1.5 });
      expect(result).toBe(mockBlob);
    });

    it("calls snapdom.toBlob with custom scale", async () => {
      mockToBlob.mockResolvedValue(mockBlob);

      await captureToBlob(mockElement, { scale: 2.5 });

      expect(mockToBlob).toHaveBeenCalledWith(mockElement, { type: "png", scale: 2.5 });
    });
  });

  describe("captureToDataUrl", () => {
    it("calls snapdom.toPng with scale 1 and returns src data URL", async () => {
      const mockDataUrl = "data:image/png;base64,abc123";
      mockToPng.mockResolvedValue({ src: mockDataUrl });

      const result = await captureToDataUrl(mockElement);

      expect(mockToPng).toHaveBeenCalledWith(mockElement, { scale: 1 });
      expect(result).toBe(mockDataUrl);
    });
  });
});
